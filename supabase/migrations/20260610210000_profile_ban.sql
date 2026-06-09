-- User ban flag for admin moderation
alter table public.profiles
  add column if not exists is_banned boolean not null default false;

create index if not exists profiles_is_banned_idx on public.profiles (is_banned)
  where is_banned = true;

-- Admins may update any profile (ban/unban, etc.)
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
  on public.profiles for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
