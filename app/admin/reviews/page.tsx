import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/AdminNav";
import { FlaggedReviewsManager } from "@/components/admin/FlaggedReviewsManager";
import { getFlaggedReviews } from "@/lib/db/admin";

export const metadata: Metadata = {
  title: "Review moderation",
  description: "Handle flagged reviews on Stier.",
};

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["open", "dismissed", "removed", "all"] as const;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusParam = searchParams.status ?? "open";
  const status = VALID_STATUSES.includes(
    statusParam as (typeof VALID_STATUSES)[number],
  )
    ? (statusParam as (typeof VALID_STATUSES)[number])
    : "open";

  const reports = await getFlaggedReviews(status);

  return (
    <div>
      <AdminNav />
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Review moderation
      </h1>
      <p className="mt-2 text-muted-foreground">
        Flagged reviews from community reports.
      </p>
      <div className="mt-8">
        <FlaggedReviewsManager reports={reports} activeFilter={status} />
      </div>
    </div>
  );
}
