import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase-server";

/**
 * Server-side admin checks. These rely on the `is_admin()` SQL function, which
 * reads the role from the database (never from client-supplied data or
 * user_metadata). Use `requireAdmin()` to gate every /admin/* route.
 */

/** Returns the verified user, or null. Revalidates the token with Auth. */
export async function getVerifiedUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** True only when the current, authenticated user has the admin role. */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

/**
 * Gate a server route to admins only. Redirects to /login when signed out and
 * to / when signed in without the admin role. Returns the user on success.
 */
export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase.rpc("is_admin");
  if (error || data !== true) redirect("/");

  return user;
}
