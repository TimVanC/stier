import { createClient } from "@/lib/supabase-server";
import { getActiveCategories } from "@/lib/db/catalog";
import { isUuid } from "@/lib/sanitize";
import { uuidFromSlug } from "@/lib/db/uuid";

export interface SubmissionCategory {
  id: string;
  name: string;
  slug: string;
}

/** Active categories for the submit form dropdown. */
export async function getSubmissionCategories(): Promise<SubmissionCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("name");

  if (data && data.length > 0) {
    return data as SubmissionCategory[];
  }

  const categories = await getActiveCategories();
  return categories.map((c) => ({
    id: isUuid(c.id) ? c.id : uuidFromSlug("category", c.slug),
    name: c.name,
    slug: c.slug,
  }));
}
