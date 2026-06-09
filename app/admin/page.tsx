import type { Metadata } from "next";
import Link from "next/link";

import { AdminNav } from "@/components/admin/AdminNav";
import { getAdminDashboardStats } from "@/lib/db/admin";
import { formatCount } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin dashboard",
  description: "Stier admin overview.",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    {
      label: "Pending submissions",
      value: stats.pendingSubmissions,
      href: "/admin/submissions",
      highlight: true,
    },
    {
      label: "Flagged reviews",
      value: stats.flaggedReviews,
      href: "/admin/reviews",
      highlight: true,
    },
    { label: "Total products", value: stats.totalProducts, href: "/admin/submissions?status=all" },
    { label: "Categories", value: stats.totalCategories, href: "/admin/categories" },
    { label: "Users", value: stats.totalUsers, href: "/admin/users" },
  ];

  return (
    <div>
      <AdminNav />
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Admin dashboard
      </h1>
      <p className="mt-2 text-muted-foreground">
        Overview and quick links to moderation tasks.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`rounded-xl border p-5 transition hover:border-foreground ${
              card.highlight
                ? "border-coral/40 bg-coral/5"
                : "border-border bg-card"
            }`}
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p
              className={`mt-2 font-display text-3xl font-extrabold ${
                card.highlight ? "text-coral" : ""
              }`}
            >
              {formatCount(card.value)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
