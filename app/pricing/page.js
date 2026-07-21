"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getPriceAnalysis, getPriceHistory, getMarketSummary } from "@/api/pricing";
import { formatKip, formatKipPerUnit, formatQuantity } from "@/lib/format";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Scale,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  X,
  ListFilter,
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
  Legend,
} from "recharts";

function PriceStatusBadge({ status }) {
  const styles = {
    underpriced: {
      bg: "bg-trend-up/10",
      text: "text-trend-up",
      icon: <ArrowUpRight className="w-3 h-3" />,
      label: "ລາຄາຕ່ຳເກີນໄປ",
    },
    overpriced: {
      bg: "bg-trend-down/10",
      text: "text-trend-down",
      icon: <ArrowDownRight className="w-3 h-3" />,
      label: "ລາຄາສູງເກີນໄປ",
    },
    fair: {
      bg: "bg-primary/10",
      text: "text-primary",
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: "ລາຄາຍຸຕິທຳ",
    },
  };

  const style = styles[status] || styles.fair;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.icon}
      {style.label}
    </span>
  );
}

// Names the calendar week and prices each series per its own selling unit
// (products are not all sold by the kilo).
function PriceHistoryTooltip({ active, payload, products }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  const unitByKey = new Map((products ?? []).map((p) => [p.key, p.unit]));

  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-md">
      <p className="font-semibold text-foreground">{point?.weekRangeLabel ?? point?.week}</p>
      <div className="mt-2 space-y-0.5 text-sm">
        {payload.map((entry) => (
          <p key={entry.dataKey} style={{ color: entry.color }}>
            {entry.name}: {formatKipPerUnit(entry.value, unitByKey.get(entry.dataKey))}
          </p>
        ))}
      </div>
    </div>
  );
}

