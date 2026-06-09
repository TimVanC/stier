import { createClient } from "@/lib/supabase-server";
import {
  mergeReviewCounts,
  getReviewCounts,
} from "@/lib/db/reviews";
import { mergeVoteSnapshot } from "@/lib/db/merge-votes";
import { getVoteSnapshot } from "@/lib/db/votes";
import { recomputeRankedProducts } from "@/lib/recompute-rankings";
import type {
  Category,
  CategoryWithStats,
  RankedProduct,
} from "@/types";

export interface SiteStats {
  productCount: number;
  categoryCount: number;
  voteCount: number;
  affiliateLinks: 0;
}

export interface HeroStackCategory {
  title: string;
  slug: string;
  href: string;
  totalVotes: number;
  products: RankedProduct[];
}

function daysAgo(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function sinceDays(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function mapCategoryRow(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    isFeatured: row.is_featured,
    isActive: row.is_active,
    createdDaysAgo: daysAgo(row.created_at),
  };
}

function mapProductRow(
  row: {
    id: string;
    slug: string;
    name: string;
    brand: string | null;
    description: string | null;
    product_url: string | null;
    affiliate_url: string | null;
    created_at: string;
  },
  categoryName: string,
  categorySlug: string,
  weeklyVotes = 0,
): RankedProduct {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand ?? "",
    categorySlug,
    categoryName,
    description: row.description ?? "",
    price: "See retailer",
    upvotes: 0,
    downvotes: 0,
    netVotes: 0,
    reviewCount: 0,
    rankChange: 0,
    weeklyVotes,
    createdDaysAgo: daysAgo(row.created_at),
    imageLabel: row.brand ?? row.name,
    affiliateUrl: row.affiliate_url ?? row.product_url ?? "#",
    rank: 0,
    score: 0,
    tier: "C",
  };
}

type ProductRowWithCategory = {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  description: string | null;
  product_url: string | null;
  affiliate_url: string | null;
  created_at: string;
  categories: { name: string; slug: string } | { name: string; slug: string }[];
};

function categoryFromJoin(
  categories: ProductRowWithCategory["categories"],
): { name: string; slug: string } {
  return Array.isArray(categories) ? categories[0]! : categories;
}

async function countVotesSince(since: Date): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("votes")
    .select("product_id")
    .gte("created_at", since.toISOString());

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    counts.set(row.product_id, (counts.get(row.product_id) ?? 0) + 1);
  }
  return counts;
}

async function categoryVoteCountsSince(
  since: Date,
): Promise<Map<string, number>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("votes")
    .select("product_id, products!inner ( category_id )")
    .gte("created_at", since.toISOString());

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const products = row.products as
      | { category_id: string }
      | { category_id: string }[];
    const categoryId = Array.isArray(products)
      ? products[0]?.category_id
      : products.category_id;
    if (!categoryId) continue;
    counts.set(categoryId, (counts.get(categoryId) ?? 0) + 1);
  }
  return counts;
}

function applyWeeklyVotes(
  products: RankedProduct[],
  weeklyByProduct: Map<string, number>,
): RankedProduct[] {
  return products.map((p) => ({
    ...p,
    weeklyVotes: weeklyByProduct.get(p.id) ?? p.weeklyVotes,
  }));
}

async function attachLiveRankings(
  baseProducts: RankedProduct[],
): Promise<RankedProduct[]> {
  if (baseProducts.length === 0) return [];

  const productIds = baseProducts.map((p) => p.id);
  const [snapshot, reviewCounts] = await Promise.all([
    getVoteSnapshot(productIds),
    getReviewCounts(productIds),
  ]);

  let products = mergeVoteSnapshot(baseProducts, snapshot);
  products = recomputeRankedProducts(
    mergeReviewCounts(products, reviewCounts),
  );
  return products;
}

