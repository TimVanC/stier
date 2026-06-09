import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

type NavItem = {
  label: string;
  href?: string;
  active?: boolean;
  children?: string[];
};

const navItems: NavItem[] = [
  { label: "For you", href: "/", active: true },
  { label: "Trending", href: "/categories?sort=trending" },
  { label: "New rankings", href: "/categories?sort=new" },
  {
    label: "Home & Kitchen",
    children: ["Coffee Beans", "Cast Iron Skillets", "Blenders", "Knives", "Cookware"],
  },
  {
    label: "Audio",
    children: [
      "Over-ear Headphones",
      "In-ear Headphones",
      "Speakers",
      "Soundbars",
      "DACs",
    ],
  },
  {
    label: "Outdoors",
    children: ["Winter Jackets", "Hiking Boots", "Backpacks", "Tents"],
  },
  { label: "Apparel", children: ["Running Shoes", "Slippers", "Sneakers"] },
  { label: "Tools", children: ["Mechanical Keyboards", "Monitors", "Mice"] },
  { label: "Tech", children: ["Laptops", "Phones", "Tablets"] },
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
        <div className="container flex h-[46px] items-center gap-6 overflow-x-auto text-[13px] font-medium text-muted-foreground scrollbar-hide md:overflow-visible">
          {navItems.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="group/nav relative flex h-full items-center"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1 whitespace-nowrap border-b-2 border-transparent py-1.5 transition hover:text-foreground group-hover/nav:text-foreground"
                >
                  {item.label}
                  <ChevronDown className="size-3 transition group-hover/nav:rotate-180" />
                </button>
                <div className="invisible absolute left-0 top-full z-50 min-w-[224px] -translate-y-1 rounded-xl border border-border bg-card p-2 opacity-0 shadow-[0_18px_40px_-24px_rgba(26,26,46,0.35)] transition duration-150 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100">
                  {item.children.map((sub) => (
                    <Link
                      key={sub}
                      href={`/categories?q=${encodeURIComponent(sub)}`}
                      className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href ?? "/categories"}
                className={`whitespace-nowrap border-b-2 py-1.5 transition hover:text-foreground ${
                  item.active
                    ? "border-coral text-foreground"
                    : "border-transparent"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
          <span className="ml-auto hidden shrink-0 items-center gap-2 whitespace-nowrap font-semibold text-foreground lg:inline-flex">
            <span className="size-1.5 rounded-full bg-coral shadow-[0_0_0_3px_rgba(255,127,129,0.18)]" />
            2,481 voting now
          </span>
        </div>
      </div>
    </header>
  );
}
