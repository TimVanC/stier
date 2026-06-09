# Stier — Product Planning Document

## What is Stier?
Stier (pronounced "steer") is a community-powered product discovery and ranking platform. The name is a play on tier lists where "S" is the highest tier. Users vote on the best products in specific categories, surfacing hidden gems that deep research uncovers — not sponsored or SEO-optimized recommendations.

The founding insight: finding the best products often requires hours of Reddit threads, YouTube videos, and TikTok reviews. Stier crowdsources that research so the next person doesn't have to do it alone.

**Domain:** stierapp.com (stier.com to be acquired later)
**Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, Vercel

---

## User Roles

### Anonymous (not logged in)
- Can view everything: all products, categories, rankings, reviews, vote counts
- Cannot: vote, review, save products, submit products
- Any action requiring auth triggers a sign up modal (never a hard redirect)

### Logged In User
- Full browsing plus: vote, review, save to lists, submit products
- Has personal dashboard pages under /profile

### Admin
- All user permissions plus: approve/reject submissions, manage categories, moderate reviews, manage users
- Identified by role field in profiles table

---

## Build Phases

### Phase 1 — Foundation
- Next.js app setup
- Tailwind + shadcn/ui
- Supabase project, schema, RLS
- Auth (email/password)
- Seed categories and products

### Phase 2 — Core Browsing
- Homepage
- Category list page
- Ranked category page
- Product detail page

### Phase 3 — Voting
- Authenticated voting
- One vote per user per product
- Ranking score calculation
- Top and Rising sorting

### Phase 4 — Reviews
- Review form
- Reviews on product pages
- Review count on cards

### Phase 5 — Submissions
- Submit product page
- Pending moderation state
- Admin approval flow

### Phase 6 — User Dashboard
- Profile page
- My Lists
- My Upvotes
- My Submissions
- My Reviews
- Settings

### Phase 7 — Polish and Launch
- Mobile UI improvements
- Empty states
- Loading states
- SEO metadata
- Analytics
- Error handling
- Final seeded categories

---

## Screen Map

### PRE-LAUNCH
- Waitlist page (replaces homepage until launch)

### PUBLIC (post-launch)
- Homepage
- Category List
- Ranked Category Page
- Product Detail Page
- Search Results
- Login
- Signup

### LOGGED IN
- All public pages with interactions unlocked
- Submit a Product
- Public/Private Profile Page
- My Lists
- My Upvotes
- My Submissions
- My Reviews
- Settings

### ADMIN
- Admin Dashboard
- Submission Queue
- Category Management
- Review Moderation
- User Management

---

## Screen Specifications

---

### WAITLIST PAGE
**Path:** `/`
**Purpose:** Capture emails and product suggestions before launch. Validate interest and solve cold start by collecting community-suggested products.

**Desktop Layout:**
- Nav: logo pill left, Join Waitlist CTA right
- Hero left: "Coming Soon" badge, headline, subheadline, email capture, waitlist position counter
- Hero right: floating tier list mockup card
- Three benefit blocks below the fold
- Product submission form: "What should we rank first?" with product name, category, optional notes
- Live feed of recently submitted product suggestions

**Mobile Layout:**
- Stacked: headline, subheadline, email input full width, CTA full width
- Counter below CTA
- Benefits stacked
- Submission form full width below

**Key Interactions:**
- Email submit shows position number ("You're #247 on the waitlist")
- Share/referral link shown after signup
- Product suggestion form stores to waitlist table in Supabase
- Counter updates in real time

---

### HOMEPAGE
**Path:** `/` (post-launch, waitlist moves to /waitlist)
**Purpose:** Explain Stier, push users into categories, surface active rankings and rising products.

**Desktop Layout:**

Nav:
- Logo pill (left)
- Search bar (center, prominent)
- Browse, Lists, Log In, Sign Up button in coral (right)
- Secondary nav row: For You, Trending, New Rankings, category links

Hero:
- Left: headline, subheadline, search bar, popular category chips (horizontal scroll)
- Right: floating live tier list card showing real ranked category data
- Stats bar: ranked products count, community lists, votes cast, 0 affiliate links
- Social proof: "As seen on Hacker News, The Verge" (when applicable)

Featured Categories:
- Section header: "What the community is ranking right now"
- Browse all link (right aligned)
- Large featured card (left): dark navy background, shows ranked products inside with vote counts
- Smaller cards (right column): Headphones, Winter Jackets
- Bottom row: Running Shoes, Slippers, Cast Iron Skillets
- Tier legend bar: S = Best in class, A = Excellent, B = Solid pick, C = Niche/Acceptable

