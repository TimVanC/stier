"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";

import {
  approveSubmission,
  rejectSubmission,
} from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AdminSubmissionRow } from "@/lib/db/admin";

const FILTERS = [
  { value: "pending", label: "Pending" },
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const;

const STATUS_STYLES = {
  pending:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200",
} as const;

export function SubmissionQueue({
  submissions,
  activeFilter,
}: {
  submissions: AdminSubmissionRow[];
  activeFilter: (typeof FILTERS)[number]["value"];
}) {
  const router = useRouter();
  const [rejectTarget, setRejectTarget] = useState<AdminSubmissionRow | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function handleApprove(productId: string) {
    setError(null);
    startTransition(async () => {
      const result = await approveSubmission(productId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  function handleRejectConfirm() {
    if (!rejectTarget) return;
    setError(null);
    startTransition(async () => {
      const result = await rejectSubmission(rejectTarget.id, rejectReason);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRejectTarget(null);
      setRejectReason("");
      refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/submissions?status=${filter.value}`}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition",
              activeFilter === filter.value
                ? "border-foreground bg-navy text-white"
                : "border-border bg-card hover:border-foreground",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No submissions in this view.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {submissions.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-bold">{item.name}</h2>
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
                        STATUS_STYLES[item.status],
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  {item.brand ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.brand}
                    </p>
                  ) : null}
                  <dl className="mt-3 grid gap-1 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category: </span>
                      {item.categoryName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Submitted by: </span>
                      {item.submitterUsername
                        ? `@${item.submitterUsername}`
                        : item.submitterDisplayName ?? "Unknown"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Date: </span>
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                    {item.productUrl ? (
                      <div>
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-coral hover:underline"
                        >
                          Product URL
                          <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    ) : null}
                    {item.status === "rejected" && item.rejectionReason ? (
                      <div className="text-red-600/80">
                        <span className="text-muted-foreground">Reason: </span>
                        {item.rejectionReason}
                      </div>
                    ) : null}
                  </dl>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                      {item.description}
                    </p>
                  ) : null}
                </div>

                {item.imageSignedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageSignedUrl}
                    alt=""
                    className="h-32 w-32 shrink-0 rounded-lg border border-border object-cover"
                  />
                ) : null}
              </div>

              {item.status === "pending" ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleApprove(item.id)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setRejectTarget(item);
                      setRejectReason("");
                    }}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {rejectTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-lg">
            <h3 className="font-display text-lg font-bold">
              Reject {rejectTarget.name}?
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Optionally tell the submitter why this was rejected.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor="reject-reason">Reason (optional)</Label>
              <Input
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Duplicate, off-topic, insufficient info…"
                disabled={isPending}
              />
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-destructive hover:text-destructive"
                disabled={isPending}
                onClick={handleRejectConfirm}
              >
                Confirm reject
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setRejectTarget(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
