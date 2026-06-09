import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stars({
  rating,
  className,
  size = "size-4",
}: {
  rating: number;
  className?: string;
  size?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size,
            i < Math.round(rating)
              ? "fill-tier-b text-tier-b"
              : "fill-transparent text-border",
          )}
        />
      ))}
    </span>
  );
}
