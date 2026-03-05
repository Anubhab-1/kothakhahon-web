# Kothakhahon Prokashoni Web

Production-style Next.js App Router storefront for Bengali books, with:
- CMS content from Sanity
- Auth + commerce persistence in Supabase
- Razorpay checkout order/payment flow
- Fallback content for graceful degradation when CMS is unavailable

## Tech Stack
- Next.js 16 (App Router, TypeScript)
- React 19
- Tailwind CSS 4
- Sanity (`next-sanity`)
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)
- Razorpay
- React Hook Form + Zod

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env.local` and fill values.

Required vars:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_TOKEN` (required for protected/extended Sanity ops)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for server-only form APIs)
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`

### 3. Run database migrations
Apply SQL files in order:
1. `supabase/migrations/20260302_phase13_auth_and_core_tables.sql`
2. `supabase/migrations/20260303_phase14_forms_tables.sql`

### 4. Run the app
```bash
npm run dev
```
Open `http://localhost:3000`.

## Scripts
- `npm run dev` - start local dev server
- `npm run lint` - run ESLint
- `npm run build` - production build + type check
- `npm run start` - run built app

## Feature Overview
- `Auth`: register/login/logout/callback with protected `/account` and `/checkout`
- `Catalog`: book listing + filtering
- `Book Detail`: rich detail view + approved review rendering from Supabase
- `Cart`: local cart state + Supabase sync
- `Wishlist`: persisted per-user toggle + account wishlist view
- `Checkout`: creates order, creates Razorpay order, verifies signature, marks payment paid
- `Account`: orders list/detail + wishlist + basic metrics
- `Lead Capture`: contact, manuscript, newsletter API persistence
- `SEO`: robots + dynamic sitemap routes
- `CMS Studio`: mounted at `/studio`

## Key Paths
- `app/` - routes, API handlers
- `components/` - UI and client interactions
- `lib/` - shared integration and utilities
- `sanity/` - Sanity schemas
- `supabase/migrations/` - schema and RLS migrations

## Notes
- Checkout and form APIs return `503` when required backend env is missing.
- Sanity-powered pages intentionally include fallback content paths for resilience.
- Use the migration files under `supabase/migrations/` as the single source of truth.

## Audit Artifacts
- `AUDIT_FILE_FEATURE_MATRIX.md`
- `AUDIT_FINDINGS_SUMMARY.md`
- `AUDIT_QUICK_WINS.md`
