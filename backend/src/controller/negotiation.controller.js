// import productModel from "../models/product.model.js";
// import sessionModel from "../models/session.model.js";
// import { generateNegotiationStream } from "../services/negotiation.service.js";
// import leaderBoardModel from "../models/leader_board.model.js";

// // ─────────────────────────────────────────────
// export function registerNegotiationSocket(socket, io) {

//     // ── EVENT: 'start_session'
//     // Fired when the user clicks "Start Negotiating" on a product page.
//     // Creates a fresh session OR resumes an existing active one.
//     //
//     // Client sends:  { productId }
//     // Server emits:  'session_started' → { sessionId, product, currentRound, maxRounds }
//     socket.on("start_session", async ({ productId }) => {
//         try {
//             const userId = socket.user.id; // set by your JWT auth middleware

//             // ── WHY .select('+product_basePrice')?
//             //    Your schema has product_basePrice with select:false.
//             //    A normal .findById() will NOT include it. We explicitly
//             //    opt in here — this is the ONE place we need the hidden price.
//             //    It stays server-side only; never sent to the client.
//             const product = await productModel
//                 .findById(productId)
//                 .select("+product_basePrice");

//             if (!product) {
//                 return socket.emit("error", { message: "Product not found" });
//             }

//             // ── Check for an existing active session for this user+product
//             //    We don't want duplicate sessions if the user refreshes.
//             let session = await sessionModel.findOne({
//                 user_id: userId,
//                 product_id: productId,
//                 status: "active",
//             });

//             if (!session) {
//                 session = await sessionModel.create({
//                     user_id: userId,
//                     product_id: productId,
//                     current_offer: product.product_offerPrice, // start at offer price
//                 });
//             }

//             // Join a socket room named after the session ID.
//             // WHY rooms? So leaderboard broadcasts don't go to wrong users.
//             socket.join(session._id.toString());

//             socket.emit("session_started", {
//                 sessionId: session._id,
//                 product: {
//                     // ── NEVER send product_basePrice to the client
//                     name: product.product_name,
//                     image: product.product_image_url,
//                     category: product.product_category,
//                     description: product.product_description,
//                     mrp: product.product_mrp,
//                     offerPrice: product.product_offerPrice,
//                     rating: product.rating,
//                 },
//                 currentRound: session.round_history.length + 1,
//                 maxRounds: session.max_rounds,
//                 roundHistory: session.round_history,
//             });
//         } catch (err) {
//             console.error("[start_session error]", err);
//             socket.emit("error", { message: "Failed to start session" });
//         }
//     });

//     // ── EVENT: 'make_offer'
//     // Fired every time the user submits a price offer.
//     // This is where the AI stream happens.
//     //
//     // Client sends:  { sessionId, userOffer }   (userOffer is a number like 4500)
//     // Server emits:
//     //   'ai_token'       — one per chunk while the AI is typing
//     //   'round_complete' — once after full response is parsed + saved
//     //   'deal_closed'    — if session ended (final round or user accepted)
//     //   'error'          — if anything went wrong
//     socket.on("make_offer", async ({ sessionId, userOffer,offerInput }) => {
//         try {
//             const userId = socket.user.id;
//             const offer = Number(userOffer);
//             // console.log(offerInput)

//             // ── Basic validation
//             if (!offer || offer <= 0 || isNaN(offer)) {
//                 return socket.emit("error", { message: "Invalid offer amount" });
//             }

//             // ── Load session and verify it belongs to this user
//             const session = await sessionModel.findOne({
//                 _id: sessionId,
//                 user_id: userId,
//                 status: "active",
//             });

//             if (!session) {
//                 return socket.emit("error", {
//                     message: "Session not found or already closed",
//                 });
//             }

//             if (session.round_history.length >= session.max_rounds) {
//                 return socket.emit("error", { message: "Maximum rounds reached" });
//             }

//             // ── Load product with hidden price (needed for system prompt)
//             const product = await productModel
//                 .findById(session.product_id)
//                 .select("+product_basePrice");

//             const currentRound = session.round_history.length + 1;
//             const isFinalRound = currentRound === session.max_rounds;

//             // ── Signal to the client that streaming is about to start
//             //    The UI should show a typing indicator / clear the chat input
//             socket.emit("ai_thinking", { round: currentRound });

//             // ── THE CORE: call the streaming service
//             await generateNegotiationStream({
//                 product,
//                 session,
//                 userOffer: offer,
//                 offerInput,

//                 // Called for EVERY token chunk (~50-200ms apart)
//                 // Your React client appends each token to the chat bubble
//                 onToken: (token) => {
//                     socket.emit("ai_token", { token });
//                 },

//                 // Called ONCE after the stream ends, with parsed JSON
//                 // onComplete: async ({ message, counter_offer }) => {
//                 //     // ── Save this round to the database
//                 //     session.round_history.push({
//                 //         user_offer: offer,
//                 //         ai_message: message,
//                 //         ai_counter_offer: counter_offer,
//                 //     });
//                 //     session.current_offer = counter_offer;

//                 //     const isLastRound = session.round_history.length >= session.max_rounds;

//                 //     if (isLastRound) {
//                 //         // Auto-close session after final round
//                 //         session.status = "closed";
//                 //         session.final_deal_price = counter_offer;
//                 //     }

//                 //     await session.save();

//                 //     // Emit round summary to the client
//                 //     socket.emit("round_complete", {
//                 //         round: currentRound,
//                 //         userOffer: offer,
//                 //         aiMessage: message,
//                 //         aiCounterOffer: counter_offer,
//                 //         roundsLeft: session.max_rounds - session.round_history.length,
//                 //         isFinalRound: isLastRound,
//                 //     });

