"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { ProductRow } from "@/components/product/ProductRow";
import type { VoteTallyState } from "@/components/product/VoteButtons";
import { Input } from "@/components/ui/input";
import { fetchVoteSnapshot } from "@/lib/actions/vote-read";
import {
  mergeVoteSnapshot,
  userVotesForProducts,
} from "@/lib/db/merge-votes";
import { recomputeRankedProducts } from "@/lib/recompute-rankings";
import { createClient } from "@/lib/supabase";
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

const filterControlClass =
  "h-9 rounded-lg border border-border bg-card text-sm font-medium text-foreground outline-none transition hover:border-foreground focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/5";

function parsePrice(price: string): number {
  const match = price.replace(/,/g, "").match(/\$\s*(\d+(\.\d+)?)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

export function RankedList({
  products,
  userVotes: initialUserVotes = {},
}: {
  products: RankedProduct[];
  userVotes?: Record<string, UserVote>;
}) {
  const categorySlug = products[0]?.categorySlug ?? "";
  const [seedBase] = useState(products);
  const [liveProducts, setLiveProducts] = useState(products);
  const [userVotes, setUserVotes] = useState(initialUserVotes);
  const [sort, setSort] = useState<SortKey>("top");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const productIds = useMemo(
    () => liveProducts.map((p) => p.id),
    [liveProducts],
  );

  useEffect(() => {
    setLiveProducts(products);
    setUserVotes(initialUserVotes);
  }, [products, initialUserVotes]);

  const refreshFromServer = useCallback(async () => {
    if (productIds.length === 0) return;
    const snapshot = await fetchVoteSnapshot(productIds);
    const merged = mergeVoteSnapshot(seedBase, categorySlug, snapshot);
    setLiveProducts(merged);
    setUserVotes(userVotesForProducts(merged, snapshot));
  }, [productIds, seedBase, categorySlug]);

  useEffect(() => {
    if (productIds.length === 0) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`category-votes:${categorySlug}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `product_id=in.(${productIds.join(",")})`,
        },
        () => {
          void refreshFromServer();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [categorySlug, productIds, refreshFromServer]);

  const handleProductTallyChange = useCallback(
    (productId: string, tally: VoteTallyState) => {
      setUserVotes((prev) => ({ ...prev, [productId]: tally.userVote }));
      setLiveProducts((prev) => {
        const updated = prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                upvotes: tally.upvotes,
                downvotes: tally.downvotes,
                netVotes: tally.netVotes,
              }
            : p,
        );
        return recomputeRankedProducts(updated);
      });
    },
    [],
  );

  const hasActiveFilters =
    tierFilter !== "all" || priceMin !== "" || priceMax !== "";

  const visible = useMemo(() => {
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;

    let list = liveProducts.filter((p) => {
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
  }, [liveProducts, sort, tierFilter, priceMin, priceMax]);

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            type="button"
            onClick={() => setSort("top")}
            className={cn(
              "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition",
              sort === "top"
                ? "border-foreground bg-navy text-white"
                : "border-border bg-card hover:border-foreground",
            )}
          >
            All
          </button>
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

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <label className="sr-only" htmlFor="tier-filter">
              Filter by tier
            </label>
            <select
              id="tier-filter"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as TierFilter)}
              className={cn(
                filterControlClass,
                "appearance-none pl-3 pr-9",
                tierFilter !== "all" && "border-foreground",
              )}
            >
              {TIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="h-9 w-24 px-3"
              aria-label="Minimum price"
            />
            <span className="text-sm text-muted-foreground">–</span>
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="h-9 w-24 px-3"
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
              className="h-9 shrink-0 px-2 text-sm font-semibold text-coral transition hover:text-coral/80"
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
              elevated={sort === "top" && !hasActiveFilters && p.rank === 1}
              onTallyChange={(tally) => handleProductTallyChange(p.id, tally)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
