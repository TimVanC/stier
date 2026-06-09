"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { useOptionalAuthGate } from "@/components/auth/AuthGateProvider";
import { fetchProductVoteTally } from "@/lib/actions/vote-read";
import { castVote, removeVote } from "@/lib/actions/votes";
import { createClient } from "@/lib/supabase";
import { cn, formatCount } from "@/lib/utils";
import type { UserVote } from "@/lib/db/votes";

/**
 * Supabase-backed vote control with optimistic UI, active-state for the
 * current user's vote, anonymous sign-up modal gating, and realtime tally sync.
 */
export function VoteButtons({
  productId,
  initialNetVotes,
  initialUserVote = null,
  orientation = "horizontal",
  size = "md",
  onNetVotesChange,
}: {
  productId: string;
  initialNetVotes: number;
  initialUserVote?: UserVote;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  onNetVotesChange?: (net: number) => void;
}) {
  const authGate = useOptionalAuthGate();
  const [userVote, setUserVote] = useState<UserVote>(initialUserVote);
  const [netVotes, setNetVotes] = useState(initialNetVotes);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? "size-3.5" : "size-4";

  const refreshTally = useCallback(async () => {
    const tally = await fetchProductVoteTally(productId);
    setNetVotes(tally.netVotes);
    setUserVote(tally.userVote);
    onNetVotesChange?.(tally.netVotes);
  }, [productId, onNetVotesChange]);

  useEffect(() => {
    setNetVotes(initialNetVotes);
    setUserVote(initialUserVote);
  }, [initialNetVotes, initialUserVote, productId]);

  // Realtime: when anyone votes on this product, refresh the tally from the server.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`votes:${productId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `product_id=eq.${productId}`,
        },
        () => {
          void refreshTally();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [productId, refreshTally]);

  function applyOptimistic(next: UserVote) {
    const prev = userVote;
    let delta = 0;
    if (prev === "upvote") delta -= 1;
    if (prev === "downvote") delta += 1;
    if (next === "upvote") delta += 1;
    if (next === "downvote") delta -= 1;
    setUserVote(next);
    setNetVotes((current) => {
      const nextNet = current + delta;
      onNetVotesChange?.(nextNet);
      return nextNet;
    });
  }

  function handleVote(next: UserVote) {
    setError(null);

    if (authGate && !authGate.isAuthenticated) {
      authGate.requestAuth();
      return;
    }

    const previousVote = userVote;
    const previousNet = netVotes;
    const removing = previousVote === next;
    applyOptimistic(removing ? null : next);

    startTransition(async () => {
      const result = removing
        ? await removeVote(productId)
        : await castVote(productId, next as "upvote" | "downvote");

      if (!result.ok) {
        setUserVote(previousVote);
        setNetVotes(previousNet);
        setError(result.error);
        return;
      }

      // Reconcile with server (covers rate-limit edge cases + other voters).
      await refreshTally();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={cn(
          "inline-flex items-center overflow-hidden rounded-lg border border-border bg-card",
          orientation === "vertical" && "flex-col",
          isPending && "opacity-80",
        )}
      >
        <button
          type="button"
          aria-label="Upvote"
          aria-pressed={userVote === "upvote"}
          disabled={isPending}
          onClick={() => handleVote("upvote")}
          className={cn(
            "inline-flex items-center justify-center text-foreground transition hover:bg-secondary disabled:cursor-wait",
            dim,
            userVote === "upvote" && "bg-coral text-white hover:bg-coral",
          )}
        >
          <ArrowUp className={icon} />
        </button>
        <span
          className={cn(
            "min-w-[44px] px-2 text-center font-display text-sm font-bold tabular-nums",
            orientation === "horizontal"
              ? "border-x border-border"
              : "border-y border-border",
          )}
        >
          {formatCount(netVotes)}
        </span>
        <button
          type="button"
          aria-label="Downvote"
          aria-pressed={userVote === "downvote"}
          disabled={isPending}
          onClick={() => handleVote("downvote")}
          className={cn(
            "inline-flex items-center justify-center text-foreground transition hover:bg-secondary disabled:cursor-wait",
            dim,
            userVote === "downvote" && "bg-navy text-white hover:bg-navy",
          )}
        >
          <ArrowDown className={icon} />
        </button>
      </div>
      {error ? (
        <p className="max-w-[12rem] text-right text-[11px] leading-tight text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
