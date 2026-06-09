import type { Metadata } from "next";
import Link from "next/link";

import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { getCategoriesWithStats } from "@/lib/seed-data";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Browse all categories",
  description:
    "From coffee beans to winter jackets — ranked by people who actually own them.",
};

export default function CategoriesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const categories = getCategoriesWithStats();
  const featured = categories.filter((c) => c.isFeatured);
  const recent = [...categories]
    .sort((a, b) => a.createdDaysAgo - b.createdDaysAgo)
    .slice(0, 4);

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Browse all categories
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          From coffee beans to winter jackets — ranked by people who actually own
          them.
        </p>
      </header>

      {/* Featured row */}
      {featured.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Featured
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {featured.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group flex w-[280px] shrink-0 flex-col justify-between rounded-xl bg-navy p-5 text-white transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl" aria-hidden>
                    {c.icon}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                    {formatCount(c.voteCount)} votes
                  </span>
                </div>
                <div className="mt-6">
                  <div className="font-display text-xl font-extrabold tracking-tight">
                    {c.name}
                  </div>
                  <div className="mt-1 text-sm text-white/60">
                    Top: {c.topProductName}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Filterable grid */}
      <CategoryBrowser categories={categories} initialQuery={searchParams?.q} />

      {/* Recently added */}
      <section className="mt-12">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recently added
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {recent.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="flex w-[220px] shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-foreground"
            >
              <span className="text-2xl" aria-hidden>
                {c.icon}
              </span>
              <span>
                <span className="block font-display text-sm font-bold">
                  {c.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {c.productCount} products
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