Rising This Week:
- Section header: "Climbing the Rankings"
- Subheadline: "Products moving up fast. Voted by the community in the last 7 days."
- Horizontal scroll row of product cards
- Each card: rank number, tier badge, product image, brand, name, category, price, vote count, rank change this week
- See all link

Footer:
- Logo + tagline + email capture (left)
- Explore: Browse categories, Trending, New rankings
- Community: Start a tier list, Voting guide, Moderators, Manifesto
- Company: About, How rankings work, Contact, Press kit
- Bottom bar: copyright, Privacy, Terms, RSS, Status

**Mobile Layout:**
- Nav: logo left, search icon right (expands on tap), hamburger menu
- Hero stacked: headline, subheadline, search bar, category chips (horizontal scroll), tier card full width below
- Stats bar: 2x2 grid
- Featured categories: large card full width, smaller cards full width stacked or horizontal scroll
- Tier legend: 2x2 grid
- Rising section: same horizontal scroll, swipeable cards
- Footer: stacked columns, accordion optional

**Key Interactions:**
- Search bar most prominent interactive element
- Category chips horizontally scrollable
- Floating tier list card shows real data
- Rising cards horizontally scrollable with scroll indicator
- Sign Up CTA in nav and hero
- Anonymous users: voting and saving locked, clicking triggers sign up modal

---

### CATEGORY LIST PAGE
**Path:** `/categories`
**Purpose:** Let users explore all available categories. Should feel organized and alive, not like a directory.

**Desktop Layout:**

Header:
- Headline: "Browse all categories"
- Subheadline: "From coffee beans to winter jackets — ranked by people who actually own them"
- Search/filter bar (filters grid in real time)
- Sort chips: Popular, New, Most Active, Alphabetical

Featured Categories Row:
- 3-4 curated larger cards (admin controlled via is_featured flag)
- Each: background image or color, category name, product count, vote count, top ranked product name
- These are the best/most seeded categories

Full Category Grid:
- 3-4 columns
- Each card: category name, icon/image, product count, vote count, top ranked product + tier badge, "View rankings" link

Recently Added:
- Horizontal scroll row of new categories
- Smaller cards, simple format

**Mobile Layout:**
- Search bar full width
- Sort chips horizontal scroll
- Featured categories: horizontal scroll row
- Main grid: 2 columns
- Recently added: horizontal scroll

**Key Interactions:**
- Search filters grid in real time (no page reload)
- Sort chips update grid order instantly
- Clicking any card goes to ranked category page
- Featured row admin controlled
- No restrictions for anonymous users

---

### RANKED CATEGORY PAGE
**Path:** `/categories/[slug]`
**Purpose:** Core page of the product. Must feel more trustworthy and useful than anything else for this query. Someone landing from Google searching "best headphones" should immediately see value.

**Desktop Layout:**

Breadcrumb: Home > Categories > [Category Name]

Header:
- Category name (large, bold)
- Short description
- Total votes, product count, last updated
- Sort controls (right): Top Ranked, Rising, Most Reviewed, Newest
- Filter chips: All, S Tier, A Tier, B Tier, Under $50, Under $100, Under $200

Product List:
Each card contains:
- Rank number (large, left)
- Product image
- Product name + brand
- Tier badge (S/A/B/C/D/F in pastel tier colors)
- Score and vote count
- Upvote / downvote buttons
- Review count
- Save to list button
- Buy button (affiliate link, opens new tab)
- Rank change indicator (↑3 or ↓1 this week)

#1 product gets elevated treatment: larger card, subtle highlight

Sidebar (desktop only):
- Category stats
- Top reviewer in category
- Related categories
- "Submit a missing product" CTA

Submit Banner (bottom of list):
- "Don't see a product that belongs here?"
- Link to submit form (auth required)

**Mobile Layout:**
- Breadcrumb simplified
- Header stacked, sort and filter as horizontal scroll chips
- Product cards full width, more compact
- Rank number left, image, name, brand, tier badge
- Upvote/downvote prominent and thumb-friendly (min 44px targets)
- Save and Buy below
- No sidebar — related categories move to bottom of page

**Key Interactions:**
- Sort and filter update list without page reload
- Votes update in real time (Supabase real-time)
- Anonymous vote click triggers sign up modal
- Already voted: button shows active state, click again removes vote
- Save button opens modal to pick which list
- Buy button opens affiliate link in new tab
- Pagination (not infinite scroll) for SEO
- Rank change indicators show week-over-week movement

**Empty State:**
- "This category is being built — submit the first product"
- CTA to submit

---

