import Link from "next/link";

import { CategoryCard } from "@/components/category/CategoryCard";
import { ClimbingProductCard } from "@/components/home/ClimbingProductCard";
import { TrendingPeriodToggle } from "@/components/discovery/TrendingPeriodToggle";
import {
  getTrendingCategoriesFromDb,
  getTrendingProductsFromDb,
} from "@/lib/db/catalog";

export const metadata = {
  title: "Trending",
  description: "Lists and products gaining the most traction right now.",
};

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = searchParams.period === "month" ? "month" : "week";
  const days = period === "month" ? 30 : 7;
  const listLimit = period === "month" ? 8 : 6;
  const productLimit = period === "month" ? 10 : 8;

  const [lists, products] = await Promise.all([
    getTrendingCategoriesFromDb(listLimit, days),
    getTrendingProductsFromDb(productLimit, days),
  ]);

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
        <TrendingPeriodToggle period={period} />
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Trending lists
        </h2>
        {lists.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No category activity in this period yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-5 font-display text-xl font-bold tracking-tight">
          Trending products
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No product votes in this period yet.
          </p>
        ) : (
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
        )}
      </section>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/categories" className="font-semibold hover:text-coral">
          Browse all categories →
        </Link>
      </p>
    </div>
  );
}
