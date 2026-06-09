import type { Metadata } from "next";

import { UserReviewsManager } from "@/components/profile/UserReviewsManager";
import { requireAuth } from "@/lib/auth-guard";
import { getUserReviews } from "@/lib/db/user-reviews";

export const metadata: Metadata = {
  title: "My reviews",
  description: "Reviews you have written on Stier.",
};

export const dynamic = "force-dynamic";

export default async function ProfileReviewsPage() {
  await requireAuth("/profile/reviews");
  const reviews = await getUserReviews();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          My reviews
        </h1>
        <p className="mt-2 text-muted-foreground">
          Edit or delete reviews you&apos;ve posted on product pages.
        </p>
      </div>
      <UserReviewsManager reviews={reviews} />
    </div>
  );
}
