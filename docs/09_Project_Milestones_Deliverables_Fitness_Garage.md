# Project Milestones & Deliverables Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

---

## 1. Project Summary

| Attribute | Detail |
|---|---|
| **Project Name** | Fitness Garage — Full Stack Gym Website |
| **Delivery Model** | Single delivery — all features built and deployed together |
| **Stack** | React + TypeScript (Vercel), FastAPI + uv (Render), PostgreSQL (Supabase), Supabase Auth |
| **Principles** | DRY, SOLID, KISS, YAGNI, Extensible, Replaceable |
| **Hosting** | All free tiers at launch — Vercel, Render, Supabase |
| **Timeline** | Estimated 8 weeks from kickoff to production deployment |
| **Phases** | 6 phases — sequential, each phase is a shippable increment |

---

## 2. Milestone Overview

```
Phase 0 │ Project Setup & Infrastructure         Week 1
Phase 1 │ Database & Backend Foundation          Week 2
Phase 2 │ Public Website — Frontend              Weeks 3–4
Phase 3 │ Admin Dashboard                        Weeks 5–6
Phase 4 │ Member Portal                          Week 7
Phase 5 │ Integrations & SEO                     Week 8
Phase 6 │ QA, Hardening & Deployment             Week 8 (final)
```

Each phase has:
- **Milestone:** The measurable completion state
- **Deliverables:** Concrete outputs an agent or reviewer can verify
- **Acceptance Criteria:** Definition of done — binary pass/fail checks
- **Blockers / Dependencies:** What must be true before this phase starts

---

## 3. Phase 0 — Project Setup & Infrastructure

**Duration:** Week 1
**Milestone:** All infrastructure provisioned, repositories initialised, CI/CD pipelines active, environment variables configured.

### 3.1 Tasks

| # | Task | Owner | Notes |
|---|---|---|---|
| 0.1 | Create GitHub repository with monorepo structure (`/frontend`, `/backend`) | Agent | |
| 0.2 | Initialise frontend: `npm create vite@latest` with React + TypeScript template | Agent | |
| 0.3 | Initialise backend: `uv init`, add FastAPI, asyncpg, cryptography, pydantic, python-dotenv, reportlab, openpyxl, pandas, supabase-py | Agent | |
| 0.4 | Configure Tailwind CSS in frontend — install, configure `tailwind.config.ts` with all custom design tokens | Agent | |
| 0.5 | Create Supabase project — obtain `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY` | Agent / Client | |
| 0.6 | Configure Supabase Auth — enable Email+Password, Magic Link, Phone OTP providers | Agent | |
| 0.7 | Create Supabase Storage buckets: `assets` (public), `invoices` (private) | Agent | |
| 0.8 | Create all storage folders: `assets/hero/`, `assets/about/`, `assets/services/`, `assets/trainers/`, `assets/gallery/`, `assets/transformations/` | Agent | |
| 0.9 | Set up Vercel project — connect GitHub frontend directory, add environment variables | Agent | |
| 0.10 | Set up Render service — connect GitHub backend directory, add environment variables | Agent | |
| 0.11 | Generate AES-256 encryption key — add to Render environment variables as `AES_ENCRYPTION_KEY` | Agent | |
| 0.12 | Configure CORS in FastAPI — whitelist Vercel domain | Agent | |
| 0.13 | Create `.env.example` for both frontend and backend | Agent | |
| 0.14 | Set up cron-job.org — create job to `GET https://<render-url>/health` every 10 minutes | Agent / Client | |
| 0.15 | Configure `vercel.json` — `cleanUrls: true`, `trailingSlash: false` | Agent | |
| 0.16 | Set up Git branching strategy: `main`, `develop`, `feature/**` | Agent | |
| 0.17 | Add ESLint + Prettier config to frontend | Agent | |

### 3.2 Deliverables

- [ ] GitHub repository live with `/frontend` and `/backend` directories
- [ ] Frontend deploys to Vercel from `main` branch automatically
- [ ] Backend deploys to Render from `main` branch automatically
- [ ] Vercel deployment URL accessible (public)
- [ ] Render deployment URL accessible (returns 404 — no routes yet, not 500)
- [ ] `GET /health` returns `{ "status": "ok" }` on Render
- [ ] Supabase project live — Auth and Storage configured
- [ ] All environment variables set on Vercel and Render
- [ ] cron-job.org job active — pinging `/health` every 10 minutes
- [ ] Both `.env.example` files committed

### 3.3 Acceptance Criteria

