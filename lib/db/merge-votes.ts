import { dbProductId } from "@/lib/db/votes";
import { recomputeRankedProducts } from "@/lib/recompute-rankings";
import type { RankedProduct } from "@/types";
import type { VoteSnapshot } from "@/lib/db/votes";

/** Attach stable Supabase product ids and live vote tallies to seed-ranked rows. */
export function mergeVoteSnapshot(
  products: RankedProduct[],
  categorySlug: string,
  snapshot: VoteSnapshot,
): RankedProduct[] {
  const merged = products.map((product) => {
    const id = dbProductId(categorySlug, product.slug);
    const tally = snapshot.tallies[id];
    return {
      ...product,
      id,
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
