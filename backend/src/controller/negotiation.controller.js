import productModel from "../models/product.model.js";
import sessionModel from "../models/session.model.js";
import { generateNegotiationStream } from "../services/negotiation.service.js";
import leaderBoardModel from "../models/leader_board.model.js";

export function registerNegotiationSocket(socket, io) {

    // ── Session shuru karo ya resume karo
    socket.on("start_session", async ({ productId }) => {
        try {
            const userId = socket.user.id;

            const product = await productModel.findById(productId).select("+product_basePrice");
            if (!product) return socket.emit("error", { message: "Product not found" });

            // Agar active session hai toh reuse karo, nahi toh naya banao
            let session = await sessionModel.findOne({ user_id: userId, product_id: productId, status: "active" });
            if (!session) {
                session = await sessionModel.create({
                    user_id: userId,
                    product_id: productId,
                    current_offer: product.product_offerPrice,
                });
            }

            socket.join(session._id.toString());

            socket.emit("session_started", {
                sessionId: session._id,
                product: {
                    name: product.product_name,
                    image: product.product_image_url,
                    category: product.product_category,
                    description: product.product_description,
                    mrp: product.product_mrp,
                    offerPrice: product.product_offerPrice,
                    rating: product.rating,
                },
                currentRound: session.round_history.length + 1,
                maxRounds: session.max_rounds,
                roundHistory: session.round_history,
            });

        } catch (err) {
            console.error("[start_session error]", err);
            socket.emit("error", { message: "Failed to start session" });
        }
    });

    // ── User ne offer kiya
    socket.on("make_offer", async ({ sessionId, userOffer, offerInput }) => {
        try {
            const userId = socket.user.id;
            const offer = Number(userOffer);

            if (!offer || offer <= 0 || isNaN(offer)) {
                return socket.emit("error", { message: "Invalid offer amount" });
            }

            const session = await sessionModel.findOne({ _id: sessionId, user_id: userId, status: "active" });
            if (!session) return socket.emit("error", { message: "Session not found or already closed" });

            if (session.round_history.length >= session.max_rounds) {
                return socket.emit("error", { message: "Maximum rounds reached" });
            }

            const product = await productModel.findById(session.product_id).select("+product_basePrice");
            const currentRound = session.round_history.length + 1;

            socket.emit("ai_thinking", { round: currentRound });

            await generateNegotiationStream({
                product,
                session,
                userOffer: offer,
                offerInput,
                onToken: (token) => socket.emit("ai_token", { token }),

                onComplete: async ({ message, counter_offer }) => {

                    // ✅ offerInput yahan outer scope se aa raha hai — BUG FIX
                    session.round_history.push({
                        user_offer: offer,
                        user_input: offerInput || `I'd like to offer $${offer}`,
                        ai_message: message,
                        ai_counter_offer: counter_offer,
                    });
                    session.current_offer = counter_offer;

                    const isLastRound = session.round_history.length >= session.max_rounds;

                    if (isLastRound) {
                        session.status = "closed";

                        const dealReached = offer >= counter_offer;
                        session.final_deal_price = dealReached ? counter_offer : null;
                        await session.save();

                        socket.emit("round_complete", {
                            round: currentRound,
                            userOffer: offer,
                            aiMessage: message,
                            aiCounterOffer: counter_offer,
                            roundsLeft: 0,
                            isFinalRound: true,
                            dealReached,
                        });

                        if (dealReached) {
                            await handleDealClosed(socket, io, userId, session, product, session.final_deal_price);
                        } else {
                            socket.emit("deal_failed", {
                                sessionId: session._id,
                                userOffer: offer,
                                aiCounterOffer: counter_offer,
                                message: "No deal reached. Better luck next time!",
                            });
                        }

                    } else {
                        await session.save();

                        socket.emit("round_complete", {
                            round: currentRound,
                            userOffer: offer,
                            aiMessage: message,
                            aiCounterOffer: counter_offer,
                            roundsLeft: session.max_rounds - session.round_history.length,
                            isFinalRound: false,
                        });
                    }
                },

                onError: (err) => {
                    console.error("[generateNegotiationStream error]", err);
                    socket.emit("error", { message: "AI failed to respond. Please try again." });
                },
            });

        } catch (err) {
            console.error("[make_offer error]", err);
            socket.emit("error", { message: "Server error processing your offer" });
        }
    });

    // ── User ne AI ka offer accept kiya
    socket.on("accept_offer", async ({ sessionId }) => {
        try {
            const userId = socket.user.id;

            const session = await sessionModel.findOne({ _id: sessionId, user_id: userId, status: "active" });
            if (!session) return socket.emit("error", { message: "Session not found" });

            session.status = "closed";
            session.final_deal_price = session.current_offer;
            await session.save();

            const product = await productModel.findById(session.product_id);
            await handleDealClosed(socket, io, userId, session, product, session.final_deal_price);

        } catch (err) {
            console.error("[accept_offer error]", err);
            socket.emit("error", { message: "Error accepting offer" });
        }
    });

    // ── User bhaag gaya — no deal
    socket.on("abandon_session", async ({ sessionId }) => {
        try {
            await sessionModel.findOneAndUpdate(
                { _id: sessionId, user_id: socket.user.id },
                { status: "closed" }
            );
            socket.emit("session_abandoned", { sessionId });
        } catch (err) {
            console.error("[abandon_session error]", err);
        }
    });
}

// ── Deal close hone par leaderboard update karo
async function handleDealClosed(socket, io, userId, session, product, finalPrice) {
    const savings = product.product_offerPrice - finalPrice;
    const savingPercent = parseFloat(((savings / product.product_offerPrice) * 100).toFixed(2));

    await leaderBoardModel.findOneAndUpdate(
        { session_id: session._id },
        {
            user_id: userId,
            product_id: product._id,
            session_id: session._id,
            deal_price: finalPrice,
            saving_percent: savingPercent,
            total_rounds: session.round_history.length,
        },
        { upsert: true, new: true }
    );

    socket.emit("deal_closed", {
        sessionId: session._id,
        finalPrice,
        offerPrice: product.product_offerPrice,
        savings,
        savingsPct: savingPercent,
        productName: product.product_name,
        totalRounds: session.round_history.length,
    });
}