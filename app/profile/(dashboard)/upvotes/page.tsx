import type { Metadata } from "next";

import { UpvotesList } from "@/components/profile/UpvotesList";
import { requireAuth } from "@/lib/auth-guard";
import { getUserUpvotes } from "@/lib/db/upvotes";

export const metadata: Metadata = {
  title: "My upvotes",
  description: "Products you have upvoted on Stier.",
};

export const dynamic = "force-dynamic";

export default async function ProfileUpvotesPage() {
  await requireAuth("/profile/upvotes");
  const products = await getUserUpvotes();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
          My upvotes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Every product you&apos;ve upvoted across Stier.
        </p>
      </div>
      <UpvotesList products={products} />
    </div>
  );
}
