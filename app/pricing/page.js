"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getPriceAnalysis, getPriceHistory, getMarketSummary } from "@/api/pricing";
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

function PriceCard({ item }) {
  const trendColor = item.trend === "up" ? "text-trend-up" : item.trend === "down" ? "text-trend-down" : "text-muted-foreground";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground">{item.product}</h3>
            <p className="text-sm text-muted-foreground">{item.unit}</p>
          </div>
          <PriceStatusBadge status={item.priceStatus} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">ລາຄາຕະຫຼາດ</p>
            <p className="text-xl font-bold text-foreground">${item.marketPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">ລາຄາຍຸຕິທຳ</p>
            <p className="text-xl font-bold text-primary">${item.fairPrice.toFixed(2)}</p>
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
  const [historyData, setHistoryData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState("all");

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

  const filteredData = selectedProduct === "all" 
    ? priceData 
    : priceData.filter(item => item.product.toLowerCase() === selectedProduct);

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
                  ໝາກເລັ່ນ ແລະ ຜັກສະຫຼັດ ສະແດງສັນຍານຄວາມຕ້ອງການທີ່ສູງ. ພິຈາລະນາໃຫ້ບູລິມະສິດກັບພືດເຫຼົ່ານີ້ເພື່ອຜົນຕອບແທນສູງສຸດ.
                  ອຸປະທານເຂົ້າສາລີເກີນກວ່າຄວາມຕ້ອງການ - ຄາດວ່າຄວາມກົດດັນດ້ານລາຄາຈະຍັງສືບຕໍ່.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {[
            { key: "all", label: "ທັງໝົດ" },
            { key: "tomatoes", label: "ໝາກເລັ່ນ" },
            { key: "corn", label: "ສາລີ" },
            { key: "soybeans", label: "ຖົ່ວເຫຼືອງ" },
            { key: "lettuce", label: "ຜັກສະຫຼັດ" },
            { key: "wheat", label: "ເຂົ້າສາລີ" },
            { key: "potatoes", label: "ມັນຝະລັ່ງ" },
          ].map((product) => (
            <Button
              key={product.key}
              variant={selectedProduct === product.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProduct(product.key)}
              className="whitespace-nowrap"
            >
              {product.label}
            </Button>
          ))}
        </div>

        {/* Price History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ແນວໂນ້ມລາຄາ (8 ອາທິດ)</CardTitle>
            <CardDescription>ການເຄື່ອນໄຫວລາຄາໃນອະດີດຂອງຜະລິດຕະພັນຫຼັກ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis className="text-xs" tick={{ fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                    formatter={(value) => [`$${value.toFixed(2)}`, ""]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="tomatoes"
                    stroke="var(--trend-down)"
                    strokeWidth={2}
                    dot={false}
                    name="ໝາກເລັ່ນ"
                  />
                  <Line
                    type="monotone"
                    dataKey="corn"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={false}
                    name="ສາລີ"
                  />
                  <Line
                    type="monotone"
                    dataKey="soybeans"
                    stroke="var(--trend-up)"
                    strokeWidth={2}
                    dot={false}
                    name="ຖົ່ວເຫຼືອງ"
                  />
                  <Line
                    type="monotone"
                    dataKey="lettuce"
                    stroke="var(--chart-4)"
                    strokeWidth={2}
                    dot={false}
                    name="ຜັກສະຫຼັດ"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Price Cards Grid */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">ການວິເຄາະລາຄາຕາມຜະລິດຕະພັນ</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredData.map((item) => (
              <PriceCard key={item.id} item={item} />
            ))}
          </div>
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