- [ ] `git push` to `main` triggers auto-deploy on both Vercel and Render
- [ ] `GET https://<render-url>/health` returns `200 { "status": "ok" }`
- [ ] No secrets committed to git — `.env` in `.gitignore`
- [ ] Supabase Auth can create a test user via the Supabase dashboard
- [ ] Supabase Storage buckets exist and `assets` bucket is publicly readable

---

## 4. Phase 1 — Database & Backend Foundation

**Duration:** Week 2
**Milestone:** All database tables created, seeded, and migrated. All API endpoints implemented, tested, and returning correct responses. Encryption layer operational.

### 4.1 Tasks

| # | Task | Owner | Notes |
|---|---|---|---|
| 1.1 | Write all SQL migration files (`000_init.sql` → `013_seed_site_config.sql`) | Agent | Per DB Schema Doc |
| 1.2 | Write and test `db/migrate.py` migration runner | Agent | Idempotent |
| 1.3 | Run all migrations against Supabase Postgres — verify all tables created and seeded | Agent | |
| 1.4 | Implement `db/connection.py` — asyncpg connection pool with FastAPI lifespan | Agent | |
| 1.5 | Implement `core/security.py` — AES-256 encrypt/decrypt functions for PII fields | Agent | |
| 1.6 | Implement `core/auth.py` — Supabase JWT verification, role extraction, `get_current_user`, `require_member`, `require_admin` dependencies | Agent | |
| 1.7 | Implement `core/config.py` — all environment variable loading | Agent | |
| 1.8 | Write all query modules under `db/queries/` — one per resource | Agent | Per DB Schema Doc |
| 1.9 | Implement `services/storage_service.py` — Supabase Storage list, upload, delete, signed URL | Agent | |
| 1.10 | Implement `services/invoice_service.py` — PDF generation with reportlab | Agent | Per invoice spec in Member Portal Doc |
| 1.11 | Implement `services/import_service.py` — CSV/Excel bulk import with pandas | Agent | |
| 1.12 | Implement `services/reviews_service.py` — Google Places API fetch and upsert | Agent | |
| 1.13 | Implement all public routers (`/public/**`) | Agent | Per API Spec Doc |
| 1.14 | Implement all member routers (`/member/**`) | Agent | Per API Spec Doc |
| 1.15 | Implement all admin routers (`/admin/**`) | Agent | Per API Spec Doc |
| 1.16 | Implement error handling middleware — standard error envelope | Agent | |
| 1.17 | Write pytest test suite — at minimum one test per endpoint (happy path + auth failure) | Agent | |
| 1.18 | Enable FastAPI Swagger at `/docs` for dev environment only | Agent | |

### 4.2 Deliverables

- [ ] All 13 migration files in `db/migrations/`
- [ ] Migration runner `db/migrate.py` — tested and idempotent
- [ ] All 9 query modules in `db/queries/`
- [ ] All service modules implemented
- [ ] All 35 API endpoints implemented (per API Spec endpoint index)
- [ ] pytest test suite with ≥ 35 tests
- [ ] All tests passing in CI

### 4.3 Acceptance Criteria

- [ ] `GET /health` → `200`
- [ ] `GET /public/site-config` → `200` with seeded config values
- [ ] `GET /public/services` → `200` with 8 seeded services
- [ ] `GET /public/plans` → `200` with 8 plan combinations
- [ ] `GET /public/trainers` → `200` with 5 placeholder trainers
- [ ] `POST /admin/members` without JWT → `401`
- [ ] `POST /admin/members` with member JWT → `403`
- [ ] `POST /admin/members` with admin JWT → `201` — member created with encrypted PII
- [ ] `GET /admin/members/:id` returns decrypted PII fields
- [ ] `POST /admin/payments` creates payment and generates invoice PDF in Supabase Storage
- [ ] `GET /member/me` with member JWT returns own decrypted data only
- [ ] `GET /member/me` returns `404` if no member record linked to JWT
- [ ] `POST /admin/members/import` with valid CSV → returns import summary
- [ ] AES encryption verified: encrypted value in Postgres differs from plaintext, decrypted value matches original

### 4.4 Dependencies

- Phase 0 complete — Supabase, Render, environment variables all configured

---

## 5. Phase 2 — Public Website Frontend

**Duration:** Weeks 3–4
**Milestone:** All 8 public pages implemented, responsive, brand-correct, and connected to live backend APIs. Scroll animations operational. All placeholder content displaying correctly.

