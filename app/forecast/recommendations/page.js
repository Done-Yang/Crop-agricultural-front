"use client";

// Full catalogue of planting suggestions — the destination of the ກັ່ນຕອງ
// button on /forecast. The forecast tab shows a curated preview; this page is
// the place to actually work through every recommended product, so it carries
// the complete filter set, sorting, and a result count.

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { getCropRecommendations } from "@/api/forecast";
import MainLayout from "@/components/mainLayout";
import {
  RecommendationCard,
  FilterRow,
  ACTION_LABEL,
} from "@/components/recommendation";
import { Loader2, Search, X, ArrowLeft, SlidersHorizontal } from "lucide-react";

// How the grid can be ordered. Every product carries these fields, so any
// choice is valid for the whole set.
const SORTS = {
  score: { label: "ຄະແນນຄວາມເໝາະສົມ", compare: (a, b) => b.recommendationScore - a.recommendationScore },
  demand: { label: "ຄວາມຕ້ອງການ", compare: (a, b) => b.expectedDemand - a.expectedDemand },
  name: { label: "ຊື່ (ກ-ຮ)", compare: (a, b) => (a.crop ?? "").localeCompare(b.crop ?? "", "lo") },
  peak: { label: "ເດືອນສູງສຸດ", compare: (a, b) => (a.peakMonth ?? 13) - (b.peakMonth ?? 13) },
};

// Rendered in chunks so a 300-product catalogue never blocks first paint.
const PAGE_SIZE = 24;

function AllRecommendations() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Seeded from the query string so /forecast can hand over a filter it
  // already had applied, and so a filtered view is shareable as a URL.
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [season, setSeason] = useState(searchParams.get("season") ?? "all");
  const [action, setAction] = useState(searchParams.get("action") ?? "all");
  const [sort, setSort] = useState("score");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        // The whole catalogue — this page's entire purpose is to show all of
        // it, so it must never request a top-N slice.
        setRecommendations(await getCropRecommendations(1000));
      } catch (error) {
        console.error("Failed to load recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) loadData();
  }, [user, authLoading, router]);

  const categories = useMemo(() => {
    const counts = new Map();
    recommendations.forEach((r) => {
      if (r.categoryName) counts.set(r.categoryName, (counts.get(r.categoryName) ?? 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [recommendations]);

  const seasons = useMemo(
    () => [...new Set(recommendations.map((r) => r.season).filter(Boolean))],
    [recommendations]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = recommendations.filter(
      (r) =>
        (category === "all" || r.categoryName === category) &&
        (season === "all" || r.season === season) &&
        (action === "all" || r.recommendedAction === action) &&
        (q === "" ||
          r.crop?.toLowerCase().includes(q) ||
          r.categoryName?.toLowerCase().includes(q))
    );
    return [...rows].sort(SORTS[sort].compare);
  }, [recommendations, search, category, season, action, sort]);

  // Any filter change restarts paging, otherwise a narrow result set would
  // still be capped at whatever the previous view had scrolled to.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [search, category, season, action, sort]);

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (season !== "all" ? 1 : 0) +
    (action !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setSeason("all");
    setAction("all");
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
      title="ຄຳແນະນຳການປູກທັງໝົດ"
      subtitle={`${recommendations.length} ຜະລິດຕະພັນທີ່ແນະນຳ`}
      headerActions={
        <Link href="/forecast">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            ກັບຄືນ
          </Button>
        </Link>
      }
    >
      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        {/* Filters — always open here; this page exists to filter. */}
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ຄົ້ນຫາຊື່ຜະລິດຕະພັນ ຫຼື ໝວດໝູ່..."
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </div>

            <FilterRow
              label="ໝວດໝູ່"
              value={category}
              onChange={setCategory}
              options={[
                { key: "all", label: `ທັງໝົດ (${recommendations.length})` },
                ...categories.map(([name, count]) => ({
                  key: name,
                  label: `${name} (${count})`,
                })),
              ]}
            />
            <FilterRow
              label="ລະດູການ"
              value={season}
              onChange={setSeason}
              options={[
                { key: "all", label: "ທັງໝົດ" },
                ...seasons.map((s) => ({ key: s, label: s })),
              ]}
            />
            <FilterRow
              label="ຄຳແນະນຳ"
              value={action}
              onChange={setAction}
              options={[
                { key: "all", label: "ທັງໝົດ" },
                { key: "INCREASE", label: ACTION_LABEL.INCREASE },
                { key: "MAINTAIN", label: ACTION_LABEL.MAINTAIN },
                { key: "REDUCE", label: ACTION_LABEL.REDUCE },
              ]}
            />
            <FilterRow
              label="ຮຽງລຳດັບຕາມ"
              value={sort}
              onChange={setSort}
              options={Object.entries(SORTS).map(([key, s]) => ({
                key,
                label: s.label,
              }))}
            />

            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <X className="mr-1 h-4 w-4" />
                ລ້າງຕົວກັ່ນຕອງ ({activeFilterCount})
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0
              ? `ພົບ ${filtered.length} ຈາກ ${recommendations.length} ຜະລິດຕະພັນ`
              : `ທັງໝົດ ${recommendations.length} ຜະລິດຕະພັນ`}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {SORTS[sort].label}
          </p>
        </div>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-10 text-center">
              <p className="text-muted-foreground">ບໍ່ພົບຜະລິດຕະພັນທີ່ກົງກັບຕົວກັ່ນຕອງ</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={resetFilters}>
                ລ້າງຕົວກັ່ນຕອງ
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.slice(0, visible).map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>

            {visible < filtered.length && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  ສະແດງເພີ່ມ ({filtered.length - visible} ເຫຼືອ)
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </MainLayout>
  );
}

export default function AllRecommendationsPage() {
  // useSearchParams needs a Suspense boundary in the App Router.
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AllRecommendations />
    </Suspense>
  );
}
