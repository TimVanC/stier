"use client";

import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

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

/**
 * Homepage "Climbing the rankings" card — matches reference `.pcard` layout.
 * Static optimistic votes (homepage cards are not wired to Supabase).
 */
export function ClimbingProductCard({
  product,
  displayRank,
}: {
  product: RankedProduct;
  displayRank: number;
}) {
  const rising = product.rankChange >= 0;
  const href = `/categories/${product.categorySlug}/${product.slug}`;
  const [voteState, setVoteState] = useState<-1 | 0 | 1>(0);
  const displayVotes = product.netVotes + voteState;
  const rankChangeAbs = Math.abs(product.rankChange);
  const tierLabel = product.tier === "S+" ? "S+ TIER" : `${product.tier} TIER`;

  return (
    <article className="relative flex w-[300px] shrink-0 snap-start cursor-pointer flex-col overflow-hidden rounded-[20px] border border-border bg-card transition duration-[180ms] ease-out hover:-translate-y-[3px] hover:border-foreground hover:shadow-[0_18px_40px_-24px_rgba(26,26,46,0.25)]">
      {/* Rank — overlays image, top-left */}
      <span
        className={cn(
          "pointer-events-none absolute left-[14px] top-[14px] z-[2] font-display text-[64px] font-black leading-[0.8] tracking-[-0.04em] mix-blend-multiply",
          displayRank === 1 ? "text-coral" : "text-navy",
        )}
      >
        {String(displayRank).padStart(2, "0")}
        <sup className="ml-0.5 align-super font-sans text-sm font-bold text-muted-foreground mix-blend-normal">
          {rising ? "↑" : "↓"}
          {rankChangeAbs}
        </sup>
      </span>

      {/* Tier pill — overlays image, top-right */}
      <span
        className={cn(
          "pointer-events-none absolute right-[14px] top-[14px] z-[2] inline-flex h-[26px] items-center whitespace-nowrap rounded-[7px] px-2.5 font-display text-[11px] font-extrabold tracking-[0.06em] shadow-[inset_0_0_0_1px_rgba(26,26,46,0.08)]",
          TIER_PILL[product.tier],
        )}
      >
        {tierLabel}
      </span>

      {/* Image area — 200px hatch + label */}
      <Link href={href} className="block">
        <div className="relative flex h-[200px] items-end justify-center overflow-hidden border-b border-border bg-secondary bg-hatch">
          <span className="pointer-events-none absolute bottom-3 left-0 right-0 text-center font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            {product.imageLabel}
          </span>
        </div>
      </Link>

      {/* Body */}
      <Link
        href={href}
        className="flex flex-1 flex-col gap-1 px-[18px] pb-3.5 pt-4"
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
          {product.brand}
        </div>
        <div className="mt-0.5 font-display text-[17px] font-bold leading-[1.2] tracking-[-0.012em]">
          {product.name}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-xs font-medium text-muted-foreground">
          <span>{product.categoryName}</span>
          <span className="size-[3px] shrink-0 rounded-full bg-muted-foreground/60" />
          <span>{product.price}</span>
          <span className="size-[3px] shrink-0 rounded-full bg-muted-foreground/60" />
          <span
            className={cn(
              "inline-flex items-center gap-1 font-display text-xs font-semibold",
              rising ? "text-emerald-600" : "text-red-600/80",
            )}
          >
            {rising ? "▲" : "▼"}{" "}
            {product.weeklyVotes.toLocaleString()} this week
          </span>
        </div>
      </Link>

      {/* Foot — vote controls + rank change */}
      <div className="flex items-center justify-between border-t border-border bg-background px-3.5 py-3">
        <div className="inline-flex h-[34px] items-center overflow-hidden rounded-[10px] border border-border bg-card">
          <button
            type="button"
            aria-label="Upvote"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVoteState((s) => (s === 1 ? 0 : 1));
            }}
            className={cn(
              "inline-flex size-[34px] items-center justify-center text-foreground transition hover:bg-secondary",
              voteState === 1 && "bg-coral text-white hover:bg-coral",
            )}
          >
            <ArrowUp className="size-3.5" strokeWidth={2.5} />
          </button>
          <span className="flex h-[34px] min-w-[42px] items-center justify-center border-x border-border px-2.5 font-display text-[13px] font-bold tabular-nums">
            {formatCount(displayVotes)}
          </span>
          <button
            type="button"
            aria-label="Downvote"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setVoteState((s) => (s === -1 ? 0 : -1));
            }}
            className={cn(
              "inline-flex size-[34px] items-center justify-center text-foreground transition hover:bg-secondary",
              voteState === -1 && "bg-navy text-white hover:bg-navy",
            )}
          >
            <ArrowDown className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 whitespace-nowrap font-display text-xs font-semibold",
            rising ? "text-emerald-600" : "text-red-600/80",
          )}
        >
          {rising ? "▲" : "▼"} {rankChangeAbs} ranks
        </span>
      </div>
    </article>
  );
}
