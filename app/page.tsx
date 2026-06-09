import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="container flex flex-col items-start gap-6 py-16 md:py-24">
      <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        <span className="flex h-3 items-end gap-0.5" aria-hidden>
          <span className="block h-1 w-[3px] rounded-sm bg-tier-c" />
          <span className="block h-1.5 w-[3px] rounded-sm bg-tier-b" />
          <span className="block h-2.5 w-[3px] rounded-sm bg-tier-a" />
          <span className="block h-3 w-[3px] rounded-sm bg-tier-s" />
        </span>
        Foundation ready
      </div>

      <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-foreground md:text-6xl">
        Stop scrolling Reddit. Start with the{" "}
        <span className="text-coral">best.</span>
      </h1>

      <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
        Project scaffolding is in place — Next.js 14, TypeScript, Tailwind CSS,
        and shadcn/ui with the Stier design tokens. The homepage, categories, and
        product pages come next.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Button asChild>
          <Link href="/categories">Browse categories</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Create an account</Link>
        </Button>
      </div>
    </section>
  );
}
