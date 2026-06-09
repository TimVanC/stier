# Stier — Build Progress

## Status: Phase 2 — Core Browsing (complete) · Auth (complete)

---

## Completed
- [x] Next.js 14 (App Router) + TypeScript (strict) project initialized
- [x] Tailwind CSS configured with the .cursorrules design tokens
- [x] shadcn/ui configured (components.json, `cn` util, Button/Input/Label)
- [x] Root layout with Inter (body) + local Satoshi (display) fonts, globals.css, design tokens
- [x] Navbar (search → /categories, primary nav, secondary category row) and Footer
- [x] Supabase clients: `lib/supabase.ts` (browser) + `lib/supabase-server.ts` (server w/ cookies)
- [x] `@supabase/supabase-js` and `@supabase/ssr` installed
- [x] Full DB migration authored AND **applied** (9 tables + RLS): `supabase/migrations/20260609030500_initial_schema.sql`
- [x] Schema verified: all 9 tables have RLS enabled with policies; `is_admin`/`handle_new_user`/`set_updated_at` functions present (search_path pinned)
- [x] GitHub repo connected (origin → TimVanC/stier) and pushed to `main`
- [x] `middleware.ts` refreshes the Supabase session on every request
- [x] Auth actions `lib/auth.ts` (signUp, signIn, signOut, getSession, getUser)
- [x] Login + signup pages (Stier design system, tier-bar accent)
- [x] Phase 2 browsing: homepage, category list, ranked category, product detail
- [x] Seed data module (`lib/seed-data.ts`) + ranking/tier logic (`lib/ranking.ts`)
- [x] `npm install`, typecheck, lint, and production build all passing (50 routes)

---

## Design & Tier-Logic Pass (Jun 9)
- [x] Removed all emojis sitewide (category `icon` field dropped from type + seed data; all render sites cleaned)
- [x] Tier badges are rounded squares with exact colors — S `#ff7f81`, A `#ffb347`, B `#ffd700`, C `#90ee90`, D `#87ceeb`, F `#d3d3d3`
  - Pinned tier shapes to fixed px radii (`rounded-[7px]` badges, `rounded-[3px]` dots) because the Tailwind `--radius` override made `rounded-sm`/`rounded-md` read as circles
- [x] **Relative per-category tiers** in `lib/ranking.ts`: F = net-negative; S/A/B/C/D by score percentile within the category (S top 10%, A 11–25%, B 26–50%, C 51–75%, D bottom 25%)
- [x] **S+ tier** added (`Tier` type, `assignTier`, `TierBadge`, tier legend): S tier **and** ≥30% of the category's votes — coral bg, white label, gold ring. Kept rare by adding a 4th product to each 3-product category and tuning vote shares so only Headphones/HD 6XX qualifies
- [x] Homepage: new headline "The reviews are rigged. Start with the best.", exactly 4 popular chips, vertically-stacked centered stats, featured = big card + 4 (no orphan), tier legend with S+, rebuilt "Climbing the rankings" cards to match the reference (oversized rank + change, tier pill, body/foot)
- [x] Navbar secondary row: hover dropdown menus with placeholder subcategories (Audio, Home & Kitchen, Outdoors, Apparel, Tools, Tech)
- [x] `/categories` reworked: title "Browse all categories", dynamic subtitle "All [filter] lists", top-4 featured, filter chips + search, rounded-square tier badges
- [x] Ranked-list + product-detail pages: universal fixes applied (no emoji, square badges, correct colors, S+ support)

---

## In Progress
- [ ] Phase 3 — Voting (wire VoteButtons to Supabase + sign-up modal)

---

## Up Next
1. Wire voting to Supabase (one vote per user) + real-time score updates
2. Replace seed-data reads with Supabase queries + DB seed script
3. Review submission form (Phase 4)
4. Set up Vercel deployment

---

## Build Queue (in order)

