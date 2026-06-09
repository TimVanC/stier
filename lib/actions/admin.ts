"use server";

import { createClient } from "@/lib/supabase-server";
import { isAdmin } from "@/lib/admin";
import { isUuid, sanitizeText } from "@/lib/sanitize";
import type { ActionResult } from "@/lib/actions/types";

async function requireAdminAction(): Promise<ActionResult | { ok: true }> {
  if (!(await isAdmin())) {
    return { ok: false, error: "Admin access required." };
  }
  return { ok: true };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function approveSubmission(productId: string): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(productId)) return { ok: false, error: "Invalid product." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: "approved", rejection_reason: null })
    .eq("id", productId);

  if (error) return { ok: false, error: "Could not approve submission." };
  return { ok: true };
}

export async function rejectSubmission(
  productId: string,
  reason?: string,
): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(productId)) return { ok: false, error: "Invalid product." };

  const rejectionReason = reason ? sanitizeText(reason, 500) : null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: "rejected", rejection_reason: rejectionReason })
    .eq("id", productId);

  if (error) return { ok: false, error: "Could not reject submission." };
  return { ok: true };
}

export async function createCategory(input: {
  name: string;
  slug?: string;
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;

  const name = sanitizeText(input.name, 120);
  if (name.length < 2) return { ok: false, error: "Category name is too short." };

  const slug = slugify(input.slug || name);
  if (slug.length < 2) return { ok: false, error: "Category slug is too short." };

  const description = input.description
    ? sanitizeText(input.description, 500)
    : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .insert({ name, slug, description })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That slug is already in use." };
    }
    return { ok: false, error: "Could not create category." };
  }

  return { ok: true, data: { id: data.id } };
}

export async function updateCategory(
  categoryId: string,
  input: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
  },
): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(categoryId)) return { ok: false, error: "Invalid category." };

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = sanitizeText(input.name, 120);
    if (name.length < 2) return { ok: false, error: "Category name is too short." };
    updates.name = name;
  }
  if (input.slug !== undefined) {
    const slug = slugify(input.slug);
    if (slug.length < 2) return { ok: false, error: "Category slug is too short." };
    updates.slug = slug;
  }
  if (input.description !== undefined) {
    updates.description = sanitizeText(input.description, 500) || null;
  }
  if (input.imageUrl !== undefined) {
    updates.image_url = sanitizeText(input.imageUrl, 500) || null;
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", categoryId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That slug is already in use." };
    }
    return { ok: false, error: "Could not update category." };
  }

  return { ok: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(categoryId)) return { ok: false, error: "Invalid category." };

  const supabase = await createClient();
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if ((count ?? 0) > 0) {
    return { ok: false, error: "Remove all products from this category first." };
  }

  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return { ok: false, error: "Could not delete category." };
  return { ok: true };
}

export async function setCategoryFeatured(
  categoryId: string,
  isFeatured: boolean,
): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(categoryId)) return { ok: false, error: "Invalid category." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_featured: isFeatured })
    .eq("id", categoryId);

  if (error) return { ok: false, error: "Could not update category." };
  return { ok: true };
}

export async function setCategoryActive(
  categoryId: string,
  isActive: boolean,
): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(categoryId)) return { ok: false, error: "Invalid category." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: isActive })
    .eq("id", categoryId);

  if (error) return { ok: false, error: "Could not update category." };
  return { ok: true };
}

export async function dismissReport(reportId: string): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(reportId)) return { ok: false, error: "Invalid report." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reports")
    .update({ status: "dismissed" })
    .eq("id", reportId);

  if (error) return { ok: false, error: "Could not dismiss report." };
  return { ok: true };
}

export async function removeReportedReview(reportId: string): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(reportId)) return { ok: false, error: "Invalid report." };

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("review_id")
    .eq("id", reportId)
    .single();

  if (!report) return { ok: false, error: "Report not found." };

  const { error: reviewError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", report.review_id);

  if (reviewError) return { ok: false, error: "Could not remove review." };

  await supabase
    .from("reports")
    .update({ status: "removed" })
    .eq("id", reportId);

  return { ok: true };
}

export async function setUserBanned(
  profileId: string,
  banned: boolean,
): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(profileId)) return { ok: false, error: "Invalid user." };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", profileId)
    .single();

  if (!profile) return { ok: false, error: "User not found." };
  if (profile.role === "admin" && banned) {
    return { ok: false, error: "Cannot ban an admin account." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ is_banned: banned })
    .eq("id", profileId);

  if (error) return { ok: false, error: "Could not update user." };
  return { ok: true };
}

export async function clearUserVotes(userId: string): Promise<ActionResult> {
  const gate = await requireAdminAction();
  if (!gate.ok) return gate;
  if (!isUuid(userId)) return { ok: false, error: "Invalid user." };

  const supabase = await createClient();
  const { error } = await supabase.from("votes").delete().eq("user_id", userId);

  if (error) return { ok: false, error: "Could not clear votes." };
  return { ok: true };
}
