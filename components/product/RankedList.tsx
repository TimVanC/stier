"use client";

import { useMemo, useState } from "react";

import { ProductRow } from "@/components/product/ProductRow";
import { cn } from "@/lib/utils";
import type { RankedProduct, Tier } from "@/types";
import type { UserVote } from "@/lib/db/votes";

type SortKey = "top" | "rising" | "reviewed" | "newest";
type TierFilter = "all" | Tier;

const SORTS: { key: SortKey; label: string }[] = [
  { key: "top", label: "Top Ranked" },
  { key: "rising", label: "Rising" },
  { key: "reviewed", label: "Most Reviewed" },
  { key: "newest", label: "Newest" },
];

const TIER_OPTIONS: { value: TierFilter; label: string }[] = [
  { value: "all", label: "All Tiers" },
  { value: "S+", label: "S+" },
  { value: "S", label: "S" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "F", label: "F" },
];

function parsePrice(price: string): number {
  const match = price.replace(/,/g, "").match(/\$\s*(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function RankedList({
  products,
  userVotes = {},
}: {
  products: RankedProduct[];
  userVotes?: Record<string, UserVote>;
}) {
  const [sort, setSort] = useState<SortKey>("top");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const hasActiveFilters =
    tierFilter !== "all" || priceMin !== "" || priceMax !== "";

  const visible = useMemo(() => {
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;

    let list = products.filter((p) => {
      if (tierFilter !== "all" && p.tier !== tierFilter) return false;
      const price = parsePrice(p.price);
      if (min !== null && !Number.isNaN(min) && price < min) return false;
      if (max !== null && !Number.isNaN(max) && price > max) return false;
      return true;
    });

    list = [...list];
    switch (sort) {
      case "rising":
        list.sort((a, b) => b.weeklyVotes - a.weeklyVotes);
        break;
      case "reviewed":
        list.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "newest":
        list.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
        break;
      default:
        list.sort((a, b) => a.rank - b.rank);
    }
    return list;
  }, [products, sort, tierFilter, priceMin, priceMax]);

  const filtersDefault =
    tierFilter === "all" && !hasActiveFilters;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3">
        {/* Sort row */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition",
                sort === s.key
                  ? "border-foreground bg-navy text-white"
                  : "border-border bg-card hover:border-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTierFilter("all");
              setPriceMin("");
              setPriceMax("");
            }}
            className={cn(
              "h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition",
              filtersDefault
                ? "border-coral bg-coral text-white"
                : "border-border bg-card hover:border-foreground",
            )}
          >
            All
          </button>

          <label className="sr-only" htmlFor="tier-filter">
            Filter by tier
          </label>
          <select
            id="tier-filter"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as TierFilter)}
            className="h-8 shrink-0 rounded-full border border-border bg-card px-3.5 text-xs font-medium text-foreground outline-none transition hover:border-foreground focus:border-foreground"
          >
            {TIER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">$</span>
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="h-8 w-20 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none transition placeholder:text-muted-foreground focus:border-foreground"
              aria-label="Minimum price"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="h-8 w-20 rounded-full border border-border bg-card px-3 text-xs font-medium outline-none transition placeholder:text-muted-foreground focus:border-foreground"
              aria-label="Maximum price"
            />
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                setTierFilter("all");
                setPriceMin("");
                setPriceMax("");
              }}
              className="h-8 shrink-0 rounded-full border border-border px-3.5 text-xs font-semibold text-muted-foreground transition hover:border-foreground hover:text-foreground"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
          No products match this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              userVote={userVotes[p.id] ?? null}
              elevated={
                sort === "top" && filtersDefault && !hasActiveFilters && p.rank === 1
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
