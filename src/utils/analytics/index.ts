// Barrel export for analytics utilities
export * from "./trends";
export * from "./grouping";
export * from "./comparison";
export * from "./rolling-average";
export * from "./formatting";
export * from "./anomaly";

// Example meta builder
export function buildMeta(meta: any = {}) {
  return {
    generatedAt: meta.generatedAt || new Date().toISOString(),
    source: meta.source || "ConsultEdge Analytics Engine",
    ...meta,
  };
}

// Example calculation stubs (to be expanded)
export function calcRetentionRate(result: any): number {
  return typeof result.retentionRate === "number" ? result.retentionRate : 0;
}
export function calcConversionRate(result: any): number {
  return typeof result.conversionRate === "number" ? result.conversionRate : 0;
}
export function calcSuccessRate(result: any): number {
  return typeof result.successRate === "number" ? result.successRate : 0;
}
export function formatBookingFunnel(raw: any[]): any[] {
  return (raw || []).map((item) => ({
    stage: item.stage ?? "",
    value: item.value ?? 0,
  }));
}
export function normalizeConsultationTrends(raw: any[]): any[] {
  return (raw || []).map((item) => ({
    timestamp: item.timestamp ?? item.month ?? item.date ?? "",
    completed: item.completed ?? 0,
    pending: item.pending ?? 0,
  }));
}
export function calcAverageRating(reviewDist: any[]): number {
  if (!reviewDist?.length) return 0;
  const total = reviewDist.reduce((sum, r) => sum + (r.rating * r.count), 0);
  const count = reviewDist.reduce((sum, r) => sum + r.count, 0);
  return count ? Math.round((total / count) * 100) / 100 : 0;
}
export function formatReviewDistribution(raw: any[]): any[] {
  return (raw || []).map((item) => ({
    rating: item.rating ?? 0,
    value: item.count ?? 0,
    label: item.rating ? `${item.rating}★` : "",
    count: item.count ?? 0,
  }));
}
