"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ReviewCard } from "@/components/review/ReviewCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

type SortKey = "helpful" | "recent" | "highest" | "lowest";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "helpful", label: "Most Helpful" },
  { key: "recent", label: "Most Recent" },
  { key: "highest", label: "Highest Rated" },
  { key: "lowest", label: "Lowest Rated" },
];

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const [sort, setSort] = useState<SortKey>("helpful");

  const sorted = useMemo(() => {
    const list = [...reviews];
    switch (sort) {
      case "recent":
        list.sort((a, b) => a.daysAgo - b.daysAgo);
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
  }, [reviews, sort]);

  return (
    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          Reviews
        </h2>
        <Button asChild>
          {/* Anonymous users get the sign-up flow; full inline form lands with reviews phase. */}
          <Link href="/login">Write a review</Link>
        </Button>
      </div>

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
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
