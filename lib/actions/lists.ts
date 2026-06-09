"use server";

import { createClient } from "@/lib/supabase-server";
import { isUuid, sanitizeText } from "@/lib/sanitize";
import type { ActionResult } from "@/lib/actions/types";

export async function createSavedList(input: {
  name: string;
  visibility?: "private" | "public";
}): Promise<ActionResult<{ id: string }>> {
  const name = sanitizeText(input.name, 80);
  if (name.length < 1) return { ok: false, error: "List name is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const visibility = input.visibility === "public" ? "public" : "private";

  const { data, error } = await supabase
    .from("saved_lists")
    .insert({ user_id: user.id, name, visibility })
    .select("id")
    .single();

  if (error) return { ok: false, error: "Could not create list." };
  return { ok: true, data: { id: data.id } };
}

export async function renameSavedList(
  listId: string,
  name: string,
): Promise<ActionResult> {
  if (!isUuid(listId)) return { ok: false, error: "Invalid list." };
  const clean = sanitizeText(name, 80);
  if (clean.length < 1) return { ok: false, error: "List name is required." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("saved_lists")
    .update({ name: clean })
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not rename list." };
  return { ok: true };
}

export async function deleteSavedList(listId: string): Promise<ActionResult> {
  if (!isUuid(listId)) return { ok: false, error: "Invalid list." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("saved_lists")
    .delete()
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not delete list." };
  return { ok: true };
}

export async function addProductToList(
  listId: string,
  productId: string,
): Promise<ActionResult> {
  if (!isUuid(listId) || !isUuid(productId)) {
    return { ok: false, error: "Invalid list or product." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { data: list } = await supabase
    .from("saved_lists")
    .select("id")
    .eq("id", listId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!list) return { ok: false, error: "List not found." };

  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("status", "approved")
    .maybeSingle();
  if (!product) return { ok: false, error: "Product not found." };

  const { error } = await supabase.from("saved_list_items").insert({
    list_id: listId,
    product_id: productId,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Product is already on this list." };
    }
    return { ok: false, error: "Could not add product." };
  }
  return { ok: true };
}

export async function removeProductFromList(
  listId: string,
  itemId: string,
): Promise<ActionResult> {
  if (!isUuid(listId) || !isUuid(itemId)) {
    return { ok: false, error: "Invalid list item." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("saved_list_items")
    .delete()
    .eq("id", itemId)
    .eq("list_id", listId);

  if (error) return { ok: false, error: "Could not remove product." };
  return { ok: true };
}

export async function setListVisibility(
  listId: string,
  visibility: "private" | "public",
): Promise<ActionResult> {
  if (!isUuid(listId)) return { ok: false, error: "Invalid list." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("saved_lists")
    .update({ visibility })
    .eq("id", listId)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Could not update list visibility." };
  return { ok: true };
}
