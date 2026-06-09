import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

import type { RankedProduct } from "@/types";

/** Sidebar blocks for products with the biggest rank movement this week. */
export function RankMomentumSidebar({
  products,
}: {
  products: RankedProduct[];
  categorySlug?: string;
}) {
  const rising = [...products]
    .filter((p) => p.rankChange > 0)
    .sort((a, b) => b.rankChange - a.rankChange)
    .slice(0, 3);

  const falling = [...products]
    .filter((p) => p.rankChange < 0)
    .sort((a, b) => a.rankChange - b.rankChange)
    .slice(0, 3);

  if (rising.length === 0 && falling.length === 0) return null;

  return (
    <>
      {rising.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            On the rise
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {rising.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/categories/${p.categorySlug}/${p.slug}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-secondary"
                >
                  <span className="min-w-0 truncate font-medium">{p.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-display text-xs font-bold text-emerald-600">
                    <TrendingUp className="size-3.5" />+{p.rankChange}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {falling.length > 0 ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Falling
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {falling.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/categories/${p.categorySlug}/${p.slug}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm transition hover:bg-secondary"
                >
                  <span className="min-w-0 truncate font-medium">{p.name}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-display text-xs font-bold text-red-600/80">
                    <TrendingDown className="size-3.5" />
                    {p.rankChange}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}
