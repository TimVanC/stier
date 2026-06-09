import type { Metadata } from "next";

import { AdminNav } from "@/components/admin/AdminNav";
import { CategoryManager } from "@/components/admin/CategoryManager";
import { getAdminCategories } from "@/lib/db/admin";

export const metadata: Metadata = {
  title: "Category management",
  description: "Create and manage Stier categories.",
};

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div>
      <AdminNav />
      <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
        Categories
      </h1>
      <p className="mt-2 text-muted-foreground">
        Manage category visibility, featured status, and metadata.
      </p>
      <div className="mt-8">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
