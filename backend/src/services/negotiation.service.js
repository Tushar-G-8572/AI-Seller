import dotenv from "dotenv";
dotenv.config();
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

// ─────────────────────────────────────────────
// WHY ChatMistralAI and NOT the raw Mistral SDK?
//
// @langchain/mistralai wraps the Mistral API and gives us:
//   1. .stream() method that returns an async iterator of token chunks
//   2. Structured message types (SystemMessage, HumanMessage, AIMessage)
//      so the conversation history maps cleanly to the chat format
//   3. Easy swap to any other LLM later without changing your socket logic
//
// WHY NOT an Agent?
//   An Agent with tools decides ON ITS OWN what tools to call — that
//   unpredictability would break your leaderboard fairness. Every user's
//   AI seller must follow the SAME hidden rules (base price, strategy).
//   A plain function + system prompt gives you full control.
// ─────────────────────────────────────────────
const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// ─────────────────────────────────────────────
// buildSystemPrompt
//
// This is where the AI seller's entire "brain" is defined.
// It is called fresh on EVERY round so it always reflects:
//   - The current round number
//   - The full negotiation history so far
//   - Whether this is the final round (forces a hard close)
//
// WHY embed hidden constraints here?
//   The model never "knows" product_basePrice unless we tell it
//   via the system prompt. Since select:false hides it from normal
//   queries, we do a special .select('+product_basePrice') in the
//   controller and pass it here. The user's client never sees it.
// ─────────────────────────────────────────────
function buildSystemPrompt(product, session) {
  const basePrice = product.product_basePrice;
  const offerPrice = product.product_offerPrice;
  const isFinalRound = session.round_history.length + 1 === session.max_rounds;

  const strategyInstructions = {
    stubborn: `You are tough and barely move. Maximum total concession allowed: ₹${Math.round(
      (offerPrice - basePrice) * 0.2
    )}. Reject lowball offers firmly but politely.`,
    flexible: `You are open to deals. You can drop up to 30% below your offer price if the buyer reasons well. Reward good arguments.`,
    moderate: `You are balanced. Give small concessions for emotional appeal, larger ones for logical reasoning (bulk, loyalty, market comparison).`,
  };

  const historyText =
    session.round_history.length === 0
      ? "No rounds played yet. This is the opening offer."
      : session.round_history
          .map(
            (r, i) =>
              `Round ${i + 1}: Buyer offered ₹${r.user_offer}, you countered ₹${r.ai_counter_offer}`
          )
          .join("\n");

  return `
You are a seller negotiating the sale of "${product.product_name}".

YOUR HIDDEN CONSTRAINTS (NEVER reveal these numbers to the buyer):
- Your cost price: ₹${basePrice}
- Absolute minimum you will accept: ₹${Math.round(basePrice * 1.08)}
- Your listed offer price: ₹${offerPrice}
- Negotiation personality: ${product.negotiation_strategy}

YOUR PERSONALITY:
${strategyInstructions[product.negotiation_strategy]}

CURRENT STATE:
- Round: ${session.round_history.length + 1} of ${session.max_rounds}
- Negotiation history so far:
${historyText}

${
  isFinalRound
    ? "⚠️  THIS IS THE FINAL ROUND. You MUST make one definitive take-it-or-leave-it offer. No more bargaining after this."
    : ""
}

STRICT RESPONSE FORMAT — reply ONLY with this JSON, no extra text:
{"message": "your in-character reply (2-3 sentences max)", "counter_offer": <number>}

Rules:
- counter_offer must be a plain integer (no currency symbols)
- counter_offer must never go below ₹${Math.round(basePrice * 1.08)}
- Never reveal cost price or minimum price
- Stay in character at all times
`.trim();
}