### 5.1 Tasks

| # | Task | Owner | Notes |
|---|---|---|---|
| 2.1 | Set up React Router v6 with all routes defined in `constants/routes.ts` | Agent | |
| 2.2 | Implement all Zustand stores: `authStore`, `siteConfigStore`, `adminStore` | Agent | |
| 2.3 | Implement Axios instance with JWT interceptor and 401 handler | Agent | `services/api.ts` |
| 2.4 | Implement all service modules: `publicService`, `memberService`, `adminService` | Agent | |
| 2.5 | Build common component library: `Button`, `Badge`, `Card`, `Modal`, `Spinner`, `Divider`, `SectionLabel`, `SectionHeading`, `StatBlock`, `EmptyState`, `ErrorMessage` | Agent | Per Frontend Doc |
| 2.6 | Build form components: `FormField`, `SelectField`, `TextareaField`, `FileUpload` | Agent | |
| 2.7 | Build layout components: `Navbar`, `Footer`, `PageWrapper`, `SectionWrapper` | Agent | |
| 2.8 | Implement custom hooks: `useScrollReveal`, `useMediaQuery`, `useDebounce` | Agent | |
| 2.9 | Implement utility functions: `buildStorageUrl`, `formatDate`, `formatCurrency`, `getMembershipStatus` | Agent | |
| 2.10 | Build `HeroSection` — slideshow (assets/hero/), headline with Chrome Slash, CTA buttons, stats bar | Agent | |
| 2.11 | Build `HomePage` — compose all home sections | Agent | |
| 2.12 | Build `AboutPage` — story, mission, about image from assets/about/ | Agent | |
| 2.13 | Build `ServicesPage` — service cards with icons from assets/services/ | Agent | |
| 2.14 | Build `PlansPage` — plan cards, 2×4 grid layout | Agent | |
| 2.15 | Build `TrainersPage` — trainer cards with photos from assets/trainers/ | Agent | |
| 2.16 | Build `GalleryPage` — masonry grid, tab filter, lightbox | Agent | |
| 2.17 | Build `TestimonialsPage` — review cards from Google Reviews API | Agent | |
| 2.18 | Build `ContactPage` — gym info from site_config, Google Maps embed, Google Form embed | Agent | |
| 2.19 | Implement all feature components: `ServiceCard`, `PlanCard`, `TrainerCard`, `ReviewCard`, `GalleryGrid`, `GalleryLightbox`, `HeroStats` | Agent | |
| 2.20 | Apply scroll reveal animations to all sections via `useScrollReveal` | Agent | |
| 2.21 | Apply `prefers-reduced-motion` CSS media query to all animations | Agent | |
| 2.22 | Verify full mobile responsiveness on all 8 pages | Agent | Test at 375px, 768px, 1280px |
| 2.23 | Add `HeroPageBanner` component — reused across all inner pages | Agent | |
| 2.24 | Upload placeholder assets to Supabase Storage (hero slides, service icons, trainer placeholders) | Agent | Minimum 3 hero images |

### 5.2 Deliverables

- [ ] All 8 public pages implemented and live on Vercel
- [ ] Full component library under `src/components/`
- [ ] All feature components under `src/features/`
- [ ] All custom hooks under `src/hooks/`
- [ ] All utility functions under `src/utils/`
- [ ] Responsive layout verified at 375px (mobile), 768px (tablet), 1280px (desktop)
- [ ] Placeholder assets uploaded to Supabase Storage

### 5.3 Acceptance Criteria

- [ ] Home page loads with hero slideshow cycling between ≥ 3 images
- [ ] Hero stats display values from `site_config` (not hardcoded)
- [ ] Services page displays all 8 services with icons from `assets/services/`
- [ ] Plans page displays all 8 plan combinations with placeholder pricing
- [ ] Trainers page displays 5 placeholder trainer cards with photos
- [ ] Gallery page shows tab filter (All / Gym / Transformations / Videos) functioning
- [ ] Gallery lightbox opens on item click and closes on backdrop click or Escape key
- [ ] Testimonials page renders Google Reviews from API
- [ ] Contact page shows Google Maps embed and Google Form embed
- [ ] Navbar collapses to hamburger on mobile — all links functional
- [ ] Footer displays gym info from `site_config`
- [ ] Chrome Slash (`/`) signature element visible in hero and section headings
- [ ] Scroll reveal animations fire on all section entries
- [ ] No layout shift (CLS) on page load — image dimensions declared
- [ ] All images have descriptive `alt` attributes
- [ ] `PageWrapper` injects correct title and meta description per page

