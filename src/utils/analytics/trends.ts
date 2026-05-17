// Trend calculation utilities for analytics

import type { TimeSeriesPoint } from "../../types/analytics.types";

export function calcGrowthPercentage(series: TimeSeriesPoint[]): number {
  if (!series || series.length < 2) return 0;
  const prev = series[series.length - 2]?.value ?? 0;
  const curr = series[series.length - 1]?.value ?? 0;
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

export function calcTrendDirection(series: TimeSeriesPoint[]): "up" | "down" | "flat" {
  if (!series || series.length < 2) return "flat";
  const prev = series[series.length - 2]?.value ?? 0;
  const curr = series[series.length - 1]?.value ?? 0;
  if (curr > prev) return "up";
  if (curr < prev) return "down";
  return "flat";
}
