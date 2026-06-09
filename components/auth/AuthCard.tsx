import Link from "next/link";

import { TierBars } from "@/components/shared/TierBars";

/**
 * Shared visual shell for the login / signup pages.
 * Desktop: centered card on the warm page background.
 * Mobile: full-bleed, no card border (per .cursorrules).
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-118px)] items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-none border-0 bg-transparent p-0 sm:rounded-xl sm:border sm:border-border sm:bg-card sm:p-8 sm:shadow-sm">
          <div className="mb-7 flex flex-col items-center text-center">
            <Link
              href="/"
              aria-label="Stier home"
              className="mb-5 inline-flex h-11 items-center rounded-xl bg-navy px-4 font-display text-lg font-extrabold tracking-tight text-white"
            >
              Stier
            </Link>
            <TierBars className="mb-4" />
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
