import { createClient } from "@/lib/supabase-server";

export interface AdminDashboardStats {
  pendingSubmissions: number;
  flaggedReviews: number;
  totalProducts: number;
  totalCategories: number;
  totalUsers: number;
}

export interface AdminSubmissionRow {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  imageSignedUrl: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  submitterUsername: string | null;
  submitterDisplayName: string | null;
}

export interface AdminCategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export interface FlaggedReviewRow {
  reportId: string;
  reportReason: string | null;
  reportStatus: "open" | "dismissed" | "removed";
  reportedAt: string;
  reviewId: string;
  rating: number;
  title: string;
  body: string;
  reviewAuthorUsername: string;
  productId: string;
  productName: string;
  productBrand: string | null;
  categorySlug: string;
  productSlug: string;
}

export interface AdminUserRow {
  profileId: string;
  userId: string;
  username: string;
  displayName: string;
  isBanned: boolean;
  role: "user" | "admin";
  createdAt: string;
  submissionCount: number;
  reviewCount: number;
  voteCount: number;
}

async function signProductImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  path: string | null,
): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage
    .from("product-images")
    .createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const supabase = await createClient();

  const [pending, flagged, products, categories, users] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    pendingSubmissions: pending.count ?? 0,
    flaggedReviews: flagged.count ?? 0,
    totalProducts: products.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalUsers: users.count ?? 0,
  };
}

export async function getAdminSubmissions(
  status?: "pending" | "approved" | "rejected" | "all",
): Promise<AdminSubmissionRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `
      id,
      name,
      brand,
      description,
      product_url,
      image_url,
      status,
      rejection_reason,
      created_at,
      category_id,
      categories!inner ( name, slug ),
      profiles ( username, display_name )
    `,
    )
    .order("created_at", { ascending: true });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data } = await query;

  const rows = await Promise.all(
    (data ?? []).map(async (row) => {
      const category = row.categories as
        | { name: string; slug: string }
        | { name: string; slug: string }[];
      const cat = Array.isArray(category) ? category[0] : category;
      const profile = row.profiles as
        | { username: string | null; display_name: string | null }
        | { username: string | null; display_name: string | null }[]
        | null;
      const submitter = Array.isArray(profile) ? profile[0] : profile;
      const imageUrl = row.image_url as string | null;

      return {
        id: row.id,
        name: row.name,
        brand: row.brand,
        description: row.description,
        productUrl: row.product_url,
        imageUrl,
        imageSignedUrl: await signProductImage(supabase, imageUrl),
        status: row.status as AdminSubmissionRow["status"],
        rejectionReason: row.rejection_reason,
        createdAt: row.created_at,
        categoryId: row.category_id,
        categoryName: cat?.name ?? "Unknown",
        categorySlug: cat?.slug ?? "",
        submitterUsername: submitter?.username ?? null,
        submitterDisplayName: submitter?.display_name ?? null,
      };
    }),
  );

  return rows;
}

export async function getAdminCategories(): Promise<AdminCategoryRow[]> {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url, is_featured, is_active, created_at")
    .order("name");

  if (!categories?.length) return [];

  const categoryIds = categories.map((c) => c.id);
  const { data: products } = await supabase
    .from("products")
    .select("category_id")
    .in("category_id", categoryIds);

  const countMap = new Map<string, number>();
  for (const row of products ?? []) {
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1);
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.image_url,
    isFeatured: c.is_featured,
    isActive: c.is_active,
    productCount: countMap.get(c.id) ?? 0,
    createdAt: c.created_at,
  }));
}

