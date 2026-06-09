"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useOptionalAuthGate } from "@/components/auth/AuthGateProvider";
import { ReviewCard } from "@/components/review/ReviewCard";
import { ReviewForm } from "@/components/review/ReviewForm";
import { Button } from "@/components/ui/button";
import { cn, formatCount } from "@/lib/utils";
import type { ProductReviewStats } from "@/lib/db/reviews";
import type { Review } from "@/types";

type SortKey = "helpful" | "recent" | "highest" | "lowest";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "helpful", label: "Most Helpful" },
  { key: "recent", label: "Most Recent" },
  { key: "highest", label: "Highest Rated" },
  { key: "lowest", label: "Lowest Rated" },
];

export function ProductReviewsBlock({
  productId,
  initialReviews,
  initialStats,
  userReview,
}: {
  productId: string;
  initialReviews: Review[];
  initialStats: ProductReviewStats;
  userReview: Review | null;
}) {
  const router = useRouter();
  const authGate = useOptionalAuthGate();
  const [sort, setSort] = useState<SortKey>("helpful");
  const [formMode, setFormMode] = useState<"hidden" | "create" | "edit">(
    "hidden",
  );

  function refreshPage() {
    setFormMode("hidden");
    router.refresh();
  }

  function handleWriteReview() {
    if (authGate && !authGate.isAuthenticated) {
      authGate.requestAuth();
      return;
    }
    if (userReview) {
      setFormMode("edit");
    } else {
      setFormMode("create");
    }
  }

  const sorted = useMemo(() => {
    const list = [...initialReviews];
    switch (sort) {
      case "recent":
        list.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime(),
        );
        break;
      case "highest":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "lowest":
        list.sort((a, b) => a.rating - b.rating);
        break;
      default:
        list.sort((a, b) => b.helpfulCount - a.helpfulCount);
    }
    return list;
  }, [initialReviews, sort]);

  const totalRatings = Object.values(initialStats.breakdown).reduce(
    (s, n) => s + n,
    0,
  );

  return (
    <>
      {totalRatings > 0 ? (
        <section className="mt-10 grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-display text-5xl font-black">
              {initialStats.avgRating}
            </span>
            <span className="mt-2 text-sm text-muted-foreground">
              out of 5
            </span>
            <span className="mt-1 text-sm text-muted-foreground">
              {formatCount(initialStats.count)} reviews
            </span>
          </div>
          <div className="flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = initialStats.breakdown[star] ?? 0;
              const pct = totalRatings ? (count / totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-tier-b"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-muted-foreground">
                    {formatCount(count)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Reviews
          </h2>
          <Button type="button" onClick={handleWriteReview}>
            {userReview ? "Edit your review" : "Write a review"}
          </Button>
        </div>

        {formMode !== "hidden" ? (
          <div className="mb-6">
            <ReviewForm
              productId={productId}
              review={formMode === "edit" ? userReview : null}
              onSuccess={refreshPage}
              onCancel={() => setFormMode("hidden")}
            />
          </div>
        ) : null}

        {initialReviews.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No reviews yet. Be the first to share your experience.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSort(s.key)}
                  className={cn(
                    "h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition",
                    sort === s.key
                      ? "border-foreground bg-navy text-white"
                      : "border-border bg-card hover:border-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              {sorted.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={
                    review.isOwn
                      ? () => setFormMode("edit")
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
