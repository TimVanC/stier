import { createClient } from "@/lib/supabase-server";

export interface SavedListSummary {
  id: string;
  name: string;
  description: string | null;
  visibility: "private" | "public";
  itemCount: number;
  createdAt: string;
}

export interface SavedListItemRow {
  id: string;
  productId: string;
  addedAt: string;
  productName: string;
  productBrand: string | null;
  categorySlug: string;
  productSlug: string;
}

export async function getUserSavedLists(): Promise<SavedListSummary[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: lists } = await supabase
    .from("saved_lists")
    .select("id, name, description, visibility, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!lists?.length) return [];

  const listIds = lists.map((l) => l.id);
  const { data: counts } = await supabase
    .from("saved_list_items")
    .select("list_id")
    .in("list_id", listIds);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.list_id, (countMap.get(row.list_id) ?? 0) + 1);
  }

  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    visibility: l.visibility as SavedListSummary["visibility"],
    itemCount: countMap.get(l.id) ?? 0,
    createdAt: l.created_at,
  }));
}

export async function getSavedListItems(
  listId: string,
): Promise<SavedListItemRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_list_items")
    .select(
      `
      id,
      product_id,
      added_at,
      products!inner (
        name,
        brand,
        slug,
        status,
        categories!inner ( slug )
      )
    `,
    )
    .eq("list_id", listId)
    .order("added_at", { ascending: false });

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
      productId: row.product_id,
      addedAt: row.added_at,
      productName: product.name,
      productBrand: product.brand,
      categorySlug: category?.slug ?? "",
      productSlug: product.slug,
    };
  });
}

export interface ProductPickerOption {
  id: string;
  name: string;
  brand: string | null;
  categoryName: string;
  categorySlug: string;
  slug: string;
}

export async function searchApprovedProducts(
  query: string,
): Promise<ProductPickerOption[]> {
  const supabase = await createClient();
  let builder = supabase
    .from("products")
    .select("id, name, brand, slug, categories!inner ( name, slug )")
    .eq("status", "approved")
    .order("name")
    .limit(25);

  const q = query.trim();
  if (q) {
    builder = builder.or(`name.ilike.%${q}%,brand.ilike.%${q}%`);
  }

  const { data } = await builder;
  return (data ?? []).map((row) => {
    const category = row.categories as
      | { name: string; slug: string }
      | { name: string; slug: string }[];
    const cat = Array.isArray(category) ? category[0] : category;
    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      categoryName: cat?.name ?? "",
      categorySlug: cat?.slug ?? "",
      slug: row.slug,
    };
  });
}

export async function getPublicProfileLists(
  profileUserId: string,
): Promise<SavedListSummary[]> {
  const supabase = await createClient();
  const { data: lists } = await supabase
    .from("saved_lists")
    .select("id, name, description, visibility, created_at")
    .eq("user_id", profileUserId)
    .eq("visibility", "public")
    .order("created_at", { ascending: false });

  if (!lists?.length) return [];

  const listIds = lists.map((l) => l.id);
  const { data: counts } = await supabase
    .from("saved_list_items")
    .select("list_id")
    .in("list_id", listIds);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    countMap.set(row.list_id, (countMap.get(row.list_id) ?? 0) + 1);
  }

  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    visibility: "public",
    itemCount: countMap.get(l.id) ?? 0,
    createdAt: l.created_at,
  }));
}
