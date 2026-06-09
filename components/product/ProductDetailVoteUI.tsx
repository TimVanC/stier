"use client";

import { Bookmark, ExternalLink } from "lucide-react";

import { useProductVoteCount } from "@/components/product/ProductVoteProvider";
import { VoteButtons } from "@/components/product/VoteButtons";
import { formatCount } from "@/lib/utils";
import type { UserVote } from "@/lib/db/votes";

export function ProductDetailVoteActions({
  productId,
  initialNetVotes,
  initialUserVote,
  price,
  affiliateUrl,
}: {
  productId: string;
  initialNetVotes: number;
  initialUserVote: UserVote;
  price: string;
  affiliateUrl: string;
}) {
  const { setNetVotes } = useProductVoteCount();

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <VoteButtons
        productId={productId}
        initialNetVotes={initialNetVotes}
        initialUserVote={initialUserVote}
        onNetVotesChange={setNetVotes}
      />
      <button
        type="button"
        className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-semibold transition hover:bg-secondary"
      >
        <Bookmark className="size-4" />
        Save to list
      </button>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-11 items-center gap-2 rounded-full bg-coral px-6 text-sm font-bold text-white transition hover:bg-coral-hover"
      >
        Buy {price}
        <ExternalLink className="size-4" />
      </a>
    </div>
  );
}

export function ProductDetailStatsBar({
  reviewCount,
  avgRating,
  rankChange,
}: {
  reviewCount: number;
  avgRating: number;
  rankChange: number;
}) {
  const { netVotes } = useProductVoteCount();

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-4">
      <Stat label="Net votes" value={formatCount(netVotes)} />
      <Stat label="Reviews" value={formatCount(reviewCount)} />
      <Stat label="Avg rating" value={`${avgRating} / 5`} />
      <Stat
        label="Rank change"
        value={`${rankChange >= 0 ? "+" : ""}${rankChange} this wk`}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-xl font-extrabold tracking-tight">
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
