"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { CategoryCard } from "@/components/category/CategoryCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { TierBadge } from "@/components/product/TierBadge";
import { cn, formatCount } from "@/lib/utils";
import type { CategoryWithStats } from "@/types";

type SortKey = "popular" | "new" | "active" | "az";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "new", label: "New" },
  { key: "active", label: "Most Active" },
  { key: "az", label: "Alphabetical" },
];

export function CategoryBrowser({
  categories,
  initialQuery = "",
}: {
  categories: CategoryWithStats[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState<SortKey>("popular");

  const featured = useMemo(
    () => [...categories].sort((a, b) => b.voteCount - a.voteCount).slice(0, 4),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = categories.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.topProductName?.toLowerCase().includes(q) ?? false),
    );
    const sorted = [...matches];
    switch (sort) {
      case "popular":
        sorted.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case "new":
        sorted.sort((a, b) => a.createdDaysAgo - b.createdDaysAgo);
        break;
      case "active":
        sorted.sort((a, b) => b.productCount - a.productCount);
        break;
      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  }, [categories, query, sort]);

  const subtitle = query.trim()
    ? `All ${query.trim()} lists`
    : "All product lists";

  return (
    <div>
      <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>

      {/* Featured — top 4 by votes */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Featured
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {featured.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex min-h-[150px] flex-col justify-between rounded-xl bg-navy p-5 text-white transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-lg font-extrabold tracking-tight">
                  {c.name}
                </span>
                {c.topTier ? <TierBadge tier={c.topTier} size="sm" /> : null}
              </div>
              <div>
                <div className="text-sm text-white/70">
                  Top: {c.topProductName}
                </div>
                <div className="mt-1 text-xs text-white/50">
                  {formatCount(c.voteCount)} votes
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Filter options */}
      <div className="relative mb-4 mt-10 max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter categories…"
          className="h-12 w-full rounded-lg border border-border bg-card pl-11 pr-4 text-sm font-medium outline-none transition focus:border-foreground focus:ring-4 focus:ring-foreground/5"
        />
      </div>

      <div className="mb-8 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
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

      {filtered.length === 0 ? (
        <EmptyState
          title={`No categories match “${query}”`}
          description="Try a different search, or browse everything below."
          actionLabel="Clear search"
          onAction={() => setQuery("")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