### PRODUCT DETAIL PAGE
**Path:** `/categories/[slug]/[product-slug]`
**Purpose:** Every product gets its own SEO-indexed page. Deep reviews, full context, voting, and a clear path to buy.

**Desktop Layout:**

Breadcrumb: Home > Categories > [Category] > [Product Name]

Header (two column):
- Left: product image (large)
- Right: product name, brand, category breadcrumb, tier badge, score + total votes, upvote/downvote, save to list, Buy button (coral, prominent), rank position "#1 in Headphones"

Stats Bar:
- Total votes, review count, average rating, rank position, rank change this week

Review Summary:
- Overall rating visual
- Pros summary (most mentioned from reviews)
- Cons summary (most mentioned from reviews)
- Rating breakdown bar chart (5 star to 1 star)

Reviews Section:
Each review card:
- Username + avatar
- Rating (stars)
- Review title
- Review body
- Pros and cons
- "Owns this product" badge
- Helpful vote count
- Date posted
- Report button (small, subtle)

Sort reviews: Most Helpful, Most Recent, Highest Rated, Lowest Rated

Write a Review button:
- Logged in: opens review form inline or modal
- Anonymous: triggers sign up modal

Review Form:
- Star rating selector
- Title field
- Body field
- Pros field
- Cons field
- "I own this product" checkbox
- Submit button

Related Products:
- "Other top products in [Category]"
- 3-4 cards horizontal scroll

**Mobile Layout:**
- Product image full width at top
- All header content stacked below
- Buy button STICKY at bottom of screen (most important mobile pattern)
- Stats bar scrollable or 2x2 grid
- Review summary full width
- Reviews stacked full width
- Related products horizontal scroll

**Key Interactions:**
- Buy button sticky on mobile
- Real time vote updates
- Review form validates before submit
- Helpful vote button on each review
- Report button on each review
- Anonymous actions all trigger sign up modal

---

### SEARCH RESULTS PAGE
**Path:** `/search?q=[query]`
**Purpose:** Fast, clean results across products and categories when users search.

**Desktop Layout:**
- Search bar at top with current query pre-filled
- Two columns: Products (wider, left) | Categories (narrower, right)
- Filter by category chips
- Sort: Most Relevant, Top Ranked, Most Voted

Product result card:
- Product image, name, brand, category, tier badge, vote count, link to product page

Category result card:
- Category name, product count, top ranked product, link to category page

**Mobile Layout:**
- Tabs: Products | Categories
- Full width results under active tab
- Filter chips horizontal scroll

**Empty State:**
- "No results for [query]"
- Suggest similar categories
- CTA to submit the product if it doesn't exist yet

---

### LOGIN PAGE
**Path:** `/login`
**Purpose:** Fast, clean sign in. Minimal friction.

**Desktop:** Centered card on light background
**Mobile:** Full screen, no card border

Content:
- Stier logo
- Headline: "Welcome back"
- Email field
- Password field
- Forgot password link
- Log In button (coral, full width)
- "Don't have an account? Sign up" link
- Subtle tier bars accent from logo (decorative)

---

### SIGNUP PAGE
**Path:** `/signup`
**Purpose:** Fast, clean account creation.

**Desktop:** Centered card on light background
**Mobile:** Full screen

Content:
- Stier logo
- Headline: "Join the community"
- Email field
- Username field
- Password field
- Sign Up button (coral, full width)
- "Already have an account? Log in" link
- Terms and privacy notice (small, below button)
- Subtle tier bars accent

---

### SUBMIT A PRODUCT PAGE
**Path:** `/submit`
**Auth required:** Yes (redirect to login if not authenticated)
**Purpose:** Let logged in users suggest missing products. Goes into pending state for admin approval.

**Desktop:** Centered form, medium width
**Mobile:** Full width stacked form

Form fields:
- Product name (required)
- Brand (required)
- Category (required, searchable dropdown)
- Product URL (required)
- Image upload OR image URL
- Short description (required)
- Why does this belong on Stier? (optional)
- Submit button (coral)

Post-submit state:
- Success message: "Thanks — your submission is in review"
- Link to view their submissions
- CTA to keep browsing

---

### USER PROFILE PAGE (PUBLIC)
**Path:** `/profile/[username]`
**Purpose:** Public facing profile showing a user's contributions. Builds community credibility.

**Visibility:** Controlled by is_private setting. If private, show "This profile is private" to other users.

**Desktop Layout:**
- Left column: avatar, username, joined date, stats (votes cast, reviews written, products submitted)
- Right column: tabbed content (Reviews, Public Lists, Approved Submissions)

