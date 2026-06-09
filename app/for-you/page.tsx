import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CategoryCard } from "@/components/category/CategoryCard";
import { ClimbingProductCard } from "@/components/home/ClimbingProductCard";
import { getCategoriesWithStats, getRisingProducts } from "@/lib/seed-data";

export const metadata = {
  title: "Suggested for you",
  description: "Community lists and rising products picked for you.",
};

export default function ForYouPage() {
  const popular = getCategoriesWithStats()
    .slice()
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 6);
  const rising = getRisingProducts(6);

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          Suggested for you
        </h1>
        <p className="mt-2 text-muted-foreground">
          Popular lists and products climbing the rankings this week. Personalised
          picks arrive in Phase 9.
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Top lists
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-tight">
            Rising products
          </h2>
          <Link
            href="/trending"
            className="inline-flex items-center gap-1 text-sm font-semibold hover:text-coral"
          >
            See trending
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="fade-right -mx-6 px-6">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
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
    </div>
  );
}
