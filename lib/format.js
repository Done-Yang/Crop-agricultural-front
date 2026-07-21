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

// Quantity with its selling unit, e.g. (598, "ກິໂລ") -> "598 ກິໂລ".
// The unit comes from the real price records (ກິໂລ, ຖົງ, ຫມື່ນ, ແຕະ, …), so
// never assume kg — fall back to a bare number when it is missing.
export function formatQuantity(value, unit) {
  const n = formatNumber(value);
  if (n === "-") return "-";
  return unit ? `${n} ${unit}` : n;
}

// A price expressed per selling unit, e.g. "25,000 ₭ / ກິໂລ".
export function formatKipPerUnit(value, unit) {
  const price = formatKip(value);
  if (price === "-") return "-";
  return unit ? `${price} / ${unit}` : price;
}

// Day-of-month numbers a monthly point covers, e.g. "1–30". Points carry
// `rangeStart`/`rangeEnd` as ISO dates; a partial month (a half-finished June)
// therefore prints its real extent rather than the whole calendar month.
// Returns "" when the point has no observed span, so the axis just omits it.
export function dayRangeLabel(point) {
  if (!point?.rangeStart || !point?.rangeEnd) return "";
  const start = Number(point.rangeStart.slice(8, 10));
  const end = Number(point.rangeEnd.slice(8, 10));
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "";
  return start === end ? `${start}` : `${start}–${end}`;
}

// Aggregate totals sum products sold in different units (ກິໂລ, ຖົງ, ຕຸກ, …),
// so no single unit is correct for them. Label them as a mixed total instead
// of implying a unit the number does not actually have.
export const MIXED_UNIT_LABEL = "ລວມທຸກໜ່ວຍ";

// Confidence tier of a forecast point -> how it should read in the UI.
// "projected" months are trend extrapolation only: with under a year of
// history the model has never observed them, so they must never be presented
// with the same weight as model-backed months.
export const BAND_META = {
  actual: { label: "ຂໍ້ມູນຈິງ", hint: "ຈາກຄຳສັ່ງຊື້ຕົວຈິງ" },
  forecast: { label: "ພະຍາກອນ", hint: "ຈາກແບບຈຳລອງ (ໜ້າເຊື່ອຖື)" },
  projected: { label: "ຄາດຄະເນ", hint: "ຄາດຄະເນຕາມແນວໂນ້ມ — ຄວາມເຊື່ອໝັ້ນຕ່ຳ" },
};
