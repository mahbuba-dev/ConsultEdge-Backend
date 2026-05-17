// Rolling average utilities for analytics

import type { TimeSeriesPoint } from "../../types/analytics.types";

export function rollingAverage(series: TimeSeriesPoint[], window: number = 3): TimeSeriesPoint[] {
  return series.map((point, idx, arr) => {
    const start = Math.max(0, idx - window + 1);
    const windowPoints = arr.slice(start, idx + 1);
    const avg = windowPoints.reduce((sum, p) => sum + p.value, 0) / windowPoints.length;
    return { ...point, value: Math.round(avg) };
  });
}
