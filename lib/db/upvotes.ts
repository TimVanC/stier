import { createClient } from "@/lib/supabase-server";

export interface UpvotedProduct {
  productId: string;
  votedAt: string;
  name: string;
  brand: string | null;
  categorySlug: string;
  categoryName: string;
  productSlug: string;
  netVotes: number;
}

export async function getUserUpvotes(): Promise<UpvotedProduct[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: votes } = await supabase
    .from("votes")
    .select("product_id, created_at")
    .eq("user_id", user.id)
    .eq("vote_type", "upvote")
    .order("created_at", { ascending: false });

  if (!votes?.length) return [];

  const productIds = votes.map((v) => v.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, brand, slug, categories!inner ( name, slug )")
    .in("id", productIds)
    .eq("status", "approved");

  const productMap = new Map(
    (products ?? []).map((p) => {
      const category = p.categories as
        | { name: string; slug: string }
        | { name: string; slug: string }[];
      const cat = Array.isArray(category) ? category[0] : category;
      return [
        p.id,
        {
          name: p.name,
          brand: p.brand,
          productSlug: p.slug,
          categorySlug: cat?.slug ?? "",
          categoryName: cat?.name ?? "",
        },
      ];
    }),
  );

  const { data: voteRows } = await supabase
    .from("votes")
    .select("product_id, vote_type")
    .in("product_id", productIds);

  const tallyMap = new Map<string, number>();
  for (const id of productIds) tallyMap.set(id, 0);
  for (const row of voteRows ?? []) {
    const current = tallyMap.get(row.product_id) ?? 0;
    tallyMap.set(
      row.product_id,
      current + (row.vote_type === "upvote" ? 1 : -1),
    );
  }

  return votes
    .map((vote) => {
      const product = productMap.get(vote.product_id);
      if (!product) return null;
      return {
        productId: vote.product_id,
        votedAt: vote.created_at,
        name: product.name,
        brand: product.brand,
        categorySlug: product.categorySlug,
        categoryName: product.categoryName,
        productSlug: product.productSlug,
        netVotes: tallyMap.get(vote.product_id) ?? 0,
      };
    })
    .filter((row): row is UpvotedProduct => row !== null);
}

export async function removeUserUpvote(productId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from("votes")
    .delete()
    .eq("user_id", user.id)
    .eq("product_id", productId);

  return !error;
}
