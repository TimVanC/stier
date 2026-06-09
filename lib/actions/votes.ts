"use server";

import { createClient } from "@/lib/supabase-server";
import { BANNED_USER_MESSAGE, isUserBanned } from "@/lib/ban";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isUuid } from "@/lib/sanitize";
import type { ActionResult } from "@/lib/actions/types";

type VoteType = "upvote" | "downvote";

/**
 * Cast (or change) the current user's vote on a product.
 *
 * Security:
 *  - The user is read from the verified server session (getUser); the client
 *    NEVER supplies the user id.
 *  - Rate limited to 50 votes/hour/user.
 *  - The DB unique(user_id, product_id) constraint + upsert guarantee one vote
 *    per user per product (no vote stuffing).
 */
export async function castVote(
  productId: string,
  voteType: VoteType,
): Promise<ActionResult> {
  if (!isUuid(productId)) return { ok: false, error: "Invalid product." };
  if (voteType !== "upvote" && voteType !== "downvote") {
    return { ok: false, error: "Invalid vote type." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to vote." };
  if (await isUserBanned(user.id)) {
    return { ok: false, error: BANNED_USER_MESSAGE };
  }

  const limit = await enforceRateLimit("vote");
  if (!limit.ok) return { ok: false, error: limit.message };

  const { error } = await supabase.from("votes").upsert(
    // user_id comes ONLY from the verified session.
    { user_id: user.id, product_id: productId, vote_type: voteType },
    { onConflict: "user_id,product_id" },
  );

  if (error) return { ok: false, error: "Could not record your vote." };
  return { ok: true };
}

/** Remove the current user's vote on a product. */
export async function removeVote(productId: string): Promise<ActionResult> {
  if (!isUuid(productId)) return { ok: false, error: "Invalid product." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("product_id", productId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not remove your vote." };
  return { ok: true };
}
