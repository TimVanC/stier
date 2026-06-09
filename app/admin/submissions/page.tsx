import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/AdminNav";
import { SubmissionQueue } from "@/components/admin/SubmissionQueue";
import { getAdminSubmissions } from "@/lib/db/admin";

export const metadata: Metadata = {
  title: "Submission queue",
  description: "Approve or reject product submissions.",
};

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["pending", "all", "approved", "rejected"] as const;

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const statusParam = searchParams.status ?? "pending";
  const status = VALID_STATUSES.includes(
    statusParam as (typeof VALID_STATUSES)[number],
  )
    ? (statusParam as (typeof VALID_STATUSES)[number])
    : "pending";

  const submissions = await getAdminSubmissions(status);

  return (
    <div>
      <AdminNav />
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Submission queue
      </h1>
      <p className="mt-2 text-muted-foreground">
        Review pending products — oldest submissions first.
      </p>
      <div className="mt-8">
        <SubmissionQueue submissions={submissions} activeFilter={status} />
      </div>
    </div>
  );
}
