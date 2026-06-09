"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function StarRatingInput({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" role="group" aria-label="Rating">
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const active = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={disabled}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            className="inline-flex size-9 items-center justify-center rounded-lg transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Star
              className={cn(
                "size-6",
                active
                  ? "fill-tier-b text-tier-b"
                  : "fill-transparent text-border",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
