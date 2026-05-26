// Mock pricing data
export const priceAnalysisData = [
  {
    id: 1,
    product: "Tomatoes",
    unit: "per kg",
    currentSupply: 85000,
    currentDemand: 92000,
    supplyDemandRatio: 0.92,
    marketPrice: 3.2,
    fairPrice: 3.45,
    priceStatus: "underpriced",
    trend: "up",
    changePercent: 8.5,
    recommendation: "Consider holding inventory for better prices",
  },
  {
    id: 2,
    product: "Corn",
    unit: "per bushel",
    currentSupply: 150000,
    currentDemand: 145000,
    supplyDemandRatio: 1.03,
    marketPrice: 6.8,
    fairPrice: 6.5,
    priceStatus: "overpriced",
    trend: "down",
    changePercent: -4.2,
    recommendation: "Good time to sell before price correction",
  },
  {
    id: 3,
    product: "Soybeans",
    unit: "per bushel",
    currentSupply: 120000,
    currentDemand: 118000,
    supplyDemandRatio: 1.02,
    marketPrice: 14.2,
    fairPrice: 14.0,
    priceStatus: "fair",
    trend: "stable",
    changePercent: 1.2,
    recommendation: "Price is at equilibrium, normal trading advised",
  },
  {
    id: 4,
    product: "Lettuce",
    unit: "per head",
    currentSupply: 45000,
    currentDemand: 52000,
    supplyDemandRatio: 0.87,
    marketPrice: 1.8,
    fairPrice: 2.1,
    priceStatus: "underpriced",
    trend: "up",
    changePercent: 15.2,
    recommendation: "Strong demand - premium pricing possible",
  },
  {
    id: 5,
    product: "Wheat",
    unit: "per bushel",
    currentSupply: 200000,
    currentDemand: 165000,
    supplyDemandRatio: 1.21,
    marketPrice: 7.5,
    fairPrice: 6.8,
    priceStatus: "overpriced",
    trend: "down",
    changePercent: -8.5,
    recommendation: "Oversupply in market, sell early or store",
  },
  {
    id: 6,
    product: "Potatoes",
    unit: "per kg",
    currentSupply: 95000,
    currentDemand: 98000,
    supplyDemandRatio: 0.97,
    marketPrice: 1.2,
    fairPrice: 1.25,
    priceStatus: "fair",
    trend: "stable",
    changePercent: 2.1,
    recommendation: "Stable market conditions, steady sales advised",
  },
];

export const priceHistoryData = [
  { week: "W1", tomatoes: 2.8, corn: 7.2, soybeans: 13.8, lettuce: 1.5 },
  { week: "W2", tomatoes: 2.9, corn: 7.0, soybeans: 13.9, lettuce: 1.6 },
  { week: "W3", tomatoes: 3.0, corn: 6.9, soybeans: 14.0, lettuce: 1.7 },
  { week: "W4", tomatoes: 3.1, corn: 6.8, soybeans: 14.1, lettuce: 1.8 },
  { week: "W5", tomatoes: 3.2, corn: 6.8, soybeans: 14.2, lettuce: 1.8 },
  { week: "W6", tomatoes: 3.3, corn: 6.7, soybeans: 14.2, lettuce: 1.9 },
  { week: "W7", tomatoes: 3.4, corn: 6.6, soybeans: 14.1, lettuce: 2.0 },
  { week: "W8", tomatoes: 3.5, corn: 6.5, soybeans: 14.0, lettuce: 2.1 },
];

export const marketSummary = {
  totalProducts: 6,
  avgPriceChange: 2.4,
  understockedItems: 2,
  overstockedItems: 2,
  atEquilibrium: 2,
  lastUpdated: new Date().toISOString(),
};

export async function getPriceAnalysis() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return priceAnalysisData;
}

export async function getPriceHistory() {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return priceHistoryData;
}

export async function getMarketSummary() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return marketSummary;
}
