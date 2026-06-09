import type { Metadata } from "next";

import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { getCategoriesWithStatsFromDb } from "@/lib/db/catalog";

export const metadata: Metadata = {
  title: "Browse all categories",
  description:
    "From coffee beans to winter jackets — ranked by people who actually own them.",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const categories = await getCategoriesWithStatsFromDb();

  return (
    <div className="container py-10 md:py-14">
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Browse all categories
      </h1>
      <CategoryBrowser
        categories={categories}
        initialQuery={searchParams?.q ?? ""}
      />
    </div>
  );
}
