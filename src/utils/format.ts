// ---------------------------------------------------------------------------
// Formatting utilities
// ---------------------------------------------------------------------------

/**
 * Format a number as USD currency.
 * - Values >= $1 use 2 decimal places.
 * - Values < $1 use 6 decimal places (useful for low-cap tokens).
 */
export function formatCurrency(value: number): string {
  const decimals = Math.abs(value) < 1 ? 6 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a number in compact notation (e.g. 1.2B, 450M).
 * Returns "N/A" when the value is null or undefined.
 */
export function formatCompact(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number as a signed percentage (e.g. +2.45%, -0.73%).
 * Returns "N/A" when the value is null or undefined.
 */
export function formatPercent(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
