import Link from "next/link";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";

const categoryLinks = [
  { label: "For you", href: "/", active: true },
  { label: "Trending", href: "/categories?sort=trending" },
  { label: "New rankings", href: "/categories?sort=new" },
  { label: "Home & kitchen", href: "/categories" },
  { label: "Audio", href: "/categories" },
  { label: "Outdoors", href: "/categories" },
  { label: "Apparel", href: "/categories" },
  { label: "Tools", href: "/categories" },
  { label: "Tech", href: "/categories" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md backdrop-saturate-150">
      <div className="container flex h-[72px] items-center gap-5">
        <Link
          href="/"
          aria-label="Stier home"
          className="inline-flex h-11 items-center rounded-xl bg-navy px-4 font-display text-lg font-extrabold tracking-tight text-white"
        >
          Stier
        </Link>

        {/* Search — the most prominent interactive element per .cursorrules */}
        <form
          action="/categories"
          role="search"
          className="relative hidden max-w-[520px] flex-1 md:block"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            name="q"
            placeholder="Search ranked products…"
            className="h-11 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm font-medium text-foreground outline-none transition focus:border-foreground focus:ring-4 focus:ring-foreground/5"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/categories">Browse</Link>
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href="/profile/lists">Lists</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="navy" size="sm" asChild>
            <Link href="/signup">
              <span className="size-2 rounded-full bg-coral" aria-hidden />
              Sign up
            </Link>
          </Button>
        </nav>
      </div>

      {/* Secondary category nav row */}
      <div className="border-t border-border/60 bg-background/60">
        <div className="container flex h-[46px] items-center gap-6 overflow-x-auto text-[13px] font-medium text-muted-foreground scrollbar-hide">
          {categoryLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`whitespace-nowrap border-b-2 py-1.5 transition hover:text-foreground ${
                link.active
                  ? "border-coral text-foreground"
                  : "border-transparent"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