### 5.4 Dependencies

- Phase 1 complete — all public API endpoints returning correct data

---

## 6. Phase 3 — Admin Dashboard

**Duration:** Weeks 5–6
**Milestone:** All admin modules implemented, functional, and accessible only to admin-role users. All CRUD operations working end-to-end. Bulk import operational.

### 6.1 Tasks

| # | Task | Owner | Notes |
|---|---|---|---|
| 3.1 | Build `AdminLayout` — `AdminSidebar` + main content wrapper | Agent | |
| 3.2 | Build `AdminSidebar` — nav items, active state, mobile collapse | Agent | |
| 3.3 | Implement `ProtectedAdminRoute` — redirect to `/admin/login` if not admin/dev | Agent | |
| 3.4 | Build `AdminLoginPage` — email + password form, Supabase Auth integration | Agent | |
| 3.5 | Build `AdminDashboardPage` — 5 metric cards + recent members table + recent payments table | Agent | |
| 3.6 | Build `MembersPage` — table with search, status filter, tier filter, pagination | Agent | |
| 3.7 | Build `MemberDetailPage` — full member detail + payment history + invoice download | Agent | |
| 3.8 | Build `MemberForm` (Add/Edit modal) — all fields, Zod validation, plan dropdown, auto expiry calc | Agent | |
| 3.9 | Build `MemberImportPage` — file upload, template download, import result summary | Agent | |
| 3.10 | Build `PaymentsPage` — table with date range filter, member search, pagination | Agent | |
| 3.11 | Build `PaymentForm` (Record Payment modal) — member search select, plan dropdown, amount, method | Agent | |
| 3.12 | Build `PlansAdminPage` — 8 plan cards (2 tiers × 4 durations), edit modal | Agent | |
| 3.13 | Build `ServicesAdminPage` — drag-to-reorder list, add/edit/deactivate service | Agent | |
| 3.14 | Build `TrainersAdminPage` — drag-to-reorder list, add/edit/deactivate trainer | Agent | |
| 3.15 | Build `GalleryAdminPage` — tabbed grid, register/edit/delete gallery item | Agent | |
| 3.16 | Build `StatsAdminPage` — hero stats form + achievements list with add/edit/reorder | Agent | |
| 3.17 | Build `ReviewsAdminPage` — reviews table with show/hide toggle, manual sync button | Agent | |
| 3.18 | Build `SettingsPage` — gym info, about section, integrations, hero slideshow settings | Agent | |
| 3.19 | Implement shared toast notification system — `ToastContext` at app root | Agent | |
| 3.20 | Implement confirmation modal — used for all destructive actions | Agent | |
| 3.21 | Implement skeleton loading states for all tables and data cards | Agent | |
| 3.22 | Implement empty states for all list/table views | Agent | |
| 3.23 | Implement error states for all API-dependent views | Agent | |
| 3.24 | Implement invoice download from admin payment table and member detail page | Agent | |
| 3.25 | Verify all admin routes return `403` for member-role JWT | Agent | |

### 6.2 Deliverables

- [ ] All admin pages implemented and live under `/admin/**`
- [ ] `AdminSidebar` with all 9 navigation items
- [ ] All CRUD operations functional for: Members, Payments, Plans, Services, Trainers, Gallery, Achievements
- [ ] Bulk CSV/Excel import operational with error reporting
- [ ] Invoice download working from both admin payments list and member detail page
- [ ] Toast notification system working across all success/error events
- [ ] Confirmation modal on all destructive actions
- [ ] Drag-to-reorder on Services, Trainers, Achievements

### 6.3 Acceptance Criteria

- [ ] `/admin/login` accessible without auth — email + password login works
- [ ] All `/admin/**` routes redirect unauthenticated users to `/admin/login`
- [ ] Member-role JWT on admin routes returns `403`
- [ ] Dashboard metrics cards show correct counts from API
- [ ] Members table search debounces at 400ms and filters results correctly
- [ ] Add Member modal validates all required fields — shows inline errors on submit
- [ ] Expiry date auto-calculates from start date + selected plan duration
- [ ] Edit Member modal pre-fills all current values
- [ ] Remove Member shows confirmation modal — on confirm sets member to `suspended`
- [ ] Bulk import accepts `.csv` and `.xlsx` — rejects other file types
- [ ] Bulk import returns summary: total rows, imported, skipped, errors with row numbers
- [ ] Record Payment creates payment record and generates invoice PDF in Supabase Storage
- [ ] Invoice download opens signed PDF URL in new tab
- [ ] Plan edit saves new price and description — reflected immediately on public plans page
- [ ] Service reorder updates `display_order` — reflected on public services page
- [ ] Trainer deactivation removes trainer from public trainers page
- [ ] Gallery delete removes DB record and deletes file from Supabase Storage
- [ ] Stats save updates site_config — reflected immediately on public home page
- [ ] Reviews sync button triggers Google Places API call and updates review cache
- [ ] Settings save updates site_config — reflected immediately on public pages
- [ ] Toast notification appears on every success and error event

