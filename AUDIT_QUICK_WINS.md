# AUDIT_QUICK_WINS

Generated: 2026-03-03 01:01:30 +05:30

## Quick Wins (Low Effort, High ROI)

| Priority | Change | Files | Effort | Why it matters | Acceptance criteria |
|---|---|---|---|---|---|
| QW-1 | Remove dead social placeholders (`href="#"`) | `components/layout/Footer.tsx` | XS | Eliminates broken navigation and trust friction. | All footer social links resolve to real URLs or are hidden when unset. |
| QW-2 | Prevent dead CTA in chapter preview when no `buyLink` | `components/ui/ChapterPreview.tsx` | XS | Avoids no-op click behavior and confusion. | CTA is disabled or rerouted when `buyLink` is absent. |
| QW-3 | Remove unused starter assets | `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` | XS | Reduces repository noise and accidental future misuse. | Assets deleted or documented as intentionally reserved. |
| QW-4 | Remove or wire unused components | `components/layout/AccountNav.tsx`, `components/ui/CustomCursor.tsx` | XS | Cuts dead code surface and maintenance overhead. | Each component is either imported in live routes or removed. |
| QW-5 | Consolidate duplicate SQL file | `PHASE13_SUPABASE.sql`, `supabase/migrations/20260302_phase13_auth_and_core_tables.sql` | XS | Prevents migration drift. | Single canonical migration source remains; duplicate removed/redirected. |
| QW-6 | Rewrite README for this actual project | `README.md` | S | Improves onboarding speed and deployment consistency. | README includes setup, env vars, architecture map, and run commands. |
| QW-7 | Add fallback telemetry logs | `app/page.tsx`, `app/books/page.tsx`, `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `app/authors/*.tsx`, `lib/sanity.ts` | S | Makes hidden CMS failures observable. | Fallback path emits structured logs/metrics with route + reason. |
| QW-8 | Add auth middleware timeout observability | `lib/supabase/middleware.ts` | S | Detects false redirects under network latency. | Timeout events are logged/counted; threshold is configurable. |
| QW-9 | Add dynamic sitemap URLs | `app/sitemap.ts` | M (borderline) | Immediate SEO coverage increase for dynamic content. | Sitemap includes blog/book/author slugs with `lastModified`. |
| QW-10 | Add CI audit checks | CI config + `package.json` scripts | S | Keeps quality baseline continuously enforced. | CI runs `npm run lint`, `npm run build`, and `npm audit --json`. |

## Structural Work (Not Quick Wins)

| Priority | Workstream | Primary files | Effort | Outcome |
|---|---|---|---|---|
| SW-1 | End-to-end checkout + payment lifecycle | `app/checkout/page.tsx`, new payment API routes, Supabase orders tables | L | Real order placement and payment verification. |
| SW-2 | Real account orders/wishlist data surfaces | `app/account/*`, `components/ui/WishlistButton.tsx` | M | Users can manage and inspect persisted purchase/saved state. |
| SW-3 | Inbound forms backend (contact, manuscript, newsletter) | `components/contact/ContactForm.tsx`, `components/for-authors/ManuscriptSubmissionForm.tsx`, `components/ui/NewsletterForm.tsx`, new API routes | M-L | No-lead-loss submission pipeline with validation and delivery. |
| SW-4 | Reviews pipeline (submit + moderation + display) | `app/books/[slug]/page.tsx`, Supabase `reviews` usage, admin flow | M | Authentic review/rating system with approval controls. |

## Recommended Execution Order
1. Complete SW-1 checkout pipeline.
2. Complete SW-2 account + wishlist persistence.
3. Complete SW-3 inbound form backends.
4. Ship QW-1 to QW-8 in parallel where possible.
5. Finalize SW-4 review pipeline and QW-9 SEO update.
