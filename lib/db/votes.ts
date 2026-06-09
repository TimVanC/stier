import { createClient } from "@/lib/supabase-server";
import { uuidFromSlug } from "@/lib/db/uuid";

export type UserVote = "upvote" | "downvote" | null;

export interface ProductVoteTally {
  upvotes: number;
  downvotes: number;
  netVotes: number;
}

export interface VoteSnapshot {
  tallies: Record<string, ProductVoteTally>;
  userVotes: Record<string, UserVote>;
  isAuthenticated: boolean;
}

function emptyTally(): ProductVoteTally {
  return { upvotes: 0, downvotes: 0, netVotes: 0 };
}

/** Resolve the stable DB uuid for a product slug within a category. */
export function dbProductId(categorySlug: string, productSlug: string): string {
  return uuidFromSlug("product", `${categorySlug}/${productSlug}`);
}

/** Aggregate vote tallies (+ current user's vote) for a set of product ids. */
export async function getVoteSnapshot(
  productIds: string[],
): Promise<VoteSnapshot> {
  const tallies: Record<string, ProductVoteTally> = {};
  const userVotes: Record<string, UserVote> = {};

  for (const id of productIds) {
    tallies[id] = emptyTally();
    userVotes[id] = null;
  }

  if (productIds.length === 0) {
    return { tallies, userVotes, isAuthenticated: false };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: votes } = await supabase
    .from("votes")
    .select("product_id, vote_type, user_id")
    .in("product_id", productIds);

  for (const vote of votes ?? []) {
    const tally = tallies[vote.product_id];
    if (!tally) continue;
    if (vote.vote_type === "upvote") tally.upvotes += 1;
    else tally.downvotes += 1;
    tally.netVotes = tally.upvotes - tally.downvotes;
    if (user && vote.user_id === user.id) {
      userVotes[vote.product_id] = vote.vote_type as UserVote;
    }
  }

  return { tallies, userVotes, isAuthenticated: !!user };
}

/** Tally for a single product (used by realtime refresh). */
export async function getProductVoteTally(
  productId: string,
): Promise<ProductVoteTally & { userVote: UserVote }> {
  const snapshot = await getVoteSnapshot([productId]);
  return {
    ...snapshot.tallies[productId],
    userVote: snapshot.userVotes[productId] ?? null,
  };
}
