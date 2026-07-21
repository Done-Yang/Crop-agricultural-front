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
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { formatNumber, formatQuantity, BAND_META, MIXED_UNIT_LABEL } from "@/lib/format";
import { MonthDayTick } from "@/components/chart-axis";

// Names the date duration each monthly point covers, plus how much confidence
// it carries (observed / model-backed / extrapolated).
function DemandTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  const band = BAND_META[point.band] ?? BAND_META.forecast;
  const demand = point.demand ?? point.demandProjected;

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md">
      <p className="font-semibold text-foreground">
        {point.month} {point.year}
      </p>
      {point.rangeLabel && (
        <p className="text-xs text-muted-foreground">
          {point.rangeLabel} ({point.days} ວັນ)
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{band.label} — {band.hint}</p>
      {/* Totals span products sold in different units, so they are labelled as
          a mixed total rather than borrowing any one product's unit. */}
      <div className="mt-2 space-y-1 text-sm">
        {demand > 0 && (
          <p className="text-primary">
            ຄວາມຕ້ອງການ: {formatQuantity(demand, MIXED_UNIT_LABEL)}
          </p>
        )}
        {point.supply > 0 && (
          <p className="text-trend-up">
            ການບໍລິໂພກຕົວຈິງ: {formatQuantity(point.supply, MIXED_UNIT_LABEL)}
          </p>
        )}
      </div>
    </div>
  );
}

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
      <div className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
        {rank}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{crop.crop}</p>
        <p className="text-xs text-muted-foreground">
          {crop.season}
          {crop.seasonDuration ? ` · ${crop.seasonDuration}` : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatQuantity(crop.expectedDemand, crop.unit)}
          {crop.peakMonthName ? ` · ສູງສຸດ ${crop.peakMonthName}` : ""}
        </p>
      </div>
      <div className="shrink-0 text-right">
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
          getCropRecommendations(10),
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

  // `demand` is null on extrapolated months (they carry `demandProjected`
  // instead), so fall back through both before using historical supply.
  const metricOf = (d) => (d.demand ?? d.demandProjected ?? 0) || d.supply || 0;
  const withMetric = forecastData.filter((d) => metricOf(d) > 0);
  const peakMonth = withMetric.reduce(
    (max, item) => (metricOf(item) > metricOf(max) ? item : max),
    withMetric[0] || null
  );
  const spanLabel =
    forecastData.length > 0
      ? `${forecastData[0].month} ${forecastData[0].year} - ${
          forecastData[forecastData.length - 1].month
        } ${forecastData[forecastData.length - 1].year}`
      : "-";

  return (
    <MainLayout title="ລະບົບຊ່ວຍເຫຼືອການກະສິກຳ">
      <main className="p-4 md:p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <QuickStatCard
            title={
              peakMonth?.rangeLabel
                ? `ຄວາມຕ້ອງການສູງສຸດ · ${peakMonth.rangeLabel}`
                : "ຄວາມຕ້ອງການສູງສຸດ"
            }
            value={peakMonth ? `${peakMonth.month} ${peakMonth.year}` : "N/A"}
            change={`${formatNumber(peakMonth ? metricOf(peakMonth) : 0)} ${MIXED_UNIT_LABEL}`}
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
              <div>
                <CardTitle className="text-lg">ແນວໂນ້ມຄວາມຕ້ອງການ</CardTitle>
                {/* The span the chart covers, so the axis is never read as
                    "the last N months" of something unspecified. */}
                <p className="text-sm text-muted-foreground">
                  {spanLabel} ({forecastData.length} ເດືອນ)
                </p>
              </div>
              <Link href="/forecast">
                <Button variant="ghost" size="sm" className="text-primary">
                  ເບິ່ງທັງໝົດ
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastData} margin={{ bottom: 12 }}>
                  {/* Two-line tick: month + the day numbers it covers. */}
                  <XAxis
                    dataKey="label"
                    className="text-xs"
                    tick={<MonthDayTick data={forecastData} />}
                    height={38}
                    interval="preserveStartEnd"
                    minTickGap={16}
                  />
                  <Tooltip content={<DemandTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="supply"
                    stroke="var(--trend-up)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="demand"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  {/* Extrapolated tail — dashed so it never reads as equally
                      confident as the model-backed segment. */}
                  <Line
                    type="monotone"
                    dataKey="demandProjected"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    strokeOpacity={0.65}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-trend-up" />
                <span className="text-sm text-muted-foreground">ການບໍລິໂພກຕົວຈິງ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">ຄວາມຕ້ອງການທີ່ພະຍາກອນ</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0 w-4 border-t-2 border-dashed border-primary/70" />
                <span className="text-sm text-muted-foreground">{BAND_META.projected.label}</span>
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
                <Link href="/forecast">
                  <Button variant="ghost" size="sm" className="text-primary">
                    ເບິ່ງທັງໝົດ
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2">
              {recommendations.slice(0, 10).map((crop, index) => (
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
