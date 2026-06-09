import { cn } from "@/lib/utils";
import type { Tier } from "@/types";

/**
 * Tier badge styles. All tiers are rounded squares (per the reference design).
 * S+ is visually distinct: solid coral with a white label and a gold border to
 * mark an undisputed, dominant community pick.
 */
const TIER_STYLES: Record<Tier, string> = {
  "S+": "bg-coral text-white ring-2 ring-amber-300 shadow-sm",
  S: "bg-tier-s text-navy",
  A: "bg-tier-a text-navy",
  B: "bg-tier-b text-navy",
  C: "bg-tier-c text-navy",
  D: "bg-tier-d text-navy",
  F: "bg-tier-f text-navy",
};

const SIZES = {
  sm: "h-6 min-w-6 px-1 text-[11px]",
  md: "h-7 min-w-7 px-1 text-sm",
  lg: "h-9 min-w-9 px-1.5 text-base",
} as const;

export function TierBadge({
  tier,
  size = "md",
  className,
}: {
  tier: Tier;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const isPlus = tier === "S+";
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[7px] font-display font-extrabold leading-none tracking-tight",
        !isPlus && "shadow-[inset_0_0_0_1px_rgba(26,26,46,0.08)]",
        TIER_STYLES[tier],
        SIZES[size],
        className,
      )}
      aria-label={`${tier} tier`}
    >
      {tier}
    </span>
  );
}
