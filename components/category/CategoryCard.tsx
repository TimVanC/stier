import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { TierBadge } from "@/components/product/TierBadge";
import { formatCount } from "@/lib/utils";
import type { CategoryWithStats } from "@/types";

/** Standard category card for grids. */
export function CategoryCard({ category }: { category: CategoryWithStats }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-foreground hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden>
            {category.icon}
          </span>
          <span className="font-display text-xl font-extrabold leading-tight tracking-tight">
            {category.name}
          </span>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
          {category.productCount} ranked
        </span>
      </div>

      {category.topProductName && category.topTier ? (
        <div className="mt-4 flex items-center gap-2.5">
          <TierBadge tier={category.topTier} size="sm" />
          <span className="text-sm font-semibold leading-tight">
            {category.topProductName}
            <span className="block text-xs font-normal text-muted-foreground">
              {formatCount(category.voteCount)} votes
            </span>
          </span>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          Be the first to rank a product here.
        </p>
      )}

      <span className="absolute bottom-4 right-4 flex size-8 translate-x-2 items-center justify-center rounded-full bg-navy text-white opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100">
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
