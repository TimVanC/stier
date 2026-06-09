import Link from "next/link";

import { getHeroStackFromDb } from "@/lib/db/catalog";
import { cn, formatCount } from "@/lib/utils";
import type { RankedProduct, Tier } from "@/types";

interface StackRow {
  tier: Tier;
  name: string;
  brand: string;
  weeklyVotes: number;
}

interface StackCardData {
  title: string;
  href: string;
  totalVotes: number;
  rows: StackRow[];
  className: string;
}

const TIER_BADGE: Record<Tier, string> = {
  "S+": "bg-coral text-white ring-2 ring-amber-300",
  S: "bg-tier-s text-navy",
  A: "bg-tier-a text-navy",
  B: "bg-tier-b text-navy",
  C: "bg-tier-c text-navy",
  D: "bg-tier-d text-navy",
  F: "bg-tier-f text-navy",
};

const CARD_LAYOUT = [
  "top-[120px] z-[1] h-[380px] -rotate-1 translate-x-10 opacity-55",
  "top-[60px] z-[2] h-[380px] translate-x-[22px] opacity-90 hero-stack-middle",
  "top-0 z-[3] h-[380px] hero-stack-front",
];

function toStackRow(p: RankedProduct): StackRow {
  return {
    tier: p.tier,
    name: p.name,
    brand: p.brand,
    weeklyVotes: p.weeklyVotes,
  };
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
          key={`${row.brand}-${row.name}`}
          className="grid grid-cols-[32px_56px_1fr_60px] items-center gap-3 border-b border-secondary px-5 py-3 last:border-0"
        >
          <span
            className={cn(
              "inline-flex size-[30px] items-center justify-center rounded-lg font-display text-[13px] font-extrabold shadow-[inset_0_0_0_1px_rgba(26,26,46,0.08)]",
              TIER_BADGE[row.tier],
            )}
          >
            {row.tier === "S+" ? "S+" : row.tier}
          </span>
          <div
            className="relative size-14 overflow-hidden rounded-[10px] bg-secondary bg-hatch"
            aria-hidden
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

/** Stacked tier-list preview cards from live category rankings. */
export async function HeroStackCards() {
  const stacks = await getHeroStackFromDb();
  if (stacks.length === 0) return null;

  const ordered = [...stacks].reverse();
  const rowLimits = [2, 3, 4];

  const cards: StackCardData[] = ordered.map((stack, i) => ({
    title: stack.title,
    href: stack.href,
    totalVotes: stack.totalVotes,
    rows: stack.products.slice(0, rowLimits[i] ?? 4).map(toStackRow),
    className: CARD_LAYOUT[i] ?? CARD_LAYOUT[0]!,
  }));

  const front = stacks[stacks.length - 1];

  return (
    <div
      className="relative mx-auto w-full max-w-[460px] lg:ml-auto"
      aria-hidden
    >
      <div className="relative h-[520px] [perspective:1200px] max-md:h-[440px]">
        {cards.map((card) => (
          <StackCard key={card.title} data={card} />
        ))}
      </div>
      {front ? (
        <Link
          href={front.href}
          className="sr-only focus:not-sr-only focus:absolute focus:left-0 focus:top-0 focus:z-50"
        >
          View {front.title} rankings
        </Link>
      ) : null}
    </div>
  );
}
