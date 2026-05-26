"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getDemandForecast, getCropRecommendations } from "@/api/forecast";
import { getPriceAnalysis, getMarketSummary } from "@/api/pricing";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Sprout,
  BarChart3,
  ChevronRight,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import MainLayout from "@/components/mainLayout";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

function QuickStatCard({ title, value, change, trend, icon: Icon }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm ${
                trend === "up" ? "text-trend-up" : "text-trend-down"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {change}
            </div>
          )}
        </div>
        <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
      </CardContent>
    </Card>
  );
}

function TopCropCard({ crop, rank }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {rank}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground">{crop.crop}</p>
        <p className="text-xs text-muted-foreground">{crop.season}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-primary">{crop.recommendationScore}%</p>
        <p className="text-xs text-muted-foreground">ຄວາມເໝາະສົມ</p>
      </div>
    </div>
  );
}

function PriceAlertCard({ item }) {
  const statusColors = {
    underpriced: { bg: "bg-trend-up/10", text: "text-trend-up", label: "ຕ່ຳກວ່າຍຸຕິທຳ" },
    overpriced: { bg: "bg-trend-down/10", text: "text-trend-down", label: "ສູງກວ່າຍຸຕິທຳ" },
    fair: { bg: "bg-primary/10", text: "text-primary", label: "ຍຸຕິທຳ" },
  };
  const status = statusColors[item.priceStatus] || statusColors.fair;

  return (
    <div className="flex items-center justify-between p-3 border-b border-border last:border-0">
      <div>
        <p className="font-medium text-foreground">{item.product}</p>
        <p className="text-sm text-muted-foreground">
          ${item.marketPrice.toFixed(2)} / ${item.fairPrice.toFixed(2)}
        </p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
        {status.label}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [forecastData, setForecastData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [forecast, crops, prices, marketSummary] = await Promise.all([
          getDemandForecast(),
          getCropRecommendations(),
          getPriceAnalysis(),
          getMarketSummary(),
        ]);
        setForecastData(forecast);
        setRecommendations(crops);
        setPriceData(prices);
        setSummary(marketSummary);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
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

  const peakMonth = forecastData.reduce((max, item) => (item.demand > max.demand ? item : max), forecastData[0]);

  return (
    <MainLayout title="ລະບົບຊ່ວຍເຫຼືອການກະສິກຳ">
      <main className="p-4 md:p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <QuickStatCard
            title="ຄວາມຕ້ອງການ"
            value={peakMonth?.month || "N/A"}
            change="+12.5%"
            trend="up"
            icon={TrendingUp}
          />
          <QuickStatCard
            title="ຜະລິດຕະພັນທີ່ຕິດຕາມ"
            value={summary?.totalProducts || 0}
            change={null}
            trend={null}
            icon={BarChart3}
          />
          <QuickStatCard
            title="ການປ່ຽນແປງລາຄາສະເລ່ຍ"
            value={`+${summary?.avgPriceChange || 0}%`}
            change="ທຽບກັບອາທິດແລ້ວ"
            trend="up"
            icon={DollarSign}
          />
          {/* <QuickStatCard
            title="ພືດປູກອັນດັບໜຶ່ງ"
            value={recommendations[0]?.crop || "N/A"}
            change={`${recommendations[0]?.recommendationScore || 0}%`}
            trend="up"
            icon={Sprout}
          /> */}
        </div>

        {/* Demand Trend Mini Chart */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">ແນວໂນ້ມຄວາມຕ້ອງການ</CardTitle>
              {/* <Link href="/forecast">
                <Button variant="ghost" size="sm" className="text-primary">
                  ເບິ່ງທັງໝົດ
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData}>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="supply"
                    stroke="var(--trend-up)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">ຄວາມຕ້ອງການທີ່ພະຍາກອນ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-trend-up" />
                <span className="text-sm text-muted-foreground">ຈຳນວນການບໍລິໂພກທີ່ຜ່ານມາ</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Two Column Layout for Desktop */}
        <div className="grid gap-6">
          {/* Top Crop Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">ຄຳແນະນຳອັນດັບຕົ້ນ</CardTitle>
                {/* <Link href="/forecast">
                  <Button variant="ghost" size="sm" className="text-primary">
                    ເບິ່ງທັງໝົດ
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.slice(0, 3).map((crop, index) => (
                <TopCropCard key={crop.id} crop={crop} rank={index + 1} />
              ))}
            </CardContent>
          </Card>

          {/* Price Alerts */}
          {/* <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">ການແຈ້ງເຕືອນລາຄາ</CardTitle>
                <Link href="/pricing">
                  <Button variant="ghost" size="sm" className="text-primary">
                    ເບິ່ງທັງໝົດ
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4">
                {priceData.slice(0, 4).map((item) => (
                  <PriceAlertCard key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card> */}
        </div>
      </main>
    </MainLayout>
  );
}
