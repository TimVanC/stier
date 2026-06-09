import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SubmitProductForm } from "@/components/submit/SubmitProductForm";
import { TierBars } from "@/components/shared/TierBars";
import { getSubmissionCategories } from "@/lib/db/categories";
import { createClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Submit a product",
  description: "Suggest a product for the community to rank on Stier.",
};

export default async function SubmitProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/submit");
  }

  const categories = await getSubmissionCategories();

  return (
    <div className="container py-8 md:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-8">
          <TierBars className="mb-4" />
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            Submit a product
          </h1>
          <p className="mt-2 text-muted-foreground">
            Missing something from a tier list? Suggest it — submissions go to
            our review queue before they appear in rankings.
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            No categories are available for submissions right now.
          </p>
        ) : (
          <SubmitProductForm categories={categories} />
        )}
      </div>
    </div>
  );
}
