import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

type SupportContext =
  | "general"
  | "homepage"
  | "booking"
  | "expert"
  | "payment"
  | "technical";

type SupportHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

type AskSupportPayload = {
  message: string;
  context?: SupportContext;
  history?: SupportHistoryItem[];
};

const SYSTEM_PROMPT = `You are ConsultEdge AI, the intelligent assistant for the ConsultEdge platform—a SaaS marketplace connecting clients and experts for professional consultations.

────────────────────────────
PLATFORM KNOWLEDGE
────────────────────────────
- You have access to platform data: expert profiles, industries, user activity, reviews, booking history, and trending metrics.
- You understand user roles: Client, Expert, Admin.
- You know all platform features: real-time chat, video consultations, booking, scheduling, notifications, reviews, expert portfolios, service categories, search filters, secure payments, and session management.

────────────────────────────
AI CAPABILITIES
────────────────────────────
1. **Trending Experts & Recommendations**
  - In the UI, you can recommend trending experts based on recent activity, high ratings, and years of experience.
  - You can filter and suggest experts by industry, budget, availability, and user preferences.
  - When asked, you can explain why an expert is trending (e.g., “high booking rate in Marketing this week”).

2. **Industry & Budget-Based Suggestions**
  - When users ask for experts in a specific industry or with a low budget, you can search and recommend suitable profiles.
  - You can compare experts by price, experience, and recent client feedback.

3. **Chatbot Support**
  - You answer user questions about the platform, expert discovery, booking, payments, and more.
  - You can explain platform workflows, recommend next steps, and provide actionable advice.
  - You can answer complex queries, such as “Who are the top-rated finance experts under $100/hour?” or “Which industries are trending this month?”

4. **Application Form Assistant**
  - When users fill out application forms (to become an expert or book a service), you recommend:
    - Titles, descriptions, and prices based on the selected industry and market data.
    - Improvements to resume, cover letter, and experience sections.
    - Suggestions are professional, ATS-friendly, and tailored to the user’s background and industry trends.
  - You never auto-fill—only suggest improvements or alternatives.

────────────────────────────
BEHAVIOR RULES
────────────────────────────
- Always respond clearly, professionally, and conversationally.
- Give practical, actionable, and data-driven advice.
- Never invent expert names, prices, or platform policies.
- For sensitive issues (refunds, billing, security), recommend admin/human support.
- If a request is outside the platform’s scope, politely redirect the conversation.
- Support structured JSON output if requested.
- Keep responses concise and suitable for a modern SaaS chat or form assistant.

You are a real AI assistant powered by LLM, not a static bot. You have full knowledge of ConsultEdge’s features, data, and workflows.`;

const bookingKeywords = ["book", "booking", "appointment", "consultation", "schedule", "slot"];
const paymentKeywords = ["pay", "payment", "checkout", "card", "refund", "invoice", "billing"];
const expertKeywords = ["expert", "mentor", "consultant", "specialist", "advisor"];
const technicalKeywords = ["bug", "error", "issue", "login", "otp", "password", "not working"];
const escalationKeywords = [
  "human",
  "admin",
  "agent",
  "refund",
  "charged twice",
  "billing issue",
  "legal",
  "complaint",
  "security",
  "hack",
  "urgent",
];

const includesAny = (text: string, keywords: string[]) =>
  keywords.some((keyword) => text.includes(keyword));

const buildSuggestedActions = (message: string, context?: SupportContext) => {
  const normalized = message.toLowerCase();

  if (context === "payment" || includesAny(normalized, paymentKeywords)) {
    return [
      "Check your payment or booking status in the dashboard",
      "Retry with a valid payment method if checkout failed",
      "Contact admin support for refund or billing review",
    ];
  }

  if (context === "expert" || includesAny(normalized, expertKeywords)) {
    return [
      "Browse verified experts by industry or skill",
      "Open an expert profile to review experience and availability",
      "Start a chat or book a consultation slot",
    ];
  }

  if (context === "technical" || includesAny(normalized, technicalKeywords)) {
    return [
      "Refresh the page and sign in again",
      "Make sure your browser allows cookies for authentication",
      "If the issue continues, contact admin support",
    ];
  }

  return [
    "Browse experts from the homepage",
    "Select a suitable slot and book a consultation",
    "Use dashboard chat for direct communication after booking",
  ];
};

const buildFallbackReply = (message: string, context?: SupportContext) => {
  const normalized = message.toLowerCase();

  if (context === "payment" || includesAny(normalized, paymentKeywords)) {
    return "I can help with payment guidance. Please confirm whether your issue is checkout failure, booking not appearing, or a refund request. For billing disputes or refunds, admin support should review it directly.";
  }

  if (context === "expert" || includesAny(normalized, expertKeywords)) {
    return "You can explore verified experts, compare their profiles, and choose a matching consultation slot. If you want, ask me what kind of expert you need and I’ll guide you.";
  }

  if (context === "technical" || includesAny(normalized, technicalKeywords)) {
    return "It looks like a technical or account issue. Try signing in again, refreshing the page, and checking your connection. If it still fails, please contact admin support for manual help.";
  }

  if (context === "booking" || includesAny(normalized, bookingKeywords)) {
    return "To book a consultation, choose an expert, review the available schedule, and confirm the booking from the platform. If a slot is missing, it may not be published or available yet.";
  }

  return "Hi — I can help with finding experts, booking consultations, schedules, payments, and general platform guidance. Tell me what you need, and I’ll guide you step by step.";
};

const shouldEscalateToHuman = (message: string) => {
  const normalized = message.toLowerCase();
  return includesAny(normalized, escalationKeywords);
};

const buildMessages = (payload: AskSupportPayload) => {
  const history = (payload.history ?? []).map((item) => ({
    role: item.role,
    content: item.content,
  }));

  return [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    {
      role: "user",
      content: payload.context
        ? `Context: ${payload.context}\nUser message: ${payload.message}`
        : payload.message,
    },
  ];
};

const generateOpenAIReply = async (payload: AskSupportPayload) => {
  if (!envVars.OPENAI_API_KEY) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "OpenAI API key is missing. AI features are disabled.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${envVars.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: envVars.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 300,
      messages: buildMessages(payload),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  return data.choices?.[0]?.message?.content?.trim() || null;
};

const askSupport = async (payload: AskSupportPayload) => {
  const message = payload.message?.trim();

  if (!message) {
    throw new AppError(status.BAD_REQUEST, "Message is required");
  }

  const suggestedActions = buildSuggestedActions(message, payload.context);
  const escalatedToHuman = shouldEscalateToHuman(message);

  // Only allow AI reply, no fallback
  const aiReply = await generateOpenAIReply({ ...payload, message });
  if (!aiReply) {
    throw new AppError(status.INTERNAL_SERVER_ERROR, "AI service unavailable. Please contact support.");
  }

  return {
    reply: aiReply,
    suggestedActions,
    escalatedToHuman,
    provider: "openai",
    model: envVars.OPENAI_MODEL || "gpt-4o-mini",
    timestamp: new Date().toISOString(),
  };
};

export const aiService = {
  askSupport,
};
