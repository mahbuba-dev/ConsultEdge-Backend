// Mapper layer for transforming Prisma analytics results to DTOs
// All analytics math, formatting, and normalization lives here
import { AIInsightDTO, ExpertAnalyticsDTO } from '../../types/analytics.types';
import { format, compareAsc } from 'date-fns';

// Helper to sort trend data chronologically
function sortTrendsChronologically(trends: { date: string; amount: number }[]) {
  return trends.slice().sort((a, b) => compareAsc(new Date(a.date), new Date(b.date)));
}

// Map Prisma result to ExpertAnalyticsDTO with unified contract
export function mapExpertAnalytics(prismaResult: any): ExpertAnalyticsDTO {
  return {
    id: prismaResult.id,
    name: prismaResult.name,
    spendingTrends: sortTrendsChronologically(
      (prismaResult.spendingTrends || []).map((t: any) => ({
        date: format(new Date(t.date), 'yyyy-MM-dd'),
        amount: t.amount,
      }))
    ),
    engagement: {
      sessions: prismaResult.sessions ?? 0,
      messages: prismaResult.messages ?? 0,
    },
    categories: prismaResult.categories || [],
    aiInsights: (prismaResult.aiInsights || []).map((i: any) => ({
      id: i.id,
      type: i.type,
      title: i.title,
      description: i.description,
      confidence: i.confidence,
      source: i.source,
      createdAt: i.createdAt,
      relatedIds: i.relatedIds || [],
      meta: i.meta || {},
    } as AIInsightDTO)),
    // Fill all required fields with safe defaults if not present
    engagementTrends: prismaResult.engagementTrends || [],
    repeatClients: prismaResult.repeatClients ?? 0,
    activeClients: prismaResult.activeClients ?? 0,
    retentionRate: prismaResult.retentionRate ?? 0,
    bookingFunnel: prismaResult.bookingFunnel || [],
    conversionRate: prismaResult.conversionRate ?? 0,
    completed: prismaResult.completed ?? 0,
    cancelled: prismaResult.cancelled ?? 0,
    total: prismaResult.total ?? 0,
    consultationTrends: prismaResult.consultationTrends || [],
    completedCount: prismaResult.completedCount ?? 0,
    pendingCount: prismaResult.pendingCount ?? 0,
    growthPercentage: prismaResult.growthPercentage ?? 0,
    successRate: prismaResult.successRate ?? 0,
    averageRating: prismaResult.averageRating ?? 0,
    reviewDistribution: prismaResult.reviewDistribution || [],
    reviewTrends: prismaResult.reviewTrends || [],
    totalReviews: prismaResult.totalReviews ?? 0,
    consultationCount: prismaResult.consultationCount ?? 0,
    clientCount: prismaResult.clientCount ?? 0,
    reviewCount: prismaResult.reviewCount ?? 0,
    totalRevenue: prismaResult.totalRevenue ?? 0,
    consultationStatusDistribution: prismaResult.consultationStatusDistribution || [],
    meta: prismaResult.meta || {},
  };
}
