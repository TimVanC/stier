import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

const TIER_BG: Record<Tier, string> = {
  S: "bg-tier-s",
  A: "bg-tier-a",
  B: "bg-tier-b",
  C: "bg-tier-c",
  D: "bg-tier-d",
  F: "bg-tier-f",
};

const SIZES = {
  sm: "h-6 w-6 text-xs",
  md: "h-7 w-7 text-sm",
  lg: "h-9 w-9 text-base",
} as const;

/**
 * Tier badge (S/A/B/C/D/F) in pastel tier colors. Dark text for contrast on
 * the light pastels, matching the reference mockup.
 */
export function TierBadge({
  tier,
  size = "md",
  className,
}: {
  tier: Tier;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-display font-extrabold text-navy shadow-[inset_0_0_0_1px_rgba(26,26,46,0.08)]",
        TIER_BG[tier],
        SIZES[size],
        className,
      )}
      aria-label={`${tier} tier`}
    >
      {tier}
    </span>
  );
}
