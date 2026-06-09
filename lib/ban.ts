import { createClient } from "@/lib/supabase-server";

/** Returns true when the given auth user is banned. */
export async function isUserBanned(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.is_banned === true;
}

/** Error message returned to banned users attempting write actions. */
export const BANNED_USER_MESSAGE =
  "Your account has been suspended. Contact support if you think this is a mistake.";
