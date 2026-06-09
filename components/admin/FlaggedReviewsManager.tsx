"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { dismissReport, removeReportedReview } from "@/lib/actions/admin";
import { Stars } from "@/components/review/Stars";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FlaggedReviewRow } from "@/lib/db/admin";

const FILTERS = [
  { value: "open", label: "Flagged" },
  { value: "dismissed", label: "Dismissed" },
  { value: "removed", label: "Removed" },
  { value: "all", label: "All" },
] as const;

export function FlaggedReviewsManager({
  reports,
  activeFilter,
}: {
  reports: FlaggedReviewRow[];
  activeFilter: (typeof FILTERS)[number]["value"];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function handleKeep(reportId: string) {
    setError(null);
    startTransition(async () => {
      const result = await dismissReport(reportId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  function handleRemove(reportId: string) {
    if (!confirm("Remove this review permanently?")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeReportedReview(reportId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/reviews?status=${filter.value}`}
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

      {reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No reports in this view.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <article
              key={report.reportId}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/categories/${report.categorySlug}/${report.productSlug}`}
                    className="font-display font-bold hover:text-coral"
                  >
                    {report.productBrand ? `${report.productBrand} · ` : ""}
                    {report.productName}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Review by @{report.reviewAuthorUsername} · flagged{" "}
                    {new Date(report.reportedAt).toLocaleString()}
                  </p>
                </div>
                <Stars rating={report.rating} />
              </div>

              {report.title ? (
                <h3 className="mt-3 font-display font-bold">{report.title}</h3>
              ) : null}
              {report.body ? (
                <p className="mt-1 text-sm leading-relaxed">{report.body}</p>
              ) : null}

              {report.reportReason ? (
                <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-sm">
                  <span className="font-medium">Reporter reason: </span>
                  {report.reportReason}
                </p>
              ) : null}

              {report.reportStatus === "open" ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => handleKeep(report.reportId)}
                  >
                    Keep review
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRemove(report.reportId)}
                  >
                    Remove review
                  </Button>
                </div>
              ) : (
                <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                  Status: {report.reportStatus}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
