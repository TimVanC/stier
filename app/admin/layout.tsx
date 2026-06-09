import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/admin";

// Admin routes must never be statically cached or read client-side role state.
export const dynamic = "force-dynamic";

/**
 * Every /admin/* page is gated here: the admin check runs server-side on every
 * request via requireAdmin(). Non-admins are redirected before any child page
 * renders. Never trust client-side role checks for admin access.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Admin
        </span>
      </div>
      {children}
    </div>
  );
}
