"use client";

import { Flag, Pencil, ThumbsUp } from "lucide-react";
import { useState, useTransition } from "react";

import { Stars } from "@/components/review/Stars";
import { markReviewHelpful, reportReview } from "@/lib/actions/reviews";
import { useOptionalAuthGate } from "@/components/auth/AuthGateProvider";
import type { Review } from "@/types";

export function ReviewCard({
  review,
  onEdit,
}: {
  review: Review;
  onEdit?: () => void;
}) {
  const authGate = useOptionalAuthGate();
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount);
  const [reported, setReported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function requireAuth(action: () => void) {
    if (authGate && !authGate.isAuthenticated) {
      authGate.requestAuth();
      return;
    }
    action();
  }

  function handleHelpful() {
    requireAuth(() => {
      const previous = helpfulCount;
      setHelpfulCount((c) => c + 1);
      setError(null);
      startTransition(async () => {
        const result = await markReviewHelpful(review.id);
        if (!result.ok) {
          setHelpfulCount(previous);
          setError(result.error);
          return;
        }
        if (result.data) setHelpfulCount(result.data.helpfulCount);
      });
    });
  }

  function handleReport() {
    requireAuth(() => {
      if (reported) return;
      setError(null);
      startTransition(async () => {
        const result = await reportReview(review.id);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setReported(true);
      });
    });
  }

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
              {review.daysAgo === 0
                ? "Today"
                : `${review.daysAgo} day${review.daysAgo === 1 ? "" : "s"} ago`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Stars rating={review.rating} />
          {review.isOwn && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Edit review"
            >
              <Pencil className="size-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {review.title ? (
        <h4 className="mt-4 font-display text-base font-bold">{review.title}</h4>
      ) : null}
      {review.body ? (
        <p className="mt-1.5 text-sm leading-relaxed text-foreground/90">
          {review.body}
        </p>
      ) : null}

      {review.pros || review.cons ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {review.pros ? (
            <div className="rounded-lg bg-tier-c/15 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Pros
              </div>
              <p className="mt-0.5 text-sm text-foreground/90">{review.pros}</p>
            </div>
          ) : null}
          {review.cons ? (
            <div className="rounded-lg bg-coral/10 p-3">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-coral">
                Cons
              </div>
              <p className="mt-0.5 text-sm text-foreground/90">{review.cons}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <button
          type="button"
          disabled={isPending}
          onClick={handleHelpful}
          className="inline-flex items-center gap-1.5 font-medium transition hover:text-foreground disabled:opacity-50"
        >
          <ThumbsUp className="size-3.5" />
          Helpful ({helpfulCount})
        </button>
        <button
          type="button"
          disabled={isPending || reported}
          onClick={handleReport}
          className="inline-flex items-center gap-1.5 transition hover:text-foreground disabled:opacity-50"
        >
          <Flag className="size-3.5" />
          {reported ? "Reported" : "Report"}
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      ) : null}
    </article>
  );
}
