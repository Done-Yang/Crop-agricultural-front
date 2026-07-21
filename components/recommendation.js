"use client";

// Shared crop-recommendation presentation: the label maps, the card, and the
// filter-chip row. Both the forecast page's preview list and the dedicated
// "all suggestions" page render from these, so the two can never drift.

import { Card, CardContent } from "@/components/ui/card";
import { formatQuantity } from "@/lib/format";
import { Sprout, TrendingUp, TrendingDown, Minus } from "lucide-react";

export const TREND_LABEL = {
  up: "ກຳລັງເພີ່ມຂຶ້ນ",
  down: "ກຳລັງຫຼຸດລົງ",
  stable: "ຄົງທີ່",
};
export const MARGIN_LABEL = { High: "ສູງ", Medium: "ປານກາງ", Low: "ຕ່ຳ" };
export const ACTION_LABEL = {
  INCREASE: "ຂະຫຍາຍການປູກ",
  REDUCE: "ຫຼຸດການປູກ",
  MAINTAIN: "ຮັກສາລະດັບເດີມ",
};
export const ACTION_STYLE = {
  INCREASE: "bg-trend-up/10 text-trend-up",
  REDUCE: "bg-trend-down/10 text-trend-down",
  MAINTAIN: "bg-muted text-muted-foreground",
};

export function TrendIcon({ trend }) {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-trend-up" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-trend-down" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

export function RecommendationCard({ recommendation }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Sprout className="w-6 h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {recommendation.crop}
              </h3>
              <p className="text-sm text-muted-foreground">
                {recommendation.season}
                {recommendation.seasonDuration ? ` · ${recommendation.seasonDuration}` : ""}
              </p>
              {/* The selling unit, so an expected demand of "598" is never
                  ambiguous between kilos, bags and crates. */}
              {recommendation.unit && (
                <p className="text-xs text-muted-foreground">
                  {recommendation.categoryName ? `${recommendation.categoryName} · ` : ""}
                  ຂາຍຕໍ່ {recommendation.unit}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
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
              {TREND_LABEL[recommendation.demandTrend] ?? TREND_LABEL.stable}
            </span>
          </div>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">{recommendation.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">ຊ່ວງປູກ</p>
            <p className="text-sm font-medium text-foreground">
              {recommendation.plantingWindow}
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">ຊ່ວງເກັບກ່ຽວ</p>
            <p className="text-sm font-medium text-foreground">
              {recommendation.harvestWindow}
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">ຄວາມຕ້ອງການທີ່ຄາດໄວ້</p>
            <p className="text-sm font-medium text-foreground">
              {formatQuantity(recommendation.expectedDemand, recommendation.unit)}
            </p>
          </div>
          <div className="p-2 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">ຄວາມຕ້ອງການສູງສຸດ</p>
            <p className="text-sm font-medium text-foreground">
              {recommendation.peakMonthName ?? "-"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${recommendation.recommendationScore}%` }}
              />
            </div>
            <span className="text-sm font-medium text-primary">
              {recommendation.recommendationScore}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                ACTION_STYLE[recommendation.recommendedAction] ?? ACTION_STYLE.MAINTAIN
              }`}
            >
              {ACTION_LABEL[recommendation.recommendedAction] ??
                recommendation.recommendedAction}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                recommendation.profitMargin === "High"
                  ? "bg-trend-up/10 text-trend-up"
                  : recommendation.profitMargin === "Medium"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              ກຳໄລ {MARGIN_LABEL[recommendation.profitMargin] ?? recommendation.profitMargin}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// A horizontally scrollable row of mutually exclusive filter chips.
export function FilterRow({ label, value, onChange, options }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
              value === opt.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
