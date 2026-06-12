/**
 * Client-safe profile types and helpers.
 * Keep this file free of server-only imports (next/headers, supabase-server)
 * so it can be imported from client components.
 */

export interface PublicProfile {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isPrivate: boolean;
  createdAt: string;
}

export interface ProfileStats {
  reviewCount: number;
  submissionCount: number;
  voteCount: number;
}

export function avatarPublicUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/avatars/${path}`;
}
