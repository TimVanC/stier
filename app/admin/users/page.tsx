import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/AdminNav";
import { UserManager } from "@/components/admin/UserManager";
import { searchAdminUsers } from "@/lib/db/admin";

export const metadata: Metadata = {
  title: "User management",
  description: "Manage Stier community members.",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const users = await searchAdminUsers(searchParams.q ?? "");

  return (
    <div>
      <AdminNav />
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Users
      </h1>
      <p className="mt-2 text-muted-foreground">
        Search members, ban abuse accounts, or clear manipulated votes.
      </p>
      <div className="mt-8">
        <UserManager users={users} initialQuery={searchParams.q ?? ""} />
      </div>
    </div>
  );
}