### Phase 1 — Foundation
- [x] Next.js 14 + TypeScript setup
- [x] Tailwind CSS configuration with design tokens
- [x] shadcn/ui installation and theme configuration
- [x] Supabase project creation (hosted: "stier" / van training org, ref ytczqoyrtzblbqihvrdp)
- [x] Supabase client setup (browser + server, @supabase/ssr)
- [x] Database schema (all 9 tables) — migration applied + verified
- [x] Row Level Security policies — applied + verified on every table
- [x] Supabase Auth configuration (email/password, session middleware)
- [x] Root layout with Navbar and Footer components
- [x] GitHub repo connected (TimVanC/stier); Vercel deploy still pending

### Phase 2 — Core Browsing
- [x] Homepage (hero, featured categories, rising this week)
- [x] Category list page (real-time search + sort filtering)
- [x] Ranked category page (sort/filter, sidebar, submit banner)
- [x] Product detail page (review summary, reviews, related, mobile sticky buy)
- [x] Basic product cards (ProductCard + ProductRow)
- [x] Category cards
- [x] Seed data (categories and products) — placeholder, ranking-aware

### Phase 3 — Voting
- [ ] Vote buttons component
- [ ] useVote hook
- [ ] Authenticated voting with sign up modal
- [ ] One vote per user constraint
- [ ] Ranking score calculation
- [ ] Top and Rising sort
- [ ] Real time vote updates

### Phase 4 — Reviews
- [ ] Review form component
- [ ] Reviews display on product pages
- [ ] Review count on product cards
- [ ] Review sort options

### Phase 5 — Submissions
- [ ] Submit product page
- [ ] Pending state storage
- [ ] Admin submission queue
- [ ] Approve/reject flow

### Phase 6 — User Dashboard
- [ ] User profile page (public)
- [ ] My Lists
- [ ] My Upvotes
- [ ] My Submissions
- [ ] My Reviews
- [ ] Settings page

### Phase 7 — Waitlist
- [ ] Waitlist page
- [ ] Email capture
- [ ] Product suggestion form
- [ ] Waitlist position counter

### Phase 8 — Admin
- [ ] Admin dashboard
- [ ] Submission queue
- [ ] Category management
- [ ] Review moderation
- [ ] User management

### Phase 9 — Polish
- [ ] Search results page
- [ ] Empty states across all pages
- [ ] Loading states across all pages
- [ ] Mobile UI pass
- [ ] SEO metadata
- [ ] OG images
- [ ] Analytics
- [ ] Error handling
- [ ] Final seed data

---

## Decisions Log
_Cursor should add to this section whenever a meaningful technical decision is made during the build._