### 6.4 Dependencies

- Phase 1 complete — all admin API endpoints operational
- Phase 2 complete — design system and component library available to reuse

---

## 7. Phase 4 — Member Portal

**Duration:** Week 7
**Milestone:** All member portal pages implemented. All three login methods working. Account linking for imported members operational. Invoice download working for members.

### 7.1 Tasks

| # | Task | Owner | Notes |
|---|---|---|---|
| 4.1 | Build `MemberLayout` — slim navbar with tab navigation, logout | Agent | |
| 4.2 | Implement `ProtectedMemberRoute` — redirect to `/login` with saved destination | Agent | |
| 4.3 | Implement post-login redirect — to saved destination or dashboard | Agent | |
| 4.4 | Build `MemberLoginPage` — three-tab interface | Agent | |
| 4.5 | Build `EmailPasswordForm` — email + password, show/hide toggle, error handling | Agent | |
| 4.6 | Build `MagicLinkForm` — email input, success state (check email message) | Agent | |
| 4.7 | Build `PhoneOtpForm` — two-step: phone → OTP with 6-digit input, resend countdown | Agent | |
| 4.8 | Implement account linking logic — match imported member by email/phone on first login | Agent | Via `GET /member/me` response handling |
| 4.9 | Build `MemberDashboardPage` — welcome message, membership status card, recent payments | Agent | |
| 4.10 | Implement membership expiry warning states — 7-day and 14-day amber/red alerts | Agent | |
| 4.11 | Build `MembershipStatusPage` — full membership detail card, expiry warning banner, contact CTA | Agent | |
| 4.12 | Build `PaymentHistoryPage` — paginated payment table (desktop) + card list (mobile) | Agent | |
| 4.13 | Implement invoice download on payment history page | Agent | `GET /member/payments/:id/invoice` |
| 4.14 | Implement logout flow — Supabase `signOut()`, clear `authStore`, redirect to `/` | Agent | |
| 4.15 | Implement session expiry handling — 401 interceptor clears auth, redirects to login | Agent | |
| 4.16 | Build all member portal error states: page error, no membership linked, invoice error | Agent | |
| 4.17 | Build skeleton loading states for dashboard and payment history | Agent | |
| 4.18 | Implement mobile-first layout for payment history — table to card transformation at `sm` breakpoint | Agent | |
| 4.19 | Verify `noindex` meta tag on all member portal pages | Agent | |

### 7.2 Deliverables

- [ ] `MemberLoginPage` with all 3 login methods functional
- [ ] All 3 member portal pages implemented: Dashboard, Membership, Payments
- [ ] Account linking operational for imported members
- [ ] Invoice download working — signed PDF opens in new tab
- [ ] Logout clears all auth state and redirects to homepage
- [ ] Mobile-responsive payment card layout on small screens

### 7.3 Acceptance Criteria

- [ ] Email + password login authenticates and redirects to dashboard
- [ ] Magic link sends email — clicking link logs member in and redirects to dashboard
- [ ] Phone OTP sends SMS — entering code logs member in and redirects to dashboard
- [ ] OTP resend button is disabled for 30 seconds after sending
- [ ] OTP 6-digit input auto-advances focus between digits
- [ ] Imported member logging in for first time is linked to their member record automatically
- [ ] Member with no linked record sees "No membership found" error with contact link
- [ ] Dashboard shows correct membership status, plan name, expiry date, days remaining
- [ ] Dashboard membership card shows amber warning badge when expiry within 14 days
- [ ] Dashboard membership card shows red expired badge when expired
- [ ] Membership status page shows all plan and period details
- [ ] Payment history shows all payments sorted by date descending
- [ ] Pagination works — "Next" and "Prev" buttons navigate through pages
- [ ] Invoice download opens PDF in new tab — file named with invoice number
- [ ] Member cannot access other members' data — RLS enforced
- [ ] All `/member/**` routes show `noindex` in page source
- [ ] Logout redirects to `/` public homepage
- [ ] 401 response during session refreshes clears auth and redirects to `/login`

