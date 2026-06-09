"use client";

import { useState, useTransition } from "react";

import { StarRatingInput } from "@/components/review/StarRatingInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteReview,
  submitReview,
  updateReview,
  type ReviewInput,
} from "@/lib/actions/reviews";
import type { Review } from "@/types";

export function ReviewForm({
  productId,
  review,
  onSuccess,
  onCancel,
}: {
  productId: string;
  review?: Review | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const isEditing = Boolean(review);
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [title, setTitle] = useState(review?.title ?? "");
  const [body, setBody] = useState(review?.body ?? "");
  const [pros, setPros] = useState(review?.pros ?? "");
  const [cons, setCons] = useState(review?.cons ?? "");
  const [ownsProduct, setOwnsProduct] = useState(review?.ownsProduct ?? false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }

    const payload: ReviewInput = {
      productId,
      rating,
      title,
      body,
      pros,
      cons,
      ownsProduct,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateReview(review!.id, payload)
        : await submitReview(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  function handleDelete() {
    if (!review || !confirm("Delete your review? This cannot be undone.")) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteReview(review.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5 md:p-6"
    >
      <h3 className="font-display text-lg font-bold">
        {isEditing ? "Edit your review" : "Write a review"}
      </h3>

      {error ? (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-2">
        <Label>Your rating</Label>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          disabled={isPending}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label htmlFor="review-title">Headline</Label>
        <Input
          id="review-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sum it up in one line"
          disabled={isPending}
          maxLength={120}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Label htmlFor="review-body">Review</Label>
        <textarea
          id="review-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What should buyers know?"
          disabled={isPending}
          rows={4}
          className="flex w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="review-pros">Pros</Label>
          <textarea
            id="review-pros"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
            placeholder="What worked well?"
            disabled={isPending}
            rows={3}
            className="flex w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="review-cons">Cons</Label>
          <textarea
            id="review-cons"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
            placeholder="What fell short?"
            disabled={isPending}
            rows={3}
            className="flex w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-foreground focus-visible:ring-4 focus-visible:ring-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={ownsProduct}
          onChange={(e) => setOwnsProduct(e.target.checked)}
          disabled={isPending}
          className="size-4 rounded border-border"
        />
        I own or have used this product
      </label>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Save changes" : "Submit review"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        {isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isPending}
            className="text-destructive hover:text-destructive"
          >
            Delete review
          </Button>
        ) : null}
      </div>
    </form>
  );
}
