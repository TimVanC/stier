import { Flag, ThumbsUp } from "lucide-react";

import { Stars } from "@/components/review/Stars";
import type { Review } from "@/types";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-navy font-display text-sm font-bold text-white">
            {review.username.charAt(0).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{review.username}</span>
              {review.ownsProduct ? (
                <span className="rounded-full bg-tier-c/30 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                  Owns this
                </span>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">
              {review.daysAgo} days ago
            </span>
          </div>
        </div>
        <Stars rating={review.rating} />
      </div>

      <h4 className="mt-4 font-display text-base font-bold">{review.title}</h4>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
        {review.body}
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg bg-tier-c/15 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
            Pros
          </div>
          <p className="mt-0.5 text-sm text-foreground/90">{review.pros}</p>
        </div>
        <div className="rounded-lg bg-coral/10 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-coral">
            Cons
          </div>
          <p className="mt-0.5 text-sm text-foreground/90">{review.cons}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 font-medium transition hover:text-foreground"
        >
          <ThumbsUp className="size-3.5" />
          Helpful ({review.helpfulCount})
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 transition hover:text-foreground"
        >
          <Flag className="size-3.5" />
          Report
        </button>
      </div>
    </article>
  );
}