### 7.4 Dependencies

- Phase 1 complete — all member API endpoints operational
- Phase 2 complete — design system and component library available

---

## 8. Phase 5 — Integrations & SEO

**Duration:** Week 8 (first half)
**Milestone:** All third-party integrations operational. Full SEO implementation verified. All structured data passing Google validation.

### 8.1 Tasks

| # | Task | Owner | Notes |
|---|---|---|---|
| 5.1 | Configure Google Places API — enable API, restrict key to Render IP | Agent / Client | |
| 5.2 | Test `POST /admin/reviews/sync` — verify reviews pulled from Google and stored | Agent | |
| 5.3 | Verify auto-sync trigger on `GET /public/reviews` when cache > 24 hours | Agent | |
| 5.4 | Implement `GymOrSportsClub` JSON-LD schema in `index.html` | Agent | Per SEO Doc |
| 5.5 | Implement dynamic `BreadcrumbList` schema in `PageWrapper` | Agent | |
| 5.6 | Implement dynamic `ItemList` schema on `ServicesPage` | Agent | |
| 5.7 | Implement dynamic `Person` schema on `TrainersPage` | Agent | |
| 5.8 | Implement dynamic `Review` aggregate schema on `TestimonialsPage` | Agent | |
| 5.9 | Implement all Open Graph meta tags in `PageWrapper` | Agent | |
| 5.10 | Implement all Twitter Card meta tags in `PageWrapper` | Agent | |
| 5.11 | Create `robots.txt` in `/public/` | Agent | Per SEO Doc |
| 5.12 | Create `sitemap.xml` in `/public/` | Agent | Per SEO Doc |
| 5.13 | Implement `<link rel="preload">` for hero first slide | Agent | |
| 5.14 | Implement `loading="lazy"` and `width`/`height` on all content images | Agent | |
| 5.15 | Implement Google Fonts `preconnect` in `index.html` | Agent | |
| 5.16 | Configure Vite manual chunk splitting | Agent | Per Frontend Doc |
| 5.17 | Verify `noindex` on all member and admin routes | Agent | |
| 5.18 | Validate all structured data using Google's Rich Results Test | Agent | `https://search.google.com/test/rich-results` |
| 5.19 | Verify Open Graph tags using Facebook Sharing Debugger | Agent | `https://developers.facebook.com/tools/debug/` |
| 5.20 | Run Lighthouse audit — target LCP < 2.5s, CLS < 0.1, Performance ≥ 85 | Agent | |
| 5.21 | Fix any Lighthouse issues identified | Agent | |

### 8.2 Deliverables

- [ ] Google Reviews syncing live from Google Places API
- [ ] All 5 JSON-LD schema types implemented
- [ ] Open Graph and Twitter Card tags on all public pages
- [ ] `robots.txt` and `sitemap.xml` in `/public/`
- [ ] Lighthouse report: Performance ≥ 85, CLS < 0.1, LCP < 2.5s
- [ ] Rich Results Test passing for GymOrSportsClub and Review schemas
- [ ] Vercel Vite build configured with manual chunk splitting

### 8.3 Acceptance Criteria

- [ ] `GET https://fitnessgarage.com/robots.txt` → accessible, blocks `/member/` and `/admin/`
- [ ] `GET https://fitnessgarage.com/sitemap.xml` → accessible, contains all 8 public page URLs
- [ ] `GET /public/reviews` returns cached reviews — no API call delay for visitor
- [ ] Google Rich Results Test passes for homepage schema
- [ ] Open Graph preview shows correct title, description, and image when URL is pasted in Facebook Debugger
- [ ] Lighthouse Performance score ≥ 85 on mobile
- [ ] Lighthouse CLS < 0.1
- [ ] Lighthouse LCP < 2.5 seconds
- [ ] No `console.error` in browser for missing meta tags or schema errors
- [ ] Vite build output: vendor chunk < 200KB gzipped

### 8.4 Dependencies

- Phase 2 complete — public pages implemented
- Google Places API key obtained (client task)

---

## 9. Phase 6 — QA, Hardening & Deployment

**Duration:** Week 8 (second half)
**Milestone:** All acceptance criteria across phases 0–5 passing. Production deployment live. Gym owner handed over access to all systems.

### 9.1 Tasks

