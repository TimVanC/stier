"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { CategoryCard } from "@/components/category/CategoryCard";
import { ClimbingProductCard } from "@/components/home/ClimbingProductCard";
import { cn } from "@/lib/utils";
import { getCategoriesWithStats, getRisingProducts } from "@/lib/seed-data";

type Period = "week" | "month";

export default function TrendingPage() {
  const [period, setPeriod] = useState<Period>("week");

  const lists = useMemo(() => {
    const sorted = getCategoriesWithStats().slice().sort((a, b) => b.voteCount - a.voteCount);
    return period === "week" ? sorted.slice(0, 6) : sorted.slice(0, 8);
  }, [period]);

  const products = useMemo(() => {
    const rising = getRisingProducts(period === "week" ? 8 : 10);
    return period === "month"
      ? [...rising].sort((a, b) => b.upvotes + b.downvotes - (a.upvotes + a.downvotes))
      : rising;
  }, [period]);

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Trending
          </h1>
          <p className="mt-2 text-muted-foreground">
            Lists and products gaining the most traction right now.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-border bg-card p-1">
          {(["week", "month"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "h-9 rounded-full px-4 text-sm font-semibold capitalize transition",
                period === p
                  ? "bg-navy text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              This {p}
            </button>
          ))}
        </div>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Trending lists
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-5 font-display text-xl font-bold tracking-tight">
          Trending products
        </h2>
        <div className="fade-right -mx-6 px-6">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {products.map((product, i) => (
              <ClimbingProductCard
                key={product.id}
                product={product}
                displayRank={i + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/categories" className="font-semibold hover:text-coral">
          Browse all categories →
        </Link>
      </p>
    </div>
  );
}
