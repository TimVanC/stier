"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { clearUserVotes, setUserBanned } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AdminUserRow } from "@/lib/db/admin";

export function UserManager({
  users,
  initialQuery = "",
}: {
  users: AdminUserRow[];
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/admin/users?${params.toString()}`);
  }

  function handleBan(user: AdminUserRow) {
    const next = !user.isBanned;
    const label = next ? "ban" : "unban";
    if (!confirm(`${label.charAt(0).toUpperCase()}${label.slice(1)} @${user.username}?`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setUserBanned(user.profileId, next);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleClearVotes(user: AdminUserRow) {
    if (
      !confirm(
        `Clear all ${user.voteCount} vote(s) from @${user.username}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await clearUserVotes(user.userId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or display name…"
          className="max-w-sm"
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending}>
          Search
        </Button>
      </form>

      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">No users found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 font-semibold">Activity</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.profileId} className="border-t border-border">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/profile/${user.username}`}
                        className="font-medium hover:text-coral"
                      >
                        @{user.username}
                      </Link>
                      {user.isBanned ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950/40 dark:text-red-200">
                          Banned
                        </span>
                      ) : null}
                      {user.role === "admin" ? (
                        <span className="rounded-full bg-navy px-2 py-0.5 text-xs font-semibold text-white">
                          Admin
                        </span>
                      ) : null}
                    </div>
                    <div className="text-muted-foreground">{user.displayName}</div>
                  </td>
                  <td className="hidden px-4 py-4 text-muted-foreground md:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-muted-foreground">
                    {user.submissionCount} submissions · {user.reviewCount} reviews ·{" "}
                    {user.voteCount} votes
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.role !== "admin" ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          className={cn(
                            user.isBanned &&
                              "text-emerald-700 hover:text-emerald-700",
                          )}
                          onClick={() => handleBan(user)}
                        >
                          {user.isBanned ? "Unban" : "Ban"}
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending || user.voteCount === 0}
                        onClick={() => handleClearVotes(user)}
                      >
                        Clear votes
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
