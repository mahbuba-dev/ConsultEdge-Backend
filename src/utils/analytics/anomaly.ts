// Anomaly detection prep utilities for analytics

import type { TimeSeriesPoint } from "../../types/analytics.types";

export function detectAnomalies(series: TimeSeriesPoint[], threshold: number = 2): number[] {
  // Returns indices of points that are > threshold stddev from mean
  if (!series.length) return [];
  const values = series.map((p) => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
  return series
    .map((p, i) => (Math.abs(p.value - mean) > threshold * std ? i : -1))
    .filter((i) => i !== -1);
}
