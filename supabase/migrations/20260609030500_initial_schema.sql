-- Stier — initial schema
-- Tables: profiles, categories, products, votes, reviews, saved_lists,
--         saved_list_items, waitlist, reports
-- Auth/RLS model derived from .cursorrules + PLANNING.md.

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

-- Generic updated_at maintenance trigger.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null unique references auth.users (id) on delete cascade,
  display_name text,
  username     text unique,
  avatar_url   text,
  role         text not null default 'user' check (role in ('user', 'admin')),
  is_private   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name, username, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references public.categories (id) on delete cascade,
  name             text not null,
  slug             text not null,
  brand            text,
  description      text,
  image_url        text,
  product_url      text,
  affiliate_url    text,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  submitted_by     uuid references public.profiles (id) on delete set null,
  rejection_reason text,
  created_at       timestamptz not null default now(),
  unique (category_id, slug)
);

create index if not exists products_category_id_idx on public.products (category_id);
create index if not exists products_status_idx on public.products (status);

-- ---------------------------------------------------------------------------
-- votes (one vote per user per product)
-- ---------------------------------------------------------------------------
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  vote_type  text not null check (vote_type in ('upvote', 'downvote')),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists votes_product_id_idx on public.votes (product_id);

-- ---------------------------------------------------------------------------
-- reviews (one review per user per product)
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  product_id    uuid not null references public.products (id) on delete cascade,
  rating        integer not null check (rating between 1 and 5),
  title         text,
  body          text,
  pros          text,
  cons          text,
  owns_product  boolean not null default false,
  helpful_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists reviews_product_id_idx on public.reviews (product_id);

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- saved_lists
-- ---------------------------------------------------------------------------
create table if not exists public.saved_lists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  description text,
  visibility  text not null default 'private' check (visibility in ('private', 'public')),
  created_at  timestamptz not null default now()
);

create index if not exists saved_lists_user_id_idx on public.saved_lists (user_id);

-- ---------------------------------------------------------------------------
-- saved_list_items
-- ---------------------------------------------------------------------------
create table if not exists public.saved_list_items (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references public.saved_lists (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  added_at   timestamptz not null default now(),
  unique (list_id, product_id)
);

create index if not exists saved_list_items_list_id_idx on public.saved_list_items (list_id);
create index if not exists saved_list_items_product_id_idx on public.saved_list_items (product_id);

-- ---------------------------------------------------------------------------
-- waitlist
-- ---------------------------------------------------------------------------
create table if not exists public.waitlist (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,
  referral_code       text unique,
  referred_by         text,
  product_suggestions text,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- reports (review moderation)
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references public.reviews (id) on delete cascade,
  reporter_id uuid references auth.users (id) on delete set null,
  reason      text,
  status      text not null default 'open' check (status in ('open', 'dismissed', 'removed')),
  created_at  timestamptz not null default now()
);

create index if not exists reports_review_id_idx on public.reports (review_id);
create index if not exists reports_status_idx on public.reports (status);

-- ---------------------------------------------------------------------------
-- Admin helper (defined after tables so the SQL body can resolve profiles)
-- ---------------------------------------------------------------------------

-- Returns true when the current user has the 'admin' role.
-- SECURITY DEFINER so it bypasses RLS on profiles (prevents recursive policy
-- evaluation). search_path is pinned and execute is limited to app roles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = (select auth.uid())
      and p.role = 'admin'
  );
$$;

-- anon needs EXECUTE too: anonymous SELECT policies on categories/products
-- call is_admin() (it returns false when auth.uid() is null).
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.votes            enable row level security;
alter table public.reviews          enable row level security;
alter table public.saved_lists      enable row level security;
alter table public.saved_list_items enable row level security;
alter table public.waitlist         enable row level security;
alter table public.reports          enable row level security;

-- profiles: public read; owner (or admin) writes.
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "profiles_update_own_or_admin"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id or public.is_admin())
  with check ((select auth.uid()) = user_id or public.is_admin());

create policy "profiles_delete_own_or_admin"
  on public.profiles for delete to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