| # | Task | Owner | Notes |
|---|---|---|---|
| 6.1 | End-to-end test: complete admin workflow — add member, record payment, download invoice | Agent | |
| 6.2 | End-to-end test: complete member workflow — login (all 3 methods), view membership, download invoice | Agent | |
| 6.3 | End-to-end test: bulk import — upload CSV with 10 test rows, verify all imported correctly | Agent | |
| 6.4 | End-to-end test: public website — visit all 8 pages, verify all content loading from API | Agent | |
| 6.5 | Security test: attempt to access `/admin/**` with member JWT — verify `403` | Agent | |
| 6.6 | Security test: attempt to access `/member/**` without JWT — verify redirect to `/login` | Agent | |
| 6.7 | Security test: verify member A cannot access member B's data | Agent | |
| 6.8 | Security test: verify PII in Postgres is ciphertext — query DB directly and confirm | Agent | |
| 6.9 | Security test: verify CORS blocks requests from non-Vercel origins | Agent | |
| 6.10 | Cross-browser test: Chrome, Firefox, Safari, Edge — all public pages | Agent | |
| 6.11 | Mobile device test: iOS Safari (375px), Android Chrome (390px) — all public + member pages | Agent | |
| 6.12 | Performance test: simulate 20 concurrent requests to public endpoints — verify no 5xx errors | Agent | |
| 6.13 | Verify cron-job.org keep-alive is operational — check Render logs for regular `/health` hits | Agent | |
| 6.14 | Connect custom domain to Vercel (when available) | Client / Agent | Deferred if domain not yet purchased |
| 6.15 | Update `CORS_ORIGINS`, canonical URLs, sitemap, and schema with production domain | Agent | |
| 6.16 | Submit sitemap to Google Search Console | Client | After domain live |
| 6.17 | Verify Google Business Profile is set up and linked | Client | |
| 6.18 | Run full pre-launch SEO checklist (per SEO Strategy Doc Section 10) | Agent | |
| 6.19 | Create admin accounts in Supabase Auth for all 6 staff — set role to `admin` | Agent / Client | |
| 6.20 | Run bulk import of 200+ existing members from client Excel file | Agent | |
| 6.21 | Admin walkthrough: gym owner verifies all dashboard modules are working | Client | |
| 6.22 | Update all placeholder content via admin dashboard: gym info, pricing, trainer profiles | Client | |
| 6.23 | Tag production release: `git tag v1.0.0` on `main` | Agent | |

### 9.2 Deliverables

- [ ] All end-to-end tests passing
- [ ] All security tests passing
- [ ] Cross-browser and mobile test report
- [ ] 200+ members imported into production database
- [ ] 6 admin accounts created and functional
- [ ] Production deployment live on Vercel + Render
- [ ] `v1.0.0` tag on `main` branch
- [ ] Dev handover README complete (separate document)

### 9.3 Acceptance Criteria

- [ ] All 8 public pages accessible and loading real content from API
- [ ] Admin can log in, add a member, record a payment, and download an invoice in < 5 actions
- [ ] Member can log in with all 3 methods and download their invoice
- [ ] Bulk import of 200+ members completes without critical errors
- [ ] PII in Postgres confirmed as ciphertext — not readable without decryption key
- [ ] No `console.error` in browser console on any public page
- [ ] No 5xx errors under 20 concurrent users
- [ ] Lighthouse Performance ≥ 85 on mobile
- [ ] All cross-browser tests passing on Chrome, Firefox, Safari, Edge
- [ ] Mobile layout correct on iOS Safari 375px and Android Chrome 390px
- [ ] cron-job.org confirmed active — Render stays warm (no cold starts observed)

---

## 10. Deliverables Register

Complete list of all project deliverables:

### 10.1 Documentation Deliverables
| # | Document | Status |
|---|---|---|
| D-01 | Product Requirements Document (PRD) | ✅ Complete |
| D-02 | Technical Architecture Document | ✅ Complete |
| D-03 | Database Schema Document | ✅ Complete (v1.1) |
| D-04 | API Specification Document | ✅ Complete |
| D-05 | Frontend Component Architecture Document | ✅ Complete |
| D-06 | Admin Dashboard Specification Document | ✅ Complete |
| D-07 | Member Portal Specification Document | ✅ Complete |
| D-08 | SEO Strategy Document | ✅ Complete |
| D-09 | Project Milestones & Deliverables Document | ✅ This document |
| D-10 | Dev Handover README | 🔲 Pending |

