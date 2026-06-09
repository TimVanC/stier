import { createClient } from "@/lib/supabase-server";
import type { Review } from "@/types";

export interface ProductReviewStats {
  count: number;
  avgRating: number;
  breakdown: Record<number, number>;
}

export interface ProductReviewBundle {
  reviews: Review[];
  stats: ProductReviewStats;
  userReview: Review | null;
}

interface ReviewRow {
  id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  pros: string | null;
  cons: string | null;
  owns_product: boolean;
  helpful_count: number;
  created_at: string;
}

interface ProfileRow {
  user_id: string;
  username: string | null;
  display_name: string | null;
}

function daysAgo(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function mapReview(
  row: ReviewRow,
  profile: ProfileRow | undefined,
  currentUserId: string | null,
): Review {
  const username =
    profile?.username ?? profile?.display_name ?? "Community member";

  return {
    id: row.id,
    userId: row.user_id,
    username,
    rating: row.rating,
    title: row.title ?? "",
    body: row.body ?? "",
    pros: row.pros ?? "",
    cons: row.cons ?? "",
    ownsProduct: row.owns_product,
    helpfulCount: row.helpful_count,
    daysAgo: daysAgo(row.created_at),
    createdAt: row.created_at,
    isOwn: currentUserId !== null && row.user_id === currentUserId,
  };
}

function computeStats(rows: { rating: number }[]): ProductReviewStats {
  const breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of rows) {
    breakdown[row.rating] = (breakdown[row.rating] ?? 0) + 1;
  }
  const count = rows.length;
  if (count === 0) {
    return { count: 0, avgRating: 0, breakdown };
  }
  const weighted = rows.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = Math.round((weighted / count) * 10) / 10;
  return { count, avgRating, breakdown };
}

/** Load reviews + aggregate stats + the current user's review (if any). */
export async function getProductReviewBundle(
  productId: string,
): Promise<ProductReviewBundle> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("reviews")
    .select(
      "id, user_id, rating, title, body, pros, cons, owns_product, helpful_count, created_at",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  const typed = (rows ?? []) as ReviewRow[];
  const userIds = [...new Set(typed.map((r) => r.user_id))];

  let profileMap = new Map<string, ProfileRow>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, username, display_name")
      .in("user_id", userIds);
    profileMap = new Map(
      (profiles ?? []).map((p) => [p.user_id, p as ProfileRow]),
    );
  }

  const reviews = typed.map((row) =>
    mapReview(row, profileMap.get(row.user_id), user?.id ?? null),
  );
  const stats = computeStats(typed);
  const userReview = reviews.find((r) => r.isOwn) ?? null;

  return { reviews, stats, userReview };
}

/** Batch review counts for product cards and ranked lists. */
export async function getReviewCounts(
  productIds: string[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const id of productIds) counts[id] = 0;
  if (productIds.length === 0) return counts;

  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("product_id")
    .in("product_id", productIds);

  for (const row of data ?? []) {
    counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
  }
  return counts;
}

/** Attach live review counts to ranked product rows. */
export function mergeReviewCounts<T extends { id: string; reviewCount: number }>(
  products: T[],
  counts: Record<string, number>,
): T[] {
  return products.map((p) => ({
    ...p,
    reviewCount: counts[p.id] ?? 0,
  }));
}
