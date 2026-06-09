import Link from "next/link";

const footerColumns = [
  {
    title: "Explore",
    links: [
      { label: "Browse categories", href: "/categories" },
      { label: "Trending now", href: "/categories?sort=trending" },
      { label: "New rankings", href: "/categories?sort=new" },
      { label: "Open debates", href: "/categories" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Start a tier list", href: "/submit" },
      { label: "Voting guide", href: "/" },
      { label: "Moderators", href: "/" },
      { label: "Manifesto", href: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "How rankings work", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Press kit", href: "/" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 bg-navy text-white">
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <span className="inline-flex h-11 items-center font-display text-xl font-extrabold tracking-tight text-white">
              Stier
            </span>
            <p className="mt-4 max-w-[340px] text-sm leading-relaxed text-white/60">
              The community ranks the products worth buying — once, and for life.
              Made by people who got tired of scrolling.
            </p>
            <form className="mt-5 flex max-w-[340px]">
              <input
                type="email"
                placeholder="you@somewhere.com"
                className="h-11 flex-1 rounded-l-lg border border-r-0 border-white/15 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/40"
              />
              <button
                type="submit"
                className="h-11 rounded-r-lg bg-coral px-4 text-sm font-bold text-white transition hover:bg-coral-hover"
              >
                Get the weekly
              </button>
            </form>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-white/50">
                {column.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/90 transition hover:text-coral"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-6 text-xs text-white/45">
          <div className="flex items-center gap-4">
            <span className="flex h-3.5 items-end gap-1" aria-hidden>
              <span className="block h-1 w-1 rounded-sm bg-tier-c" />
              <span className="block h-[7px] w-1 rounded-sm bg-tier-b" />
              <span className="block h-2.5 w-1 rounded-sm bg-tier-a" />
              <span className="block h-3.5 w-1 rounded-sm bg-tier-s" />
            </span>
            © {new Date().getFullYear()} Stier, Inc. · Made for the long haul.
          </div>
          <div className="flex gap-4">
            <Link href="/" className="transition hover:text-white">
              Privacy
            </Link>
            <Link href="/" className="transition hover:text-white">
              Terms
            </Link>
            <Link href="/" className="transition hover:text-white">
              RSS
            </Link>
            <Link href="/" className="transition hover:text-white">
              Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
