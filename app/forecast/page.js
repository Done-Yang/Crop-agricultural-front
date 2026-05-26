"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getDemandForecast, getCropRecommendations, getSeasonalDemand } from "@/api/forecast";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Sprout,
  BarChart3,
  ChevronRight,
  Leaf,
} from "lucide-react";
import MainLayout from "@/components/mainLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

function TrendIcon({ trend }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-trend-up" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-trend-down" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function RecommendationCard({ recommendation }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sprout className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{recommendation.crop}</h3>
              <p className="text-sm text-muted-foreground">{recommendation.season}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon trend={recommendation.demandTrend} />
            <span
              className={`text-sm font-medium ${
                recommendation.demandTrend === "up"
                  ? "text-trend-up"
                  : recommendation.demandTrend === "down"
                  ? "text-trend-down"
                  : "text-muted-foreground"
              }`}
            >
              {recommendation.demandTrend === "up" ? "ກຳລັງເພີ່ມຂຶ້ນ" : recommendation.demandTrend === "down" ? "ກຳລັງຫຼຸດລົງ" : "ຄົງທີ່"}
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{recommendation.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">ຊ່ວງປູກ</p>
            <p className="text-sm font-medium text-foreground">{recommendation.plantingWindow}</p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">ຊ່ວງເກັບກ່ຽວ</p>
            <p className="text-sm font-medium text-foreground">{recommendation.harvestWindow}</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${recommendation.recommendationScore}%` }}
              />
            </div>
            <span className="text-sm font-medium text-primary">{recommendation.recommendationScore}%</span>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              recommendation.profitMargin === "High"
                ? "bg-trend-up/10 text-trend-up"
                : recommendation.profitMargin === "Medium"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            ກຳໄລ {recommendation.profitMargin === "High" ? "ສູງ" : recommendation.profitMargin === "Medium" ? "ປານກາງ" : "ຕ່ຳ"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ForecastPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [forecastData, setForecastData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [seasonalData, setSeasonalData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trends");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [forecast, crops, seasonal] = await Promise.all([
          getDemandForecast(),
          getCropRecommendations(),
          getSeasonalDemand(),
        ]);
        setForecastData(forecast);
        setRecommendations(crops);
        setSeasonalData(seasonal);
      } catch (error) {
        console.error("Failed to load forecast data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout
      title="ການພະຍາກອນຄວາມຕ້ອງການ"
      subtitle="ວາງແຜນປູກພືດໂດຍອີງໃສ່ແນວໂນ້ມຕະຫຼາດ"
      headerActions={
        <Button variant="outline" size="sm" className="hidden md:flex">
          <Calendar className="w-4 h-4 mr-2" />
          ປີນີ້
        </Button>
      }
      headerExtra={
        <div className="px-4 md:px-6 flex gap-1">
          <button
            onClick={() => setActiveTab("trends")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "trends"
                ? "bg-background text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            ແນວໂນ້ມ
          </button>
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === "recommendations"
                ? "bg-background text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Leaf className="w-4 h-4 inline mr-2" />
            ຄຳແນະນຳ
          </button>
        </div>
      }
    >
      <main className="p-4 md:p-6 max-w-6xl mx-auto">
        {activeTab === "trends" ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ພາບລວມຄວາມຕ້ອງການ</p>
                  <p className="text-2xl font-bold text-foreground">ກໍລະກົດ</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-trend-up" />
                    <span className="text-sm text-trend-up">7,800 ໜ່ວຍ</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ລະດູຕ່ຳ</p>
                  <p className="text-2xl font-bold text-foreground">ມັງກອນ</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="w-4 h-4 text-trend-down" />
                    <span className="text-sm text-trend-down">4,200 ໜ່ວຍ</span>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ການເຕີບໂຕສະເລ່ຍ</p>
                  <p className="text-2xl font-bold text-foreground">+12.5%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-trend-up" />
                    <span className="text-sm text-trend-up">ທຽບກັບປີກ່ອນ</span>
                  </div>
                </CardContent>
              </Card>
              {/* <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ຊ່ອງວ່າງອຸປະທານ</p>
                  <p className="text-2xl font-bold text-foreground">-5.2%</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Minus className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary">ໂອກາດ</span>
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* Demand vs Supply Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ແນວໂນ້ມຄວາມຕ້ອງການ</CardTitle>
                <CardDescription>ການຄາດຄະເນປັດຈຸບັນ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                      <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="demand"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--primary)" }}
                        name="ຄວາມຕ້ອງການທີ່ພະຍາກອນ"
                      />
                      <Line
                        type="monotone"
                        dataKey="supply"
                        stroke="var(--trend-up)"
                        strokeWidth={2}
                        dot={{ fill: "var(--trend-up)" }}
                        name="ຈຳນວນການບໍລິໂພກທີ່ຜ່ານມາ"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Seasonal Demand by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ຄວາມຕ້ອງການຕາມລະດູຕາມໝວດໝູ່</CardTitle>
                <CardDescription>ປຽບທຽບຄວາມຕ້ອງການລະຫວ່າງໝວດໝູ່ຜະລິດຕະພັນ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonalData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="season" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                      <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="vegetables" fill="var(--trend-up)" name="ຜັກ" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="fruits" fill="var(--primary)" name="ໝາກໄມ້" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="grains" fill="var(--chart-4)" name="ທັນຍະພືດ" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recommendations Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">ຄຳແນະນຳສຳລັບການວາງແຜນ</h2>
                <p className="text-sm text-muted-foreground">
                  ແນະນຳ {recommendations.length} ພືດປູກໂດຍອີງໃສ່ຄວາມຕ້ອງການຕາມລະດູ
                </p>
              </div>
              <Button variant="outline" size="sm">
                ກັ່ນຕອງ
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Top Recommendation Highlight */}
            <Card className="bg-suggestion border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    ຕົວເລືອກອັນດັບໜຶ່ງ
                  </div>
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{recommendations[0]?.crop}</h3>
                    <p className="text-muted-foreground mt-1">{recommendations[0]?.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{recommendations[0]?.recommendationScore}%</p>
                    <p className="text-sm text-muted-foreground">ຄະແນນຄວາມເໝາະສົມ</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">ຜົນຜະລິດທີ່ຄາດໄວ້</p>
                    <p className="font-medium text-foreground">{recommendations[0]?.expectedYield}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ຊ່ວງປູກ</p>
                    <p className="font-medium text-foreground">{recommendations[0]?.plantingWindow}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ອັດຕາກຳໄລ</p>
                    <p className="font-medium text-trend-up">{recommendations[0]?.profitMargin === "High" ? "ສູງ" : recommendations[0]?.profitMargin === "Medium" ? "ປານກາງ" : "ຕ່ຳ"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* All Recommendations */}
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.slice(1).map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>
        )}
      </main>
    </MainLayout>
  );
}