| Date | Decision | Reason |
|------|----------|--------|
| — | Using Supabase for auth, database, and storage | Keeps stack consolidated, avoids Clerk and Cloudinary |
| — | Pagination over infinite scroll on ranked lists | Better for SEO |
| — | Anonymous users can see all content | Lower friction for discovery, better SEO crawlability |
| — | Sign up modal instead of redirect on auth-required actions | Better UX, user doesn't lose their place |
| Jun 9 | Tailwind v3 + shadcn/ui with HSL CSS variables | Stable, well-supported combo; design tokens mapped to shadcn semantic vars so components stay on-theme |
| Jun 9 | Inter Tight as the display font (instead of Satoshi) | Satoshi is not on Google Fonts; Inter Tight is the closest Google-hosted match (also used in the reference mockup) and keeps the stack dependency-free via next/font |
| Jun 9 | shadcn `Button` extended with `navy` variant + coral default | Matches the .cursorrules CTA patterns (coral rounded-full primary, navy nav button) |
| Jun 9 | Brand tokens also exposed as Tailwind colors (`coral`, `navy`, `paper`, `tier.*`) | Lets components use named brand colors instead of hardcoded hex, satisfying the "no hardcoded colors" rule |
| Jun 9 | Switched display font to local Satoshi (`next/font/local`), removed Inter Tight | Real font file added at public/fonts; matches the .cursorrules spec |
| Jun 9 | Auth/sessions via `@supabase/ssr` (browser + server clients); no Clerk | Matches stack rules — Supabase Auth only |
| Jun 9 | Added `role` column to `profiles` (`user`/`admin`) | .cursorrules auth rules identify admins by a role field |
| Jun 9 | Added `reports` table (review_id, reporter_id, reason, status) | Backs the Report button + admin Review Moderation queue |
| Jun 9 | `is_admin()` SECURITY DEFINER helper (search_path pinned, execute granted to anon+authenticated) | Avoids recursive RLS on profiles; anon needs execute since category/product SELECT policies call it |
| Jun 9 | `handle_new_user` trigger auto-creates a profile on signup | Keeps profiles in sync with auth.users; execute revoked from API roles |
| Jun 9 | Votes allow owner UPDATE + DELETE (not strictly insert-only) | PLANNING voting UX requires switching and removing a vote; admin can also delete for manipulation cases |
| Jun 9 | One review per user per product (unique constraint) | Prevents duplicate/spam reviews; supports edit/delete in "My Reviews" |
| Jun 9 | `waitlist` SELECT restricted to admins | Emails are PII; public position counter/feed should use a server-side aggregate, not direct table reads |
| Jun 9 | Applied migration via a `pg` script using a direct `DATABASE_URL` (db.<ref>.supabase.co:5432) | MCP server wasn't connected; session pooler reported "tenant not found" for the region/host tried, but the direct host worked over IPv6 |
| Jun 9 | All SECURITY/trigger functions pin `search_path = ''` | Avoids Supabase's "mutable search_path" lint and search-path hijacking |
| Jun 9 | `lib/auth.ts` is a single `"use server"` module exporting the 5 auth functions | Lets client auth forms call them directly as server actions; non-async type kept unexported to satisfy the directive |
| Jun 9 | Middleware refreshes session but does NOT gate routes | Anonymous users can view everything (per rules); auth is enforced at the action level |
| Jun 9 | Auth forms use inline error text (not toast) | No toast system yet; inline errors are accessible and avoid `alert()` |
| Jun 9 | Phase 2 built on a local seed-data module, not live Supabase reads | Lets every page look populated now; swap to queries in the data-layer phase. Shapes mirror the DB schema |
| Jun 9 | Tuned seed review counts to be monotonic with intended quality | The .cursorrules score formula weights `reviewCount*2`, which dominated with large review numbers; tuning keeps the formula intact while producing realistic #1s and a proper S→F tier spread |
| Jun 9 | Placeholder imagery via `ImagePlaceholder` (hatch + icon + label) | No real product images seeded yet; reads as intentional rather than empty |

---

## Files Created
_Cursor should update this as files are created._

