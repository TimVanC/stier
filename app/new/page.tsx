import Link from "next/link";

import { CategoryCard } from "@/components/category/CategoryCard";
import { ProductRow } from "@/components/product/ProductRow";
import {
  getNewCategoriesFromDb,
  getNewProductsFromDb,
} from "@/lib/db/catalog";

export const metadata = {
  title: "New rankings",
  description: "Recently added community lists and products.",
};

export default async function NewRankingsPage() {
  const [newLists, newProducts] = await Promise.all([
    getNewCategoriesFromDb(6),
    getNewProductsFromDb(5),
  ]);

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          New rankings
        </h1>
        <p className="mt-2 text-muted-foreground">
          Fresh lists and recently added products, sorted by date.
        </p>
      </header>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          New lists
        </h2>
        {newLists.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newLists.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">
          Recently added products
        </h2>
        {newProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No approved products yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {newProducts.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
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
