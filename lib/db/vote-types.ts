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

export function emptyVoteTally(): ProductVoteTally {
  return { upvotes: 0, downvotes: 0, netVotes: 0 };
}
