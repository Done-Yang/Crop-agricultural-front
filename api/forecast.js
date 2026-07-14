// Demand-forecast + crop-recommendation data — real calls to the Light Backend
// presentation API (/api/v1/ui/*). Return shapes match what the pages consume.

import { apiGet } from "@/lib/api-client";

// [{ month, monthIndex, year, demand, supply, price }]
export async function getDemandForecast() {
  const res = await apiGet("/api/v1/ui/demand-forecast");
  return res?.data ?? [];
}

// [{ id, crop, season, demandTrend, expectedYield, profitMargin,
//    plantingWindow, harvestWindow, recommendationScore, description, ... }]
export async function getCropRecommendations(limit = 12) {
  const res = await apiGet(`/api/v1/ui/crop-recommendations?limit=${limit}`);
  return res?.data ?? [];
}

// { seasons: [{ season, cat0, cat1, ... }], categories: [{ key, name, color }] }
export async function getSeasonalDemand(top = 5) {
  const res = await apiGet(`/api/v1/ui/seasonal-demand?top=${top}`);
  return res ?? { seasons: [], categories: [] };
}