//                 //     // If session is closed, emit deal result + update leaderboard
//                 //     if (isLastRound) {
//                 //         await handleDealClosed(socket, io,userId, session, product, counter_offer);
//                 //     }
//                 // },
//                 onComplete: async ({ message, counter_offer,offerInput }) => {
//                     session.round_history.push({
//                         user_offer: offer,
//                         user_input: offerInput || `I'd like to offer $${offer}`,
//                         ai_message: message,
//                         ai_counter_offer: counter_offer,
//                     });
//                     session.current_offer = counter_offer;

//                     const isLastRound = session.round_history.length >= session.max_rounds;

//                     if (isLastRound) {
//                         session.status = "closed";

//                         // ── Deal only happens if user's offer >= AI's counter
//                         const dealReached = offer >= counter_offer;
//                         const finalPrice = dealReached ? counter_offer : null;

//                         session.final_deal_price = finalPrice;
//                         await session.save();

//                         socket.emit("round_complete", {
//                             round: currentRound,
//                             userOffer: offer,
//                             aiMessage: message,
//                             aiCounterOffer: counter_offer,
//                             roundsLeft: 0,
//                             isFinalRound: true,
//                             dealReached,          // ← send this to frontend
//                         });

//                         if (dealReached) {
//                             await handleDealClosed(socket, io, userId, session, product, finalPrice);
//                         } else {
//                             // ── No deal — emit a separate event so UI shows "Deal Failed"
//                             socket.emit("deal_failed", {
//                                 sessionId: session._id,
//                                 userOffer: offer,
//                                 aiCounterOffer: counter_offer,
//                                 message: "No deal reached. Better luck next time!",
//                             });
//                         }

//                     } else {
//                         await session.save();

//                         socket.emit("round_complete", {
//                             round: currentRound,
//                             userOffer: offer,
//                             aiMessage: message,
//                             aiCounterOffer: counter_offer,
//                             roundsLeft: session.max_rounds - session.round_history.length,
//                             isFinalRound: false,
//                         });
//                     }
//                 },

//                 onError: (err) => {
//                     console.error("[generateNegotiationStream error]", err);
//                     socket.emit("error", {
//                         message: "AI failed to respond. Please try again.",
//                     });
//                 },
//             });
//         } catch (err) {
//             console.error("[make_offer error]", err);
//             socket.emit("error", { message: "Server error processing your offer" });
//         }
//     });

//     // ── EVENT: 'accept_offer'
//     // The user decides to accept the AI's current counter-offer.
//     // Closes the session immediately (don't wait for final round).
//     //
//     // Client sends:  { sessionId }
//     socket.on("accept_offer", async ({ sessionId }) => {
//         try {
//             const userId = socket.user.id;

//             const session = await sessionModel.findOne({
//                 _id: sessionId,
//                 user_id: userId,
//                 status: "active",
//             });

//             if (!session) {
//                 return socket.emit("error", { message: "Session not found" });
//             }

//             const finalPrice = session.current_offer;
//             session.status = "closed";
//             session.final_deal_price = finalPrice;
//             await session.save();

//             const product = await productModel.findById(session.product_id);

//             await handleDealClosed(socket, io, userId, session, product, finalPrice);
//         } catch (err) {
//             console.error("[accept_offer error]", err);
//             socket.emit("error", { message: "Error accepting offer" });
//         }
//     });

//     // ── EVENT: 'abandon_session'
//     // User walks away — no deal. Close session without a deal price.
//     socket.on("abandon_session", async ({ sessionId }) => {
//         try {
//             await sessionModel.findOneAndUpdate(
//                 { _id: sessionId, user_id: socket.user.id },
//                 { status: "closed" }
//             );
//             socket.emit("session_abandoned", { sessionId });
//         } catch (err) {
//             console.error("[abandon_session error]", err);
//         }
//     });
// }

// // ─────────────────────────────────────────────
// // handleDealClosed (private helper)
// //
// // WHY separate function?
// //   Both 'accept_offer' and the final round of 'make_offer' need
// //   the same logic: record the deal, update the leaderboard,
// //   and broadcast to all clients. DRY principle.
// //
// // WHY io.emit for leaderboard but socket.emit for deal_closed?
// //   'deal_closed' is personal — only this user needs to know their deal.
// //   'leaderboard_update' is global — everyone watching the leaderboard
// //   should see it update in real time without refreshing.
// // ─────────────────────────────────────────────
// async function handleDealClosed(socket, io, userId, session, product, finalPrice) {
//     // Calculate how good the deal was as a percentage below offer price
//     const savings = product.product_offerPrice - (finalPrice);
//     const savingPercent = parseFloat(
//         ((savings / product.product_offerPrice) * 100).toFixed(2)
//     );

//     // upsert — safe against duplicate socket fires

//     await leaderBoardModel.findOneAndUpdate(
//         { session_id: session._id },           // match on session, not user+product
//         {
//             user_id: userId,
//             product_id: product._id,
//             session_id: session._id,
//             deal_price: finalPrice,
//             saving_percent: savingPercent,        // e.g. 23.4  (actual %)
//             total_rounds: session.round_history.length,
//         },
//         { upsert: true, new: true }
//     );

//     socket.emit("deal_closed", {
//         sessionId: session._id,
//         finalPrice,
//         offerPrice: product.product_offerPrice,
//         savings,
//         savingsPct: savingPercent,
//         productName: product.product_name,
//         totalRounds: session.round_history.length,
//     });

// }

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