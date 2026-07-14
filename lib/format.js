// Display formatting helpers. Prices in this app are Lao Kip (₭), so they are
// large integers — never show them as USD or with two decimals.

const kipFormatter = new Intl.NumberFormat("lo-LA", {
  maximumFractionDigits: 0,
});

// Format a Kip amount, e.g. 25000 -> "25,000 ₭".
export function formatKip(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return `${kipFormatter.format(Math.round(n))} ₭`;
}

// Compact Kip for tight spaces, e.g. 25000 -> "25K ₭", 1200000 -> "1.2M ₭".
export function formatKipCompact(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M ₭`;
  if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)}K ₭`;
  return `${Math.round(n)} ₭`;
}

// Thousands-separated integer without a currency suffix.
export function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "-";
  return kipFormatter.format(Math.round(n));
}
