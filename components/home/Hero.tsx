import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

import { TierBadge } from "@/components/product/TierBadge";
import { TierBars } from "@/components/shared/TierBars";
import { formatCount } from "@/lib/utils";
import {
  getRankedProducts,
  getSiteStats,
} from "@/lib/seed-data";

const POPULAR = [
  { label: "Coffee Beans", slug: "coffee-beans", tier: "bg-tier-s" },
  { label: "Headphones", slug: "headphones", tier: "bg-tier-a" },
  { label: "Winter Jackets", slug: "winter-jackets", tier: "bg-tier-b" },
  { label: "Running Shoes", slug: "running-shoes", tier: "bg-tier-c" },
];

export function Hero() {
  const stats = getSiteStats();
  const board = getRankedProducts("headphones").slice(0, 4);

  return (
    <section className="relative overflow-hidden">
      <div className="container py-12 md:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Left: copy + search */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <TierBars className="h-3" />
              Community-ranked · since 2024
            </div>

            <h1 className="font-display text-[clamp(2.5rem,6vw,4.75rem)] font-extrabold leading-[0.96] tracking-tight text-foreground">
              Stop searching.
              <br />
              Start <span className="text-coral">finding.</span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Fake five-star reviews, paid &ldquo;best of&rdquo; articles, sponsored
              blog posts, endless forum threads.{" "}
              <span className="font-semibold text-foreground">
                We just rank what&apos;s actually good
              </span>{" "}
              — voted by the people who own it.
            </p>

            <form
              action="/categories"
              className="relative mt-7 max-w-xl"
              role="search"
            >
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-foreground" />
              <input
                type="search"
                name="q"
                placeholder="What are you trying to find?"
                className="h-[60px] w-full rounded-2xl border-[1.5px] border-foreground bg-card pl-14 pr-32 text-base font-medium text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 inline-flex h-11 items-center gap-1.5 rounded-xl bg-coral px-4 font-display text-sm font-bold text-white transition hover:bg-coral-hover"
              >
                Rank it
                <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Popular
              </span>
              {POPULAR.map((chip) => (
                <Link
                  key={chip.slug}
                  href={`/categories/${chip.slug}`}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-medium transition hover:-translate-y-px hover:border-foreground"
                >
                  <span className={`size-2 rounded-[3px] ${chip.tier}`} />
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right: floating live tier list card */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-28px_rgba(26,26,46,0.28)]">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="font-display text-base font-extrabold tracking-tight">
                  Over-ear headphones
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {formatCount(
                    board.reduce((s, p) => s + p.upvotes + p.downvotes, 0),
                  )}{" "}
                  votes
                </span>
              </div>
              <ul>
                {board.map((p) => (
                  <li
                    key={p.id}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-secondary px-5 py-3 last:border-0"
                  >
                    <TierBadge tier={p.tier} size="sm" />
                    <span>
                      <span className="block text-sm font-semibold leading-tight">
                        {p.name}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {p.brand}
                      </span>
                    </span>
                    <span className="text-right font-display text-sm font-bold text-emerald-600">
                      +{formatCount(p.weeklyVotes)}
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        this wk
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-12 flex flex-wrap items-center gap-x-12 gap-y-6 border-t border-border pt-6">
          <Stat n={`${formatCount(stats.productCount)}+`} label="ranked products" />
          <Stat n={formatCount(stats.categoryCount)} label="community lists" />
          <Stat n={formatCount(stats.voteCount)} label="honest votes cast" />
          <Stat n="0" label="affiliate links" />
          <span className="hidden flex-1 md:block" />
          <span className="max-w-[16rem] text-sm text-muted-foreground/70">
            As seen on Hacker News, The Verge
          </span>
        </div>
      </div>
    </section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="font-display text-2xl font-extrabold leading-none tracking-tight">
        {n}
      </span>
      <span className="mt-1.5 text-sm leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
