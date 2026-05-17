export interface ClientAnalyticsDTO {
  id: string;
  name: string;
  savedExperts: string[];
  engagement: { sessions: number; messages: number };
  spendingTrends: { date: string; amount: number }[];
  aiInsights: AIInsightDTO[];
}

export interface AdminAnalyticsDTO {
  id: string;
  platformTrends: { date: string; value: number }[];
  categoryBreakdown: { category: string; count: number }[];
  aiInsights: AIInsightDTO[];
}

export interface AIAnalyticsDTO {
  id: string;
  usageTrends: { date: string; count: number }[];
  feedback: { likes: number; dislikes: number };
  aiInsights: AIInsightDTO[];
}
// Centralized analytics DTO/type layer for ConsultEdge
// Shared primitives, domain DTOs, and future-ready fields

export interface AIInsightDTO {
  id: string;
  type: 'summary' | 'anomaly' | 'recommendation' | 'trend';
  title: string;
  description: string;
  confidence: number; // 0-1
  source: 'ai' | 'human' | 'hybrid';
  createdAt: string; // ISO date
  relatedIds?: string[];
  meta?: Record<string, any>;
}

export interface ExpertAnalyticsDTO {
  id: string;
  name: string;
  spendingTrends: { date: string; amount: number }[];
  engagement: { sessions: number; messages: number };
  categories: string[];
  aiInsights: AIInsightDTO[];
}

// --- Shared Primitives ---

export interface TimeSeriesPoint {
  timestamp: string; // ISO date string (month, day, or hour granularity)
  value: number;
  [key: string]: number | string | undefined; // For multi-series support
}

export interface DistributionPoint {
  label: string; // e.g., rating, status, category
  value: number;
}

export interface InsightDTO {
  title: string;
  insight: string;
  trend: "positive" | "negative" | "neutral";
  severity: "low" | "medium" | "high";
  generatedAt: string; // ISO date
  source?: string;
  confidence?: number; // 0-1
  comparisonPeriod?: string;
  trendDirection?: "up" | "down" | "flat";
  anomalyFlags?: string[];
  meta?: AnalyticsMeta;
}

export interface AnalyticsMeta {
  generatedAt: string;
  source: string;
  confidence?: number;
  comparisonPeriod?: string;
  trendDirection?: "up" | "down" | "flat";
  anomalyFlags?: string[];
  realtime?: boolean;
  [key: string]: any;
}

// --- AI Analytics DTOs ---

export interface AIInsightDTO extends InsightDTO {
  aiModel: string;
  aiVersion?: string;
  aiPrompt?: string;
  aiResponseId?: string;
  aiLatencyMs?: number;
}

export interface AIAnalyticsDTO {
  usageTrends: TimeSeriesPoint[];
  featureDistribution: DistributionPoint[];
  aiInsights: AIInsightDTO[];
  totalRequests: number;
  uniqueUsers: number;
  generatedAt: string;
  meta?: AnalyticsMeta;
}

// --- Expert Analytics DTOs ---

export interface ExpertEngagementTrend extends TimeSeriesPoint {
  activeClients: number;
  repeatClients: number;
}

export interface ExpertBookingFunnelStage {
  stage: string;
  value: number;
}

export interface ExpertConsultationTrend extends TimeSeriesPoint {
  completed: number;
  pending: number;
}

export interface ExpertReviewDistribution extends DistributionPoint {
  rating: number;
}

export interface ExpertAnalyticsDTO {
  engagementTrends: ExpertEngagementTrend[];
  repeatClients: number;
  activeClients: number;
  retentionRate: number;
  bookingFunnel: ExpertBookingFunnelStage[];
  conversionRate: number;
  completed: number;
  cancelled: number;
  total: number;
  consultationTrends: ExpertConsultationTrend[];
  completedCount: number;
  pendingCount: number;
  growthPercentage: number;
  successRate: number;
  averageRating: number;
  reviewDistribution: ExpertReviewDistribution[];
  reviewTrends: TimeSeriesPoint[];
  totalReviews: number;
  consultationCount: number;
  clientCount: number;
  reviewCount: number;
  totalRevenue: number;
  consultationStatusDistribution: DistributionPoint[];
  meta?: AnalyticsMeta;
}

// --- Client Analytics DTOs ---

export interface ClientEngagementTrend extends TimeSeriesPoint {
  bookings: number;
  spending: number;
  aiUsage: number;
}

export interface ClientAnalyticsDTO {
  engagementTrends: ClientEngagementTrend[];
  bookingActivity: TimeSeriesPoint[];
  spendingTrends: TimeSeriesPoint[];
  aiUsageTrends: TimeSeriesPoint[];
  categoryDistribution: DistributionPoint[];
  retentionRate: number;
  activeExperts: number;
  savedExperts: number;
  consultationHistory: TimeSeriesPoint[];
  meta?: AnalyticsMeta;
}

// --- Admin Analytics DTOs ---

export interface AdminGrowthTrend extends TimeSeriesPoint {
  experts: number;
  clients: number;
  consultations: number;
  revenue: number;
}

export interface AdminAnalyticsDTO {
  growthTrends: AdminGrowthTrend[];
  industryDistribution: DistributionPoint[];
  revenueTrends: TimeSeriesPoint[];
  aiUsageTrends: TimeSeriesPoint[];
  topExperts: DistributionPoint[];
  topCategories: DistributionPoint[];
  activeUsers: number;
  inactiveUsers: number;
  totalRevenue: number;
  totalConsultations: number;
  totalClients: number;
  totalExperts: number;
  meta?: AnalyticsMeta;
}

// --- Realtime/Explainability/Degraded States ---

export interface RealtimeAnalyticsMeta extends AnalyticsMeta {
  realtime: true;
  lastUpdated: string;
  updateIntervalSec: number;
}

export interface AnalyticsDegradedState {
  reason: string;
  missingFields: string[];
  degraded: true;
  meta?: AnalyticsMeta;
}

// --- Export boundaries for future modules ---
// (e.g., export * from './ai-analytics.types';)
