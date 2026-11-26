-- Shadow Labs language archive: initial schema
-- Concepts are language-neutral. Every name, sentence, recording and task carries a `language`.
-- Nothing is public-approved until a reviewer for that language approves it.

create extension if not exists unaccent with schema extensions;

-- ---------- reference tables ----------
create table public.languages (
  code text primary key,                 -- ISO 639: ha, yo, ig, ff, kr, tiv, efi ...
  name text not null,                    -- English name
  native_name text not null,
  active boolean not null default false, -- shown on the site
  sort int not null default 100
);

create table public.collections (
  slug text primary key,
  name text not null,
  description text,
  sort int not null default 100
);

create table public.concepts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  english text not null,                 -- working label only, not the "source" language
  gloss text,                            -- short definition to disambiguate senses
  collection_slug text references public.collections(slug) on update cascade,
  cultural_note text,
  created_at timestamptz not null default now()
);

-- ---------- people ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'contributor' check (role in ('contributor','reviewer','admin')),
  languages text[] not null default '{}', -- languages this person works in / reviews
  bank_details_on_file boolean not null default false,
  agreement_signed_at timestamptz,        -- contribution agreement (consent, rights, payment)
  created_at timestamptz not null default now()
);

-- ---------- content ----------
create type public.item_status as enum ('pending','approved','rejected');
create type public.item_source as enum ('ai_draft','contributor','lead','import');

create table public.lexemes (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references public.concepts(id) on delete cascade,
  language text not null references public.languages(code),
  form text not null,                    -- with tone marks / diacritics, e.g. ewúrẹ́
  plain text,                            -- lowercased, no diacritics, for search
  dialect text,                          -- e.g. Kano, Sokoto, Ọ̀yọ́, Onitsha
  part_of_speech text,
  notes text,
  is_primary boolean not null default false,
  source public.item_source not null default 'contributor',
  status public.item_status not null default 'pending',
  contributor_id uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);
create index on public.lexemes (concept_id);
create index on public.lexemes (language, status);
create index on public.lexemes (plain);

create table public.sentences (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid references public.concepts(id) on delete set null,
  language text not null references public.languages(code),
  text text not null,
  english text,
  source public.item_source not null default 'contributor',
  status public.item_status not null default 'pending',
  contributor_id uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);
create index on public.sentences (concept_id);

-- Images and audio. License, source and credit are stored from day one.
create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image','audio')),
  url text not null,                     -- public URL (Supabase Storage, R2 or Commons)
  storage_path text,                     -- our own bucket path, if we host it
  license text not null,                 -- e.g. CC BY-SA 4.0, CC0, "Contributor agreement v1"
  license_url text,
  source_url text,                       -- page the file came from
  creator text,                          -- author / photographer / speaker display name
  credit text,                           -- ready-to-print attribution line
  ai_generated boolean not null default false,
  concept_id uuid references public.concepts(id) on delete cascade,
  lexeme_id uuid references public.lexemes(id) on delete cascade,
  sentence_id uuid references public.sentences(id) on delete cascade,
  language text references public.languages(code),
  is_primary boolean not null default false,
  status public.item_status not null default 'pending',
  contributor_id uuid references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.media (concept_id);
create index on public.media (lexeme_id);

-- Fix-the-AI: the main contributor task.
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid references public.concepts(id) on delete set null,
  source_language text not null default 'en',
  source_text text not null,
  target_language text not null references public.languages(code),
  ai_draft text,
  ai_engine text,                        -- e.g. google-translate-v2, gemini-2.5-flash
  status text not null default 'open'
    check (status in ('open','claimed','submitted','approved','rejected')),
  claimed_by uuid references public.profiles(id),
  claimed_at timestamptz,
  corrected_text text,
  error_tags text[] not null default '{}', -- tone, wrong_word, wrong_meaning, spelling, grammar, untranslated, ok
  contributor_note text,
  audio_media_id uuid references public.media(id),
  submitted_at timestamptz,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now()
);
create index on public.tasks (target_language, status);

-- Audit log of every review decision (also drives payouts and acceptance rate).
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  item_type text not null check (item_type in ('lexeme','sentence','media','task')),
  item_id uuid not null,
  language text references public.languages(code),
  contributor_id uuid references public.profiles(id),
  reviewer_id uuid not null references public.profiles(id),
  decision public.item_status not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.profiles(id),
  period text not null,                  -- e.g. 2026-12
  item_count int not null default 0,
  amount_ngn numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending','paid','cancelled')),
  reference text,                        -- Paystack / Flutterwave transfer ref
  created_at timestamptz not null default now()
);

-- ---------- helpers ----------
create or replace function public.make_plain(t text) returns text
language sql immutable as $$ select lower(extensions.unaccent(coalesce(t,''))) $$;

create or replace function public.lexeme_set_plain() returns trigger
language plpgsql as $$ begin new.plain := public.make_plain(new.form); return new; end $$;
create trigger lexeme_plain before insert or update of form on public.lexemes
  for each row execute function public.lexeme_set_plain();

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.can_review(lang text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and (role = 'admin' or (role = 'reviewer' and lang = any(languages)))
  )
$$;

