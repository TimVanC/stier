-- Stier — security hardening
-- Adds: username format + case-insensitive uniqueness, per-user rate limiting,
-- and a PRIVATE storage bucket (with RLS policies) for product-submission images.

-- ---------------------------------------------------------------------------
-- Username validation + case-insensitive uniqueness (DB-level backstop)
-- ---------------------------------------------------------------------------

-- Drop the old case-sensitive unique constraint on profiles.username, if present.
alter table public.profiles drop constraint if exists profiles_username_key;

-- Format rule: 3-20 chars, letters/numbers/underscore only. NULL is allowed
-- (profile may be created before a username is chosen) but never an invalid value.
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles
  add constraint profiles_username_format
  check (username is null or username ~ '^[A-Za-z0-9_]{3,20}$');

-- Case-insensitive uniqueness: "Alice" and "alice" cannot coexist.
drop index if exists public.profiles_username_lower_key;
create unique index profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

-- ---------------------------------------------------------------------------
-- Rate limiting (per-user, per-action sliding window)
-- ---------------------------------------------------------------------------
create table if not exists public.user_action_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  action_type text not null,
  created_at  timestamptz not null default now()
);

create index if not exists user_action_events_lookup_idx
  on public.user_action_events (user_id, action_type, created_at desc);

alter table public.user_action_events enable row level security;

-- No direct client writes: the SECURITY DEFINER function below is the only
-- writer. Users may read their own events (e.g. to show remaining quota).
drop policy if exists "user_action_events_select_own" on public.user_action_events;
create policy "user_action_events_select_own"
  on public.user_action_events for select to authenticated
  using ((select auth.uid()) = user_id);

-- Atomically check a per-user rate limit and, when under the limit, log the
-- action. Returns true when allowed (and recorded), false when the limit is hit.
-- SECURITY DEFINER so it can write despite RLS, but the row is ALWAYS pinned to
-- the caller's auth.uid() — never a client-supplied id.
create or replace function public.record_user_action(
  p_action_type    text,
  p_max_count      integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_count   integer;
begin
  if v_user_id is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select count(*) into v_count
  from public.user_action_events
  where user_id = v_user_id
    and action_type = p_action_type
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max_count then
    return false;
  end if;

  insert into public.user_action_events (user_id, action_type)
  values (v_user_id, p_action_type);

  return true;
end;
$$;

revoke execute on function public.record_user_action(text, integer, integer)
  from public, anon;
grant execute on function public.record_user_action(text, integer, integer)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Private storage bucket for product-submission images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  false,                                                   -- PRIVATE: signed URLs only
  5242880,                                                 -- 5 MB hard cap (server enforces too)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Uploads are scoped to a per-user folder: "<auth.uid()>/<file>".
drop policy if exists "product_images_insert_own" on storage.objects;
create policy "product_images_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "product_images_update_own" on storage.objects;
create policy "product_images_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "product_images_select_own_or_admin" on storage.objects;
create policy "product_images_select_own_or_admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'product-images'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
    )
  );

drop policy if exists "product_images_delete_own_or_admin" on storage.objects;
create policy "product_images_delete_own_or_admin"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.is_admin()
    )
  );
