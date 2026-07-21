// Pricing data — real calls to the Light Backend presentation API.
// Prices are Lao Kip (₭); use lib/format.formatKip to display them.

import { apiGet } from "@/lib/api-client";

// [{ id, product, category, unit, currentSupply, currentDemand,
//    supplyDemandRatio, marketPrice, fairPrice, priceStatus, trend,
//    changePercent, recommendation }]
// The default limit covers every product with a price baseline — the page
// filters client-side, so a low cap here would silently hide products from
// both the category counts and the analysis grid.
export async function getPriceAnalysis({ category, limit = 500 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category && category !== "all") params.set("category", category);
  const res = await apiGet(`/api/v1/ui/price-analysis?${params.toString()}`);
  return res?.data ?? [];
}

// { weeks: [{ week, weekLabel, weekRangeLabel, p0, p1, ... }],
//   products: [{ key, name, color, unit }],
//   available: [{ name, unit, category }], totalAvailable }
//
// `category` restricts the tracked products to that category so the chart
// follows the page's filter instead of always showing the global top-N.
// `products` charts an explicit selection instead of the top-N — that is how
// the UI reaches any tracked product, not just the head of the demand ranking.
// `available` always lists every chartable product in scope, so the picker can
// be populated without a second round trip.
export async function getPriceHistory({ limit = 12, weeks = 8, category, products } = {}) {
  const params = new URLSearchParams({ limit: String(limit), weeks: String(weeks) });
  if (category && category !== "all") params.set("category", category);
  // Repeated `products` params — FastAPI reads them as a list.
  (products ?? []).forEach((name) => params.append("products", name));
  const res = await apiGet(`/api/v1/ui/price-history?${params.toString()}`);
  return res ?? { weeks: [], products: [], available: [], totalAvailable: 0 };
}

// { totalProducts, avgPriceChange, understockedItems, overstockedItems,
//   atEquilibrium, lastUpdated }
export async function getMarketSummary() {
  return await apiGet("/api/v1/ui/market-summary");
}