function PriceCard({ item }) {
  const trendColor = item.trend === "up" ? "text-trend-up" : item.trend === "down" ? "text-trend-down" : "text-muted-foreground";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground">{item.product}</h3>
            <p className="text-sm text-muted-foreground">
              {item.category ? `${item.category} · ` : ""}ຕໍ່ {item.unit}
            </p>
          </div>
          <PriceStatusBadge status={item.priceStatus} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">ລາຄາຕະຫຼາດ</p>
            <p className="text-xl font-bold text-foreground">{formatKip(item.marketPrice)}</p>
            <p className="text-xs text-muted-foreground">ຕໍ່ {item.unit}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">ລາຄາຍຸຕິທຳ</p>
            <p className="text-xl font-bold text-primary">{formatKip(item.fairPrice)}</p>
            <p className="text-xs text-muted-foreground">ຕໍ່ {item.unit}</p>
          </div>
        </div>

        {/* Volumes carry the same unit as the price. */}
        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">ອຸປະທານ (30 ວັນ)</p>
            <p className="font-medium text-foreground">
              {formatQuantity(item.currentSupply, item.unit)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">ຄວາມຕ້ອງການ (30 ວັນ)</p>
            <p className="font-medium text-foreground">
              {formatQuantity(item.currentDemand, item.unit)}
            </p>
          </div>
        </div>

        {/* Supply/Demand Ratio Visualization */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">ອັດຕາສ່ວນອຸປະທານ/ຄວາມຕ້ອງການ</span>
            <span className={trendColor}>
              {item.supplyDemandRatio.toFixed(2)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                item.supplyDemandRatio > 1 ? "bg-trend-down" : item.supplyDemandRatio < 0.95 ? "bg-trend-up" : "bg-primary"
              }`}
              style={{ width: `${Math.min(item.supplyDemandRatio * 50, 100)}%` }}
            />
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-between py-2 border-t border-border">
          <div className="flex items-center gap-2">
            {item.trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-trend-up" />
            ) : item.trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-trend-down" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={`text-sm font-medium ${trendColor}`}>
              {item.changePercent > 0 ? "+" : ""}
              {item.changePercent.toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">ທຽບກັບອາທິດແລ້ວ</span>
        </div>

        {/* Recommendation */}
        <div className="mt-3 p-3 bg-suggestion rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{item.recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PricingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [priceData, setPriceData] = useState([]);
  const [historyData, setHistoryData] = useState({ weeks: [], products: [] });
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Explicit product selection for the trend chart. Empty => follow the
  // top-`chartLimit` demand ranking, which is the sensible default; a non-empty
  // set lets the user chart any tracked product, however far down the ranking.
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [chartLimit, setChartLimit] = useState(12);
  const [showPicker, setShowPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [prices, history, marketSummary] = await Promise.all([
          getPriceAnalysis(),
          getPriceHistory(),
          getMarketSummary(),
        ]);
        setPriceData(prices);
        setHistoryData(history);
        setSummary(marketSummary);
      } catch (error) {
        console.error("Failed to load pricing data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading, router]);

  // The trend chart's products are chosen server-side by demand ranking, so
  // changing the category has to refetch rather than filter what we already
  // hold — otherwise the chart keeps showing the global top-N.
  useEffect(() => {
    if (!user || isLoading) return;
    let cancelled = false;

    async function loadHistory() {
      setIsChartLoading(true);
      try {
        const history = await getPriceHistory({
          category: selectedCategory,
          limit: chartLimit,
          products: selectedProducts,
        });
        if (!cancelled) setHistoryData(history);
      } catch (error) {
        console.error("Failed to load price history:", error);
      } finally {
        if (!cancelled) setIsChartLoading(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
    // `selectedProducts` is compared by value — a new array with the same
    // names must not retrigger the fetch.
  }, [selectedCategory, chartLimit, selectedProducts.join(" "), user, isLoading]);

  // Changing category invalidates an explicit pick: those products may not
  // exist in the new category, which would leave the chart empty.
  useEffect(() => {
    setSelectedProducts([]);
    setProductSearch("");
  }, [selectedCategory]);

  // Category filter options are derived from the real data (most-common first).
  const categoryOptions = [
    { key: "all", label: "ທັງໝົດ" },
    ...Array.from(
      priceData.reduce((m, item) => {
        const c = item.category;
        if (c) m.set(c, (m.get(c) || 0) + 1);
        return m;
      }, new Map())
    )
      .sort((a, b) => b[1] - a[1])
      .map(([label]) => ({ key: label, label })),
  ];

  const filteredData =
    selectedCategory === "all"
      ? priceData
      : priceData.filter((item) => item.category === selectedCategory);

  // Every chartable product in the current category, narrowed by the picker's
  // own search box so a 300-item list stays navigable.
  const available = historyData.available ?? [];
  const pickerResults = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [available, productSearch]);

  function toggleProduct(name) {
    setSelectedProducts((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <MainLayout
      title="ລາຄາຍຸຕິທຳ"
      subtitle="ລາຄາທີ່ສົມດຸນລະຫວ່າງອຸປະທານ ແລະ ຄວາມຕ້ອງການ"
      // headerActions={
      //   <Button variant="outline" size="sm">
      //     <RefreshCw className="w-4 h-4 mr-2" />
      //     ໂຫຼດໃໝ່
      //   </Button>
      // }
    >
      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Market Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{summary.totalProducts}</p>
                <p className="text-sm text-muted-foreground">ຜະລິດຕະພັນທີ່ຕິດຕາມ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-trend-up" />
                </div>
                <p className="text-2xl font-bold text-trend-up">+{summary.avgPriceChange}%</p>
                <p className="text-sm text-muted-foreground">ການປ່ຽນແປງລາຄາສະເລ່ຍ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight className="w-5 h-5 text-trend-up" />
                </div>
                <p className="text-2xl font-bold text-foreground">{summary.understockedItems}</p>
                <p className="text-sm text-muted-foreground">ສິນຄ້າຂາດແຄນ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-5 h-5 text-trend-down" />
                </div>
                <p className="text-2xl font-bold text-foreground">{summary.overstockedItems}</p>
                <p className="text-sm text-muted-foreground">ສິນຄ້າເກີນ</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Price Trend Alert */}
        <Card className="border-primary/20 bg-suggestion">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">ຂໍ້ມູນເຈາະເລິກຕະຫຼາດ</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  ມີ {summary?.understockedItems ?? 0} ຜະລິດຕະພັນທີ່ຄວາມຕ້ອງການສູງກວ່າອຸປະທານ (ລາຄາຕ່ຳກວ່າຍຸຕິທຳ) —
                  ເປັນໂອກາດຕັ້ງລາຄາສູງຂຶ້ນ. ອີກ {summary?.overstockedItems ?? 0} ຜະລິດຕະພັນມີອຸປະທານເກີນ —
                  ຄວນຂາຍໄວ ຫຼື ເກັບຮັກສາໄວ້ເພື່ອຫຼີກລ່ຽງຄວາມກົດດັນດ້ານລາຄາ.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Filter (derived from live data) */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {categoryOptions.map((cat) => (
            <Button
              key={cat.key}
              variant={selectedCategory === cat.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.key)}
              className="whitespace-nowrap"
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Price History Chart */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">ແນວໂນ້ມລາຄາ (8 ອາທິດ)</CardTitle>
                <CardDescription>
                  {historyData.products.length > 0
                    ? `ກຳລັງສະແດງ ${historyData.products.length} ຈາກ ${
                        historyData.totalAvailable ?? historyData.products.length
                      } ຜະລິດຕະພັນທີ່ມີບັນທຶກລາຄາ${
                        selectedCategory === "all" ? "" : ` ໃນ${selectedCategory}`
                      }`
                    : "ບໍ່ມີຂໍ້ມູນລາຄາ"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {isChartLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                <Button
                  variant={showPicker ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPicker((v) => !v)}
                >
                  <ListFilter className="w-4 h-4 mr-1" />
                  ເລືອກຜະລິດຕະພັນ
                  {selectedProducts.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                      {selectedProducts.length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Product picker — the trend chart defaults to the top-N by
                demand, so without this any product outside that head is
                simply unreachable. */}
            {showPicker && (
              <div className="mb-4 rounded-lg border border-border p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={`ຄົ້ນຫາໃນ ${available.length} ຜະລິດຕະພັນ...`}
                    className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedProducts.length > 0
                      ? `ເລືອກແລ້ວ ${selectedProducts.length}`
                      : `ຄ່າເລີ່ມຕົ້ນ: ${chartLimit} ອັນດັບຕົ້ນຕາມຄວາມຕ້ອງການ`}
                  </span>
                  {selectedProducts.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedProducts([])}>
                      <X className="mr-1 h-3.5 w-3.5" />
                      ລ້າງການເລືອກ
                    </Button>
                  )}
                  {selectedProducts.length === 0 &&
                    [12, 25, 50].map((n) => (
                      <Button
                        key={n}
                        variant={chartLimit === n ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartLimit(n)}
                      >
                        {n} ອັນດັບຕົ້ນ
                      </Button>
                    ))}
                </div>

                {/* Scrolls rather than paginating — picking is a scan-and-tap
                    task, and the search box narrows long lists. */}
                <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-border">
                  {pickerResults.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      ບໍ່ພົບຜະລິດຕະພັນ
                    </p>
                  ) : (
                    pickerResults.map((p) => {
                      const checked = selectedProducts.includes(p.name);
                      return (
                        <button
                          key={p.name}
                          onClick={() => toggleProduct(p.name)}
                          className={`flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2 text-left text-sm last:border-0 transition-colors ${
                            checked ? "bg-primary/10" : "hover:bg-muted"
                          }`}
                        >
                          <span className="min-w-0 truncate text-foreground">{p.name}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {p.category ? `${p.category} · ` : ""}ຕໍ່ {p.unit}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {historyData.weeks.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">
                ບໍ່ມີບັນທຶກລາຄາສຳລັບ{selectedCategory === "all" ? "ຜະລິດຕະພັນເຫຼົ່ານີ້" : selectedCategory}
              </p>
            ) : (
              <div className="h-64 md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData.weeks}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="weekLabel"
                      className="text-xs"
                      tick={{ fill: "var(--muted-foreground)" }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "var(--muted-foreground)" }}
                      width={70}
                      tickFormatter={(v) => formatKip(v)}
                    />
                    <Tooltip content={<PriceHistoryTooltip products={historyData.products} />} />
                    <Legend />
                    {historyData.products.map((product) => (
                      <Line
                        key={product.key}
                        type="monotone"
                        dataKey={product.key}
                        stroke={product.color}
                        strokeWidth={2}
                        dot={false}
                        name={product.name}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Price Cards Grid */}
        <div>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">ການວິເຄາະລາຄາຕາມຜະລິດຕະພັນ</h2>
            <p className="text-sm text-muted-foreground">
              {selectedCategory === "all"
                ? `ທັງໝົດ ${filteredData.length} ຜະລິດຕະພັນ`
                : `${filteredData.length} ຈາກ ${priceData.length} ຜະລິດຕະພັນ`}
            </p>
          </div>
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                ບໍ່ພົບຜະລິດຕະພັນໃນໝວດໝູ່ນີ້
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredData.map((item) => (
                <PriceCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Last Updated */}
        {summary && (
          <p className="text-center text-sm text-muted-foreground">
            ອັບເດດຫຼ້າສຸດ: {new Date(summary.lastUpdated).toLocaleString()}
          </p>
        )}
      </main>
    </MainLayout>
  );
}
