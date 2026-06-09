import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ReviewCard } from "@/components/review/ReviewCard";
import {
  avatarPublicUrl,
  getProfileByUsername,
  getProfileStats,
} from "@/lib/db/profile";
import { getPublicProfileLists } from "@/lib/db/lists";
import {
  getPublicApprovedSubmissions,
  getPublicProfileReviews,
} from "@/lib/db/user-reviews";
import { getUser } from "@/lib/auth";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const profile = await getProfileByUsername(params.username);
  if (!profile) return { title: "Profile not found" };
  return {
    title: `${profile.displayName} (@${profile.username})`,
    description: `Community profile for ${profile.displayName} on Stier.`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await getProfileByUsername(params.username);
  if (!profile) notFound();

  const currentUser = await getUser();
  const isOwner = currentUser?.id === profile.userId;

  if (profile.isPrivate && !isOwner) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">Private profile</h1>
        <p className="mt-2 text-muted-foreground">
          This profile is only visible to its owner.
        </p>
      </div>
    );
  }

  const [stats, reviews, lists, submissions] = await Promise.all([
    getProfileStats(profile),
    getPublicProfileReviews(profile.userId, profile.username),
    getPublicProfileLists(profile.userId),
    getPublicApprovedSubmissions(profile.id),
  ]);

  const avatar = avatarPublicUrl(profile.avatarUrl);
  const joined = new Date(profile.createdAt).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="container py-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-border bg-card p-6 text-center lg:text-left">
          <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-full bg-navy font-display text-2xl font-bold text-white lg:mx-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="size-full object-cover" />
            ) : (
              profile.displayName.charAt(0).toUpperCase()
            )}
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
            {profile.displayName}
          </h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          <p className="mt-2 text-sm text-muted-foreground">Joined {joined}</p>

          <dl className="mt-6 grid grid-cols-3 gap-3 text-center lg:text-left">
            <div>
              <dt className="font-display text-xl font-extrabold">
                {formatCount(stats.reviewCount)}
              </dt>
              <dd className="text-xs text-muted-foreground">Reviews</dd>
            </div>
            <div>
              <dt className="font-display text-xl font-extrabold">
                {formatCount(stats.submissionCount)}
              </dt>
              <dd className="text-xs text-muted-foreground">Submissions</dd>
            </div>
            <div>
              <dt className="font-display text-xl font-extrabold">
                {formatCount(stats.voteCount)}
              </dt>
              <dd className="text-xs text-muted-foreground">Votes</dd>
            </div>
          </dl>

          {isOwner ? (
            <Link
              href="/profile/settings"
              className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-full border border-border text-sm font-semibold transition hover:bg-secondary"
            >
              Edit profile
            </Link>
          ) : null}
        </aside>

        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Reviews
            </h2>
            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No public reviews yet.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                {reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Public lists
            </h2>
            {lists.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No public lists yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {lists.map((list) => (
                  <li
                    key={list.id}
                    className="rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <div className="font-medium">{list.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {list.itemCount} product{list.itemCount === 1 ? "" : "s"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Approved submissions
            </h2>
            {submissions.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No approved submissions yet.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-2">
                {submissions.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-border bg-card px-4 py-3"
                  >
                    <div className="font-medium">
                      {item.brand ? `${item.brand} · ` : ""}
                      {item.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.categoryName}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
