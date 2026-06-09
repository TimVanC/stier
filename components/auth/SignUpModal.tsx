"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { SignupForm } from "@/components/auth/SignupForm";
import { TierBars } from "@/components/shared/TierBars";

/**
 * Sign-up modal shown when anonymous users try to vote or save.
 * Never hard-redirects — keeps the user on the page they were browsing.
 */
export function SignUpModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function handleSuccess() {
    onOpenChange(false);
    router.refresh();
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={() => onOpenChange(false)}
      className="fixed inset-0 z-50 m-0 h-full max-h-none w-full max-w-none border-0 bg-transparent p-4 backdrop:bg-navy/50 open:flex open:items-center open:justify-center"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-[0_24px_60px_-28px_rgba(26,26,46,0.35)] md:p-8">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Close"
        >
          ×
        </button>

        <div className="mb-5 inline-flex items-center gap-2.5">
          <TierBars className="h-3" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Join the community
          </span>
        </div>

        <h2 className="font-display text-2xl font-extrabold tracking-tight">
          Sign up to vote
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create a free account to upvote, downvote, and help rank what&apos;s
          actually good.
        </p>

        <div className="mt-6">
          <SignupForm embedded onSuccess={handleSuccess} />
        </div>

        <div className="mt-4">
          <Link
            href="/login"
            onClick={() => onOpenChange(false)}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-card text-sm font-semibold transition hover:border-foreground hover:bg-secondary"
          >
            Log in
          </Link>
        </div>
      </div>
    </dialog>
  );
}
