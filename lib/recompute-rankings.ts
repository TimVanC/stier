import { assignTier, calculateScore } from "@/lib/ranking";
import type { RankedProduct } from "@/types";

/**
 * Re-sort a category's products and assign relative tiers from live vote tallies.
 * Review counts and recency come from the seed row; votes come from Supabase.
 */
export function recomputeRankedProducts(
  products: RankedProduct[],
): RankedProduct[] {
  if (products.length === 0) return [];

  const scored = products.map((p) => {
    const score = calculateScore(
      p.upvotes,
      p.downvotes,
      p.reviewCount,
      p.createdDaysAgo,
    );
    const netVotes = p.upvotes - p.downvotes;
    return { ...p, score, netVotes };
  });

  scored.sort((a, b) => b.score - a.score);

  const scores = scored.map((p) => p.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const categoryVotes = scored.reduce(
    (sum, p) => sum + p.upvotes + p.downvotes,
    0,
  );

  return scored.map((p, i) => ({
    ...p,
    rank: i + 1,
    tier: assignTier({
      score: p.score,
      minScore,
      maxScore,
      netVotes: p.netVotes,
      productVotes: p.upvotes + p.downvotes,
      categoryVotes,
    }),
  }));
}
