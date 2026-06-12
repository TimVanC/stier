import { createClient } from "@/lib/supabase-server";
import type { PublicProfile, ProfileStats } from "@/lib/db/profile-shared";

export { avatarPublicUrl } from "@/lib/db/profile-shared";
export type { PublicProfile, ProfileStats } from "@/lib/db/profile-shared";

function mapProfile(row: {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_private: boolean;
  created_at: string;
}): PublicProfile {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.username ?? "member",
    displayName: row.display_name ?? row.username ?? "Community member",
    avatarUrl: row.avatar_url,
    isPrivate: row.is_private,
    createdAt: row.created_at,
  };
}

export async function getProfileByUsername(
  username: string,
): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, user_id, username, display_name, avatar_url, is_private, created_at")
    .ilike("username", username)
    .maybeSingle();

  return data ? mapProfile(data) : null;
}

export async function getCurrentUserProfile(): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, user_id, username, display_name, avatar_url, is_private, created_at")
    .eq("user_id", user.id)
    .single();

  return data ? mapProfile(data) : null;
}

export async function getProfileStats(
  profile: PublicProfile,
): Promise<ProfileStats> {
  const supabase = await createClient();

  const [reviews, submissions, votes] = await Promise.all([
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.userId),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("submitted_by", profile.id),
    supabase
      .from("votes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.userId),
  ]);

  return {
    reviewCount: reviews.count ?? 0,
    submissionCount: submissions.count ?? 0,
    voteCount: votes.count ?? 0,
  };
}
