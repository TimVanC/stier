import { cn } from "@/lib/utils";

/**
 * Decorative ascending tier bars (C → S) from the Stier logo. Used as an
 * accent on auth pages, empty states, and badges.
 */
export function TierBars({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-end gap-1", className)} aria-hidden>
      <span className="block h-1.5 w-1.5 rounded-sm bg-tier-c" />
      <span className="block h-2.5 w-1.5 rounded-sm bg-tier-b" />
      <span className="block h-4 w-1.5 rounded-sm bg-tier-a" />
      <span className="block h-6 w-1.5 rounded-sm bg-tier-s" />
    </span>
  );
}
