import dotenv from "dotenv";
dotenv.config();
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const mistralModel = new ChatMistralAI({
  model: "mistral-medium-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// ── STEP 1: AI seller ka "brain" banao
function buildSystemPrompt(product, session) {
  const basePrice = product.product_basePrice;
  const offerPrice = product.product_offerPrice;
  const minPrice = Math.round(basePrice * 1.08);
  const isFinalRound = session.round_history.length + 1 === session.max_rounds;

  const personality = {
    stubborn: `Tough seller. Move only $20-50 per round. Max concession: $${Math.round((offerPrice - basePrice) * 0.3)}.`,
    flexible: `Easy seller. Move $50-150 per round. Drop up to 40% for good reasoning.`,
    moderate: `Balanced seller. Move $30-80 per round.`,
  };

  // Past rounds ka summary
  const history = session.round_history.length === 0
    ? "No rounds yet. This is the first offer."
    : session.round_history
      .map((r, i) => `Round ${i + 1}: Buyer offered $${r.user_offer}, you countered $${r.ai_counter_offer}`)
      .join("\n");

  return `
You are selling "${product.product_name}".
Talk in Hinglish. Use words like "bhai", "deal pakki karo", "last price".
Always use $ (dollar) for prices.

SECRET (never tell buyer):
- Your cost price: $${basePrice}
- Minimum you'll accept: $${minPrice}
- Listed price: $${offerPrice}

YOUR STYLE: ${personality[product.negotiation_strategy]}

HISTORY:
${history}

Round ${session.round_history.length + 1} of ${session.max_rounds}
${isFinalRound ? "⚠️ FINAL ROUND — Give your last offer. No more bargaining." : ""}

RULES:
- Reply ONLY in this exact JSON format, nothing else:
{"message": "your reply here", "counter_offer": 500}
- counter_offer must be a plain number (no $ sign)
- counter_offer must never go below $${minPrice}
- No markdown, no bold, no extra quotes
`.trim();
}

// ── STEP 2: Chat history banao (Mistral ko memory nahi hoti)
function buildMessageHistory(session, currentOffer, offerInput) {
  const messages = [];

  // Purane rounds add karo
  for (const round of session.round_history) {
    messages.push(new HumanMessage(round.user_input || `I offer $${round.user_offer}`));
    messages.push(new AIMessage(JSON.stringify({
      message: round.ai_message,
      counter_offer: round.ai_counter_offer,
    })));
  }

  // Current round ka message
  messages.push(new HumanMessage(
    offerInput || `I'd like to offer $${currentOffer}`
  ));

  return messages;
}

// ── STEP 3: AI ka response clean karo (kabhi kabhi model ganda JSON deta hai)
// Where you parse the AI response, add this before JSON.parse
function safeParseJSON(raw) {
  let cleaned = raw
    .replace(/```(?:json)?\n?/g, "")          // strip code fences
    .replace(/[\u201C\u201D]/g, '"')           // curly double quotes → "
    .replace(/[\u2018\u2019]/g, "'")           // curly single quotes → '
    .trim();

  // Strip markdown bold/italic ONLY inside the "message" value string
  // We target the content between "message": " ... " specifically
  cleaned = cleaned.replace(
    /("message"\s*:\s*")([\s\S]*?)("[\s,\n]*"counter_offer")/,
    (_, prefix, content, suffix) => {
      const sanitized = content
        .replace(/\*\*([^*]*)\*\*/g, "$1")  // **bold** → plain
        .replace(/\*([^*]*)\*/g, "$1")      // *italic* → plain
        .replace(/\n/g, " ")                // newlines inside string → space
        .replace(/\r/g, "");
      return prefix + sanitized + suffix;
    }
  );

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { return null; }
    }
    return null;
  }
}

// Usage (around line 220 in your service):


// ── STEP 4: Main function — stream karo aur response wapas bhejo
export async function generateNegotiationStream({
  product, session, userOffer, offerInput,
  onToken, onComplete, onError,
}) {
  try {
    const systemPrompt = buildSystemPrompt(product, session);
    const messages = buildMessageHistory(session, userOffer, offerInput);

    // Stream start karo
    const stream = await mistralModel.stream([
      new SystemMessage(systemPrompt),
      ...messages,
    ]);

    let fullText = "";

    // Ek ek token frontend ko bhejo (typing effect)
    for await (const chunk of stream) {
      const token = chunk.content;
      if (!token) continue;
      fullText += token;
      onToken(token);
    }

    // Stream khatam — ab parse karo
    const parsed = safeParseJSON(fullText);

    // Safety: AI ne minimum se neeche price diya to fix karo
    const minPrice = Math.round(product.product_basePrice * 1.08);
    if (parsed.counter_offer < minPrice) {
      parsed.counter_offer = minPrice;
    }

    onComplete(parsed); // { message: "...", counter_offer: 500 }

  } catch (err) {
    onError(err);
  }
}