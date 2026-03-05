-- Phase 14: inbound forms tables (contact + manuscript)
-- Run after 20260302_phase13_auth_and_core_tables.sql

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  department text not null,
  message text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists contact_messages_created_at_idx
  on public.contact_messages(created_at desc);
create index if not exists contact_messages_email_idx
  on public.contact_messages(email);

create table if not exists public.manuscript_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  manuscript_title text not null,
  genre text not null,
  word_count integer not null check (word_count >= 1000),
  language text not null,
  synopsis text not null,
  status text not null default 'new' check (status in ('new', 'under_review', 'accepted', 'rejected')),
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists manuscript_submissions_created_at_idx
  on public.manuscript_submissions(created_at desc);
create index if not exists manuscript_submissions_email_idx
  on public.manuscript_submissions(email);

alter table public.contact_messages enable row level security;
alter table public.manuscript_submissions enable row level security;

drop policy if exists "contact_insert_any" on public.contact_messages;
create policy "contact_insert_any"
  on public.contact_messages
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "manuscript_insert_any" on public.manuscript_submissions;
create policy "manuscript_insert_any"
  on public.manuscript_submissions
  for insert
  to anon, authenticated
  with check (true);
