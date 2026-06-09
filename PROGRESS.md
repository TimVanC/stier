# Stier — Build Progress

## Status: Phase 7 — Admin Panel (complete) · Browsing on Supabase (complete)

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

## Copy (Jun 9)
- [x] Hero headline → "Stop searching." / "Start finding." (two lines, "finding." in coral `#ff7f81`)

## Homepage & Nav Polish (Jun 9)
- [x] **Hero stack cards** — rebuilt right-side preview as 3 stacked, rotated cards with depth/shadow/float animation matching `homepage_mockup.html` (`HeroStackCards.tsx`)
- [x] **Climbing the rankings** — rebuilt cards from reference: oversized rank (coral #1), tier pill top-right, image, brand/name, meta row, vote controls + rank change foot (`ClimbingProductCard.tsx`)
- [x] **Nav pages** — `/for-you`, `/trending`, `/new` with seed data; week/month toggle on trending
- [x] **Nav dropdowns** — subcategories → ranked lists (e.g. `/categories/over-ear-headphones`); parent labels → grid pages (e.g. `/categories/audio`) via `lib/nav-catalog.ts`
- [x] **For-you note** — real personalization deferred to Phase 9 (seed suggestions only for now)
- [x] **Ranked sidebar** — "On the rise" + "Falling" momentum sections below category stats
- [x] **Ranked filters** — All pill, tier dropdown (S+–F), price min/max, Reset when active

## Homepage Polish Fixes (Jun 9)
- [x] **Hero stack cards** — middle + back cards fully populated from seed data (tier badge, brand, name, weekly votes); reference-style 30px tier badges + hatch thumbs
- [x] **Sidebar momentum** — "On the rise" / "Falling" entries show `Brand · Product Name`
- [x] **Filter bar** — "All" pill on sort row (resets sort to Top Ranked); tier dropdown + price inputs styled with shadcn Input; coral text Reset when tier/price filters active
- [x] **Climbing the rankings** — `ClimbingProductCard` rebuilt to match reference `.pcard` (rank/tier overlay, 200px hatch image, body meta row, foot votes + rank change)

## Security Audit & Hardening (Jun 9)
Migration: `supabase/migrations/20260609214500_security_hardening.sql` (applied + verified).

- [x] **Admin route protection** — `app/admin/layout.tsx` runs `requireAdmin()` (server) on every request via the `is_admin()` SQL fn; non-admins redirect to `/`. Defense-in-depth: middleware also gates `/admin/*` server-side. No client-side role trust.
- [x] **Rate limiting** — `record_user_action()` (SECURITY DEFINER, keyed to `auth.uid()`) + `user_action_events` table; `lib/rate-limit.ts`. Votes 50/hr, reviews 5/day, product submissions 10/day. Enforced inside each server action.
- [x] **Input sanitization** — `lib/sanitize.ts` strips HTML tags + control chars and caps length on all free text (review body/title/pros/cons, product name/brand/description). Applied in the review/product server actions.
- [x] **Auth middleware** — `middleware.ts` calls `getUser()` (revalidates token with Auth server, not just cookie read) on every matched request; expired/tampered sessions are refreshed or cleared via `@supabase/ssr` cookie handling.
- [x] **API/server-action protection** — every writing action (`votes`, `reviews`, `products`, image upload) verifies `getUser()` server-side and derives identity from the session. The client never supplies user/profile ids.
- [x] **Username validation** — app-level regex in `signUp` + `SignupForm` (`[A-Za-z0-9_]{3,20}`); DB CHECK `profiles_username_format` + case-insensitive unique index `profiles_username_lower_key`.
- [x] **Image upload security** — private `product-images` bucket (signed URLs only); `uploadProductImage` validates MIME allowlist + 5 MB cap server-side; bucket also enforces size/MIME; RLS confines users to their `<uid>/` folder; reads via 60s signed URLs.
- [x] **Env var audit** — zero `SUPABASE_SERVICE_ROLE_KEY` references in any source file (grep clean); key lives only in gitignored `.env.local`. App uses the anon key + RLS everywhere; service role intentionally unused.
- [x] **Security headers** — `next.config.mjs`: CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- [x] **Votes manipulation** — DB `unique(user_id, product_id)` enforced; `castVote` upserts with `user_id` from session only.

### Flagged (recommendations, not blocking)
- CSP `script-src` includes `'unsafe-inline' 'unsafe-eval'` because Next.js injects inline hydration scripts (and eval in dev) without a nonce pipeline. Tightening would require a nonce/middleware CSP setup.
- [x] `next.config.mjs` image `remotePatterns` narrowed to Supabase storage host (`ytczqoyrtblbqihvrdp.supabase.co/storage/v1/object/**`) only

---

## Phase 3 — Voting (Jun 9)
- [x] **DB catalog seed** — `scripts/seed-catalog.mjs` + `scripts/catalog-seed-data.json`; 8 categories + 35 products with deterministic UUIDs (`lib/db/uuid.ts`) matching seed slugs; `npm run db:seed`
- [x] **Realtime** — `votes` table added to `supabase_realtime` publication (`20260610190000_votes_realtime.sql`)
- [x] **VoteButtons → Supabase** — `castVote` / `removeVote` server actions; optimistic UI; active up/down state; click same button removes vote; switch vote on opposite click; rate-limited server-side
- [x] **Sign-up modal** — anonymous vote clicks open `SignUpModal` (embedded sign-up form + Log in button; no hard redirect); `AuthGateProvider` on ranked + product pages
- [x] **Live tallies** — server `getVoteSnapshot()` on page load; user votes fetched and reflected in button active state
- [x] **Category realtime** — `RankedList` subscribes to all product votes in the category; tallies refresh when other users vote
- [x] **Live rankings** — `lib/recompute-rankings.ts` recalculates score, rank, and relative tier after each vote (via `mergeVoteSnapshot` + client-side updates in `RankedList` / `ProductVoteProvider`)
- [x] Wired on **ranked category page** (`ProductRow` / `RankedList`) and **product detail page** (`ProductDetailVoteActions` + live tier/rank badge + stats bar)
- [x] Homepage `ProductCard` shows static vote count only (card is a link — voting happens on detail/list pages)

---

## Phase 4 — Reviews (Jun 9)
Migration: `supabase/migrations/20260610193000_review_helpful_rpc.sql` (applied).

- [x] **Review form** — `ReviewForm` on product detail: star rating, headline, body, pros/cons, owns-product; calls `submitReview` / `updateReview` / `deleteReview`
- [x] **DB reads** — `getProductReviewBundle()` loads reviews + stats + current user's review; `getReviewCounts()` for list/card counts
- [x] **Review counts** — live counts on `ProductRow`, `ProductCard`, product detail header/stats (merged into ranking recompute on category page)
- [x] **Sort** — Most Helpful, Most Recent, Highest Rated, Lowest Rated (client-side on DB-loaded reviews)
- [x] **Helpful votes** — `markReviewHelpful` via `increment_review_helpful()` SECURITY DEFINER RPC
- [x] **Reporting** — `reportReview` inserts into `reports` table
- [x] **Auth gate** — anonymous "Write a review" opens the same `SignUpModal` as voting
- [x] **One review per user** — DB unique `(user_id, product_id)` + upsert error handling
- [x] **Edit / delete** — owners edit inline form or delete from form; RLS enforces ownership

---

## Phase 5 — Submissions (Jun 9)
- [x] **`/submit` page** — auth required (redirect to `/login?next=/submit`); form submits via `submitProduct` as `pending`
- [x] **Image upload** — optional file upload to private `product-images` bucket via `uploadProductImage`
- [x] **Success state** — confirmation + links to `/profile/submissions` and browse categories
- [x] **Duplicate detection** — `checkProductDuplicate` warns before insert; user can confirm with `allowDuplicate` (unique slug suffix)
- [x] **`/profile/submissions`** — table of user's submissions with pending / approved / rejected status

---

## Phase 6 — User Dashboard (Jun 9)
Migration: `supabase/migrations/20260610200000_avatars_bucket.sql` (applied).

- [x] **`/profile/[username]`** — public profile from Supabase; real review, submission, and vote counts; private profile gate; public reviews, lists, and approved submissions
- [x] **`/profile/lists`** — create, rename, delete `saved_lists`; add/remove products via `saved_list_items`; public/private visibility toggle
- [x] **`/profile/upvotes`** — all upvoted products from `votes` table; remove upvote action
- [x] **`/profile/submissions`** — user submissions with pending/approved/rejected badges; rejection reason when provided
- [x] **`/profile/reviews`** — all user reviews with edit (ReviewForm) and delete
- [x] **`/profile/settings`** — display name, username, avatar upload (public `avatars` bucket), password change, profile visibility toggle, delete account with DELETE confirmation
- [x] **Dashboard layout** — shared `ProfileDashboardNav` across all `/profile/*` dashboard routes; auth redirect to `/login?next=…`

---

## Phase 7 — Admin Panel (Jun 9)
Migration: `supabase/migrations/20260610210000_profile_ban.sql` (applied).

- [x] **`/admin` dashboard** — real counts: pending submissions, flagged reviews, total products, categories, users; quick links to each section
- [x] **`/admin/submissions`** — pending submissions oldest first; approve → `approved` (live immediately); reject modal with optional `rejection_reason`
- [x] **`/admin/categories`** — create, edit, delete (empty only), toggle `is_featured` and `is_active`
- [x] **`/admin/reviews`** — flagged reviews from `reports` table; keep (dismiss) or remove review actions
- [x] **`/admin/users`** — searchable user list with activity stats; ban/unban (`is_banned`); clear all votes
- [x] **Ban enforcement** — banned users blocked from voting, reviewing, and submitting

---

## Supabase Catalog Migration (Jun 9)

- [x] **`lib/db/catalog.ts`** — categories, ranked products, and product detail from Supabase with seed fallback when DB is empty
- [x] **`/categories`** — category list reads active categories + live stats from DB
- [x] **`/categories/[slug]`** — ranked list loads approved `products` for the category, merges live votes/reviews/tiers
- [x] **`/categories/[slug]/[product-slug]`** — product detail from approved products table (real UUIDs)
- [x] **Homepage featured** — `FeaturedCategories` reads `is_featured = true` categories from Supabase
- [x] **Vote bundle fix** — `lib/db/vote-types.ts` keeps client components out of server-only Supabase imports
- [x] **`generateStaticParams` removed** — category + product detail routes are `force-dynamic`; static param generation was calling Supabase via `cookies()` outside a request scope (500 on first compile)

---

## In Progress
- [ ] Phase 8 — Waitlist

---

## Up Next
1. Waitlist page + email capture (Phase 8)
2. Wire remaining seed-data pages (hero stats, rising, trending, for-you) to Supabase
3. Phase 9 — personalized For You feed
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
- [x] Vote buttons component (Supabase-backed)
- [x] Authenticated voting with sign up modal
- [x] One vote per user constraint (DB unique + upsert)
- [x] Ranking score calculation (existing `lib/ranking.ts`; tiers still from seed until full DB ranking)
- [x] Top and Rising sort (client-side on seed ranks; vote counts live from DB)
- [x] Real time vote updates (Supabase Realtime on `votes`)

### Phase 4 — Reviews
- [x] Review form component (Supabase insert/update/delete)
- [x] Reviews display on product pages (from DB)
- [x] Review count on product cards and ranked rows (from DB)
- [x] Review sort options (helpful, recent, highest, lowest)
- [x] Helpful vote + report actions
- [x] Sign-up modal gate for anonymous reviewers

### Phase 5 — Submissions
- [x] Submit product page (`/submit`) with Supabase insert as pending
- [x] Image upload to private storage bucket
- [x] Success confirmation + link to `/profile/submissions`
- [x] Duplicate name + brand detection with confirm-to-submit
- [x] Auth redirect for anonymous users
- [x] Admin submission queue approve/reject flow

### Phase 6 — User Dashboard
- [x] User profile page (public)
- [x] My Lists
- [x] My Upvotes
- [x] My Submissions
- [x] My Reviews
- [x] Settings page

### Phase 7 — Waitlist
- [ ] Waitlist page
- [ ] Email capture
- [ ] Product suggestion form
- [ ] Waitlist position counter

### Phase 8 — Admin
- [x] Admin dashboard
- [x] Submission queue
- [x] Category management
- [x] Review moderation
- [x] User management

### Phase 9 — Polish
- [ ] **Personalized For You feed** (replace seed suggestions on `/for-you`)
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
| Jun 9 | Helpful count bumped via `increment_review_helpful()` RPC | Users cannot UPDATE others' review rows under RLS; SECURITY DEFINER keeps the increment safe |
| Jun 9 | Live vote tallies merged into ranked lists via `getVoteSnapshot` + `mergeVoteSnapshot`; tiers/ranks recomputed with `recomputeRankedProducts` after each vote | Keeps relative percentile tier logic accurate while review/recency data still comes from seed |
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
| app/categories/[slug]/page.tsx | Ranked category page (dynamic + metadata) |
| app/categories/[slug]/[product-slug]/page.tsx | Product detail (dynamic + metadata) |
| lib/db/catalog.ts | Supabase catalog reads with seed fallback |
| lib/db/vote-types.ts | Client-safe vote types (no server imports) |
| components/home/* | Hero, FeaturedCategories, RisingThisWeek |
| components/category/* | CategoryCard, CategoryBrowser |
| lib/recompute-rankings.ts | Re-sort category products and assign tiers from live vote tallies |
| lib/db/categories.ts, submissions.ts | Category dropdown + user submission reads |
| lib/actions/products.ts | Submit, upload, duplicate check |
| components/submit/SubmitProductForm.tsx | Submit form + success state |
| app/submit/page.tsx | Auth-gated submit page |
| app/profile/(dashboard)/* | Lists, upvotes, submissions, reviews, settings dashboard pages |
| app/profile/[username]/page.tsx | Public profile with stats, reviews, lists, submissions |
| components/profile/* | ProfileDashboardNav, ListsManager, UpvotesList, UserReviewsManager, SettingsForm |
| lib/db/profile.ts, lists.ts, upvotes.ts, user-reviews.ts | Profile, lists, upvotes, and user-review reads |
| lib/actions/profile.ts, lists.ts | Profile settings, avatar upload, account delete, saved-list CRUD |
| lib/auth-guard.ts, lib/supabase-admin.ts | Auth redirect helper + service-role client for account deletion |
| app/admin/* | Dashboard, submissions, categories, reviews, users |
| components/admin/* | AdminNav, SubmissionQueue, CategoryManager, FlaggedReviewsManager, UserManager |
| lib/db/admin.ts, lib/actions/admin.ts, lib/ban.ts | Admin reads, moderation actions, ban checks |
| supabase/migrations/20260610210000_profile_ban.sql | `is_banned` on profiles + admin profile update policy |
| lib/actions/reviews.ts, review-read.ts | Submit/update/delete/helpful/report + client refresh |
| components/review/* | ReviewForm, ReviewCard, ProductReviewsBlock, StarRatingInput, Stars |
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

Phase 2 (Core Browsing) is complete. Category list, ranked lists, product detail, and
homepage featured categories read from Supabase via `lib/db/catalog.ts` (seed fallback
when DB is empty). Homepage hero stats, rising section, hero stack cards, nav parent
grids, and `/for-you` / `/trending` / `/new` still use seed data.

Phase 3 (Voting) is complete: VoteButtons call Supabase server actions with optimistic UI,
sign-up modal for anonymous users, category-level realtime on ranked lists, and live
tier/rank recalculation via `recomputeRankedProducts`. Product detail tier badge and
rank update after votes.

Phase 4 (Reviews) is complete: review form on product detail writes to Supabase,
reviews/stats load from DB, counts on cards and ranked rows, sort + helpful + report
actions wired, one-review-per-user enforced, edit/delete for owners.

Phase 5 (Submissions) is complete: `/submit` form writes pending products to Supabase
with optional image upload, duplicate warning, and `/profile/submissions` tracking.

Phase 6 (User Dashboard) is complete: public profile at `/profile/[username]` with
real stats; dashboard pages for lists, upvotes, submissions, reviews, and settings —
all wired to Supabase with auth redirects. Avatar uploads use the public `avatars` bucket;
account deletion requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.

Phase 7 (Admin Panel) is complete: `/admin` dashboard with live stats; submission
queue with approve/reject; category CRUD; flagged review moderation; user search with
ban and clear-votes actions. Ban enforcement blocks votes, reviews, and submissions.

Browsing reads from Supabase: category list, ranked lists, product detail, and homepage
featured categories. Seed data is fallback only when the DB returns empty. Category and
product routes are `force-dynamic` (no `generateStaticParams`).

**Still on seed data:** hero stats (`getSiteStats`), hero stack cards, rising this week,
`/for-you`, `/trending`, `/new`, nav parent grid previews (`ParentCategoryGrid`).

Phase 8 next: waitlist page. Use `npm run dev` to view.
