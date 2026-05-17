import { z } from "zod";

const historyItemSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
});

const askSupport = z.object({
  body: z.object({
    message: z.string().trim().min(1, "Message is required").max(4000),
    context: z
      .enum(["general", "homepage", "booking", "expert", "payment", "technical"])
      .optional(),
    history: z.array(historyItemSchema).max(12).optional(),
  }),
});

const expertItem = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  industry: z.string().max(120).optional(),
  expertise: z.array(z.string().max(80)).max(20).optional(),
  bio: z.string().max(2000).optional(),
  rating: z.number().min(0).max(5).optional(),
});

const recommendations = z.object({
  body: z.object({
    viewedExperts: z.array(z.string().max(200)).max(100).optional(),
    exploredIndustries: z.array(z.string().max(120)).max(100).optional(),
    searchHistory: z.array(z.string().max(200)).max(100).optional(),
    clickedCategories: z.array(z.string().max(120)).max(100).optional(),
  }),
});

const industryCreation = z.object({
  body: z.object({
    industryName: z.string().trim().min(2).max(100),
  }),
});

const search = z.object({
  body: z.object({
    query: z.string().trim().min(1).max(500),
    userActivity: z
      .object({
        viewedExperts: z.array(z.string().max(200)).max(100).optional(),
        exploredIndustries: z.array(z.string().max(120)).max(100).optional(),
        searchHistory: z.array(z.string().max(200)).max(100).optional(),
        clickedCategories: z.array(z.string().max(120)).max(100).optional(),
      })
      .optional(),
    db: z
      .object({
        experts: z.array(expertItem).max(300).optional(),
        industries: z.array(z.record(z.string(), z.unknown())).max(300).optional(),
        testimonials: z.array(z.record(z.string(), z.unknown())).max(500).optional(),
        trending: z.array(z.record(z.string(), z.unknown())).max(200).optional(),
      })
      .optional(),
  }),
});

const summary = z.object({
  body: z.object({
    text: z.string().trim().min(20).max(20000),
    audience: z.string().max(100).optional(),
  }),
});

const chat = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(4000),
    context: z.string().max(500).optional(),
    history: z.array(historyItemSchema).max(20).optional(),
  }),
});

const persistedChatMessage = z.object({
  body: z.object({
    message: z.string().trim().min(1).max(4000),
    context: z.string().max(500).optional(),
    conversationId: z.string().uuid().optional(),
  }),
});

const conversationParams = z.object({
  params: z.object({
    conversationId: z.string().uuid(),
  }),
});

const messageFeedback = z.object({
  params: z.object({
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
  }),
  body: z.object({
    feedback: z.enum(["LIKE", "DISLIKE"]).nullable(),
  }),
});

const ragQuery = z.object({
  body: z.object({
    query: z.string().trim().min(1).max(1000),
    topK: z.coerce.number().int().min(1).max(20).optional(),
    context: z
      .array(
        z.object({
          source_id: z.string().trim().min(1).max(200),
          content: z.string().trim().min(1).max(12000),
          metadata: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .min(1)
      .max(100),
  }),
});

const documentAnalysis = z.object({
  body: z.object({
    text: z.string().trim().min(50).max(40000),
    objective: z.string().max(500).optional(),
  }),
});

const profileSuggest = z.object({
  body: z.object({
    industry: z.string().trim().min(2).max(100),
    feedback: z.string().max(400).optional(),
  }),
});

export const aiValidation = {
  askSupport,
  recommendations,
  industryCreation,
  search,
  summary,
  chat,
  persistedChatMessage,
  conversationParams,
  messageFeedback,
  ragQuery,
  documentAnalysis,
  profileSuggest,
};
