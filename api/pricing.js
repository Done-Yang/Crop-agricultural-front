// Pricing data — real calls to the Light Backend presentation API.
// Prices are Lao Kip (₭); use lib/format.formatKip to display them.

import { apiGet } from "@/lib/api-client";

// [{ id, product, category, unit, currentSupply, currentDemand,
//    supplyDemandRatio, marketPrice, fairPrice, priceStatus, trend,
//    changePercent, recommendation }]
export async function getPriceAnalysis({ category, limit = 60 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (category && category !== "all") params.set("category", category);
  const res = await apiGet(`/api/v1/ui/price-analysis?${params.toString()}`);
  return res?.data ?? [];
}

// { weeks: [{ week, p0, p1, ... }], products: [{ key, name, color }] }
export async function getPriceHistory({ limit = 5, weeks = 8 } = {}) {
  const res = await apiGet(`/api/v1/ui/price-history?limit=${limit}&weeks=${weeks}`);
  return res ?? { weeks: [], products: [] };
}

// { totalProducts, avgPriceChange, understockedItems, overstockedItems,
//   atEquilibrium, lastUpdated }
export async function getMarketSummary() {
  return await apiGet("/api/v1/ui/market-summary");
}
