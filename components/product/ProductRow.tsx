import Link from "next/link";
import {
  Bookmark,
  ExternalLink,
  MessageSquare,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { TierBadge } from "@/components/product/TierBadge";
import { VoteButtons } from "@/components/product/VoteButtons";
import { cn, formatCount } from "@/lib/utils";
import type { RankedProduct } from "@/types";

/** Horizontal ranked-list row used on the category page. */
export function ProductRow({
  product,
  elevated = false,
}: {
  product: RankedProduct;
  elevated?: boolean;
}) {
  const href = `/categories/${product.categorySlug}/${product.slug}`;
  const rising = product.rankChange >= 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-card p-4 transition hover:shadow-md sm:flex-row sm:items-center sm:gap-5",
        elevated
          ? "border-coral/40 shadow-sm ring-1 ring-coral/20"
          : "border-border",
      )}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        <span className="w-8 shrink-0 text-center font-display text-3xl font-black tabular-nums text-foreground">
          {product.rank}
        </span>
        <Link href={href} className="shrink-0">
          <ImagePlaceholder
            label=""
            className="size-20 rounded-lg border border-border"
          />
        </Link>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <TierBadge tier={product.tier} size="sm" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </span>
        </div>
        <Link href={href} className="mt-1 block">
          <h3 className="font-display text-lg font-bold leading-tight tracking-tight hover:text-coral">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{product.price}</span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {formatCount(product.reviewCount)} reviews
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              rising ? "text-emerald-600" : "text-red-600",
            )}
          >
            {rising ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            {rising ? "+" : ""}
            {product.rankChange} this week
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-center">
        <VoteButtons netVotes={product.netVotes} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Save to list"
            aria-label="Save to list"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card transition hover:bg-secondary"
          >
            <Bookmark className="size-4" />
          </button>
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-coral px-4 text-sm font-semibold text-white transition hover:bg-coral-hover"
          >
            Buy
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
