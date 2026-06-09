# Stier — Build Progress

## Status: Phase 1 — Foundation (in progress)

---

## Completed
- [x] Next.js 14 (App Router) + TypeScript (strict) project initialized
- [x] Tailwind CSS configured with the .cursorrules design tokens
- [x] shadcn/ui configured (components.json, `cn` util, base Button component)
- [x] Root layout with Inter (body) + local Satoshi (display) fonts, globals.css, design tokens
- [x] Placeholder Navbar (search, primary nav, secondary category row) and Footer
- [x] Homepage placeholder using brand tokens
- [x] Supabase clients: `lib/supabase.ts` (browser) + `lib/supabase-server.ts` (server w/ cookies)
- [x] `@supabase/supabase-js` and `@supabase/ssr` installed
- [x] Full DB migration authored AND **applied** (9 tables + RLS): `supabase/migrations/20260609030500_initial_schema.sql`
- [x] Schema verified: all 9 tables have RLS enabled with policies; `is_admin`/`handle_new_user`/`set_updated_at` functions present (search_path pinned)
- [x] `npm install`, typecheck, lint, and production build all passing

---

## In Progress
- [ ] Configure Supabase Auth (email/password) + middleware for session refresh

---

## Up Next
1. Configure Supabase Auth (email/password) + auth middleware (`middleware.ts`) for session refresh
2. Build login / signup pages
3. Seed categories and products
4. Set up Vercel deployment + connect GitHub repo

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
- [ ] Supabase Auth configuration
- [x] Root layout with Navbar and Footer components
- [ ] Vercel project connected to GitHub

### Phase 2 — Core Browsing
- [ ] Homepage
- [ ] Category list page
- [ ] Ranked category page
- [ ] Product detail page
- [ ] Basic product cards
- [ ] Category cards
- [ ] Seed data (categories and products)

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

Next session: (1) configure Supabase Auth (email/password) and add `middleware.ts` to refresh
sessions, (2) build login/signup pages with the sign-up modal pattern, (3) seed categories +
products, (4) generate TypeScript types from the DB (`types/index.ts`). The Navbar/Footer are
still placeholders (need a mobile hamburger menu + real search). Use `npm run dev` to view.
