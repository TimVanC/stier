"use server";

import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { validateUsername, sanitizeText, isUuid } from "@/lib/sanitize";
import type { ActionResult } from "@/lib/actions/types";

const AVATAR_BUCKET = "avatars";
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function updateProfileSettings(input: {
  displayName?: string;
  username?: string;
  isPrivate?: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const updates: Record<string, unknown> = {};

  if (input.displayName !== undefined) {
    const displayName = sanitizeText(input.displayName, 80);
    if (displayName.length < 1) {
      return { ok: false, error: "Display name is required." };
    }
    updates.display_name = displayName;
  }

  if (input.username !== undefined) {
    const check = validateUsername(input.username);
    if (!check.ok) return { ok: false, error: check.error };

    const { data: taken } = await supabase
      .from("profiles")
      .select("id, user_id")
      .ilike("username", check.value)
      .maybeSingle();

    if (taken && taken.user_id !== user.id) {
      return { ok: false, error: "That username is already taken." };
    }
    updates.username = check.value;
  }

  if (input.isPrivate !== undefined) {
    updates.is_private = Boolean(input.isPrivate);
  }

  if (Object.keys(updates).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "That username is already taken." };
    }
    return { ok: false, error: "Could not update profile." };
  }

  return { ok: true };
}

export async function uploadAvatar(
  formData: FormData,
): Promise<ActionResult<{ avatarUrl: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided." };
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { ok: false, error: "Only JPEG, PNG, WebP, or GIF images are allowed." };
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, error: "Avatar must be 2 MB or smaller." };
  }

  const ext = EXT_BY_TYPE[file.type] ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) return { ok: false, error: "Upload failed. Please try again." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: path })
    .eq("user_id", user.id);

  if (profileError) return { ok: false, error: "Could not save avatar." };

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const avatarUrl = base
    ? `${base}/storage/v1/object/public/avatars/${path}`
    : path;

  return { ok: true, data: { avatarUrl } };
}

export async function changePassword(input: {
  newPassword: string;
}): Promise<ActionResult> {
  const password = input.newPassword;
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteAccount(
  confirmation: string,
): Promise<ActionResult> {
  if (confirmation !== "DELETE") {
    return { ok: false, error: 'Type DELETE to confirm account removal.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) return { ok: false, error: "Could not delete account." };
  } catch {
    return { ok: false, error: "Account deletion is not configured." };
  }

  await supabase.auth.signOut();
  return { ok: true };
}
