"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import {
  getDemandForecast,
  getCropRecommendations,
  getSeasonalDemand,
  getPlantingCalendar,
} from "@/api/forecast";
import { formatNumber, formatQuantity, BAND_META, MIXED_UNIT_LABEL } from "@/lib/format";
import { MonthDayTick, SeasonMonthTick } from "@/components/chart-axis";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  ChevronRight,
  Leaf,
  Filter,
  Info,
  CalendarDays,
} from "lucide-react";
import MainLayout from "@/components/mainLayout";
import { RecommendationCard, MARGIN_LABEL } from "@/components/recommendation";
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

// How many suggestions the tab previews before handing off to the dedicated
// /forecast/recommendations page, which carries the full catalogue + filters.
const PREVIEW_COUNT = 8;

// Tooltip for the monthly trend chart: names the date duration the point
// covers and how much confidence the point carries.
function TrendTooltip({ active, payload }) {
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
      <p className="mt-1 text-xs text-muted-foreground">
        {point.season} · {band.label} — {band.hint}
      </p>
      <div className="mt-2 space-y-1 text-sm">
        {demand > 0 && (
          <p className="text-primary">
            ຄວາມຕ້ອງການ: {formatQuantity(demand, MIXED_UNIT_LABEL)}
            {point.band === "projected" ? " (ຄາດຄະເນ)" : ""}
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

function SeasonTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      {point?.monthRange && (
        <p className="text-xs text-muted-foreground">
          {point.monthRange} ({point.monthCount} ເດືອນ)
        </p>
      )}
      {point?.monthNumbersLabel && (
        <p className="text-xs text-muted-foreground">ເດືອນ {point.monthNumbersLabel}</p>
      )}
      {point?.observedRangeLabel && (
        <p className="text-xs text-muted-foreground">ຂໍ້ມູນຈິງ: {point.observedRangeLabel}</p>
      )}
      <div className="mt-2 space-y-0.5 text-sm">
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color }}>
            {entry.name}: {formatQuantity(entry.value, MIXED_UNIT_LABEL)}
          </p>
        ))}
      </div>
      {/* A season built partly from forecast must say so — otherwise the bar
          reads as if every month of it had been observed. */}
      {point?.hasForecast && (
        <p className="mt-2 border-t border-border pt-1.5 text-xs text-muted-foreground">
          ຂໍ້ມູນຈິງ {formatNumber(point.actualQuantity)} · ພະຍາກອນ{" "}
          {formatNumber(point.forecastQuantity)}
        </p>
      )}
    </div>
  );
}

