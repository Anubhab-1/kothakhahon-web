-- Phase 13: Supabase setup (auth + core commerce tables + RLS)
-- Run this in Supabase SQL editor (or via Supabase migrations) once per project.

create extension if not exists pgcrypto;

-- USER PROFILES
create table if not exists public.sqlusers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  total_amount numeric(10,2) not null check (total_amount >= 0),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  shipping_address jsonb default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

-- ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id text not null,
  book_title text not null,
  book_cover_url text,
  quantity integer not null default 1 check (quantity > 0),
  price numeric(10,2) not null check (price >= 0)
);

create index if not exists order_items_order_id_idx on public.order_items(order_id);

-- CART ITEMS
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null,
  book_title text not null,
  book_cover_url text,
  price numeric(10,2) not null check (price >= 0),
  quantity integer not null default 1 check (quantity > 0),
  added_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, book_id)
);

create index if not exists cart_items_user_id_idx on public.cart_items(user_id);
create index if not exists cart_items_added_at_idx on public.cart_items(added_at desc);

-- WISHLIST
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null,
  book_title text not null,
  book_cover_url text,
  added_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, book_id)
);

create index if not exists wishlist_user_id_idx on public.wishlist(user_id);
create index if not exists wishlist_added_at_idx on public.wishlist(added_at desc);

-- REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (user_id, book_id)
);

create index if not exists reviews_book_id_idx on public.reviews(book_id);
create index if not exists reviews_approved_created_idx on public.reviews(is_approved, created_at desc);

-- NEWSLETTER
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  subscribed_at timestamptz not null default timezone('utc'::text, now()),
  is_active boolean not null default true
);

create index if not exists newsletter_email_idx on public.newsletter_subscribers(email);

-- PROFILE SYNC ON AUTH SIGNUP
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.sqlusers (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.sqlusers.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.sqlusers.avatar_url);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- RLS
alter table public.sqlusers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- sqlusers policies
drop policy if exists "profiles_select_own" on public.sqlusers;
create policy "profiles_select_own"
  on public.sqlusers
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.sqlusers;
create policy "profiles_insert_own"
  on public.sqlusers
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.sqlusers;
create policy "profiles_update_own"
  on public.sqlusers
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- orders policies
drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
  on public.orders
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- order_items policies (via parent order ownership)
drop policy if exists "order_items_select_own_orders" on public.order_items;
create policy "order_items_select_own_orders"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

drop policy if exists "order_items_insert_own_orders" on public.order_items;
create policy "order_items_insert_own_orders"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = auth.uid()
    )
  );

-- cart_items policies
drop policy if exists "cart_select_own" on public.cart_items;
create policy "cart_select_own"
  on public.cart_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "cart_insert_own" on public.cart_items;
create policy "cart_insert_own"
  on public.cart_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "cart_update_own" on public.cart_items;
create policy "cart_update_own"
  on public.cart_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cart_delete_own" on public.cart_items;
create policy "cart_delete_own"
  on public.cart_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- wishlist policies
drop policy if exists "wishlist_select_own" on public.wishlist;
create policy "wishlist_select_own"
  on public.wishlist
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "wishlist_insert_own" on public.wishlist;
create policy "wishlist_insert_own"
  on public.wishlist
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "wishlist_delete_own" on public.wishlist;
create policy "wishlist_delete_own"
  on public.wishlist
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- reviews policies
drop policy if exists "reviews_select_approved_public" on public.reviews;
create policy "reviews_select_approved_public"
  on public.reviews
  for select
  to anon
  using (is_approved = true);

drop policy if exists "reviews_select_own_or_approved" on public.reviews;
create policy "reviews_select_own_or_approved"
  on public.reviews
  for select
  to authenticated
  using (is_approved = true or auth.uid() = user_id);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own"
  on public.reviews
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own"
  on public.reviews
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "reviews_delete_own" on public.reviews;
create policy "reviews_delete_own"
  on public.reviews
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- newsletter policies
drop policy if exists "newsletter_insert_any" on public.newsletter_subscribers;
create policy "newsletter_insert_any"
  on public.newsletter_subscribers
  for insert
  to anon, authenticated
  with check (true);
