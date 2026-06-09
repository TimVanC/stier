"use server";

import { createClient } from "@/lib/supabase-server";
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
  if (!isUuid(input.productId)) return { ok: false, error: "Invalid product." };

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Rating must be a whole number from 1 to 5." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to review." };

  const limit = await enforceRateLimit("review");
  if (!limit.ok) return { ok: false, error: limit.message };

  const title = sanitizeText(input.title, 120);
  const body = sanitizeText(input.body, 5000);
  const pros = sanitizeText(input.pros, 1000);
  const cons = sanitizeText(input.cons, 1000);

  const { error } = await supabase.from("reviews").insert({
    user_id: user.id, // verified session only
    product_id: input.productId,
    rating,
    title: title || null,
    body: body || null,
    pros: pros || null,
    cons: cons || null,
    owns_product: Boolean(input.ownsProduct),
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "You've already reviewed this product." };
    }
    return { ok: false, error: "Could not submit your review." };
  }

  return { ok: true };
}
