# Supabase Setup (Phase 13)

Run the SQL migration first, then configure auth URLs.

## 1) Run migration

Execute this file in Supabase SQL editor:

- `supabase/migrations/20260302_phase13_auth_and_core_tables.sql`

This creates:

- `sqlusers`
- `orders`
- `order_items`
- `cart_items`
- `wishlist`
- `reviews`
- `newsletter_subscribers`

It also enables RLS and creates policies.

## 2) Configure Auth URLs in Supabase dashboard

Set these in **Authentication -> URL Configuration**:

- Site URL: `http://localhost:3000` (dev)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback` (production)

## 3) Configure local env

In `.env.local` set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 4) Quick verification

1. Start app: `npm run dev`
2. Open `/auth/register` and create a user.
3. Confirm email and return via `/auth/callback`.
4. Open `/account` and verify session works.
5. In Supabase table editor, verify a `sqlusers` row exists for that user.
