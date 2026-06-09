import Link from "next/link";

import { TierBadge } from "@/components/product/TierBadge";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { formatCount } from "@/lib/utils";
import { getRankedProducts } from "@/lib/seed-data";
import type { Tier } from "@/types";

interface StackRow {
  tier: Tier;
  name: string;
  brand: string;
  weeklyVotes: number;
}

interface StackCardData {
  title: string;
  totalVotes: number;
  rows: StackRow[];
  className: string;
}

function StackCard({ data }: { data: StackCardData }) {
  return (
    <div
      className={`absolute inset-x-0 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-28px_rgba(26,26,46,0.28),0_2px_0_rgba(26,26,46,0.02)] ${data.className}`}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-[18px]">
        <span className="font-display text-[17px] font-extrabold leading-none tracking-tight">
          {data.title}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {formatCount(data.totalVotes)} votes
        </span>
      </div>
      {data.rows.map((row) => (
        <div
          key={row.name}
          className="grid grid-cols-[32px_56px_1fr_60px] items-center gap-3 border-b border-secondary px-5 py-3 last:border-0"
        >
          <TierBadge tier={row.tier} size="sm" />
          <ImagePlaceholder
            label=""
            className="size-14 rounded-[10px] border-0 bg-secondary"
          />
          <span>
            <span className="block text-sm font-semibold leading-tight">
              {row.name}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              {row.brand}
            </span>
          </span>
          <span className="text-right font-display text-sm font-bold tabular-nums">
            +{formatCount(row.weeklyVotes)}
            <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              this wk
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Stacked tier-list preview cards from the homepage reference mockup. */
export function HeroStackCards() {
  const headphones = getRankedProducts("headphones");
  const slippers = getRankedProducts("slippers");

  const front: StackCardData = {
    title: "Over-ear headphones",
    totalVotes: headphones.reduce((s, p) => s + p.upvotes + p.downvotes, 0),
    rows: headphones.slice(0, 4).map((p) => ({
      tier: p.tier,
      name: p.name,
      brand: p.brand,
      weeklyVotes: p.weeklyVotes,
    })),
    className:
      "top-0 z-[3] h-[380px] hero-stack-front",
  };

  const middle: StackCardData = {
    title: "Slippers",
    totalVotes: slippers.reduce((s, p) => s + p.upvotes + p.downvotes, 0),
    rows: slippers.slice(0, 3).map((p) => ({
      tier: p.tier,
      name: p.name,
      brand: p.brand,
      weeklyVotes: p.weeklyVotes,
    })),
    className:
      "top-[60px] z-[2] h-[380px] translate-x-[22px] opacity-90 hero-stack-middle",
  };

  const back: StackCardData = {
    title: "Pour-over kettles",
    totalVotes: 8210,
    rows: [
      { tier: "S", name: "Stagg EKG Pro", brand: "Fellow", weeklyVotes: 421 },
      { tier: "A", name: "Buono", brand: "Hario", weeklyVotes: 184 },
    ],
    className:
      "top-[120px] z-[1] h-[380px] -rotate-1 translate-x-10 opacity-55",
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[460px] lg:ml-auto"
      aria-hidden
    >
      <div className="relative h-[520px] [perspective:1200px] max-md:h-[440px]">
        <StackCard data={back} />
        <StackCard data={middle} />
        <StackCard data={front} />
      </div>
      <Link
        href="/categories/headphones"
        className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-50"
      >
        View over-ear headphones rankings
      </Link>
    </div>
  );
}
