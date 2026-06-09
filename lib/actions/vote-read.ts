"use server";

import {
  getProductVoteTally,
  getVoteSnapshot,
  type VoteSnapshot,
} from "@/lib/db/votes";

/** Server action wrapper for client-side vote tally refresh (realtime). */
export async function fetchVoteSnapshot(
  productIds: string[],
): Promise<VoteSnapshot> {
  return getVoteSnapshot(productIds);
}

/** Server action wrapper for a single product tally refresh. */
export async function fetchProductVoteTally(productId: string) {
  return getProductVoteTally(productId);
}
