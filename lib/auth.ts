"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase-server";

type AuthResult = { error: string } | void;

/**
 * Create a new account (email/password). Username is stored in user metadata
 * so the `handle_new_user` DB trigger can populate the profiles row.
 */
export async function signUp(input: {
  email: string;
  password: string;
  username: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { username: input.username, display_name: input.username },
    },
  });

  if (error) return { error: error.message };
  redirect("/");
}

/** Sign in with email/password. */
export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) return { error: error.message };
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
