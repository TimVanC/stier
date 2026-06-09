import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategoryCard } from "@/components/category/CategoryCard";
import { TierBadge } from "@/components/product/TierBadge";
import {
  getCategoriesWithStats,
  getRankedProducts,
} from "@/lib/seed-data";
import { formatCount } from "@/lib/utils";
import type { Tier } from "@/types";

const TIER_LEGEND: { tier: Tier; label: string; note: string }[] = [
  { tier: "S+", label: "Undisputed community pick", note: "Dominates its category" },
  { tier: "S", label: "Best in class", note: "Top of the category" },
  { tier: "A", label: "Excellent", note: "Beats most alternatives" },
  { tier: "B", label: "Solid pick", note: "You won't regret it" },
  { tier: "C", label: "Niche / Acceptable", note: "Only if it fits" },
];

export function FeaturedCategories() {
  const all = getCategoriesWithStats();
  const big = all.find((c) => c.slug === "coffee-beans") ?? all[0];
  const rest = all.filter((c) => c.slug !== big.slug).slice(0, 4);
  const bigBoard = getRankedProducts(big.slug).slice(0, 4);

  return (
    <section className="container py-12 md:py-16">
      <div className="mb-8 flex items-end justify-between gap-5">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="size-2 rounded-[3px] bg-tier-s" />
            Featured categories
          </div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            What the community is ranking right now
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Hand-picked lists with the deepest debates this week.
          </p>
        </div>
        <Link
          href="/categories"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-semibold transition hover:bg-secondary sm:inline-flex"
        >
          Browse all <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Big dark featured card */}
        <Link
          href={`/categories/${big.slug}`}
          className="group flex flex-col justify-between rounded-xl bg-navy p-7 text-white transition hover:shadow-md lg:row-span-2"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <span className="font-display text-3xl font-extrabold leading-tight tracking-tight">
                {big.name}
              </span>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs">
                {formatCount(big.voteCount)} votes
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
              {big.description}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            {bigBoard.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5 border-b border-white/10 py-2 last:border-0"
              >
                <TierBadge tier={p.tier} size="sm" />
                <span className="text-sm font-medium leading-tight">
                  {p.name}
                  <span className="block text-[11px] text-white/50">
                    {p.brand}
                  </span>
                </span>
                <span className="font-display text-xs font-bold text-white">
                  ↑ {formatCount(p.weeklyVotes)}
                </span>
              </div>
            ))}
          </div>
        </Link>

        {rest.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Tier legend */}
      <div className="mt-6 flex flex-wrap gap-4 rounded-xl border border-border bg-card p-5">
        {TIER_LEGEND.map((t) => (
          <div key={t.tier} className="flex min-w-[160px] flex-1 items-center gap-2.5">
            <TierBadge tier={t.tier} size="md" />
            <span className="text-sm font-semibold leading-tight">
              {t.label}
              <span className="block text-xs font-normal text-muted-foreground">
                {t.note}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