function statsFromProducts(
  category: Category,
  products: RankedProduct[],
): CategoryWithStats {
  const voteCount = products.reduce(
    (sum, p) => sum + p.upvotes + p.downvotes,
    0,
  );
  return {
    ...category,
    productCount: products.length,
    voteCount,
    topProductName: products[0]?.name ?? null,
    topTier: products[0]?.tier ?? null,
  };
}

async function loadProductsByIds(
  productIds: string[],
  weeklyByProduct: Map<string, number> = new Map(),
): Promise<RankedProduct[]> {
  if (productIds.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name, brand, description, product_url, affiliate_url, created_at, categories!inner ( name, slug )",
    )
    .in("id", productIds)
    .eq("status", "approved");

  if (!data?.length) return [];

  const byId = new Map(
    data.map((row) => {
      const cat = categoryFromJoin(row as ProductRowWithCategory);
      return [
        row.id,
        mapProductRow(
          row,
          cat.name,
          cat.slug,
          weeklyByProduct.get(row.id) ?? 0,
        ),
      ] as const;
    }),
  );

  const ordered = productIds
    .map((id) => byId.get(id))
    .filter((p): p is RankedProduct => !!p);

  return attachLiveRankings(ordered);
}

async function topProductIdsByPeriodVotes(
  limit: number,
  days: number,
): Promise<string[]> {
  const counts = await countVotesSince(sinceDays(days));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

/** Site-wide stats for the homepage hero strip. */
export async function getSiteStatsFromDb(): Promise<SiteStats> {
  const supabase = await createClient();

  const [productsRes, categoriesRes, votesRes] = await Promise.all([
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("votes").select("id", { count: "exact", head: true }),
  ]);

  return {
    productCount: productsRes.count ?? 0,
    categoryCount: categoriesRes.count ?? 0,
    voteCount: votesRes.count ?? 0,
    affiliateLinks: 0,
  };
}

/** Top three category previews for the hero stack cards. */
export async function getHeroStackFromDb(): Promise<HeroStackCategory[]> {
  const categories = await getCategoriesWithStatsFromDb();
  const withProducts = categories
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 3);

  const weekly = await countVotesSince(sinceDays(7));

  const stacks = await Promise.all(
    withProducts.map(async (category) => {
      const products = await loadRankedProductsForCategory(category.slug);
      const enriched = applyWeeklyVotes(products, weekly);
      return {
        title: category.name,
        slug: category.slug,
        href: `/categories/${category.slug}`,
        totalVotes: category.voteCount,
        products: enriched,
      };
    }),
  );

  return stacks;
}

/** Products with the most votes cast in the last N days. */
export async function getRisingProductsFromDb(
  limit = 7,
  days = 7,
): Promise<RankedProduct[]> {
  const weekly = await countVotesSince(sinceDays(days));
  let productIds = [...weekly.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (productIds.length === 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(limit);
    productIds = (data ?? []).map((r) => r.id);
  }

  return loadProductsByIds(productIds, weekly);
}

/** Categories ranked by vote activity in a time window. */
export async function getTrendingCategoriesFromDb(
  limit: number,
  days: number,
): Promise<CategoryWithStats[]> {
  const categories = await getActiveCategories();
  if (!categories.length) return [];

  const periodCounts = await categoryVoteCountsSince(sinceDays(days));

  const ranked = await Promise.all(
    categories.map(async (category) => {
      const stats = await getCategoryBySlugFromDb(category.slug);
      const periodVotes = periodCounts.get(category.id) ?? 0;
      return {
        stats: stats ?? statsFromProducts(category, []),
        periodVotes,
      };
    }),
  );

  return ranked
    .sort((a, b) => b.periodVotes - a.periodVotes || b.stats.voteCount - a.stats.voteCount)
    .slice(0, limit)
    .map((r) => r.stats);
}

/** Popular categories by all-time vote totals. */
export async function getPopularCategoriesFromDb(
  limit: number,
): Promise<CategoryWithStats[]> {
  const categories = await getCategoriesWithStatsFromDb();
  return categories
    .slice()
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, limit);
}

