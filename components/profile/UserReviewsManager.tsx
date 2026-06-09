"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { ReviewForm } from "@/components/review/ReviewForm";
import { Stars } from "@/components/review/Stars";
import { Button } from "@/components/ui/button";
import { deleteReview } from "@/lib/actions/reviews";
import { formatCount } from "@/lib/utils";
import type { UserReviewRow } from "@/lib/db/user-reviews";

export function UserReviewsManager({
  reviews,
}: {
  reviews: UserReviewRow[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const editing = reviews.find((r) => r.id === editingId) ?? null;

  function handleDelete(reviewId: string) {
    if (!confirm("Delete your review? This cannot be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReview(reviewId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (editingId === reviewId) setEditingId(null);
      router.refresh();
    });
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <h2 className="font-display text-lg font-bold">
          You haven&apos;t written any reviews yet
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Open a product page and share your take with the community.
        </p>
        <Link
          href="/categories"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition hover:bg-coral-hover"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {editing ? (
        <ReviewForm
          productId={editing.productId}
          review={editing}
          onSuccess={() => {
            setEditingId(null);
            router.refresh();
          }}
          onCancel={() => setEditingId(null)}
        />
      ) : null}

      {reviews.map((review) => (
        <article
          key={review.id}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link
                href={`/categories/${review.categorySlug}/${review.productSlug}`}
                className="font-display text-base font-bold hover:text-coral"
              >
                {review.productBrand ? `${review.productBrand} · ` : ""}
                {review.productName}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {review.daysAgo === 0
                  ? "Today"
                  : `${review.daysAgo} day${review.daysAgo === 1 ? "" : "s"} ago`}{" "}
                · {formatCount(review.helpfulCount)} helpful
              </p>
            </div>
            <Stars rating={review.rating} />
          </div>

          {review.title ? (
            <h3 className="mt-3 font-display font-bold">{review.title}</h3>
          ) : null}
          {review.body ? (
            <p className="mt-1 text-sm leading-relaxed text-foreground/90">
              {review.body}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => setEditingId(review.id)}
            >
              Edit review
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(review.id)}
            >
              Delete
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
