import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { TierBadge } from "@/components/product/TierBadge";
import { VoteButtons } from "@/components/product/VoteButtons";
import { cn, formatCount } from "@/lib/utils";
import type { RankedProduct } from "@/types";

/** Vertical product card used in the homepage "Rising" row. */
export function ProductCard({ product }: { product: RankedProduct }) {
  const rising = product.rankChange >= 0;
  return (
    <Link
      href={`/categories/${product.categorySlug}/${product.slug}`}
      className="group flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:-translate-y-0.5 hover:border-foreground hover:shadow-md"
    >
      <div className="relative">
        <span className="absolute left-3.5 top-3 z-10 font-display text-5xl font-black leading-none text-navy/90 mix-blend-multiply">
          {String(product.rank).padStart(2, "0")}
        </span>
        <span className="absolute right-3.5 top-3 z-10">
          <TierBadge tier={product.tier} size="sm" />
        </span>
        <ImagePlaceholder
          label={product.imageLabel}
          className="h-44 border-b border-border"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {product.brand}
        </div>
        <div className="font-display text-base font-bold leading-tight tracking-tight">
          {product.name}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{product.categoryName}</span>
          <span className="size-1 rounded-full bg-muted-foreground/50" />
          <span>{product.price}</span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-background px-3 py-2.5">
        <VoteButtons netVotes={product.netVotes} size="sm" />
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold",
            rising ? "text-emerald-600" : "text-red-600",
          )}
        >
          {rising ? (
            <TrendingUp className="size-3.5" />
          ) : (
            <TrendingDown className="size-3.5" />
          )}
          {rising ? "+" : ""}
          {formatCount(product.weeklyVotes)} this wk
        </span>
      </div>
    </Link>
  );
}
