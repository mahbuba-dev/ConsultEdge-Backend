// Comparison period utilities for analytics

export function getComparisonPeriod(current: string, monthsBack: number = 1): string {
  const date = new Date(current);
  date.setMonth(date.getMonth() - monthsBack);
  return date.toISOString().slice(0, 7); // YYYY-MM
}