| File | Purpose |
|------|---------|
| .cursorrules | Project rules and design system for Cursor |
| PLANNING.md | Full product plan, screen specs, decisions |
| PROGRESS.md | This file — build tracking |
| package.json | Dependencies and scripts (dev, build, start, lint, typecheck) |
| tsconfig.json | TypeScript config (strict, `@/*` path alias) |
| next.config.mjs | Next.js config (remote image patterns) |
| postcss.config.mjs | PostCSS config (tailwindcss + autoprefixer) |
| tailwind.config.ts | Tailwind theme: design tokens, brand/tier colors, fonts, radius |
| components.json | shadcn/ui configuration |
| .eslintrc.json | ESLint (next/core-web-vitals + next/typescript) |
| .gitignore | Standard Next.js ignore rules |
| lib/utils.ts | `cn()` class-merge helper |
| app/globals.css | Tailwind layers + design-token CSS variables (light/dark) |
| app/layout.tsx | Root layout: fonts, metadata, Navbar + Footer shell |
| app/page.tsx | Homepage placeholder (foundation status) |
| components/ui/button.tsx | shadcn Button with Stier variants |
| components/layout/Navbar.tsx | Placeholder sticky nav (search, links, category row) |
| components/layout/Footer.tsx | Placeholder navy footer (columns, email capture, tier bars) |
| public/fonts/Satoshi-Variable.woff2 | Local display font (Satoshi) |
| lib/supabase.ts | Browser Supabase client (anon key, `createBrowserClient`) |
| lib/supabase-server.ts | Server Supabase client (cookies, `createServerClient`) |
| supabase/config.toml | Supabase CLI config (link/push instructions) |
| supabase/migrations/20260609030500_initial_schema.sql | Full schema: 9 tables, indexes, triggers, RLS policies (APPLIED) |
| scripts/run-migration.mjs | One-off migration runner (`npm run db:migrate`, reads DATABASE_URL) |
| scripts/verify-db.mjs | Schema/RLS verification helper |
| .env.local | Supabase URL + anon + service-role keys + DATABASE_URL (gitignored) |
| middleware.ts | Refreshes the Supabase session on every request |
| lib/auth.ts | Server auth actions: signUp, signIn, signOut, getSession, getUser |
| lib/ranking.ts | `calculateScore` + `assignTier` (from .cursorrules) + tier labels |
| lib/seed-data.ts | Placeholder categories/products/reviews + ranking-aware accessors |
| types/index.ts | Shared types: Tier, Category, Product, RankedProduct, Review |
| components/ui/input.tsx, label.tsx | Form primitives for auth |
| components/auth/AuthCard.tsx, LoginForm.tsx, SignupForm.tsx | Auth UI |
| app/login/page.tsx, app/signup/page.tsx | Auth pages |
| app/categories/page.tsx | Category list (search/sort browser) |
| app/categories/[slug]/page.tsx | Ranked category page (SSG + metadata) |
| app/categories/[slug]/[product-slug]/page.tsx | Product detail (SSG + metadata) |
| components/home/* | Hero, FeaturedCategories, RisingThisWeek |
| components/category/* | CategoryCard, CategoryBrowser |
| components/product/* | TierBadge, VoteButtons, ProductCard, ProductRow, RankedList |
| components/review/* | Stars, ReviewCard, ReviewsSection |
| components/shared/* | TierBars, ImagePlaceholder, EmptyState |

---

## Known Issues
_Cursor should log any bugs or blockers here._

- Supabase MCP server still isn't connected in-session (would be nicer than the `pg` script
  for future schema work). Not blocking — migrations can be applied with `npm run db:migrate`.
- Full Supabase advisor lints (`get_advisors`) couldn't be run without MCP/CLI. Re-run advisors
  once MCP/CLI is available to catch anything beyond the search_path fix already applied.

---

## Notes for Next Session
_Cursor should leave a note here at the end of each working session summarizing where things are and what to do next._

Phase 1 foundation scaffolding is done: Next.js 14 + TypeScript + Tailwind + shadcn/ui are
installed and configured with the design tokens, and the root layout renders a placeholder
Navbar and Footer. `npm run build`, `npm run typecheck`, and `npm run lint` all pass.

Supabase is fully wired up: clients (`lib/supabase.ts` + `lib/supabase-server.ts` via
@supabase/ssr), and the full migration (9 tables + RLS + functions/triggers) is APPLIED and
verified on the hosted DB. Apply future schema changes with `npm run db:migrate` (uses
`DATABASE_URL` in `.env.local`, direct host db.<ref>.supabase.co:5432). No Clerk anywhere.

Auth is done: `middleware.ts` refreshes sessions, `lib/auth.ts` exposes signUp/signIn/signOut/
getSession/getUser, and the login/signup pages are styled with the design system. The repo is
connected to GitHub (TimVanC/stier) and `main` is up to date.

Phase 2 (Core Browsing) is complete and fully populated from `lib/seed-data.ts`: homepage
(hero + featured + rising), category list (live search/sort), ranked category page
(sort/filter + sidebar), and product detail (review summary + reviews + related + mobile
sticky buy). All 46 routes build; category/product pages are statically generated.

IMPORTANT for next session: the UI currently reads from the local seed module, NOT Supabase.
Phase 3 should (1) wire `VoteButtons` to real Supabase votes (one per user) + the sign-up
modal, and (2) start replacing seed reads with DB queries (plus a seed script to load the
sample data into Supabase). The Navbar still needs a mobile hamburger menu. `/search`,
`/submit`, `/profile/*`, `/forgot-password`, `/terms`, `/privacy` are linked but not built yet.
Use `npm run dev` to view.
