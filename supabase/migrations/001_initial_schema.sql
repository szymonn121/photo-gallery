-- Cinematic Photography Gallery — initial schema
-- Run in Supabase SQL Editor or with: supabase db push

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.photo_status as enum ('draft', 'published');
create type public.collection_status as enum ('draft', 'published');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 1 and 4000),
  cover_photo_id uuid,
  status public.collection_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 140),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text not null check (char_length(description) between 1 and 8000),
  alt_text text not null check (char_length(alt_text) between 5 and 300),
  original_image_url text not null check (original_image_url ~ '^https://'),
  thumbnail_url text not null check (thumbnail_url ~ '^https://'),
  original_storage_path text not null check (original_storage_path like 'originals/%'),
  thumbnail_storage_path text not null check (thumbnail_storage_path like 'thumbnails/%'),
  width integer not null check (width > 0 and width <= 50000),
  height integer not null check (height > 0 and height <= 50000),
  aspect_ratio numeric(12, 6) not null check (aspect_ratio > 0),
  hero_focus_x smallint not null default 50 check (hero_focus_x between 0 and 100),
  hero_focus_y smallint not null default 50 check (hero_focus_y between 0 and 100),
  hero_mobile_focus_x smallint not null default 50 check (hero_mobile_focus_x between 0 and 100),
  hero_mobile_focus_y smallint not null default 50 check (hero_mobile_focus_y between 0 and 100),
  blur_data_url text,
  location_name text check (location_name is null or char_length(location_name) <= 300),
  location_description text check (location_description is null or char_length(location_description) <= 1500),
  latitude double precision check (latitude between -90 and 90),
  longitude double precision check (longitude between -180 and 180),
  camera text check (camera is null or char_length(camera) <= 300),
  lens text check (lens is null or char_length(lens) <= 300),
  focal_length text check (focal_length is null or char_length(focal_length) <= 100),
  aperture text check (aperture is null or char_length(aperture) <= 100),
  shutter_speed text check (shutter_speed is null or char_length(shutter_speed) <= 100),
  iso integer check (iso is null or iso between 1 and 10000000),
  captured_at timestamptz,
  published_at timestamptz,
  status public.photo_status not null default 'draft',
  is_featured boolean not null default false,
  collection_id uuid references public.collections(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coordinates_are_complete check ((latitude is null and longitude is null) or (latitude is not null and longitude is not null)),
  constraint published_photo_has_date check (status = 'draft' or published_at is not null),
  constraint aspect_ratio_matches_dimensions check (abs(aspect_ratio - (width::numeric / height::numeric)) < 0.01)
);

alter table public.collections
  add constraint collections_cover_photo_fk
  foreign key (cover_photo_id) references public.photos(id) on delete set null;

