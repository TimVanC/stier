import type { Metadata } from "next";
import Link from "next/link";

import { requireAuth } from "@/lib/auth-guard";
import { getUserSubmissions } from "@/lib/db/submissions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My submissions",
  description: "Track products you have submitted to Stier.",
};

export const dynamic = "force-dynamic";

const STATUS_STYLES = {
  pending:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  approved:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-200",
} as const;

export default async function MySubmissionsPage() {
  await requireAuth("/profile/submissions");
  const submissions = await getUserSubmissions();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            My submissions
          </h1>
          <p className="mt-2 text-muted-foreground">
            Products you&apos;ve suggested for the community to rank.
          </p>
        </div>
        <Link
          href="/submit"
          className="inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition hover:bg-coral-hover"
        >
          Submit a product
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <h2 className="font-display text-lg font-bold">
            You haven&apos;t submitted any products yet
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Know something that belongs on a tier list? Add it to the queue.
          </p>
          <Link
            href="/submit"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition hover:bg-coral-hover"
          >
            Submit a product
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Submitted
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-4">
                    <div className="font-medium">{s.name}</div>
                    {s.brand ? (
                      <div className="text-muted-foreground">{s.brand}</div>
                    ) : null}
                    {s.status === "rejected" && s.rejectionReason ? (
                      <p className="mt-1 text-xs text-red-600/80">
                        Reason: {s.rejectionReason}
                      </p>
                    ) : null}
                  </td>
                  <td className="hidden px-4 py-4 text-muted-foreground sm:table-cell">
                    {s.categoryName}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                        STATUS_STYLES[s.status],
                      )}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-4 text-muted-foreground md:table-cell">
                    {new Date(s.createdAt).toLocaleDateString()}
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
