import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { AuthGateProvider } from "@/components/auth/AuthGateProvider";
import { EmptyState } from "@/components/shared/EmptyState";
import { RankedList } from "@/components/product/RankedList";
import { ParentCategoryGrid } from "@/components/category/ParentCategoryGrid";
import {
  mergeVoteSnapshot,
  userVotesForProducts,
} from "@/lib/db/merge-votes";
import { dbProductId, getVoteSnapshot } from "@/lib/db/votes";
import { getNavList, getNavParent, NAV_PARENTS } from "@/lib/nav-catalog";
import {
  getCategories,
  getCategoryBySlug,
  getRankedProducts,
} from "@/lib/seed-data";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const seed = getCategories().map((c) => ({ slug: c.slug }));
  const parents = NAV_PARENTS.map((p) => ({ slug: p.slug }));
  const lists = NAV_PARENTS.flatMap((p) =>
    p.lists.map((l) => ({ slug: l.slug })),
  );
  const seen = new Set<string>();
  return [...seed, ...parents, ...lists].filter((item) => {
    if (seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const parent = getNavParent(params.slug);
  if (parent) {
    return {
      title: `${parent.label} — Community Rankings`,
      description: parent.description,
    };
  }
  const navList = getNavList(params.slug);
  if (navList) {
    return {
      title: `Best ${navList.name} — Ranked by the Community`,
      description: navList.description,
    };
  }
  const category = getCategoryBySlug(params.slug);
  if (!category) return { title: "Category not found" };
  return {
    title: `Best ${category.name} — Ranked by the Community`,
    description: category.description,
  };
}

export default async function RankedCategoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const parent = getNavParent(params.slug);
  if (parent) {
    return <ParentCategoryGrid parent={parent} />;
  }

  const navList = getNavList(params.slug);
  const productCategorySlug = navList?.productCategorySlug ?? params.slug;
  const seedCategory = getCategoryBySlug(productCategorySlug);
  if (!seedCategory && !navList) notFound();

  const displayName = navList?.name ?? seedCategory!.name;
  const displayDescription =
    navList?.description ?? seedCategory!.description;
  const voteCount = seedCategory?.voteCount ?? 0;
  const productCount = seedCategory?.productCount ?? 0;
  const topProductName = seedCategory?.topProductName ?? null;

  const seedProducts = getRankedProducts(productCategorySlug);
  const productIds = seedProducts.map((p) =>
    dbProductId(productCategorySlug, p.slug),
  );
  const snapshot = await getVoteSnapshot(productIds);
  const products = mergeVoteSnapshot(
    seedProducts,
    productCategorySlug,
    snapshot,
  );
  const userVotes = userVotesForProducts(products, snapshot);

  const related = getCategories()
    .filter((c) => c.slug !== productCategorySlug)
    .slice(0, 5);

  return (
    <AuthGateProvider isAuthenticated={snapshot.isAuthenticated}>
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
        <span className="font-medium text-foreground">{displayName}</span>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {displayName}
          </h1>
        </div>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {displayDescription}
        </p>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold text-foreground">
              {formatCount(voteCount)}
            </span>{" "}
            votes
          </span>
          <span>
            <span className="font-semibold text-foreground">
              {productCount}
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
            <RankedList products={products} userVotes={userVotes} />
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
                <dd className="font-semibold">{productCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total votes</dt>
                <dd className="font-semibold">
                  {formatCount(voteCount)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Top pick</dt>
                <dd className="font-semibold">{topProductName ?? "—"}</dd>
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
    </AuthGateProvider>
  );
}
