// Demand-forecast + crop-recommendation data — real calls to the Light Backend
// presentation API (/api/v1/ui/*). Return shapes match what the pages consume.

import { apiGet } from "@/lib/api-client";

// [{ month, monthShort, monthIndex, year, label, band, season,
//    demand, demandProjected, demandLower, demandUpper, supply, price,
//    rangeStart, rangeEnd, rangeLabel, days }]
//
// `band` is the confidence tier of the point — "actual" (observed orders),
// "forecast" (model-backed) or "projected" (trend extrapolation beyond the
// model's seasonal reach). `demand` and `demandProjected` split the same
// series across two keys so the chart can draw the projected tail dashed.
export async function getDemandForecast() {
  const res = await apiGet("/api/v1/ui/demand-forecast");
  return res?.data ?? [];
}

// [{ id, crop, categoryName, unit, season, seasonDuration, demandTrend,
//    recommendedAction, expectedDemand, expectedDemandLabel, expectedYield,
//    profitMargin, plantingWindow, harvestWindow, plantMonth, plantMonthName,
//    peakMonth, peakMonthName, recommendationScore, fairPrice, description }]
export async function getCropRecommendations(limit = 12) {
  const res = await apiGet(`/api/v1/ui/crop-recommendations?limit=${limit}`);
  return res?.data ?? [];
}

// { seasons: [{ season, months, monthRange, monthCount, observedRangeLabel,
//               cat0, cat1, ... }],
//   categories: [{ key, name, color }] }
export async function getSeasonalDemand(top = 5) {
  const res = await apiGet(`/api/v1/ui/seasonal-demand?top=${top}`);
  return res ?? { seasons: [], categories: [] };
}

// Year-round planting calendar — all 12 months, each listing the crops best
// planted in it (~3 months ahead of their forecast peak demand).
// [{ month, monthShort, monthIndex, season, seasonDuration, totalCrops,
//    crops: [{ id, crop, categoryName, unit, recommendedAction,
//              expectedDemand, recommendationScore, harvestWindow,
//              peakMonthName }] }]
export async function getPlantingCalendar(perMonth = 6) {
  const res = await apiGet(`/api/v1/ui/planting-calendar?per_month=${perMonth}`);
  return res?.data ?? [];
}
