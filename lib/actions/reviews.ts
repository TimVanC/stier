"use server";

import { createClient } from "@/lib/supabase-server";
import { BANNED_USER_MESSAGE, isUserBanned } from "@/lib/ban";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isUuid, sanitizeText } from "@/lib/sanitize";
import type { ActionResult } from "@/lib/actions/types";

export interface ReviewInput {
  productId: string;
  rating: number;
  title?: string;
  body?: string;
  pros?: string;
  cons?: string;
  ownsProduct?: boolean;
}

function validateReviewFields(input: ReviewInput) {
  if (!isUuid(input.productId)) return { ok: false as const, error: "Invalid product." };

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false as const, error: "Rating must be a whole number from 1 to 5." };
  }

  return {
    ok: true as const,
    rating,
    title: sanitizeText(input.title, 120),
    body: sanitizeText(input.body, 5000),
    pros: sanitizeText(input.pros, 1000),
    cons: sanitizeText(input.cons, 1000),
    ownsProduct: Boolean(input.ownsProduct),
  };
}

/**
 * Submit a review.
 *
 * Security:
 *  - user_id from the verified session only.
 *  - Rate limited to 5 reviews/day/user.
 *  - All free-text fields are HTML-stripped + length-capped before storage.
 *  - DB unique(user_id, product_id) prevents duplicate reviews.
 */
export async function submitReview(
  input: ReviewInput,
): Promise<ActionResult> {
  const validated = validateReviewFields(input);
  if (!validated.ok) return validated;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to review." };
  if (await isUserBanned(user.id)) {
    return { ok: false, error: BANNED_USER_MESSAGE };
  }

  const limit = await enforceRateLimit("review");
  if (!limit.ok) return { ok: false, error: limit.message };

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    product_id: input.productId,
    rating: validated.rating,
    title: validated.title || null,
    body: validated.body || null,
    pros: validated.pros || null,
    cons: validated.cons || null,
    owns_product: validated.ownsProduct,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You've already reviewed this product." };
    }
    return { ok: false, error: "Could not submit your review." };
  }

  return { ok: true };
}

/** Update the current user's review. */
export async function updateReview(
  reviewId: string,
  input: Omit<ReviewInput, "productId">,
): Promise<ActionResult> {
  if (!isUuid(reviewId)) return { ok: false, error: "Invalid review." };

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be a whole number from 1 to 5." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };
  if (await isUserBanned(user.id)) {
    return { ok: false, error: BANNED_USER_MESSAGE };
  }

  const { error } = await supabase
    .from("reviews")
    .update({
      rating,
      title: sanitizeText(input.title, 120) || null,
      body: sanitizeText(input.body, 5000) || null,
      pros: sanitizeText(input.pros, 1000) || null,
      cons: sanitizeText(input.cons, 1000) || null,
      owns_product: Boolean(input.ownsProduct),
    })
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not update your review." };
  return { ok: true };
}

/** Delete the current user's review. */
export async function deleteReview(reviewId: string): Promise<ActionResult> {
  if (!isUuid(reviewId)) return { ok: false, error: "Invalid review." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not delete your review." };
  return { ok: true };
}

/** Increment helpful count via SECURITY DEFINER RPC. */
export async function markReviewHelpful(
  reviewId: string,
): Promise<ActionResult<{ helpfulCount: number }>> {
  if (!isUuid(reviewId)) return { ok: false, error: "Invalid review." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data, error } = await supabase.rpc("increment_review_helpful", {
    p_review_id: reviewId,
  });

  if (error) return { ok: false, error: "Could not mark review as helpful." };
  return { ok: true, data: { helpfulCount: data as number } };
}

/** File a moderation report against a review. */
export async function reportReview(
  reviewId: string,
  reason?: string,
): Promise<ActionResult> {
  if (!isUuid(reviewId)) return { ok: false, error: "Invalid review." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to report." };

  const { error } = await supabase.from("reports").insert({
    review_id: reviewId,
    reporter_id: user.id,
    reason: sanitizeText(reason, 500) || null,
    status: "open",
  });

  if (error) return { ok: false, error: "Could not submit report." };
  return { ok: true };
}