**Mobile Layout:**
- Avatar and stats at top
- Tabs below: Reviews | Lists | Submissions

Notes:
- Reviews tab: all public reviews by this user
- Lists tab: public saved lists only
- Submissions tab: approved submissions only
- Pending and rejected submissions are never shown on public profile

---

### MY LISTS
**Path:** `/profile/lists`
**Auth required:** Yes

- "Create new list" button at top
- Each list card: name, product count, visibility badge (public/private), edit, delete
- Clicking a list shows all products in it with remove option
- Empty state: "You haven't saved any lists yet — start by saving a product"

---

### MY UPVOTES
**Path:** `/profile/upvotes`
**Auth required:** Yes

- Grid of all upvoted products
- Same card format as ranked list
- Remove upvote option
- Filter by category chips
- Empty state: "Products you upvote will appear here"

---

### MY SUBMISSIONS
**Path:** `/profile/submissions`
**Auth required:** Yes

- List of all submitted products
- Each item: product name, category, submission date, status badge (Pending / Approved / Rejected)
- Rejected items show reason if admin provided one
- Empty state: "You haven't submitted any products yet"
- CTA to submit a product

---

### MY REVIEWS
**Path:** `/profile/reviews`
**Auth required:** Yes

- List of all reviews written by user
- Each: product name, rating, review title, date, helpful vote count
- Edit and delete options
- Empty state: "You haven't written any reviews yet"

---

### SETTINGS
**Path:** `/profile/settings`
**Auth required:** Yes

Sections:
- Display name
- Username
- Avatar upload
- Email address
- Password change
- Profile visibility toggle: Public / Private
  - Note: even private profiles still show reviews on product pages (accountability)
- Email notification preferences
- Delete account (bottom of page, subtle but present, requires confirmation)

---

### ADMIN DASHBOARD
**Path:** `/admin`
**Auth required:** Admin role only. Redirect non-admins to homepage.
**Purpose:** Simple overview and quick access to admin tasks.

Content:
- Pending submissions count (most important number, shown prominently)
- Flagged reviews count
- Stats: total products, categories, users
- Quick links to each admin section

---

### ADMIN — SUBMISSION QUEUE
**Path:** `/admin/submissions`
**Purpose:** Most used admin page. Approve or reject submitted products.

Layout (desktop and mobile):
- Filter: All, Pending, Approved, Rejected
- Filter by category, date, user
- List oldest first (FIFO)
- Each item: product name, brand, category, submitted by username, date, product URL (opens new tab), image preview
- Approve button (green) and Reject button (red)
- Reject opens a small modal with optional reason field
- Approved products go live immediately in their category

---

### ADMIN — CATEGORY MANAGEMENT
**Path:** `/admin/categories`
**Purpose:** Add, edit, and manage categories.

Layout:
- Add new category button
- List of all categories
- Each: name, slug, product count, featured toggle (is_featured), active toggle (is_active)
- Edit: name, description, image, slug
- Delete: only allowed if category has zero products

---

### ADMIN — REVIEW MODERATION
**Path:** `/admin/reviews`
**Purpose:** Handle flagged reviews.

Layout:
- Filter: Flagged, Removed, All
- Each flagged item: review content, product it belongs to, reporter's reason, date flagged
- Actions: Keep (dismiss flag) or Remove review

---

### ADMIN — USER MANAGEMENT
**Path:** `/admin/users`
**Purpose:** Handle abuse cases. Kept minimal.

Layout:
- Searchable user list
- Each user: username, join date, submission count, review count, vote count
- Actions: Ban user, Clear votes (for manipulation cases)

---

## Key Product Decisions

1. Anonymous users can see everything — no paywalls on discovery, only on interaction
2. Voting triggers sign up modal, never a hard redirect
3. One vote per user per product enforced at database AND application level
4. Product submissions always go through admin approval before going live
5. Rankings use pagination not infinite scroll (SEO priority)
6. Private profiles still show reviews on product pages (accountability)
7. Admin uses simple protected pages, not a custom dashboard
8. Supabase handles auth, database, AND storage — no Clerk, no Cloudinary
9. Buy links are affiliate links controlled entirely by the site owner
10. Monetization never touches rankings — trust is the core asset

---

## Monetization Phases
1. Launch free, build trust — no monetization
2. Affiliate links on buy buttons (Amazon Associates, Impact, ShareASale)
3. Premium user features (advanced filters, unlimited lists)
4. Brand partnerships (enhanced product pages, clearly labeled category sponsorship — never ranking influence)
5. Data insights (trend reports, category sentiment for brands)
