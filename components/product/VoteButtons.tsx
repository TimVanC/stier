"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState } from "react";

import { cn, formatCount } from "@/lib/utils";

type VoteState = -1 | 0 | 1;

/**
 * Optimistic vote control. Anonymous voting is not yet wired to auth — for now
 * it updates locally. The sign-up modal hook lands with the voting phase.
 */
export function VoteButtons({
  netVotes,
  orientation = "horizontal",
  size = "md",
}: {
  netVotes: number;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md";
}) {
  const [state, setState] = useState<VoteState>(0);

  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const icon = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div
      className={cn(
        "inline-flex items-center overflow-hidden rounded-lg border border-border bg-card",
        orientation === "vertical" && "flex-col",
      )}
    >
      <button
        type="button"
        aria-label="Upvote"
        aria-pressed={state === 1}
        onClick={() => setState((s) => (s === 1 ? 0 : 1))}
        className={cn(
          "inline-flex items-center justify-center text-foreground transition hover:bg-secondary",
          dim,
          state === 1 && "bg-coral text-white hover:bg-coral",
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
        {formatCount(netVotes + state)}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        aria-pressed={state === -1}
        onClick={() => setState((s) => (s === -1 ? 0 : -1))}
        className={cn(
          "inline-flex items-center justify-center text-foreground transition hover:bg-secondary",
          dim,
          state === -1 && "bg-navy text-white hover:bg-navy",
        )}
      >
        <ArrowDown className={icon} />
      </button>
    </div>
  );
}
