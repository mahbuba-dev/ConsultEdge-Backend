// Formatting utilities for analytics

import type { DistributionPoint, TimeSeriesPoint } from "../../types/analytics.types";

export function formatDistribution(raw: any[]): DistributionPoint[] {
  return (raw || []).map((item) => ({
    label: item.label ?? item.status ?? item.rating ?? "",
    value: item.value ?? item.count ?? 0,
  }));
}

export function normalizeTimeSeries(raw: any[]): TimeSeriesPoint[] {
  return (raw || []).map((item) => ({
    timestamp: item.timestamp ?? item.month ?? item.date ?? "",
    value: item.value ?? item.count ?? 0,
    ...item,
  }));
}
