"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";
import { validateUsername } from "@/lib/sanitize";

type AuthResult = { error: string } | void;

/**
 * Create a new account (email/password). Username is validated app-side (and
 * again by a DB CHECK + case-insensitive unique index) before being stored in
 * user metadata, where the `handle_new_user` trigger copies it to profiles.
 */
export async function signUp(
  input: {
    email: string;
    password: string;
    username: string;
  },
  options?: { redirect?: boolean },
): Promise<AuthResult> {
  const check = validateUsername(input.username);
  if (!check.ok) return { error: check.error };
  const username = check.value;

  const supabase = await createClient();

  // Case-insensitive availability check (DB unique index is the hard backstop).
  const { data: taken } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .maybeSingle();
  if (taken) return { error: "That username is already taken." };

  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { username, display_name: username },
    },
  });

  if (error) return { error: error.message };
  if (options?.redirect !== false) redirect("/");
}

/** Sign in with email/password. */
export async function signIn(
  input: {
    email: string;
    password: string;
  },
  options?: { redirectTo?: string },
): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) return { error: error.message };

  const next = options?.redirectTo;
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }
  redirect("/");
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Return the current session (or null). */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Return the current authenticated user (or null). Uses getUser() which
 * revalidates the token with the Auth server (safer than reading the session).
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
