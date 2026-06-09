"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/profile/lists", label: "Lists" },
  { href: "/profile/upvotes", label: "Upvotes" },
  { href: "/profile/submissions", label: "Submissions" },
  { href: "/profile/reviews", label: "Reviews" },
  { href: "/profile/settings", label: "Settings" },
];

export function ProfileDashboardNav({
  username,
}: {
  username: string | null;
}) {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition",
              pathname === link.href ||
                pathname.startsWith(`${link.href}/`)
                ? "border-foreground bg-navy text-white"
                : "border-border bg-card hover:border-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      {username ? (
        <Link
          href={`/profile/${username}`}
          className="text-sm font-medium text-muted-foreground transition hover:text-coral"
        >
          View public profile →
        </Link>
      ) : null}
    </nav>
  );
}
