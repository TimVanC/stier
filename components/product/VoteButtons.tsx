"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";

import { useOptionalAuthGate } from "@/components/auth/AuthGateProvider";
import { fetchProductVoteTally } from "@/lib/actions/vote-read";
import { castVote, removeVote } from "@/lib/actions/votes";
import { createClient } from "@/lib/supabase";
import { cn, formatCount } from "@/lib/utils";
import type { ProductVoteTally, UserVote } from "@/lib/db/vote-types";

export interface VoteTallyState extends ProductVoteTally {
  userVote: UserVote;
}

/**
 * Supabase-backed vote control with optimistic UI, active-state for the
 * current user's vote, anonymous sign-up modal gating, and realtime tally sync.
 */
export function VoteButtons({
  productId,
  initialUpvotes,
  initialDownvotes,
  initialUserVote = null,
  orientation = "horizontal",
  size = "md",
  syncRealtime = true,
  onTallyChange,
}: {
  productId: string;
  initialUpvotes: number;
  initialDownvotes: number;
  initialUserVote?: UserVote;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
  /** When false, parent handles realtime refresh (e.g. category list). */
  syncRealtime?: boolean;
  onTallyChange?: (tally: VoteTallyState) => void;
}) {
  const authGate = useOptionalAuthGate();
  const [userVote, setUserVote] = useState<UserVote>(initialUserVote);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const netVotes = upvotes - downvotes;
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? "size-3.5" : "size-4";

  const emitTally = useCallback(
    (
      nextUp: number,
      nextDown: number,
      nextUserVote: UserVote,
    ) => {
      onTallyChange?.({
        upvotes: nextUp,
        downvotes: nextDown,
        netVotes: nextUp - nextDown,
        userVote: nextUserVote,
      });
    },
    [onTallyChange],
  );

  const applyTally = useCallback(
    (nextUp: number, nextDown: number, nextUserVote: UserVote) => {
      setUpvotes(nextUp);
      setDownvotes(nextDown);
      setUserVote(nextUserVote);
      emitTally(nextUp, nextDown, nextUserVote);
    },
    [emitTally],
  );

  const refreshTally = useCallback(async () => {
    const tally = await fetchProductVoteTally(productId);
    applyTally(tally.upvotes, tally.downvotes, tally.userVote);
  }, [productId, applyTally]);

  useEffect(() => {
    setUpvotes(initialUpvotes);
    setDownvotes(initialDownvotes);
    setUserVote(initialUserVote);
  }, [initialUpvotes, initialDownvotes, initialUserVote, productId]);

  useEffect(() => {
    if (!syncRealtime) return;

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
  }, [productId, refreshTally, syncRealtime]);

  function applyOptimistic(next: UserVote) {
    let nextUp = upvotes;
    let nextDown = downvotes;
    if (userVote === "upvote") nextUp -= 1;
    if (userVote === "downvote") nextDown -= 1;
    if (next === "upvote") nextUp += 1;
    if (next === "downvote") nextDown += 1;
    applyTally(nextUp, nextDown, next);
  }

  function handleVote(next: UserVote) {
    setError(null);

    if (authGate && !authGate.isAuthenticated) {
      authGate.requestAuth();
      return;
    }

    const previousUp = upvotes;
    const previousDown = downvotes;
    const previousUserVote = userVote;
    const removing = previousUserVote === next;
    applyOptimistic(removing ? null : next);

    startTransition(async () => {
      const result = removing
        ? await removeVote(productId)
        : await castVote(productId, next as "upvote" | "downvote");

      if (!result.ok) {
        applyTally(previousUp, previousDown, previousUserVote);
        setError(result.error);
        return;
      }

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
