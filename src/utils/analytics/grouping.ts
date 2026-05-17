// Grouping utilities for analytics (monthly, weekly, daily)

import type { TimeSeriesPoint } from "../../types/analytics.types";

export function groupByMonth(data: { date: string; value: number }[]): TimeSeriesPoint[] {
  const grouped: Record<string, number> = {};
  for (const item of data) {
    const month = item.date.slice(0, 7); // YYYY-MM
    grouped[month] = (grouped[month] || 0) + item.value;
  }
  return Object.entries(grouped).map(([timestamp, value]) => ({ timestamp, value }));
}
