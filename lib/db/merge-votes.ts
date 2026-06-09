import { recomputeRankedProducts } from "@/lib/recompute-rankings";
import type { RankedProduct } from "@/types";
import type { VoteSnapshot } from "@/lib/db/vote-types";

/** Attach live vote tallies to ranked rows (products must already have stable ids). */
export function mergeVoteSnapshot(
  products: RankedProduct[],
  snapshot: VoteSnapshot,
): RankedProduct[] {
  const merged = products.map((product) => {
    const tally = snapshot.tallies[product.id];
    return {
      ...product,
      upvotes: tally?.upvotes ?? 0,
      downvotes: tally?.downvotes ?? 0,
      netVotes: tally?.netVotes ?? 0,
    };
  });
  return recomputeRankedProducts(merged);
}

export function userVotesForProducts(
  products: RankedProduct[],
  snapshot: VoteSnapshot,
): Record<string, "upvote" | "downvote" | null> {
  const map: Record<string, "upvote" | "downvote" | null> = {};
  for (const product of products) {
    map[product.id] = snapshot.userVotes[product.id] ?? null;
  }
  return map;
}