/** Recently created active categories. */
export async function getNewCategoriesFromDb(
  limit: number,
): Promise<CategoryWithStats[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, is_featured, is_active, created_at",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  return Promise.all(
    data.map(async (row) => {
      const category = mapCategoryRow(row);
      const products = await loadRankedProductsForCategory(category.slug);
      return statsFromProducts(category, products);
    }),
  );
}

/** Recently approved products. */
export async function getNewProductsFromDb(
  limit: number,
): Promise<RankedProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name, brand, description, product_url, affiliate_url, created_at, categories!inner ( name, slug )",
    )
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  const base = data.map((row) => {
    const cat = categoryFromJoin(row as ProductRowWithCategory);
    return mapProductRow(row, cat.name, cat.slug);
  });

  return attachLiveRankings(base);
}

/** Trending products for week (rising) or month (most votes in period). */
export async function getTrendingProductsFromDb(
  limit: number,
  days: number,
): Promise<RankedProduct[]> {
  if (days <= 7) {
    return getRisingProductsFromDb(limit, days);
  }

  const productIds = await topProductIdsByPeriodVotes(limit, days);
  const weekly = await countVotesSince(sinceDays(days));
  return loadProductsByIds(productIds, weekly);
}

/** Active categories from Supabase. */
export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, is_featured, is_active, created_at",
    )
    .eq("is_active", true)
    .order("name");

  return data?.map(mapCategoryRow) ?? [];
}

/** All active categories with live stats. */
export async function getCategoriesWithStatsFromDb(): Promise<
  CategoryWithStats[]
> {
  const categories = await getActiveCategories();
  if (!categories.length) return [];

  const results = await Promise.all(
    categories.map(async (category) => {
      const products = await loadRankedProductsForCategory(category.slug);
      return statsFromProducts(category, products);
    }),
  );

  return results;
}

/** Featured categories with stats (homepage). */
export async function getFeaturedCategoriesFromDb(): Promise<
  CategoryWithStats[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, is_featured, is_active, created_at",
    )
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("name");

  if (!data?.length) return [];

  const featured = await Promise.all(
    data.map(async (row) => {
      const category = mapCategoryRow(row);
      const products = await loadRankedProductsForCategory(category.slug);
      return statsFromProducts(category, products);
    }),
  );

  return featured;
}

/** Single category metadata by slug. */
export async function getCategoryBySlugFromDb(
  slug: string,
): Promise<CategoryWithStats | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, is_featured, is_active, created_at",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!data) return null;

  const category = mapCategoryRow(data);
  const products = await loadRankedProductsForCategory(slug);
  return statsFromProducts(category, products);
}

/** Approved products for a category as ranked rows (votes + reviews merged). */
export async function loadRankedProductsForCategory(
  categorySlug: string,
): Promise<RankedProduct[]> {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!category) return [];

  const { data: products } = await supabase
    .from("products")
    .select(
      "id, slug, name, brand, description, product_url, affiliate_url, created_at",
    )
    .eq("category_id", category.id)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (!products?.length) return [];

  const baseProducts = products.map((p) =>
    mapProductRow(p, category.name, category.slug),
  );

  return attachLiveRankings(baseProducts);
}

/** Single approved product by category + product slug. */
export async function getProductBySlugFromDb(
  categorySlug: string,
  productSlug: string,
): Promise<RankedProduct | null> {
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!category) return null;

  const { data: row } = await supabase
    .from("products")
    .select(
      "id, slug, name, brand, description, product_url, affiliate_url, created_at",
    )
    .eq("category_id", category.id)
    .eq("slug", productSlug)
    .eq("status", "approved")
    .maybeSingle();

  if (!row) return null;

  const base = mapProductRow(row, category.name, category.slug);
  const [product] = await attachLiveRankings([base]);
  return product ?? null;
}

/** Related products in the same category (excludes current slug). */
export async function getRelatedProductsFromDb(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): Promise<RankedProduct[]> {
  const products = await loadRankedProductsForCategory(categorySlug);
  return products.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}
