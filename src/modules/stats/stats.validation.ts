import { z } from "zod";
import * as analyticsTypes from "../../types/analytics.types";

// Accepts either a valid UUID or a valid email for expertId
export const ExpertIdSchema = z.string().refine(
  (val) => {
    // UUID v4 regex
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    // Simple email regex (for validation, not RFC compliance)
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return uuidRegex.test(val) || emailRegex.test(val);
  },
  {
    message: "expertId must be a valid UUID or a valid expert email",
  }
);

// Declare AIInsightSchema first so it can be used in other schemas
export const AIInsightSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(["summary", "anomaly", "recommendation", "trend"]),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(1),
  source: z.enum(["ai", "human", "hybrid"]),
  createdAt: z.string(),
  relatedIds: z.array(z.string()).optional(),
  meta: z.record(z.string(), z.any()).optional(),
});

// Example: Zod schema for ExpertAnalyticsDTO (contract-compliant)
export const ExpertAnalyticsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  spendingTrends: z.array(z.object({ date: z.string(), amount: z.number() })),
  engagement: z.object({ sessions: z.number(), messages: z.number() }),
  categories: z.array(z.string()),
  aiInsights: z.array(AIInsightSchema),
  meta: z.any().optional(),
});

export const ClientAnalyticsSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  savedExperts: z.array(z.string()),
  engagement: z.object({ sessions: z.number(), messages: z.number() }),
  spendingTrends: z.array(z.object({ date: z.string(), amount: z.number() })),
  aiInsights: z.array(AIInsightSchema),
  meta: z.any().optional(),
});

export const AdminAnalyticsSchema = z.object({
  id: z.string().uuid(),
  platformTrends: z.array(z.object({ date: z.string(), value: z.number() })),
  categoryBreakdown: z.array(z.object({ category: z.string(), count: z.number() })),
  aiInsights: z.array(AIInsightSchema),
  meta: z.any().optional(),
});

export const AIAnalyticsSchema = z.object({
  id: z.string().uuid(),
  usageTrends: z.array(z.object({ date: z.string(), count: z.number() })),
  feedback: z.object({ likes: z.number(), dislikes: z.number() }),
  aiInsights: z.array(AIInsightSchema),
  meta: z.any().optional(),
});
