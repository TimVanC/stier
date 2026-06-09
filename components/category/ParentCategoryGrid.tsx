import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { NavList, NavParent } from "@/lib/nav-catalog";
import { getCategoryBySlugFromDb } from "@/lib/db/catalog";
import { formatCount } from "@/lib/utils";
import { TierBadge } from "@/components/product/TierBadge";

/** Grid of sub-lists under a parent nav category (e.g. /categories/audio). */
export async function ParentCategoryGrid({ parent }: { parent: NavParent }) {
  const listStats = await Promise.all(
    parent.lists.map((list) =>
      getCategoryBySlugFromDb(list.productCategorySlug),
    ),
  );

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/categories" className="transition hover:text-foreground">
          Categories
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{parent.label}</span>
      </nav>

      <header className="mb-8 max-w-2xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          {parent.label}
        </h1>
        <p className="mt-2 text-muted-foreground">{parent.description}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parent.lists.map((list, i) => (
          <ListCard key={list.slug} list={list} stats={listStats[i] ?? null} />
        ))}
      </div>
    </div>
  );
}

function ListCard({
  list,
  stats,
}: {
  list: NavList;
  stats: Awaited<ReturnType<typeof getCategoryBySlugFromDb>>;
}) {
  const voteCount = stats?.voteCount ?? 0;
  const productCount = stats?.productCount ?? 0;
  const topProductName = stats?.topProductName;
  const topTier = stats?.topTier;

  return (
    <Link
      href={`/categories/${list.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-foreground hover:shadow-md"
    >
      <h2 className="font-display text-xl font-bold tracking-tight group-hover:text-coral">
        {list.name}
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {list.description}
      </p>
      {topProductName && topTier ? (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <TierBadge tier={topTier} size="sm" />
          <span className="text-muted-foreground">
            Top:{" "}
            <span className="font-semibold text-foreground">{topProductName}</span>
          </span>
        </div>
      ) : null}
      <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">{productCount}</span>{" "}
          products
        </span>
        <span>
          <span className="font-semibold text-foreground">
            {formatCount(voteCount)}
          </span>{" "}
          votes
        </span>
      </div>
    </Link>
  );
}
