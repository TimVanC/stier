import { createClient } from "@/lib/supabase-server";
import {
  getCategories,
  getCategoriesWithStats,
  getCategoryBySlug,
  getFeaturedCategories,
  getProductBySlug,
  getRankedProducts,
  getRelatedProducts,
} from "@/lib/seed-data";
import { dbProductId } from "@/lib/db/votes";
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

function daysAgo(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
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
    weeklyVotes: 0,
    createdDaysAgo: daysAgo(row.created_at),
    imageLabel: row.brand ?? row.name,
    affiliateUrl: row.affiliate_url ?? row.product_url ?? "#",
    rank: 0,
    score: 0,
    tier: "C",
  };
}

function seedProductsWithIds(categorySlug: string): RankedProduct[] {
  return getRankedProducts(categorySlug).map((p) => ({
    ...p,
    id: dbProductId(categorySlug, p.slug),
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

/** Active categories from Supabase, falling back to seed data. */
export async function getActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select(
      "id, name, slug, description, is_featured, is_active, created_at",
    )
    .eq("is_active", true)
    .order("name");

  if (data?.length) {
    return data.map(mapCategoryRow);
  }
  return getCategories();
}

/** All active categories with live stats. */
export async function getCategoriesWithStatsFromDb(): Promise<
  CategoryWithStats[]
> {
  const categories = await getActiveCategories();
  if (!categories.length) return getCategoriesWithStats();

  const supabase = await createClient();
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("id, slug")
    .eq("is_active", true);

  if (!dbCategories?.length) {
    return getCategoriesWithStats();
  }

  const results = await Promise.all(
    categories.map(async (category) => {
      const products = await loadRankedProductsForCategory(category.slug);
      if (products.length === 0) {
        const seed = getCategoryBySlug(category.slug);
        if (seed) return seed;
      }
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

  if (!data?.length) {
    return getFeaturedCategories();
  }

  const featured = await Promise.all(
    data.map(async (row) => {
      const category = mapCategoryRow(row);
      const products = await loadRankedProductsForCategory(category.slug);
      if (products.length === 0) {
        const seed = getFeaturedCategories().find(
          (c) => c.slug === category.slug,
        );
        if (seed) return seed;
      }
      return statsFromProducts(category, products);
    }),
  );

  return featured.length ? featured : getFeaturedCategories();
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

  if (!data) {
    return getCategoryBySlug(slug) ?? null;
  }

  const category = mapCategoryRow(data);
  const products = await loadRankedProductsForCategory(slug);
  if (products.length === 0) {
    return getCategoryBySlug(slug) ?? statsFromProducts(category, []);
  }
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

  let baseProducts: RankedProduct[] = [];

  if (category) {
    const { data: products } = await supabase
      .from("products")
      .select(
        "id, slug, name, brand, description, product_url, affiliate_url, created_at",
      )
      .eq("category_id", category.id)
      .eq("status", "approved")
      .order("created_at", { ascending: true });

    if (products?.length) {
      baseProducts = products.map((p) =>
        mapProductRow(p, category.name, category.slug),
      );
    }
  }

  if (baseProducts.length === 0) {
    baseProducts = seedProductsWithIds(categorySlug);
  }

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

  if (category) {
    const { data: row } = await supabase
      .from("products")
      .select(
        "id, slug, name, brand, description, product_url, affiliate_url, created_at",
      )
      .eq("category_id", category.id)
      .eq("slug", productSlug)
      .eq("status", "approved")
      .maybeSingle();

    if (row) {
      const base = mapProductRow(row, category.name, category.slug);
      const [product] = await attachLiveRankings([base]);
      return product ?? null;
    }
  }

  const seed = getProductBySlug(categorySlug, productSlug);
  if (!seed) return null;

  const base = { ...seed, id: dbProductId(categorySlug, productSlug) };
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
  const filtered = products.filter((p) => p.slug !== excludeSlug);
  if (filtered.length > 0) {
    return filtered.slice(0, limit);
  }
  const seed = getRelatedProducts(categorySlug, excludeSlug, limit).map((p) => ({
    ...p,
    id: dbProductId(categorySlug, p.slug),
  }));
  return attachLiveRankings(seed);
}

/** Category slugs for static generation. */
export async function getActiveCategorySlugs(): Promise<string[]> {
  const categories = await getActiveCategories();
  return categories.map((c) => c.slug);
}

/** Product slug pairs for static generation. */
export async function getApprovedProductParams(): Promise<
  { slug: string; "product-slug": string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug, categories!inner ( slug )")
    .eq("status", "approved");

  if (data?.length) {
    return data.map((row) => {
      const cat = row.categories as { slug: string } | { slug: string }[];
      const categorySlug = Array.isArray(cat) ? cat[0]?.slug : cat?.slug;
      return { slug: categorySlug ?? "", "product-slug": row.slug };
    });
  }

  return getCategories().flatMap((c) =>
    getRankedProducts(c.slug).map((p) => ({
      slug: c.slug,
      "product-slug": p.slug,
    })),
  );
}
