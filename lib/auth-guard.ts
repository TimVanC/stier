import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth";

/** Redirect anonymous users to login with a return path. */
export async function requireAuth(returnPath: string) {
  const user = await getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  }
  return user;
}