create table public.site_settings (
  id boolean primary key default true check (id = true),
  photographer_name text not null default '[IMIĘ I NAZWISKO]',
  gallery_name text not null default 'Galeria autorska',
  intro text not null default '[TEKST TYMCZASOWY] Fotografuję światło, miejsca i chwile, które łatwo przeoczyć.',
  biography text not null default '[TEKST TYMCZASOWY] Uzupełnij tutaj swoją biografię w panelu administratora.',
  photography_style text not null default '[TEKST TYMCZASOWY] Opisz swój styl, podejście do koloru, światła i kompozycji.',
  equipment text not null default '[TEKST TYMCZASOWY] Wymień aparat, obiektywy i pozostały sprzęt.',
  email text,
  instagram_url text,
  x_url text,
  watermark_enabled boolean not null default false,
  watermark_text text not null default '© Fotograf',
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

create table public.login_rate_limits (
  key_hash text primary key,
  attempts integer not null default 1,
  window_started_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger photos_set_updated_at before update on public.photos
for each row execute function public.set_updated_at();
create trigger collections_set_updated_at before update on public.collections
for each row execute function public.set_updated_at();
create trigger settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth
set row_security = off
as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.check_login_rate_limit(p_key text)
returns boolean
language plpgsql
security definer
set search_path = public
set row_security = off
as $$
declare
  v_hash text := encode(digest(left(p_key, 240), 'sha256'), 'hex');
  v_record public.login_rate_limits%rowtype;
begin
  delete from public.login_rate_limits where window_started_at < now() - interval '24 hours';
  select * into v_record from public.login_rate_limits where key_hash = v_hash for update;

  if not found then
    insert into public.login_rate_limits(key_hash, attempts, window_started_at) values (v_hash, 1, now());
    return true;
  end if;

  if v_record.window_started_at < now() - interval '15 minutes' then
    update public.login_rate_limits set attempts = 1, window_started_at = now() where key_hash = v_hash;
    return true;
  end if;

  if v_record.attempts >= 6 then
    return false;
  end if;

  update public.login_rate_limits set attempts = attempts + 1 where key_hash = v_hash;
  return true;
end;
$$;

revoke all on function public.check_login_rate_limit(text) from public;
grant execute on function public.check_login_rate_limit(text) to anon, authenticated;

create index photos_published_at_idx on public.photos (published_at desc) where status = 'published';
create index photos_collection_published_idx on public.photos (collection_id, published_at desc) where status = 'published';
create index photos_status_updated_idx on public.photos (status, updated_at desc);
create index photos_title_trgm_idx on public.photos using gin (title gin_trgm_ops);
create index photos_description_trgm_idx on public.photos using gin (description gin_trgm_ops);
create index collections_status_idx on public.collections (status, created_at desc);
create unique index photos_one_featured_idx on public.photos ((is_featured)) where is_featured = true;

alter table public.admin_users enable row level security;
alter table public.collections enable row level security;
alter table public.photos enable row level security;
alter table public.site_settings enable row level security;
alter table public.login_rate_limits enable row level security;

create policy "Admin can read own membership"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

create policy "Public can read published collections"
on public.collections for select to anon, authenticated
using (status = 'published');
create policy "Admin can read all collections"
on public.collections for select to authenticated
using (public.is_admin());
create policy "Admin can insert collections"
on public.collections for insert to authenticated
with check (public.is_admin());
create policy "Admin can update collections"
on public.collections for update to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete collections"
on public.collections for delete to authenticated
using (public.is_admin());

create policy "Public can read published photos"
on public.photos for select to anon, authenticated
using (status = 'published' and published_at <= now());
create policy "Admin can read all photos"
on public.photos for select to authenticated
using (public.is_admin());
create policy "Admin can insert photos"
on public.photos for insert to authenticated
with check (public.is_admin());
create policy "Admin can update photos"
on public.photos for update to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "Admin can delete photos"
on public.photos for delete to authenticated
using (public.is_admin());

create policy "Public can read site settings"
on public.site_settings for select to anon, authenticated
using (true);
create policy "Admin can update site settings"
on public.site_settings for update to authenticated
using (public.is_admin()) with check (public.is_admin());

-- Storage bucket and policies. Public download is intentional; writes remain administrator-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 41943040, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin can upload photo objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'photos' and public.is_admin() and (name like 'originals/%' or name like 'thumbnails/%'));
create policy "Admin can update photo objects"
on storage.objects for update to authenticated
using (bucket_id = 'photos' and public.is_admin())
with check (bucket_id = 'photos' and public.is_admin());
create policy "Admin can delete photo objects"
on storage.objects for delete to authenticated
using (bucket_id = 'photos' and public.is_admin());

-- Tables are intentionally not granted directly beyond what PostgREST and RLS need.
grant usage on schema public to anon, authenticated;
grant select on public.photos, public.collections, public.site_settings to anon, authenticated;
grant select, insert, update, delete on public.photos, public.collections to authenticated;
grant select on public.admin_users to authenticated;
grant update on public.site_settings to authenticated;
