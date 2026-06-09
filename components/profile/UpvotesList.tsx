"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeVote } from "@/lib/actions/votes";
import { Button } from "@/components/ui/button";
import { formatCount } from "@/lib/utils";
import type { UpvotedProduct } from "@/lib/db/upvotes";

export function UpvotesList({
  products,
}: {
  products: UpvotedProduct[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRemove(productId: string) {
    setError(null);
    startTransition(async () => {
      const result = await removeVote(productId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <h2 className="font-display text-lg font-bold">
          Products you upvote will appear here
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse rankings and upvote what you actually recommend.
        </p>
        <Link
          href="/categories"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition hover:bg-coral-hover"
        >
          Browse categories
        </Link>
      </div>
    );
  }

  return (
    <div>
      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {products.map((p) => (
          <div
            key={p.productId}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <Link
                href={`/categories/${p.categorySlug}/${p.productSlug}`}
                className="block font-display font-bold hover:text-coral"
              >
                {p.brand ? `${p.brand} · ` : ""}
                {p.name}
              </Link>
              <p className="mt-1 text-sm text-muted-foreground">
                {p.categoryName} · {formatCount(p.netVotes)} net votes
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={() => handleRemove(p.productId)}
            >
              Remove upvote
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
