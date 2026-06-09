"use client";

import { useMemo, useState } from "react";

import { ProductRow } from "@/components/product/ProductRow";
import { cn } from "@/lib/utils";
import type { RankedProduct } from "@/types";

type SortKey = "top" | "rising" | "reviewed" | "newest";
type FilterKey = "all" | "S" | "A" | "B" | "u50" | "u100" | "u200";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "top", label: "Top Ranked" },
  { key: "rising", label: "Rising" },
  { key: "reviewed", label: "Most Reviewed" },
  { key: "newest", label: "Newest" },
];

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "S", label: "S Tier" },
  { key: "A", label: "A Tier" },
  { key: "B", label: "B Tier" },
  { key: "u50", label: "Under $50" },
  { key: "u100", label: "Under $100" },
  { key: "u200", label: "Under $200" },
];

function parsePrice(price: string): number {
  const match = price.replace(/,/g, "").match(/\$\s*(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function RankedList({ products }: { products: RankedProduct[] }) {
  const [sort, setSort] = useState<SortKey>("top");
  const [filter, setFilter] = useState<FilterKey>("all");

  const visible = useMemo(() => {
    let list = products.filter((p) => {
      switch (filter) {
        case "S":
        case "A":
        case "B":
          return p.tier === filter;
        case "u50":
          return parsePrice(p.price) < 50;
        case "u100":
          return parsePrice(p.price) < 100;
        case "u200":
          return parsePrice(p.price) < 200;
        default:
          return true;
      }
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
  }, [products, sort, filter]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3">
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
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-8 shrink-0 rounded-full border px-3.5 text-xs font-medium transition",
                filter === f.key
                  ? "border-coral bg-coral text-white"
                  : "border-border bg-card hover:border-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
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
              elevated={sort === "top" && filter === "all" && p.rank === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
