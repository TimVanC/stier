import { createClient } from "@/lib/supabase-server";

export interface UserSubmission {
  id: string;
  name: string;
  brand: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  categoryName: string;
  rejectionReason: string | null;
}

/** All products submitted by the signed-in user. */
export async function getUserSubmissions(): Promise<UserSubmission[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return [];

  const { data } = await supabase
    .from("products")
    .select(
      "id, name, brand, status, created_at, rejection_reason, categories ( name )",
    )
    .eq("submitted_by", profile.id)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => {
    const category = row.categories as { name: string } | { name: string }[] | null;
    const categoryName = Array.isArray(category)
      ? category[0]?.name
      : category?.name;

    return {
      id: row.id,
      name: row.name,
      brand: row.brand,
      status: row.status as UserSubmission["status"],
      createdAt: row.created_at,
      categoryName: categoryName ?? "Unknown",
      rejectionReason: row.rejection_reason,
    };
  });
}