-- categories: active visible to everyone; admin sees all and manages.
create policy "categories_select_active_or_admin"
  on public.categories for select
  using (is_active or public.is_admin());

create policy "categories_admin_insert"
  on public.categories for insert to authenticated
  with check (public.is_admin());

create policy "categories_admin_update"
  on public.categories for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "categories_admin_delete"
  on public.categories for delete to authenticated
  using (public.is_admin());

-- products: approved visible to everyone; pending/rejected only to submitter
-- and admins. Submissions land as 'pending' and belong to the submitter.
create policy "products_select_visible"
  on public.products for select
  using (
    status = 'approved'
    or public.is_admin()
    or submitted_by = (select id from public.profiles where user_id = (select auth.uid()))
  );

create policy "products_insert_submitter"
  on public.products for insert to authenticated
  with check (
    public.is_admin()
    or (
      status = 'pending'
      and submitted_by = (select id from public.profiles where user_id = (select auth.uid()))
    )
  );

create policy "products_admin_update"
  on public.products for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete to authenticated
  using (public.is_admin());

-- votes: counts public; owner manages their single vote; admin can clear.
create policy "votes_select_all"
  on public.votes for select
  using (true);

create policy "votes_insert_own"
  on public.votes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "votes_update_own"
  on public.votes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "votes_delete_own_or_admin"
  on public.votes for delete to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

-- reviews: public read (even for private profiles); owner manages own; admin moderates.
create policy "reviews_select_all"
  on public.reviews for select
  using (true);

create policy "reviews_insert_own"
  on public.reviews for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "reviews_update_own_or_admin"
  on public.reviews for update to authenticated
  using ((select auth.uid()) = user_id or public.is_admin())
  with check ((select auth.uid()) = user_id or public.is_admin());

create policy "reviews_delete_own_or_admin"
  on public.reviews for delete to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

-- saved_lists: owner + public lists readable; owner manages.
create policy "saved_lists_select_visible"
  on public.saved_lists for select
  using (
    (select auth.uid()) = user_id
    or visibility = 'public'
    or public.is_admin()
  );

create policy "saved_lists_insert_own"
  on public.saved_lists for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "saved_lists_update_own"
  on public.saved_lists for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "saved_lists_delete_own"
  on public.saved_lists for delete to authenticated
  using ((select auth.uid()) = user_id);

-- saved_list_items: visible if the parent list is visible; owner manages.
create policy "saved_list_items_select_visible"
  on public.saved_list_items for select
  using (
    exists (
      select 1 from public.saved_lists l
      where l.id = list_id
        and (l.user_id = (select auth.uid()) or l.visibility = 'public' or public.is_admin())
    )
  );

create policy "saved_list_items_insert_own"
  on public.saved_list_items for insert to authenticated
  with check (
    exists (
      select 1 from public.saved_lists l
      where l.id = list_id and l.user_id = (select auth.uid())
    )
  );

create policy "saved_list_items_delete_own"
  on public.saved_list_items for delete to authenticated
  using (
    exists (
      select 1 from public.saved_lists l
      where l.id = list_id and l.user_id = (select auth.uid())
    )
  );

-- waitlist: anyone may join; only admins may read PII (emails).
-- Public counters/feeds should be served via a server-side aggregate.
create policy "waitlist_insert_anyone"
  on public.waitlist for insert
  with check (true);

create policy "waitlist_admin_select"
  on public.waitlist for select to authenticated
  using (public.is_admin());

create policy "waitlist_admin_update"
  on public.waitlist for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "waitlist_admin_delete"
  on public.waitlist for delete to authenticated
  using (public.is_admin());

-- reports: authenticated users file reports; reporter and admins can read;
-- admins moderate.
create policy "reports_insert_own"
  on public.reports for insert to authenticated
  with check ((select auth.uid()) = reporter_id);

create policy "reports_select_own_or_admin"
  on public.reports for select to authenticated
  using ((select auth.uid()) = reporter_id or public.is_admin());

create policy "reports_admin_update"
  on public.reports for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "reports_admin_delete"
  on public.reports for delete to authenticated
  using (public.is_admin());