### 10.2 Code Deliverables
| # | Deliverable | Phase |
|---|---|---|
| C-01 | GitHub repository — monorepo structure | 0 |
| C-02 | Vite + React + TypeScript frontend | 0 |
| C-03 | FastAPI + uv backend | 0 |
| C-04 | Tailwind config with design tokens | 0 |
| C-05 | All SQL migration files (14 files) | 1 |
| C-06 | Migration runner `db/migrate.py` | 1 |
| C-07 | All query modules in `db/queries/` | 1 |
| C-08 | Security module — AES-256 encrypt/decrypt | 1 |
| C-09 | Auth module — JWT verification and role guards | 1 |
| C-10 | All service modules (invoice, import, reviews, storage) | 1 |
| C-11 | All 35 API endpoints | 1 |
| C-12 | pytest test suite (≥ 35 tests) | 1 |
| C-13 | Common component library (12 components) | 2 |
| C-14 | Layout components (Navbar, Footer, PageWrapper, SectionWrapper) | 2 |
| C-15 | Feature components (ServiceCard, TrainerCard, etc.) | 2 |
| C-16 | All 8 public pages | 2 |
| C-17 | Custom hooks (useScrollReveal, useMediaQuery, useDebounce) | 2 |
| C-18 | Utility functions | 2 |
| C-19 | Zustand stores | 2 |
| C-20 | All admin pages (11 modules) | 3 |
| C-21 | Admin sidebar, layout, auth | 3 |
| C-22 | Toast notification system | 3 |
| C-23 | Member login page (3 auth methods) | 4 |
| C-24 | All 3 member portal pages | 4 |
| C-25 | Account linking logic for imported members | 4 |
| C-26 | All JSON-LD schema implementations | 5 |
| C-27 | Open Graph and Twitter Card implementation | 5 |
| C-28 | robots.txt and sitemap.xml | 5 |
| C-29 | Core Web Vitals optimisation | 5 |

### 10.3 Infrastructure Deliverables
| # | Deliverable | Phase |
|---|---|---|
| I-01 | Vercel deployment — auto-deploy from `main` | 0 |
| I-02 | Render deployment — auto-deploy from `main` | 0 |
| I-03 | Supabase project — Auth + Storage + Postgres | 0 |
| I-04 | Supabase Storage buckets and folders | 0 |
| I-05 | cron-job.org keep-alive job | 0 |
| I-06 | All environment variables configured | 0 |
| I-07 | Production database — all tables + seed data | 1 |
| I-08 | 200+ members bulk imported | 6 |
| I-09 | 6 admin accounts created | 6 |
| I-10 | Custom domain connected (when available) | 6 |

---

## 11. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Render free tier cold starts affect UX | Medium | Medium | cron-job.org keep-alive — mitigated |
| Google Places API free credit exhausted | Low | Low | Reviews cached for 24 hours — minimal API calls |
| Supabase free tier storage limit (1GB) reached | Low | Low | Gallery images compressed on upload; upgrade storage if needed |
| Client Excel import has unexpected column formats | Medium | Medium | Import service returns detailed row-level error report; admin corrects and re-imports |
| Domain not purchased before launch | Medium | Low | Deploy without custom domain — Vercel URL works; update when domain is ready |
| Gym location details not ready at launch | Medium | Low | Placeholder values in site_config — admin fills via Settings dashboard post-launch |
| Google Business Profile verification takes time | Medium | Low | Website launches independently — GBP verified in parallel |
| Supabase Auth Phone OTP requires Twilio setup | High | Medium | Supabase requires Twilio credentials for SMS OTP — client must provide Twilio account or phone OTP tab is disabled at launch |

---

## 12. Out of Scope — Future Phases

Documented here for planning continuity. Not to be built in this delivery.

| Feature | Suggested Phase |
|---|---|
| SMS notifications (expiry, payment, welcome) | Phase 7 |
| Online payment integration (Razorpay / Stripe) | Phase 7 |
| Class schedule and booking | Phase 8 |
| WhatsApp notifications | Phase 8 |
| Native mobile app (iOS / Android) | Phase 9 |
| AWS migration (ECS, RDS, S3, CloudFront) | When scale demands |
| Multi-location support | When expansion occurs |
| Multiple admin roles / permissions | Phase 7 |
| Analytics dashboard (member growth, revenue trends) | Phase 7 |
| Fitness tracking inside member portal | Phase 8 |
| Automated member onboarding email | Phase 7 |

---

*End of Project Milestones & Deliverables Document — Fitness Garage v1.0*