-- New sign-up -> profile. The very first account becomes admin.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    case when exists (select 1 from profiles where role = 'admin') then 'contributor' else 'admin' end
  );
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stop people promoting themselves.
create or replace function public.protect_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role) and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end $$;
create trigger profile_role_guard before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Public numbers for the home page.
create or replace view public.language_stats with (security_invoker = on) as
select l.code, l.name, l.native_name, l.active, l.sort,
  (select count(*) from lexemes x where x.language = l.code and x.status = 'approved') as approved_names,
  (select count(*) from lexemes x where x.language = l.code and x.status = 'pending') as pending_names,
  (select count(*) from media m where m.language = l.code and m.kind = 'audio' and m.status = 'approved') as approved_audio,
  (select count(*) from tasks t where t.target_language = l.code and t.status = 'approved') as approved_tasks
from languages l;

-- ---------- row level security ----------
alter table public.languages enable row level security;
alter table public.collections enable row level security;
alter table public.concepts enable row level security;
alter table public.profiles enable row level security;
alter table public.lexemes enable row level security;
alter table public.sentences enable row level security;
alter table public.media enable row level security;
alter table public.tasks enable row level security;
alter table public.reviews enable row level security;
alter table public.payouts enable row level security;

-- reference data: anyone reads, admins write
create policy "read languages" on public.languages for select using (true);
create policy "admin languages" on public.languages for all using (public.is_admin()) with check (public.is_admin());
create policy "read collections" on public.collections for select using (true);
create policy "admin collections" on public.collections for all using (public.is_admin()) with check (public.is_admin());
create policy "read concepts" on public.concepts for select using (true);
create policy "admin concepts" on public.concepts for all using (public.is_admin()) with check (public.is_admin());

-- profiles
create policy "read profiles" on public.profiles for select using (true);
create policy "update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "admin profiles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- content: anyone reads non-rejected (the app decides whether drafts are shown),
-- signed-in users add pending items as themselves, reviewers of that language decide.
create policy "read lexemes" on public.lexemes for select
  using (status <> 'rejected' or contributor_id = auth.uid() or public.can_review(language));
create policy "add lexemes" on public.lexemes for insert to authenticated
  with check (contributor_id = auth.uid() and status = 'pending');
create policy "review lexemes" on public.lexemes for update using (public.can_review(language)) with check (public.can_review(language));
create policy "admin delete lexemes" on public.lexemes for delete using (public.is_admin());

create policy "read sentences" on public.sentences for select
  using (status <> 'rejected' or contributor_id = auth.uid() or public.can_review(language));
create policy "add sentences" on public.sentences for insert to authenticated
  with check (contributor_id = auth.uid() and status = 'pending');
create policy "review sentences" on public.sentences for update using (public.can_review(language)) with check (public.can_review(language));

create policy "read media" on public.media for select
  using (status <> 'rejected' or contributor_id = auth.uid() or public.is_admin() or (language is not null and public.can_review(language)));
create policy "add media" on public.media for insert to authenticated
  with check (contributor_id = auth.uid() and (status = 'pending' or public.is_admin()));
create policy "review media" on public.media for update
  using (public.is_admin() or (language is not null and public.can_review(language)))
  with check (public.is_admin() or (language is not null and public.can_review(language)));
create policy "admin delete media" on public.media for delete using (public.is_admin());

-- tasks: signed-in users see open tasks and their own; claim/submit their own; reviewers decide
create policy "read tasks" on public.tasks for select to authenticated
  using (status = 'open' or claimed_by = auth.uid() or public.can_review(target_language));
create policy "claim or submit task" on public.tasks for update to authenticated
  using (status = 'open' or (claimed_by = auth.uid() and status in ('claimed','submitted')))
  with check (claimed_by = auth.uid() and status in ('claimed','submitted'));
create policy "review tasks" on public.tasks for update using (public.can_review(target_language)) with check (public.can_review(target_language));
create policy "admin tasks" on public.tasks for all using (public.is_admin()) with check (public.is_admin());

-- reviews: reviewers write, contributors read their own
create policy "read reviews" on public.reviews for select to authenticated
  using (contributor_id = auth.uid() or reviewer_id = auth.uid() or public.is_admin());
create policy "write reviews" on public.reviews for insert to authenticated
  with check (reviewer_id = auth.uid() and public.can_review(language));

-- payouts: own rows; admin manages
create policy "read own payouts" on public.payouts for select to authenticated
  using (contributor_id = auth.uid() or public.is_admin());
create policy "admin payouts" on public.payouts for all using (public.is_admin()) with check (public.is_admin());

-- ---------- storage: one public bucket for images and audio ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
  array['image/jpeg','image/png','image/webp','audio/webm','audio/ogg','audio/mpeg','audio/mp4','audio/wav'])
on conflict (id) do nothing;

create policy "public read media bucket" on storage.objects for select using (bucket_id = 'media');
create policy "users upload to own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "admin manage media bucket" on storage.objects for all
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());

-- ---------- reference data ----------
insert into public.languages (code, name, native_name, active, sort) values
  ('ha','Hausa','Harshen Hausa', true, 1),
  ('yo','Yoruba','Èdè Yorùbá', true, 2),
  ('ig','Igbo','Asụsụ Igbo', true, 3),
  ('ff','Fulfulde','Fulfulde', false, 4),
  ('kr','Kanuri','Kanuri', false, 5),
  ('tiv','Tiv','Tiv', false, 6),
  ('ijc','Ijaw','Izon', false, 7),
  ('efi','Efik','Efik', false, 8);

insert into public.collections (slug, name, description, sort) values
  ('animals','Animals','Farm animals, wild animals, birds and insects.', 1),
  ('food','Food','Grains, soups, fruit, vegetables and dishes.', 2),
  ('clothing-crafts','Clothing and crafts','Cloth, dress, tools and the things people make.', 3),
  ('household','Household items','Things in and around the home.', 4);
