import { aiProvider } from "../utils/aiProvider";
import { ragResponseSchema, type RagResponse } from "../schemas/ragOutput.schema";
import { rankRagContext, type RagContextItem } from "../utils/ragRanker";

export type RagQueryInput = {
  query: string;
  context: RagContextItem[];
  topK?: number;
};

export type RagQueryResult = {
  data: RagResponse;
  meta: {
    model: string;
    provider: string;
    tokensUsed: number;
    latencyMs: number;
  };
};

const NO_MATCH = "No matching data found in the system.";

const buildPrompt = (query: string, context: RagContextItem[]) => {
  return [
    "You are the RAG engine for ConsultEdge.",
    "Answer ONLY using the data provided below.",
    "Never hallucinate or invent experts, industries, reviews, or policies.",
    `If answer not present, answer must be exactly: \"${NO_MATCH}\".`,
    "Rules:",
    "1) Use only retrieved context.",
    "2) Do not guess missing information.",
    "3) If multiple experts match, rank by relevance.",
    "4) If user intent is unclear, ask a clarifying question in suggestions.",
    "5) Keep answer clear and professional.",
    "6) Include why this answer in reasoning.",
    "7) Include citations using source_id values from context.",
    "Output JSON with shape:",
    '{"answer":"...","reasoning":"...","sources":[{"source_id":"...","evidence":"..."}],"suggestions":["..."]}',
    "Context:",
    JSON.stringify(context),
    "Query:",
    query,
  ].join("\n");
};

export const aiRagService = {
  async query(input: RagQueryInput): Promise<RagQueryResult> {
    const ranked = rankRagContext(input.query, input.context, input.topK ?? 6);

    if (ranked.length === 0 || ranked[0].score < 0.08) {
      throw new Error(
        "No relevant evidence matched the query in retrieved context. Real AI unavailable or insufficient context. Please refine your query or try again later."
      );
    }

    const { data, meta } = await aiProvider.generateJSON<RagResponse>({
      messages: [
        {
          role: "system",
          content: "You are a strict retrieval-grounded JSON API. Never output non-JSON.",
        },
        {
          role: "user",
          content: buildPrompt(input.query, ranked),
        },
      ],
      temperature: 0.1,
      maxTokens: 900,
    });

    const parsed = ragResponseSchema.safeParse(data);

    if (!parsed.success) {
      return {
        data: {
          answer: NO_MATCH,
          reasoning: "Model response was invalid against RAG schema.",
          sources: [],
          suggestions: [
            "Retry query with narrower intent.",
            "Check retrieved context quality and source_id fields.",
          ],
        },
        meta: {
          model: meta.model,
          provider: meta.provider,
          tokensUsed: meta.tokensUsed,
          latencyMs: meta.latencyMs,
        },
      };
    }

    return {
      data: parsed.data,
      meta: {
        model: meta.model,
        provider: meta.provider,
        tokensUsed: meta.tokensUsed,
        latencyMs: meta.latencyMs,
      },
    };
  },
};
