// Mock demand forecast data
export const demandForecastData = [
  { month: "Jan", demand: 4200, supply: 3800, price: 2.5 },
  { month: "Feb", demand: 4500, supply: 4000, price: 2.6 },
  { month: "Mar", demand: 5200, supply: 4500, price: 2.8 },
  { month: "Apr", demand: 5800, supply: 5200, price: 2.7 },
  { month: "May", demand: 6500, supply: 6000, price: 2.5 },
  { month: "Jun", demand: 7200, supply: 6800, price: 2.4 },
  { month: "Jul", demand: 7800, supply: 7500, price: 2.3 },
  { month: "Aug", demand: 7500, supply: 7200, price: 2.4 },
  { month: "Sep", demand: 6800, supply: 6500, price: 2.5 },
  { month: "Oct", demand: 5500, supply: 5200, price: 2.6 },
  { month: "Nov", demand: 4800, supply: 4500, price: 2.7 },
  { month: "Dec", demand: 4500, supply: 4200, price: 2.8 },
];

export const cropRecommendations = [
  {
    id: 1,
    crop: "Tomatoes",
    season: "Spring-Summer",
    demandTrend: "up",
    expectedYield: "25 tons/acre",
    profitMargin: "High",
    plantingWindow: "Mar - Apr",
    harvestWindow: "Jun - Aug",
    recommendationScore: 95,
    description: "High demand expected due to seasonal festivals",
  },
  {
    id: 2,
    crop: "Corn",
    season: "Summer",
    demandTrend: "up",
    expectedYield: "180 bushels/acre",
    profitMargin: "Medium",
    plantingWindow: "Apr - May",
    harvestWindow: "Aug - Sep",
    recommendationScore: 88,
    description: "Steady market demand with good export potential",
  },
  {
    id: 3,
    crop: "Soybeans",
    season: "Summer-Fall",
    demandTrend: "stable",
    expectedYield: "50 bushels/acre",
    profitMargin: "Medium",
    plantingWindow: "May - Jun",
    harvestWindow: "Sep - Oct",
    recommendationScore: 82,
    description: "Consistent demand from food processing industry",
  },
  {
    id: 4,
    crop: "Lettuce",
    season: "Spring-Fall",
    demandTrend: "up",
    expectedYield: "20 tons/acre",
    profitMargin: "High",
    plantingWindow: "Feb - Mar",
    harvestWindow: "Apr - May",
    recommendationScore: 90,
    description: "Growing health food trend increasing demand",
  },
  {
    id: 5,
    crop: "Wheat",
    season: "Fall-Winter",
    demandTrend: "down",
    expectedYield: "60 bushels/acre",
    profitMargin: "Low",
    plantingWindow: "Sep - Oct",
    harvestWindow: "Jun - Jul",
    recommendationScore: 65,
    description: "Market oversupply expected, consider alternatives",
  },
];

export const seasonalDemandData = [
  { season: "Spring", vegetables: 8500, fruits: 6200, grains: 4500 },
  { season: "Summer", vegetables: 9200, fruits: 8500, grains: 5200 },
  { season: "Fall", vegetables: 7800, fruits: 7200, grains: 6800 },
  { season: "Winter", vegetables: 5500, fruits: 4800, grains: 5500 },
];

export async function getDemandForecast() {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return demandForecastData;
}

export async function getCropRecommendations() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return cropRecommendations;
}

export async function getSeasonalDemand() {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return seasonalDemandData;
}
