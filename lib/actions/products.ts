"use server";

import { createClient } from "@/lib/supabase-server";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isUuid, sanitizeText } from "@/lib/sanitize";
import type { ActionResult } from "@/lib/actions/types";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const IMAGE_BUCKET = "product-images";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface ProductInput {
  categoryId: string;
  name: string;
  brand?: string;
  description?: string;
  productUrl?: string;
  /** Optional storage path returned by uploadProductImage(). */
  imagePath?: string;
  /** Set when the user confirms submitting despite a duplicate warning. */
  allowDuplicate?: boolean;
}

function normalizeProductIdentity(name: string, brand: string) {
  return {
    name: name.trim().toLowerCase(),
    brand: brand.trim().toLowerCase(),
  };
}

async function findDuplicateProduct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  categoryId: string,
  name: string,
  brand: string,
) {
  const target = normalizeProductIdentity(name, brand);
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, brand, status")
    .eq("category_id", categoryId);

  if (error) return { error: "Could not check for duplicates." as const };

  const match = (products ?? []).find((p) => {
    const existing = normalizeProductIdentity(p.name, p.brand ?? "");
    return existing.name === target.name && existing.brand === target.brand;
  });

  return { match };
}

/** Check if a product with the same name + brand already exists in a category. */
export async function checkProductDuplicate(
  categoryId: string,
  name: string,
  brand?: string,
): Promise<
  ActionResult<{ isDuplicate: boolean; existingStatus?: string }>
> {
  if (!isUuid(categoryId)) {
    return { ok: false, error: "Pick a valid category." };
  }

  const cleanName = sanitizeText(name, 120);
  const cleanBrand = sanitizeText(brand, 80);
  if (cleanName.length < 2) {
    return { ok: false, error: "Product name is too short." };
  }
  if (cleanBrand.length < 1) {
    return { ok: false, error: "Brand is required." };
  }

  const supabase = await createClient();
  const { match, error } = await findDuplicateProduct(
    supabase,
    categoryId,
    cleanName,
    cleanBrand,
  );
  if (error) return { ok: false, error };

  return {
    ok: true,
    data: {
      isDuplicate: Boolean(match),
      existingStatus: match?.status,
    },
  };
}

/**
 * Submit a product for moderation (lands as 'pending').
 *
 * Security:
 *  - Requires a verified session; submitted_by is resolved from the user's own
 *    profile server-side (never trusted from the client).
 *  - Rate limited to 10 submissions/day/user.
 *  - Name/brand/description are HTML-stripped + length-capped.
 *  - product_url scheme is restricted to http(s).
 *  - RLS additionally forces status='pending' and submitted_by = own profile.
 */
export async function submitProduct(
  input: ProductInput,
): Promise<ActionResult<{ id: string }>> {
  if (!isUuid(input.categoryId)) {
    return { ok: false, error: "Pick a valid category." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to submit." };

  const limit = await enforceRateLimit("product_submission");
  if (!limit.ok) return { ok: false, error: limit.message };

  const name = sanitizeText(input.name, 120);
  if (name.length < 2) return { ok: false, error: "Product name is too short." };
  const brand = sanitizeText(input.brand, 80);
  if (brand.length < 1) return { ok: false, error: "Brand is required." };
  const description = sanitizeText(input.description, 2000);

  let productUrl: string | null = null;
  if (input.productUrl && input.productUrl.trim()) {
    try {
      const u = new URL(input.productUrl.trim());
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        return { ok: false, error: "Product URL must start with http(s)." };
      }
      productUrl = u.toString();
    } catch {
      return { ok: false, error: "Product URL is not a valid URL." };
    }
  }

  // Resolve the caller's own profile id (the RLS-checked submitter).
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (profileError || !profile) {
    return { ok: false, error: "Could not resolve your profile." };
  }

  const duplicate = await findDuplicateProduct(
    supabase,
    input.categoryId,
    name,
    brand,
  );
  if (duplicate.error) {
    return { ok: false, error: duplicate.error };
  }
  if (duplicate.match && !input.allowDuplicate) {
    return {
      ok: false,
      error: "A product with this name and brand already exists in that category.",
    };
  }

  let slug = slugify(name) || `product-${Date.now()}`;
  if (duplicate.match && input.allowDuplicate) {
    slug = `${slug}-${crypto.randomUUID().slice(0, 8)}`;
  }

  // Image path (if any) must live in the caller's own folder.
  let imageUrl: string | null = null;
  if (input.imagePath) {
    if (!input.imagePath.startsWith(`${user.id}/`)) {
      return { ok: false, error: "Invalid image reference." };
    }
    imageUrl = input.imagePath;
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      category_id: input.categoryId,
      name,
      slug,
      brand: brand || null,
      description: description || null,
      product_url: productUrl,
      image_url: imageUrl,
      status: "pending", // RLS enforces this too
      submitted_by: profile.id, // resolved server-side
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That product already exists in this category." };
    }
    return { ok: false, error: "Could not submit the product." };
  }

  return { ok: true, data: { id: data.id } };
}

/**
 * Upload a product image to the PRIVATE bucket after server-side validation of
 * file type and size. Files are stored under "<user.id>/<uuid>.<ext>" so RLS
 * confines each user to their own folder. Returns the storage path.
 */
export async function uploadProductImage(
  formData: FormData,
): Promise<ActionResult<{ path: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in to upload." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };

  // Server-side validation — never trust the client-reported type alone, but we
  // also reject anything outside the allowlist and over the size cap.
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 5 MB or smaller." };
  }
  if (file.size === 0) {
    return { ok: false, error: "Image file is empty." };
  }

  const ext = EXT_BY_TYPE[file.type] ?? "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { ok: false, error: "Upload failed. Please try again." };
  return { ok: true, data: { path } };
}

/**
 * Mint a short-lived signed URL for a private product image. Callers may only
 * read images in their own folder (admins can read any, enforced by RLS).
 */
export async function getSignedProductImageUrl(
  path: string,
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data, error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(path, 60);

  if (error || !data) return { ok: false, error: "Could not load image." };
  return { ok: true, data: { url: data.signedUrl } };
}
