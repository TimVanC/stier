"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

export function TrendingPeriodToggle({
  period,
}: {
  period: "week" | "month";
}) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      {(["week", "month"] as const).map((p) => (
        <Link
          key={p}
          href={p === "week" ? "/trending" : "/trending?period=month"}
          scroll={false}
          className={cn(
            "h-9 rounded-full px-4 text-sm font-semibold capitalize transition",
            period === p
              ? "bg-navy text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          This {p}
        </Link>
      ))}
    </div>
  );
}
