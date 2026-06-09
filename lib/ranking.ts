import type { Tier } from "@/types";

/**
 * MVP ranking score (from .cursorrules).
 * Combines vote confidence, review volume, and a recency boost.
 */
export function calculateScore(
  upvotes: number,
  downvotes: number,
  reviewCount: number,
  daysSinceAdded: number,
): number {
  const netVotes = upvotes - downvotes;
  const totalVotes = upvotes + downvotes;
  const voteConfidence = totalVotes > 0 ? netVotes / totalVotes : 0;
  const recencyBoost = Math.max(0, 1 - daysSinceAdded / 365);
  return voteConfidence * 100 + reviewCount * 2 + recencyBoost * 10;
}

export interface TierContext {
  /** This product's ranking score. */
  score: number;
  /** Lowest and highest score in the category (for relative percentile). */
  minScore: number;
  maxScore: number;
  /** Net votes (up - down); negative net forces F. */
  netVotes: number;
  /** This product's total votes (up + down). */
  productVotes: number;
  /** Sum of all votes (up + down) across the category. */
  categoryVotes: number;
}

/**
 * Relative, per-category tier assignment.
 *
 * - F  : net-negative votes (community rejects it), regardless of score
 * - S+ : holds S tier AND commands >= 30% of all votes in the category
 *        (an undisputed, dominant community pick — rare)
 * - S  : top 10% of the category's score range
 * - A  : top 11-25%
 * - B  : top 26-50%
 * - C  : top 51-75%
 * - D  : bottom 25%
 *
 * Percentile is computed against the category's score range so the strongest
 * product always lands in S and weaker ones fall relative to it.
 */
export function assignTier(ctx: TierContext): Tier {
  if (ctx.netVotes < 0) return "F";

  const range = ctx.maxScore - ctx.minScore;
  const normalized = range > 0 ? (ctx.score - ctx.minScore) / range : 1;

  let base: Tier;
  if (normalized >= 0.9) base = "S";
  else if (normalized >= 0.75) base = "A";
  else if (normalized >= 0.5) base = "B";
  else if (normalized >= 0.25) base = "C";
  else base = "D";

  if (
    base === "S" &&
    ctx.categoryVotes > 0 &&
    ctx.productVotes / ctx.categoryVotes >= 0.3
  ) {
    return "S+";
  }

  return base;
}

export const TIER_LABELS: Record<Tier, string> = {
  "S+": "Undisputed community pick",
  S: "Best in class",
  A: "Excellent",
  B: "Solid pick",
  C: "Niche / Acceptable",
  D: "Below average",
  F: "Skip it",
};
