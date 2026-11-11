-- StreamVerse complete schema. Run once in the Supabase SQL Editor. Safe to re-run.
-- Contains NO secrets. The service-role key is only ever used inside the
-- delete-account Edge Function (server side), never in the mobile app.

-- ============ PROFILES ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[A-Za-z0-9_]{3,24}$');
alter table public.profiles drop constraint if exists profiles_display_name_len;
alter table public.profiles add constraint profiles_display_name_len
  check (display_name is null or char_length(display_name) between 1 and 50);
alter table public.profiles drop constraint if exists profiles_username_key;
create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username)) where username is not null;

-- ============ SERVICES (public directory, read-only for clients) ============
create table if not exists public.services (
  id text primary key,
  name text not null,
  category text not null,
  website text not null,
  created_at timestamptz not null default now()
);
alter table public.services add column if not exists categories text[] not null default '{}';
alter table public.services add column if not exists description text not null default '';
alter table public.services add column if not exists is_active boolean not null default true;
alter table public.services add column if not exists sort_order integer not null default 100;

alter table public.services drop constraint if exists services_category_valid;
alter table public.services add constraint services_category_valid
  check (category in ('Movies','TV Shows','Music','Anime','Live TV','Video'));
alter table public.services drop constraint if exists services_categories_valid;
alter table public.services add constraint services_categories_valid
  check (categories <@ array['Movies','TV Shows','Music','Anime','Live TV','Video']::text[]);
alter table public.services drop constraint if exists services_website_https;
alter table public.services add constraint services_website_https
  check (website ~ '^https://');
create index if not exists services_category_idx on public.services (category);

-- ============ FAVORITES ============
create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id text not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, service_id)
);
create index if not exists favorites_user_created_idx
  on public.favorites (user_id, created_at desc);

-- ============ RECENT ACTIVITY (one row per user+service, latest open time) ============
create table if not exists public.recent_activity (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  service_id text not null references public.services(id) on delete cascade,
  opened_at timestamptz not null default now()
);
-- Remove pre-existing duplicates (from the old schema) before adding the constraint.
delete from public.recent_activity a
  using public.recent_activity b
  where a.user_id = b.user_id and a.service_id = b.service_id and a.id < b.id;
alter table public.recent_activity drop constraint if exists recent_activity_user_service_key;
alter table public.recent_activity
  add constraint recent_activity_user_service_key unique (user_id, service_id);
create index if not exists recent_activity_user_opened_idx
  on public.recent_activity (user_id, opened_at desc);

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.favorites enable row level security;
alter table public.recent_activity enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists "Authenticated read services" on public.services;
create policy "Authenticated read services" on public.services
  for select to authenticated using (is_active);
-- No insert/update/delete policies on services: clients cannot modify the directory.

drop policy if exists "Users manage own favorites" on public.favorites;
drop policy if exists "Users read own favorites" on public.favorites;
drop policy if exists "Users insert own favorites" on public.favorites;
drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users read own favorites" on public.favorites
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own favorites" on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users delete own favorites" on public.favorites
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists "Users read own activity" on public.recent_activity;
drop policy if exists "Users insert own activity" on public.recent_activity;
drop policy if exists "Users update own activity" on public.recent_activity;
drop policy if exists "Users delete own activity" on public.recent_activity;
create policy "Users read own activity" on public.recent_activity
  for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own activity" on public.recent_activity
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own activity" on public.recent_activity
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own activity" on public.recent_activity
  for delete to authenticated using (auth.uid() = user_id);

-- Anonymous (logged-out) callers get nothing.
revoke all on public.profiles, public.services, public.favorites, public.recent_activity from anon;
grant select, insert, update on public.profiles to authenticated;
grant select on public.services to authenticated;
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.recent_activity to authenticated;

-- ============ SERVICE DIRECTORY SEED (official destinations only) ============
insert into public.services (id, name, category, categories, website, description, sort_order) values
('netflix','Netflix','Movies','{Movies,"TV Shows",Anime}','https://www.netflix.com/','Movies, series, anime and documentaries.',10),
('prime-video','Prime Video','Movies','{Movies,"TV Shows",Anime}','https://www.primevideo.com/','Movies and series from Amazon.',20),
('jiohotstar','JioHotstar','Movies','{Movies,"TV Shows","Live TV"}','https://www.jiohotstar.com/','Entertainment, sports and live programming in India.',30),
('youtube','YouTube','Video','{Video,"Live TV"}','https://www.youtube.com/','Videos, creators and live streams.',40),
('vimeo','Vimeo','Video','{Video}','https://vimeo.com/','Creative video and filmmaker content.',50),
('spotify','Spotify','Music','{Music}','https://open.spotify.com/','Music, playlists and podcasts.',60),
('youtube-music','YouTube Music','Music','{Music}','https://music.youtube.com/','Songs, music videos and mixes.',70),
('apple-music','Apple Music','Music','{Music}','https://music.apple.com/',E'Apple\u2019s music streaming service.',80)
on conflict (id) do update set
  name = excluded.name, category = excluded.category, categories = excluded.categories,
  website = excluded.website, description = excluded.description, sort_order = excluded.sort_order;

-- ============ TRIGGERS / FUNCTIONS ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for users created before the trigger existed.
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute procedure public.touch_updated_at();

-- Records an open without duplicates: one row per (user, service), newest time wins.
-- SECURITY INVOKER (default) so RLS applies; auth.uid() is the only user it can touch.
create or replace function public.record_service_open(p_service_id text)
returns void language plpgsql set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not authenticated'; end if;
  insert into public.recent_activity (user_id, service_id, opened_at)
  values (uid, p_service_id, now())
  on conflict (user_id, service_id) do update set opened_at = excluded.opened_at;
  -- keep at most 50 entries per user
  delete from public.recent_activity
  where user_id = uid and id in (
    select id from public.recent_activity where user_id = uid
    order by opened_at desc offset 50
  );
end;
$$;
revoke all on function public.record_service_open(text) from public, anon;
grant execute on function public.record_service_open(text) to authenticated;
