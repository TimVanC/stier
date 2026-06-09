import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { RankedList } from "@/components/product/RankedList";
import {
  getCategories,
  getCategoryBySlug,
  getRankedProducts,
} from "@/lib/seed-data";
import { formatCount } from "@/lib/utils";

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const category = getCategoryBySlug(params.slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `Best ${category.name} — Ranked by the Community`,
    description: category.description,
  };
}

export default function RankedCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const products = getRankedProducts(category.slug);
  const related = getCategories()
    .filter((c) => c.slug !== category.slug)
    .slice(0, 5);

  return (
    <div className="container py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/categories" className="transition hover:text-foreground">
          Categories
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            {category.icon}
          </span>
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {category.name}
          </h1>
        </div>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {category.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">
              {formatCount(category.voteCount)}
            </span>{" "}
            votes
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {category.productCount}
            </span>{" "}
            products
          </span>
          <span>Updated daily</span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* Ranked list */}
        <div>
          {products.length === 0 ? (
            <EmptyState
              title="This category is being built"
              description="Be the first to submit a product that belongs here."
              actionLabel="Submit a product"
              actionHref="/submit"
            />
          ) : (
            <RankedList products={products} />
          )}

          {/* Submit banner */}
          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-display text-base font-bold">
                Don&apos;t see a product that belongs here?
              </p>
              <p className="text-sm text-muted-foreground">
                Submit it and the community will rank it.
              </p>
            </div>
            <Link
              href="/submit"
              className="inline-flex h-10 shrink-0 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition hover:bg-coral-hover"
            >
              Submit a product
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="hidden flex-col gap-5 lg:flex">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Category stats
            </h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="font-semibold">{category.productCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total votes</dt>
                <dd className="font-semibold">
                  {formatCount(category.voteCount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Top pick</dt>
                <dd className="font-semibold">{category.topProductName}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Related categories
            </h2>
            <ul className="mt-3 flex flex-col gap-1">
              {related.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm transition hover:bg-secondary"
                  >
                    <span aria-hidden>{c.icon}</span>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-navy p-5 text-white">
            <p className="font-display text-base font-bold">
              Missing a product?
            </p>
            <p className="mt-1 text-sm text-white/70">
              Help the community rank what matters.
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition hover:bg-coral-hover"
            >
              Submit a product
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
