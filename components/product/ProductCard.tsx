import Link from "next/link";

import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { cn, formatCount } from "@/lib/utils";
import type { RankedProduct, Tier } from "@/types";

const TIER_PILL: Record<Tier, string> = {
  "S+": "bg-coral text-white ring-2 ring-amber-300",
  S: "bg-tier-s text-navy",
  A: "bg-tier-a text-navy",
  B: "bg-tier-b text-navy",
  C: "bg-tier-c text-navy",
  D: "bg-tier-d text-navy",
  F: "bg-tier-f text-navy",
};

/** Vertical product card used in the homepage "Climbing the rankings" row. */
export function ProductCard({ product }: { product: RankedProduct }) {
  const rising = product.rankChange >= 0;
  const href = `/categories/${product.categorySlug}/${product.slug}`;

  return (
    <Link
      href={href}
      className="group flex w-[300px] shrink-0 snap-start flex-col overflow-hidden rounded-[20px] border border-border bg-card transition hover:-translate-y-1 hover:border-foreground hover:shadow-lg"
    >
      <div className="relative">
        {/* Oversized rank number with rank-change superscript */}
        <span
          className={cn(
            "absolute left-3.5 top-2 z-10 font-display text-[64px] font-black leading-[0.8] tracking-tighter mix-blend-multiply",
            product.rank === 1 ? "text-coral" : "text-navy",
          )}
        >
          {String(product.rank).padStart(2, "0")}
          <sup
            className={cn(
              "ml-0.5 align-super font-display text-xs font-bold",
              rising ? "text-emerald-600" : "text-red-600",
            )}
          >
            {rising ? "↑" : "↓"}
            {Math.abs(product.rankChange)}
          </sup>
        </span>

        {/* Tier pill */}
        <span
          className={cn(
            "absolute right-3.5 top-3 z-10 inline-flex h-[26px] items-center rounded-[7px] px-2.5 font-display text-[11px] font-extrabold tracking-wide shadow-[inset_0_0_0_1px_rgba(26,26,46,0.08)]",
            TIER_PILL[product.tier],
          )}
        >
          {product.tier} TIER
        </span>

        <ImagePlaceholder
          label={product.imageLabel}
          className="h-[200px] border-b border-border"
        />
      </div>

      <div className="flex flex-1 flex-col gap-1 p-[18px]">
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {product.brand}
        </div>
        <div className="font-display text-[17px] font-bold leading-tight tracking-tight">
          {product.name}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{product.categoryName}</span>
          <span className="size-[3px] rounded-full bg-muted-foreground/50" />
          <span>{product.price}</span>
          <span className="size-[3px] rounded-full bg-muted-foreground/50" />
          <span
            className={cn(
              "font-semibold",
              rising ? "text-emerald-600" : "text-red-600",
            )}
          >
            {rising ? "▲" : "▼"} {formatCount(product.weeklyVotes)} this week
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border bg-background px-3.5 py-3">
        <span className="font-display text-sm font-bold tabular-nums text-foreground">
          {formatCount(product.netVotes)} votes
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 font-display text-xs font-bold",
            rising ? "text-emerald-600" : "text-red-600",
          )}
        >
          {rising ? "▲" : "▼"} {Math.abs(product.rankChange)} ranks
        </span>
      </div>
    </Link>
  );
}
