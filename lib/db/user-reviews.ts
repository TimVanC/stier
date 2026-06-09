import { createClient } from "@/lib/supabase-server";
import type { Review } from "@/types";

export interface UserReviewRow extends Review {
  productId: string;
  productName: string;
  productBrand: string | null;
  categorySlug: string;
  productSlug: string;
}

function daysAgo(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export async function getUserReviews(): Promise<UserReviewRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("user_id", user.id)
    .single();

  const username =
    profile?.username ?? profile?.display_name ?? "Community member";

  const { data } = await supabase
    .from("reviews")
    .select(
      `
      id,
      user_id,
      product_id,
      rating,
      title,
      body,
      pros,
      cons,
      owns_product,
      helpful_count,
      created_at,
      products!inner (
        name,
        brand,
        slug,
        categories!inner ( slug )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const raw = row.products as unknown;
    const product = (Array.isArray(raw) ? raw[0] : raw) as {
      name: string;
      brand: string | null;
      slug: string;
      categories: { slug: string } | { slug: string }[];
    };
    const category = Array.isArray(product.categories)
      ? product.categories[0]
      : product.categories;

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
      isOwn: true,
      productId: row.product_id,
      productName: product.name,
      productBrand: product.brand,
      categorySlug: category?.slug ?? "",
      productSlug: product.slug,
    };
  });
}

export async function getPublicProfileReviews(
  userId: string,
  username: string,
): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      "id, user_id, rating, title, body, pros, cons, owns_product, helpful_count, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => ({
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
  }));
}

export async function getPublicApprovedSubmissions(profileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, brand, created_at, categories ( name )")
    .eq("submitted_by", profileId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []).map((row) => {
    const category = row.categories as { name: string } | { name: string }[] | null;
    const categoryName = Array.isArray(category)
      ? category[0]?.name
      : category?.name;
    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      categoryName: categoryName ?? "Unknown",
      createdAt: row.created_at,
    };
  });
}
