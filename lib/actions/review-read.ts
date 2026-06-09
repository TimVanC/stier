"use server";

import {
  getProductReviewBundle,
  type ProductReviewBundle,
} from "@/lib/db/reviews";

/** Server action wrapper for client-side review list refresh. */
export async function fetchProductReviews(
  productId: string,
): Promise<ProductReviewBundle> {
  return getProductReviewBundle(productId);
}