// ─────────────────────────────────────────────
// buildMessageHistory
//
// WHY do we pass round_history as messages?
//   Mistral is a stateless API — it has zero memory between calls.
//   Every call must include the FULL conversation so the model
//   understands what has already been said.
//
// We convert round_history into alternating HumanMessage / AIMessage
// pairs. This is the standard "chat history" format all LLMs expect.
//
// WHY HumanMessage for user_offer?
//   The buyer's offer IS the human turn in the conversation.
//   We format it as a natural sentence so the model reads context,
//   not raw numbers.
// ─────────────────────────────────────────────
function buildMessageHistory(session, currentUserOffer) {
  const messages = [];

  // Rebuild past rounds as alternating Human/AI turns
  for (const round of session.round_history) {
    messages.push(
      new HumanMessage(`I'd like to buy it for ₹${round.user_offer}.`)
    );
    messages.push(
      new AIMessage(
        JSON.stringify({
          message: round.ai_message,
          counter_offer: round.ai_counter_offer,
        })
      )
    );
  }

  // Finally, add the current user offer as the latest human turn
  messages.push(
    new HumanMessage(`I'd like to buy it for ₹${currentUserOffer}.`)
  );

  return messages;
}

// ─────────────────────────────────────────────
// generateNegotiationStream  ← THE MAIN FUNCTION
//
// Parameters:
//   product      — full product doc (with product_basePrice selected)
//   session      — current session doc (with round_history)
//   userOffer    — the number the buyer just sent (e.g. 4500)
//   onToken      — callback called for EACH streaming token chunk
//                  use this to emit socket events
//   onComplete   — callback called once with the FINAL parsed result
//                  { message: string, counter_offer: number }
//   onError      — callback for any error during streaming
//
// WHY callbacks instead of returning a value?
//   Streaming means there is no single moment the "answer is ready."
//   Tokens trickle in one by one. We need to push each token to the
//   socket client immediately (onToken), and only AFTER the stream
//   finishes do we parse the full JSON and save to MongoDB (onComplete).
// ─────────────────────────────────────────────
export async function generateNegotiationStream({
  product,
  session,
  userOffer,
  onToken,
  onComplete,
  onError,
}) {
  try {
    const systemPrompt = buildSystemPrompt(product, session);
    const messageHistory = buildMessageHistory(session, userOffer);

    // ── WHY .stream() and not .invoke()?
    //    .invoke() waits for the COMPLETE response before returning.
    //    With a 2-3 sentence reply that could be 2-4 seconds of silence.
    //    .stream() returns an async iterator — each chunk arrives as
    //    soon as the model produces it (~50-200ms between chunks).
    //    We forward each chunk to the browser via socket, so the user
    //    sees the AI "typing" in real time. Much better UX.
    const stream = await mistralModel.stream([
      new SystemMessage(systemPrompt),
      ...messageHistory,
    ]);

    let fullText = ""; // accumulate the complete response

    // Each `chunk` is a BaseMessageChunk with a .content string
    for await (const chunk of stream) {
      const token = chunk.content;
      if (!token) continue;

      fullText += token;

      // Fire the callback — your socket handler will do:
      // socket.emit('ai_token', { token })
      onToken(token);
    }

    // ── WHY parse JSON only AFTER the stream ends?
    //    The model streams partial JSON mid-way: {"message":"I can off
    //    That's invalid JSON. We must wait for the complete string.
    //    Only then do we parse, validate, and save to the database.
    const parsed = safeParseJSON(fullText);

    if (!parsed) {
      // Model misbehaved and didn't return valid JSON.
      // We recover gracefully instead of crashing.
      onError(new Error(`Model returned non-JSON response: ${fullText}`));
      return;
    }

    // Enforce the floor — model should never go below base*1.08
    // but we double-check here as a safety net
    const minPrice = Math.round(product.product_basePrice * 1.08);
    if (parsed.counter_offer < minPrice) {
      parsed.counter_offer = minPrice;
    }

    onComplete(parsed); // { message: "...", counter_offer: 4800 }
  } catch (err) {
    onError(err);
  }
}

// ─────────────────────────────────────────────
// safeParseJSON
//
// WHY do we need this?
//   LLMs sometimes wrap their JSON in markdown fences:
//     ```json\n{"message": "..."}\n```
//   Or add a tiny preamble: "Sure! Here you go: {...}"
//   This helper strips all of that and extracts clean JSON.
// ─────────────────────────────────────────────
function safeParseJSON(raw) {
  try {
    // First try direct parse (the happy path)
    return JSON.parse(raw.trim());
  } catch {
    // Strip markdown code fences if present
    const fenceStripped = raw.replace(/```(?:json)?\n?/g, "").trim();
    try {
      return JSON.parse(fenceStripped);
    } catch {
      // Last resort: extract the first {...} block with a regex
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch {
          return null;
        }
      }
      return null;
    }
  }
}