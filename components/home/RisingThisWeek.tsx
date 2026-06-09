import Link from "next/link";

import { ClimbingProductCard } from "@/components/home/ClimbingProductCard";
import { getRisingProductsFromDb } from "@/lib/db/catalog";

export async function RisingThisWeek() {
  const rising = await getRisingProductsFromDb(7);

  if (rising.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <span className="size-2 rounded-[3px] bg-coral" />
              Rising this week
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
              Climbing the rankings
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Products moving up fast. Voted by the community in the last 7 days.
            </p>
          </div>
          <Link
            href="/categories"
            className="hidden shrink-0 rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm font-semibold transition hover:bg-secondary sm:inline-block"
          >
            See all
          </Link>
        </div>
      </div>

      <div className="fade-right">
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 scrollbar-hide md:px-[max(1.5rem,calc((100vw-1320px)/2+1.5rem))]">
          {rising.map((product, i) => (
            <ClimbingProductCard
              key={product.id}
              product={product}
              displayRank={i + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