export async function getFlaggedReviews(
  status: "open" | "dismissed" | "removed" | "all" = "open",
): Promise<FlaggedReviewRow[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select(
      `
      id,
      reason,
      status,
      created_at,
      reviews!inner (
        id,
        rating,
        title,
        body,
        user_id,
        product_id,
        products!inner (
          name,
          brand,
          slug,
          categories!inner ( slug )
        )
      )
    `,
    )
    .order("created_at", { ascending: true });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data } = await query;
  if (!data?.length) return [];

  const userIds = [
    ...new Set(
      data.map((row) => {
        const reviewRaw = row.reviews as unknown;
        const review = (Array.isArray(reviewRaw) ? reviewRaw[0] : reviewRaw) as {
          user_id: string;
        };
        return review.user_id;
      }),
    ),
  ];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, username, display_name")
    .in("user_id", userIds);

  const usernameMap = new Map<string, string>();
  for (const p of profiles ?? []) {
    usernameMap.set(
      p.user_id,
      p.username ?? p.display_name ?? "Community member",
    );
  }

  return data.map((row) => {
    const reviewRaw = row.reviews as unknown;
    const review = (Array.isArray(reviewRaw) ? reviewRaw[0] : reviewRaw) as {
      id: string;
      rating: number;
      title: string | null;
      body: string | null;
      user_id: string;
      product_id: string;
      products: unknown;
    };
    const productRaw = review.products as unknown;
    const product = (Array.isArray(productRaw) ? productRaw[0] : productRaw) as {
      name: string;
      brand: string | null;
      slug: string;
      categories: { slug: string } | { slug: string }[];
    };
    const category = Array.isArray(product.categories)
      ? product.categories[0]
      : product.categories;

    return {
      reportId: row.id,
      reportReason: row.reason,
      reportStatus: row.status as FlaggedReviewRow["reportStatus"],
      reportedAt: row.created_at,
      reviewId: review.id,
      rating: review.rating,
      title: review.title ?? "",
      body: review.body ?? "",
      reviewAuthorUsername: usernameMap.get(review.user_id) ?? "Community member",
      productId: review.product_id,
      productName: product.name,
      productBrand: product.brand,
      categorySlug: category?.slug ?? "",
      productSlug: product.slug,
    };
  });
}

export async function searchAdminUsers(query: string): Promise<AdminUserRow[]> {
  const supabase = await createClient();

  let builder = supabase
    .from("profiles")
    .select("id, user_id, username, display_name, is_banned, role, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  const q = query.trim();
  if (q) {
    builder = builder.or(`username.ilike.%${q}%,display_name.ilike.%${q}%`);
  }

  const { data: profiles } = await builder;
  if (!profiles?.length) return [];

  const profileIds = profiles.map((p) => p.id);
  const userIds = profiles.map((p) => p.user_id);

  const [submissions, reviews, votes] = await Promise.all([
    supabase.from("products").select("submitted_by").in("submitted_by", profileIds),
    supabase.from("reviews").select("user_id").in("user_id", userIds),
    supabase.from("votes").select("user_id").in("user_id", userIds),
  ]);

  const submissionMap = new Map<string, number>();
  for (const row of submissions.data ?? []) {
    if (row.submitted_by) {
      submissionMap.set(
        row.submitted_by,
        (submissionMap.get(row.submitted_by) ?? 0) + 1,
      );
    }
  }

  const reviewMap = new Map<string, number>();
  for (const row of reviews.data ?? []) {
    reviewMap.set(row.user_id, (reviewMap.get(row.user_id) ?? 0) + 1);
  }

  const voteMap = new Map<string, number>();
  for (const row of votes.data ?? []) {
    voteMap.set(row.user_id, (voteMap.get(row.user_id) ?? 0) + 1);
  }

  return profiles.map((p) => ({
    profileId: p.id,
    userId: p.user_id,
    username: p.username ?? "member",
    displayName: p.display_name ?? p.username ?? "Community member",
    isBanned: p.is_banned,
    role: p.role as AdminUserRow["role"],
    createdAt: p.created_at,
    submissionCount: submissionMap.get(p.id) ?? 0,
    reviewCount: reviewMap.get(p.user_id) ?? 0,
    voteCount: voteMap.get(p.user_id) ?? 0,
  }));
}
