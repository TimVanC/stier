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

/**
 * Tier assignment relative to the category's top score (from .cursorrules).
 */
export function assignTier(score: number, categoryTopScore: number): Tier {
  const ratio = categoryTopScore > 0 ? score / categoryTopScore : 0;
  if (ratio >= 0.85) return "S";
  if (ratio >= 0.7) return "A";
  if (ratio >= 0.5) return "B";
  if (ratio >= 0.3) return "C";
  if (ratio >= 0.15) return "D";
  return "F";
}

export const TIER_LABELS: Record<Tier, string> = {
  S: "Best in class",
  A: "Excellent",
  B: "Solid pick",
  C: "Niche / Acceptable",
  D: "Below average",
  F: "Skip it",
};