// One month of the year-round planting calendar.
function CalendarMonthCard({ entry }) {
  const empty = entry.totalCrops === 0;
  return (
    <div
      className={`rounded-xl border p-3 ${
        empty ? "border-dashed border-border bg-muted/30" : "border-border bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between">
        <p className="font-semibold text-foreground">{entry.month}</p>
        <span className="text-xs text-muted-foreground">{entry.season}</span>
      </div>
      {empty ? (
        <p className="mt-3 text-xs text-muted-foreground">ບໍ່ມີພືດທີ່ແນະນຳໃນເດືອນນີ້</p>
      ) : (
        <>
          <p className="mt-1 text-xs text-primary">{entry.totalCrops} ຊະນິດແນະນຳ</p>
          <ul className="mt-2 space-y-1.5">
            {entry.crops.map((crop) => (
              <li key={crop.id} className="text-sm">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-foreground">{crop.crop}</span>
                  <span className="shrink-0 text-xs font-medium text-primary">
                    {crop.recommendationScore}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ເກັບກ່ຽວ {crop.peakMonthName} · {formatQuantity(crop.expectedDemand, crop.unit)}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function ForecastPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [forecastData, setForecastData] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [seasonalData, setSeasonalData] = useState({ seasons: [], categories: [] });
  const [calendar, setCalendar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("trends");
  const [yearOnly, setYearOnly] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [forecast, crops, seasonal, cal] = await Promise.all([
          getDemandForecast(),
          // The full set, so the "view all" count is the real total even
          // though this tab only previews the head of it.
          getCropRecommendations(500),
          getSeasonalDemand(),
          getPlantingCalendar(4),
        ]);
        setForecastData(forecast);
        setRecommendations(crops);
        setSeasonalData(seasonal);
        setCalendar(cal);
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

  // "ປີນີ້" narrows the series to a 12-month planning window starting at the
  // last month with real orders — the span a farmer is actually planning over.
  const chartData = useMemo(() => {
    if (!yearOnly || forecastData.length === 0) return forecastData;
    const lastActual = forecastData.map((d) => d.band).lastIndexOf("actual");
    const start = lastActual < 0 ? 0 : lastActual;
    return forecastData.slice(start, start + 12);
  }, [forecastData, yearOnly]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Derive peak / low demand months from the real series (demand where the
  // forecast exists, otherwise historical supply).
  const metricOf = (d) => (d.demand ?? d.demandProjected ?? 0) || d.supply || 0;
  const withMetric = chartData.filter((d) => metricOf(d) > 0);
  const peakPoint = withMetric.reduce(
    (max, d) => (metricOf(d) > metricOf(max) ? d : max),
    withMetric[0] || null
  );
  const lowPoint = withMetric.reduce(
    (min, d) => (metricOf(d) < metricOf(min) ? d : min),
    withMetric[0] || null
  );

  const projectedCount = chartData.filter((d) => d.band === "projected").length;
  const spanLabel =
    chartData.length > 0
      ? `${chartData[0].month} ${chartData[0].year} - ${
          chartData[chartData.length - 1].month
        } ${chartData[chartData.length - 1].year}`
      : "-";

  // The tab previews the strongest suggestions; ກັ່ນຕອງ opens the full
  // catalogue where every product can be filtered and sorted.
  const topPick = recommendations[0];
  const preview = recommendations.slice(1, PREVIEW_COUNT + 1);

  return (
    <MainLayout
      title="ການພະຍາກອນຄວາມຕ້ອງການ"
      subtitle="ວາງແຜນປູກພືດໂດຍອີງໃສ່ແນວໂນ້ມຕະຫຼາດ"
      headerActions={
        <Button
          variant={yearOnly ? "default" : "outline"}
          size="sm"
          className="hidden md:flex"
          onClick={() => setYearOnly((v) => !v)}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {yearOnly ? "12 ເດືອນຂ້າງໜ້າ" : "ທັງໝົດ"}
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ເດືອນຄວາມຕ້ອງການສູງສຸດ</p>
                  <p className="text-2xl font-bold text-foreground">
                    {peakPoint ? `${peakPoint.month} ${peakPoint.year}` : "N/A"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-trend-up shrink-0" />
                    <span className="text-sm text-trend-up">
                      {formatNumber(peakPoint ? metricOf(peakPoint) : 0)} {MIXED_UNIT_LABEL}
                    </span>
                  </div>
                  {peakPoint?.rangeLabel && (
                    <p className="mt-1 text-xs text-muted-foreground">{peakPoint.rangeLabel}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ລະດູຕ່ຳ</p>
                  <p className="text-2xl font-bold text-foreground">
                    {lowPoint ? `${lowPoint.month} ${lowPoint.year}` : "N/A"}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingDown className="w-4 h-4 text-trend-down shrink-0" />
                    <span className="text-sm text-trend-down">
                      {formatNumber(lowPoint ? metricOf(lowPoint) : 0)} {MIXED_UNIT_LABEL}
                    </span>
                  </div>
                  {lowPoint?.rangeLabel && (
                    <p className="mt-1 text-xs text-muted-foreground">{lowPoint.rangeLabel}</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">ໄລຍະພະຍາກອນ</p>
                  <p className="text-2xl font-bold text-foreground">{chartData.length} ເດືອນ</p>
                  <div className="flex items-center gap-1 mt-1">
                    <BarChart3 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-primary">{spanLabel}</span>
                  </div>
                  {projectedCount > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      ລວມ {projectedCount} ເດືອນທີ່ເປັນການຄາດຄະເນ
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Demand vs Supply Chart */}
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">ແນວໂນ້ມຄວາມຕ້ອງການ</CardTitle>
                    <CardDescription>{spanLabel}</CardDescription>
                  </div>
                  <Button
                    variant={yearOnly ? "default" : "outline"}
                    size="sm"
                    className="md:hidden"
                    onClick={() => setYearOnly((v) => !v)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    {yearOnly ? "12 ເດືອນ" : "ທັງໝົດ"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ bottom: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      {/* Two-line tick: month + the day numbers it covers. */}
                      <XAxis
                        dataKey="label"
                        className="text-xs"
                        tick={<MonthDayTick data={chartData} />}
                        height={38}
                        interval="preserveStartEnd"
                      />
                      <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                      <Tooltip content={<TrendTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="supply"
                        stroke="var(--trend-up)"
                        strokeWidth={2}
                        dot={{ fill: "var(--trend-up)", r: 3 }}
                        name="ການບໍລິໂພກຕົວຈິງ"
                        connectNulls
                      />
                      <Line
                        type="monotone"
                        dataKey="demand"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={{ fill: "var(--primary)", r: 3 }}
                        name="ຄວາມຕ້ອງການທີ່ພະຍາກອນ"
                        connectNulls
                      />
                      {/* The extrapolated tail is drawn dashed and hollow so it
                          never reads as equally confident as the solid line. */}
                      <Line
                        type="monotone"
                        dataKey="demandProjected"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        strokeDasharray="5 4"
                        strokeOpacity={0.65}
                        dot={{
                          fill: "var(--background)",
                          stroke: "var(--primary)",
                          strokeWidth: 2,
                          r: 3,
                        }}
                        name="ຄາດຄະເນຕາມແນວໂນ້ມ"
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {projectedCount > 0 && (
                  <div className="mt-4 flex gap-2 rounded-lg bg-muted/60 p-3">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">ໝາຍເຫດ:</span>{" "}
                      ເສັ້ນຂີດຂາດ ({BAND_META.projected.label}) ແມ່ນການຄາດຄະເນຕາມແນວໂນ້ມເທົ່ານັ້ນ.
                      ຂໍ້ມູນປະຫວັດມີພຽງ ~6 ເດືອນ ຈຶ່ງບໍ່ພຽງພໍໃຫ້ແບບຈຳລອງຮຽນຮູ້ລະດູການປະຈຳປີ —
                      ຄວນໃຊ້ເປັນທິດທາງລວມ ບໍ່ແມ່ນຕົວເລກທີ່ແນ່ນອນ.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Year-round planting calendar */}
            {calendar.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">ປະຕິທິນການປູກຕະຫຼອດປີ</CardTitle>
                      <CardDescription>
                        ພືດໃດເໝາະປູກໃນເດືອນໃດ — ອີງຕາມການປູກລ່ວງໜ້າ 3 ເດືອນກ່ອນຄວາມຕ້ອງການສູງສຸດ
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {calendar.map((entry) => (
                      <CalendarMonthCard key={entry.monthIndex} entry={entry} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Seasonal Demand by Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ຄວາມຕ້ອງການຕາມລະດູຕາມໝວດໝູ່</CardTitle>
                <CardDescription>
                  ຄົບ 12 ເດືອນ — ລວມຂໍ້ມູນຈິງ ແລະ ພະຍາກອນ ເພື່ອໃຫ້ທຸກລະດູມີເດືອນຄົບຖ້ວນ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Each season's month span, so "ລະດູຝົນ" is never just a word,
                    plus how much of the bar is observed vs forecast. */}
                <div className="mb-4 grid gap-2 sm:grid-cols-3">
                  {seasonalData.seasons.map((s) => (
                    <div key={s.season} className="rounded-lg bg-muted/60 p-2.5">
                      <p className="text-sm font-medium text-foreground">{s.season}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.monthRange} ({s.monthCount} ເດືອນ)
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground/80">
                        ເດືອນ {s.monthNumbersLabel}
                      </p>
                      {s.hasForecast && (
                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                          ຈິງ {formatNumber(s.actualQuantity)} · ພະຍາກອນ{" "}
                          {formatNumber(s.forecastQuantity)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="h-64 md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={seasonalData.seasons} margin={{ bottom: 12 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      {/* Season name + the calendar month numbers it spans. */}
                      <XAxis
                        dataKey="season"
                        className="text-xs"
                        tick={<SeasonMonthTick data={seasonalData.seasons} />}
                        height={38}
                      />
                      <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                      <Tooltip content={<SeasonTooltip />} />
                      <Legend />
                      {seasonalData.categories.map((cat) => (
                        <Bar
                          key={cat.key}
                          dataKey={cat.key}
                          fill={cat.color}
                          name={cat.name}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recommendations Header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-foreground">ຄຳແນະນຳສຳລັບການວາງແຜນ</h2>
                <p className="text-sm text-muted-foreground">
                  ແນະນຳ {recommendations.length} ພືດປູກໂດຍອີງໃສ່ຄວາມຕ້ອງການຕາມລະດູ
                </p>
              </div>
              {/* Opens the full catalogue, where every suggestion can be
                  filtered and sorted. */}
              <Link href="/forecast/recommendations" className="shrink-0">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-1" />
                  ກັ່ນຕອງ
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center text-muted-foreground">
                  ຍັງບໍ່ມີຄຳແນະນຳ — ກະລຸນາເອີ້ນໃຊ້ pipeline ກ່ອນ
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Top Recommendation Highlight */}
                <Card className="bg-suggestion border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="px-2 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        ຕົວເລືອກອັນດັບໜຶ່ງ
                      </div>
                    </div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{topPick.crop}</h3>
                        <p className="text-muted-foreground mt-1">{topPick.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-primary">
                          {topPick.recommendationScore}%
                        </p>
                        <p className="text-sm text-muted-foreground">ຄະແນນຄວາມເໝາະສົມ</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">ຜົນຜະລິດທີ່ຄາດໄວ້</p>
                        <p className="font-medium text-foreground">{topPick.expectedYield}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ໜ່ວຍຂາຍ</p>
                        <p className="font-medium text-foreground">{topPick.unit ?? "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ຊ່ວງປູກ</p>
                        <p className="font-medium text-foreground">{topPick.plantingWindow}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ຊ່ວງເກັບກ່ຽວ</p>
                        <p className="font-medium text-foreground">{topPick.harvestWindow}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ລະດູການ</p>
                        <p className="font-medium text-foreground">
                          {topPick.season} ({topPick.seasonDuration})
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ອັດຕາກຳໄລ</p>
                        <p className="font-medium text-trend-up">
                          {MARGIN_LABEL[topPick.profitMargin] ?? topPick.profitMargin}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* A preview of the strongest suggestions — the full,
                    filterable catalogue lives on its own page. */}
                <div className="grid gap-4 md:grid-cols-2">
                  {preview.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>

                {recommendations.length > preview.length + 1 && (
                  <div className="flex justify-center">
                    <Link href="/forecast/recommendations">
                      <Button variant="outline">
                        ເບິ່ງຄຳແນະນຳທັງໝົດ ({recommendations.length})
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </MainLayout>
  );
}
