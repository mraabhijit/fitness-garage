# Fitness Garage — Project Context & Developer Guidelines

> **Single Source of Truth** for AI Agents and Developers working on the **Fitness Garage** gym web platform.
> Compiled from official requirements and specifications in [`docs/`](file:///home/arch/projects/fitness-garage/docs).

---

## 0. Official Documentation Index

### 0.1 Active Specifications — Phase 1 (Static Web Application)

| # | Document | Purpose |
|---|---|---|
| 1 | [`01_PRD_Fitness_Garage_v2.md`](file:///home/arch/projects/fitness-garage/docs/01_PRD_Fitness_Garage_v2.md) | Product requirements, scope, target audience, brand identity, and static feature requirements |
| 2 | [`02_Technical_Architecture_Fitness_Garage_v2.md`](file:///home/arch/projects/fitness-garage/docs/02_Technical_Architecture_Fitness_Garage_v2.md) | Static frontend topology, Vercel CDN hosting, browser-side Google Reviews, and Replaceable Service Layer architecture |
| 5 | [`05_Frontend_Component_Architecture_Fitness_Garage_v2.md`](file:///home/arch/projects/fitness-garage/docs/05_Frontend_Component_Architecture_Fitness_Garage_v2.md) | React 18+ component tree, Tailwind tokens, `src/data/*.json` schemas, hooks, and public pages |
| 8 | [`08_SEO_Strategy_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/08_SEO_Strategy_Fitness_Garage.md) | Local SEO strategy, 5 JSON-LD schemas, Core Web Vitals, Open Graph, robots.txt, and sitemap |
| 9 | [`09_Project_Milestones_Deliverables_Fitness_Garage_v2.md`](file:///home/arch/projects/fitness-garage/docs/09_Project_Milestones_Deliverables_Fitness_Garage_v2.md) | 3-phase static delivery roadmap, task breakdowns, acceptance criteria, and risk mitigations |
| 10 | [`10_Dev_Handover_README_Fitness_Garage_v2.md`](file:///home/arch/projects/fitness-garage/docs/10_Dev_Handover_README_Fitness_Garage_v2.md) | Developer setup, content update workflows, asset management, and Phase 2 swap checklist |
| 11 | [`11_Dev_Methodology_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/11_Dev_Methodology_Fitness_Garage.md) | Git branching, conventional commits, pre-commit enforcement, Ponytail reviews, and Definition of Done |

### 0.2 New Config & Tooling Templates in `docs/`

| File | Purpose |
|---|---|
| [`docs/Makefile`](file:///home/arch/projects/fitness-garage/docs/Makefile) | Streamlined development automation targets for frontend dev, data validation, placeholder audit, and pre-PR checks |
| [`docs/ci.yml`](file:///home/arch/projects/fitness-garage/docs/ci.yml) | GitHub Actions CI workflow (formatting, linting, type-checking, Vite build, JSON data validation, Lighthouse CI) |
| [`docs/docker-compose.yml`](file:///home/arch/projects/fitness-garage/docs/docker-compose.yml) | Local frontend development container with hot-reload volume mounts, with Phase 2 services documented |
| [`docs/gitignore`](file:///home/arch/projects/fitness-garage/docs/gitignore) | Root `.gitignore` template covering environment secrets, Node.js, Vite build artifacts, and Phase 2 Python rules |
| [`docs/pre-commit-config.yaml`](file:///home/arch/projects/fitness-garage/docs/pre-commit-config.yaml) | Pre-commit configuration with Yelp secret detection, Prettier, ESLint, tsc, JSON data validator, and markdownlint |

### 0.3 Archived Specifications — Phase 2 (Future Backend & Portal Integration)

These specifications and backend implementations are preserved and maintained for seamless Phase 2 wiring:

| # | Document | Purpose |
|---|---|---|
| 1-v1 | [`01_PRD_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/01_PRD_Fitness_Garage.md) | Original full-stack PRD with member portal & admin dashboard specs |
| 2-v1 | [`02_Technical_Architecture_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/02_Technical_Architecture_Fitness_Garage.md) | Full-stack cloud topology (FastAPI + Supabase Postgres/Auth/Storage + Render) |
| 3 | [`03_Database_Schema_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/03_Database_Schema_Fitness_Garage.md) | PostgreSQL schema (9 tables), asyncpg raw SQL parameterized queries, RLS policies, migrations |
| 4 | [`04_API_Specification_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/04_API_Specification_Fitness_Garage.md) | 35 REST API endpoints, Pydantic v2 schemas, standard error envelopes |
| 5-v1 | [`05_Frontend_Component_Architecture_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/05_Frontend_Component_Architecture_Fitness_Garage.md) | Full-stack frontend component tree with Zustand stores, Axios interceptors, and admin/member portals |
| 6 | [`06_Admin_Dashboard_Specification_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/06_Admin_Dashboard_Specification_Fitness_Garage.md) | 11 admin modules, CRUD workflows, bulk Excel/CSV member import, payment recording |
| 7 | [`07_Member_Portal_Specification_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/07_Member_Portal_Specification_Fitness_Garage.md) | 3-way member auth, status badges, payment history, signed PDF invoice downloads |
| 9-v1 | [`09_Project_Milestones_Deliverables_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/09_Project_Milestones_Deliverables_Fitness_Garage.md) | Original 6-phase full-stack roadmap & deliverables register |
| 10-v1 | [`10_Dev_Handover_README_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/10_Dev_Handover_README_Fitness_Garage.md) | Original full-stack developer setup and operational guide |

---

## 1. Project Overview & Dual-Phase Strategy

### 1.1 Purpose & Problem Statement
Fitness Garage is a premium gym brand requiring a high-performance digital presence to convert visitors into walk-ins and memberships. 

To achieve the fastest time-to-market with zero server hosting costs and maximum reliability, the project is structured in two distinct phases:
1. **Phase 1 (Current Scope — Static Web Application):** A blazing-fast, pure static React + TypeScript frontend hosted on Vercel's global edge CDN. All marketing content is driven by local JSON data files (`src/data/*.json`) and static media assets (`public/assets/`). Live Google Reviews are fetched directly in the browser via the Google Places API with `sessionStorage` caching, and contact inquiries are captured via Google Forms embeds.
2. **Phase 2 (Future Scope — Backend & Portals Integration):** Seamless activation of a FastAPI backend on Render, Supabase PostgreSQL with RLS, ReportLab automated invoice generation, Member Portal (`/member/**`), and Admin Dashboard (`/admin/**`).

### 1.2 The Core Architectural Tenet: The Replaceable Service Layer
The frontend is strictly architected so that transitioning from Phase 1 (Static) to Phase 2 (Full-Stack Backend) requires **modifying only one file**:
```
Phase 1 (Static):       Component ──► publicService.ts ──► src/data/*.json
Phase 2 (Backend Wired): Component ──► publicService.ts ──► Axios API Client ──► FastAPI / Postgres
```
**Zero public pages, zero UI components, zero layout wrappers, and zero hooks change when wiring the backend.**

### 1.3 Governing Architectural Principles
* **DRY (Don't Repeat Yourself):** Reusable base UI primitives, centralized asset URL helpers (`buildAssetUrl`), single point of data consumption.
* **SOLID:** Single-responsibility components; UI components consume data exclusively from `publicService.ts` — never importing from `data/` directly.
* **KISS (Keep It Simple, Stupid):** `useState` and props for UI state; no global state library (no Zustand/Redux) in Phase 1; native `fetch` for Google Places API.
* **YAGNI (You Aren't Gonna Need It):** Build strictly what is required for the static marketing site now. Backend code and specs are preserved in the repository for Phase 2 without cluttering the Phase 1 runtime.
* **Extensible:** New sections or pages plug in seamlessly without altering existing layout or routing contracts.
* **Replaceable:** `publicService.ts` and `buildAssetUrl.ts` encapsulate all data sourcing behind stable asynchronous interfaces.

### 1.4 Brand & Design Tokens
* **Gym Name:** Fitness Garage
* **UI Aesthetic:** Bold, energetic, premium dark industrial gym aesthetic.
* **Color Palette:**
  * `garage-black` (`#1A1A1A`): Primary page background
  * `garage-dark` (`#2C2C2C`): Card & panel surfaces
  * `garage-mid` (`#3D3D3D`): Borders and dividers
  * `garage-chrome` (`#D4AF37`): Primary accent / CTAs / highlights (Yellowish Chrome)
  * `garage-chrome-dim` (`#A88A1C`): Hover state for accent
  * `garage-white` (`#F0F0F0`): Primary body text
  * `garage-muted` (`#9A9A9A`): Secondary captions and labels
  * **Semantic Status (Phase 2):**
    * `status-active` (`#22C55E`): Active membership
    * `status-expired` (`#EF4444`): Expired membership
    * `status-pending` (`#F59E0B`): Pending membership / warning
* **Typography:**
  * **Display Font (Public Site Headings & Stats):** `Bebas Neue` (Google Fonts) — bold, condensed, punchy.
  * **Body Font (Copy, Forms, Portals):** `Inter` (Google Fonts) — clean, legible, optimized for reading.
* **Signature Visual Element:** **The Chrome Slash (`/`)**
  * Placed between heading keywords (e.g., `PUSH / BEYOND YOUR LIMITS`) rendered as `<span className="text-garage-chrome">/</span>`.

---

## 2. Technical Stack & Infrastructure Architecture

### 2.1 Phase 1 Topology (Active — Static Web Application)

```
┌─────────────────────────────────────────────────────────────────┐
│                     VISITOR BROWSER                             │
│                                                                 │
│   React 18+ TypeScript SPA (Vite — Hosted on Vercel CDN Edge)  │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  src/data/*.json                                         │  │
│   │  Static content: services, plans, trainers, gallery      │  │
│   │  Loaded asynchronously via publicService.ts              │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Google Places API (Browser-side fetch)                  │  │
│   │  Live reviews + sessionStorage cache + JSON fallback     │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Google Maps embed (iframe)                              │  │
│   │  Google Forms embed (iframe for contact enquiries)       │  │
│   └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Phase 2 Topology (Future — Backend & Portals Wired)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│         React 18+ TypeScript + Vite (Vercel — Free)         │
│   Public Website │ Member Portal │ Admin Dashboard          │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS + JWT (Bearer)
┌─────────────────────────▼───────────────────────────────────┐
│                        API LAYER                            │
│         FastAPI + uv (Render — Free Web Service)            │
│   REST API │ asyncpg Queries │ AES-256 Encryption Layer     │
└──────────┬──────────────────────────────┬───────────────────┘
           │ raw SQL                      │ JWT Verify
┌──────────▼──────────┐     ┌────────────▼───────────────────┐
│    DATA LAYER       │     │       AUTH LAYER               │
│  Supabase Postgres  │     │     Supabase Auth              │
│  (RLS Enabled)      │     │  Email │ Magic Link │ Phone OTP│
└─────────────────────┘     └────────────────────────────────┘
```

### 2.3 Technology Stack Matrix

| Area | Phase 1 (Static Site) | Phase 2 (Backend & Portals) | Hosting / Provider | Cost |
|---|---|---|---|---|
| **Frontend Framework** | React 18+, TypeScript 5+, Vite | React 18+, TypeScript 5+, Vite | Vercel Edge CDN | Free |
| **Styling** | Tailwind CSS (`garage-*` tokens) | Tailwind CSS (`garage-*` tokens) | Vercel | Free |
| **Data Storage** | Local JSON (`src/data/*.json`) | PostgreSQL 15+ (asyncpg raw SQL) | Supabase Free Tier | Free |
| **Media Assets** | `/public/assets/<section>/` | Supabase Storage (`assets` & `invoices`) | Vercel CDN / Supabase | Free |
| **State Management** | React `useState` & props | Zustand (`authStore`, `adminStore`) | Browser Memory | Free |
| **HTTP Client** | Native `fetch` (Google Places only) | Axios (JWT interceptors & error handlers) | Browser | Free |
| **Reviews Sync** | Browser fetch + `sessionStorage` | Google Places API backend sync (24h cache) | Google Cloud Console | Free Credit |
| **Contact Form** | Google Forms `<iframe>` embed | Custom form or Google Form | Google Forms | Free |
| **Backend API** | *None (deferred)* | FastAPI (Python >= 3.14, Pydantic v2) | Render Free Web Service | Free |
| **Authentication** | *None (deferred)* | Supabase Auth (Email, Magic Link, OTP) | Supabase Free Tier | Free |
| **PII Encryption** | *None (no PII in Phase 1)* | Fernet AES-256 (`cryptography`) | FastAPI Service Layer | Free |
| **Invoices** | *None (deferred)* | ReportLab PDF generator | FastAPI Service Layer | Free |
| **Keep-Alive** | *None (static CDN)* | cron-job.org (pings `GET /health` q10m) | cron-job.org | Free |

---

## 3. Data Layer & Content Architecture

### 3.1 Phase 1: Static JSON Data Schemas (`src/data/`)

All marketing and configuration content is stored in version-controlled JSON files under `frontend/src/data/`:

| File | Primary Keys / Contents | Description |
|---|---|---|
| `site.json` | `gym_name`, `tagline`, `about_story`, `address`, `phone`, `email`, `google_maps_embed_url`, `google_form_url`, `google_place_id`, `opening_hours` | Core gym metadata, NAP consistency, and iframe embed URLs |
| `hero.json` | `slideshow_interval_ms`, `slides[]`, `headline_before`, `headline_after`, `cta_buttons[]`, `stats[]` | Hero slideshow media, heading text, CTA links, and key stats |
| `services.json` | `services[]` (`id`, `name`, `slug`, `description`, `icon_filename`) | 8 gym training services and icon mappings |
| `plans.json` | `plans[]` (`id`, `tier`, `duration`, `price`, `description`) | 8 membership combinations (`basic`/`pt` × `monthly`/`quarterly`/`half_yearly`/`annual`) |
| `trainers.json` | `trainers[]` (`id`, `name`, `slug`, `specialization`, `experience_years`, `certifications[]`, `bio`, `photo_filename`, `display_order`) | Trainer profiles, credentials, and photos |
| `gallery.json` | `items[]` (`id`, `folder`, `filename`, `media_type`, `caption`, `display_order`) | Media gallery items across `gallery` and `transformations` |
| `achievements.json` | `achievements[]` (`id`, `label`, `value`, `display_order`) | Awards, stats milestones, and badges |
| `reviews.json` | `reviews[]` (`id`, `reviewer_name`, `review_text`, `rating`, `review_date`) | Static fallback reviews displayed if Google Places API fails |

### 3.2 Asset Management Conventions (`public/assets/`)
Static images and videos follow a section-named folder convention:
```
frontend/public/assets/
├── hero/              → Slideshow images and videos (e.g. slide-1.jpg, slide-2.mp4)
├── about/             → About section images (e.g. about-gym.jpg)
├── services/          → Service SVG/PNG icons (filename = <slug>.svg)
├── trainers/          → Trainer headshots (filename = <slug>.jpg)
├── gallery/           → General gym and equipment photos/videos
└── transformations/   → Before/after member transformation photos
```
* **URL Construction:** Handled exclusively via `buildAssetUrl(folder, filename)` in `src/utils/buildAssetUrl.ts`.

### 3.3 Phase 2: PostgreSQL Schema (`asyncpg` & Supabase)
When backend is activated, the 9 PostgreSQL tables defined in `docs/03_Database_Schema_Fitness_Garage.md` take over:
1. `members` (PII encrypted: `full_name`, `phone_number`, `email_address`, RLS enabled)
2. `membership_plans` (8 combinations, unique `(tier, duration)`)
3. `payments` (`amount`, `payment_date`, `payment_method`, `invoice_path`)
4. `trainers` (`slug`, `specialization`, `certifications`, `photo_filename`)
5. `services` (`slug`, `description`, `icon_filename`)
6. `gallery` (`folder_path`, `file_name`, `media_type`)
7. `reviews` (`google_review_id`, `rating`, `is_visible`, 24h sync)
8. `site_config` (`config_key`, `config_value`, `description`)
9. `achievements` (`label`, `value`, `display_order`)

---

## 4. The Replaceable Service Layer & Future Backend Wiring

### 4.1 Interface Contract (`src/services/publicService.ts`)
All components consume data exclusively through `publicService`, which returns standard Promises:

```typescript
// Phase 1 (Static — Active)
import siteData from '../data/site.json'
import heroData from '../data/hero.json'
import servicesData from '../data/services.json'
import plansData from '../data/plans.json'
import trainersData from '../data/trainers.json'
import galleryData from '../data/gallery.json'
import achievementsData from '../data/achievements.json'
import fallbackReviews from '../data/reviews.json'

export const publicService = {
  getSiteConfig: async () => siteData,
  getHeroData: async () => heroData,
  getServices: async () => servicesData.services,
  getPlans: async () => plansData.plans,
  getTrainers: async () => trainersData.trainers,
  getGallery: async (folder?: string) =>
    folder ? galleryData.items.filter(i => i.folder === folder) : galleryData.items,
  getAchievements: async () => achievementsData.achievements,
  getFallbackReviews: async () => fallbackReviews.reviews,
}
```

### 4.2 Phase 2 Backend Swap
When ready to wire the backend:
```typescript
// Phase 2 (Backend Wired — Future)
import { api } from './api'

export const publicService = {
  getSiteConfig: () => api.get('/public/site-config').then(r => r.data.data),
  getHeroData: () => api.get('/public/assets/hero').then(r => r.data.data),
  getServices: () => api.get('/public/services').then(r => r.data.data),
  getPlans: () => api.get('/public/plans').then(r => r.data.data),
  getTrainers: () => api.get('/public/trainers').then(r => r.data.data),
  getGallery: (folder?: string) => api.get('/public/gallery', { params: { folder } }).then(r => r.data.data),
  getAchievements: () => api.get('/public/achievements').then(r => r.data.data),
  getReviews: () => api.get('/public/reviews').then(r => r.data.data),
}
```

### 4.3 Phase 2 Swap Checklist
- [ ] Add `axios`, `@supabase/supabase-js`, `zustand`, `react-hook-form`, `zod` to `frontend/package.json`
- [ ] Update `src/services/publicService.ts` to call `/api/v1/public/**` via Axios
- [ ] Update `src/utils/buildAssetUrl.ts` to prefix Supabase Storage URL
- [ ] Activate `src/store/authStore.ts` and auth interceptors in `src/services/api.ts`
- [ ] Mount `ProtectedMemberRoute` and `ProtectedAdminRoute` in `src/router/index.tsx`
- [ ] Set `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in environment variables

---

## 5. Frontend Architecture & Page Directory

### 5.1 Directory Map
```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── og-default.jpg
│   └── assets/                    # Static section media assets
│       ├── hero/
│       ├── about/
│       ├── services/
│       ├── trainers/
│       ├── gallery/
│       └── transformations/
│
├── src/
│   ├── data/                      # ALL STATIC CONTENT JSON FILES
│   │   ├── site.json
│   │   ├── hero.json
│   │   ├── services.json
│   │   ├── plans.json
│   │   ├── trainers.json
│   │   ├── gallery.json
│   │   ├── achievements.json
│   │   └── reviews.json
│   │
│   ├── components/
│   │   ├── common/                # Button, Badge, Card, Modal, Spinner, SectionHeading, StatBlock, ErrorMessage
│   │   ├── layout/                # Navbar, Footer, PageWrapper, SectionWrapper, HeroPageBanner, AdminSidebar*
│   │   └── forms/                 # FormField*, SelectField*, FileUpload* (*Phase 2)
│   │
│   ├── pages/
│   │   ├── public/                # HomePage, AboutPage, ServicesPage, PlansPage, TrainersPage,
│   │   │                          # GalleryPage, TestimonialsPage, ContactPage, NotFoundPage
│   │   ├── auth/                  # MemberLoginPage*, AdminLoginPage* (*Phase 2)
│   │   ├── member/                # MemberDashboardPage*, MembershipStatusPage*, PaymentHistoryPage* (*Phase 2)
│   │   └── admin/                 # AdminDashboardPage*, MembersPage*, PaymentsPage*, etc. (*Phase 2)
│   │
│   ├── features/                  # Scoped feature components
│   │   ├── hero/                  # HeroSlideshow, HeroStats
│   │   ├── services/              # ServiceCard
│   │   ├── plans/                 # PlanCard
│   │   ├── trainers/              # TrainerCard
│   │   ├── gallery/               # GalleryGrid, GalleryLightbox
│   │   └── reviews/               # ReviewCard, GoogleReviews
│   │
│   ├── hooks/                     # useScrollReveal, useMediaQuery, useGoogleReviews, useDebounce
│   ├── services/                  # publicService.ts (Single Swap Point), api.ts*, memberService*, adminService*
│   ├── types/                     # site.ts, service.ts, plan.ts, trainer.ts, gallery.ts, review.ts, achievement.ts
│   ├── utils/                     # buildAssetUrl.ts, formatDate.ts, formatCurrency.ts
│   ├── constants/                 # routes.ts
│   ├── router/                    # index.tsx (Public routes code-split via React.lazy)
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
```

### 5.2 Public Routes Matrix (`constants/routes.ts`)

| Route Constant | Path | Page Component | Data Source |
|---|---|---|---|
| `ROUTES.HOME` | `/` | `HomePage` | Parallel `Promise.all` across site, hero, services, plans, trainers, achievements |
| `ROUTES.ABOUT` | `/about` | `AboutPage` | `site.json` (story, mission), `hero.json` (stats), `trainers.json` |
| `ROUTES.SERVICES` | `/services` | `ServicesPage` | `services.json` (all 8 services with SVG icons) |
| `ROUTES.PLANS` | `/plans` | `PlansPage` | `plans.json` (8 plan cards, ₹0 displayed as "Contact for pricing") |
| `ROUTES.TRAINERS` | `/trainers` | `TrainersPage` | `trainers.json` (profiles, certifications, bios, photos) |
| `ROUTES.GALLERY` | `/gallery` | `GalleryPage` | `gallery.json` (tabs: All, Gym, Transformations, Videos + Lightbox) |
| `ROUTES.TESTIMONIALS` | `/testimonials` | `TestimonialsPage` | `useGoogleReviews` (Google Places API + sessionStorage + fallback) |
| `ROUTES.CONTACT` | `/contact` | `ContactPage` | `site.json` (NAP info, Google Maps iframe, Google Form iframe) |
| `ROUTES.NOT_FOUND` | `*` | `NotFoundPage` | Static 404 with Chrome Slash and return CTA |

---

## 6. Google Reviews Integration & Browser Caching

### 6.1 Integration Flow
1. Component mounts and invokes `useGoogleReviews(placeId, apiKey)`.
2. Hook checks `sessionStorage.getItem('fg_reviews_cache')`.
   - **Cache Hit:** Parses and returns cached reviews instantly (zero layout shift, zero API consumption).
   - **Cache Miss:** Issues `fetch` call to Google Places API (`maps.googleapis.com/maps/api/place/details/json`).
3. On API success: Maps review data, writes to `sessionStorage`, renders `ReviewCard` components with "Powered by Google" attribution.
4. On API error or missing credentials: Catches error and falls back to static curated reviews from `src/data/reviews.json`.

### 6.2 Environment Variables
```env
# frontend/.env.local (gitignored)
VITE_GOOGLE_PLACES_API_KEY=<restricted-to-domain>
VITE_GOOGLE_PLACE_ID=<gym-place-id>
```
* **Security Requirement:** The Google Places API key must be restricted in Google Cloud Console to authorized HTTP referrers (e.g. `https://fitnessgarage.vercel.app/*` and production custom domains).

---

## 7. Backend Structure & Repository Organization (`backend/`)

The full backend architecture is preserved in `backend/` ready for Phase 2 deployment:

```
backend/
├── app/
│   ├── main.py                  # FastAPI app with CORS, health routes, lifespan connection pool
│   ├── core/
│   │   ├── config.py            # Environment settings (Pydantic BaseSettings)
│   │   ├── security.py          # Fernet AES-256 encrypt/decrypt helpers
│   │   └── auth.py              # Supabase JWT decoding and role dependencies
│   ├── schemas/                 # Pydantic v2 schemas for all 9 domain entities
│   ├── services/                # Business logic: member_service, payment_service, invoice_service,
│   │                            # import_service, reviews_service, storage_service
│   └── routers/
│       ├── public/              # /api/v1/public/** endpoints
│       ├── member/              # /api/v1/member/** endpoints
│       └── admin/               # /api/v1/admin/** endpoints
└── db/
    ├── connection.py            # asyncpg connection pool
    ├── migrate.py               # Plain SQL migration runner against _migrations table
    ├── migrations/              # 14 SQL migration scripts (000_init.sql ... 013_seed_site_config.sql)
    └── queries/                 # Parameterized SQL query modules per entity
```

---

## 8. Security & Data Protection Architecture

### 8.1 Phase 1 Security Controls
- **API Key Scoping:** `VITE_GOOGLE_PLACES_API_KEY` restricted to HTTP domain referrers in Google Cloud Console.
- **Secret Detection:** Yelp `detect-secrets` configured in pre-commit to prevent accidental credential commits.
- **No Backend Secrets:** Zero database credentials or private keys in the frontend bundle.

### 8.2 Phase 2 Security Controls (Preserved in Backend)
- **PII Encryption (AES-256):** Fernet symmetric encryption applied to `full_name`, `phone_number`, `email_address` before database writes.
- **Postgres Row Level Security (RLS):** Members restricted to `auth.uid() = supabase_user_id`; Admin/Dev role bypasses via Service Role Key.
- **In-Memory JWT:** Supabase JWT stored strictly in memory (`authStore.ts`), never in `localStorage` or `sessionStorage`.
- **Private Invoices:** Invoice PDFs stored in private bucket `invoices/<member_id>/<payment_id>.pdf` accessed strictly via temporary signed URLs (60-min expiry).

---

## 9. SEO Strategy & Technical Implementation

> Extracted from [`docs/08_SEO_Strategy_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/08_SEO_Strategy_Fitness_Garage.md).

### 9.1 NAP Consistency & Metadata
- **Single Source of Truth:** Gym name, address, phone, email, and Google Maps embed are bound from `site.json` / `publicService.getSiteConfig()`.
- **PageWrapper Component:** Injects canonical URLs, unique titles (≤ 60 chars), meta descriptions (≤ 155 chars), Open Graph tags, and Twitter Cards on every page.

### 9.2 Structured Data (5 JSON-LD Schemas)
1. **`GymOrSportsClub` (`index.html`):** Base business identity with address, geo-coordinates, opening hours, and Google Place CID.
2. **`BreadcrumbList` (`PageWrapper.tsx`):** Injected dynamically for all inner pages.
3. **`ItemList` (`ServicesPage.tsx`):** Structured list of all 8 fitness services.
4. **`Person` (`TrainersPage.tsx`):** Structured trainer profiles with job titles and credentials.
5. **`AggregateRating` & `Review` (`TestimonialsPage.tsx`):** Structured review rating data.

### 9.3 Core Web Vitals Optimization
- **LCP (< 2.5s):** First hero slide preloaded via `<link rel="preload">` in `index.html`.
- **CLS (< 0.1):** Explicit `width` and `height` on all media elements; zero layout shifts from review hydration.
- **Vite Chunk Splitting:** Vendor chunk separation (`react`, `react-dom`, `react-router-dom`).
- **Font Optimization:** Google Fonts preconnected with `display=swap`.

---

## 10. Development, Tooling & Operational Workflow

### 10.1 Development Automation (`Makefile`)
```bash
make help               # Display all available targets
make setup              # First-time setup: npm ci, pre-commit install, .env.local copy
make dev                # Start Vite dev server at http://localhost:5173
make lint               # Run ESLint and tsc type check
make format             # Run Prettier code formatter
make test               # Run type check, production build, and JSON data validation
make validate-data      # Validate syntax and required keys across all src/data/*.json files
make placeholder-check  # Audit remaining TBD / placeholder values in data files
make pre-commit-run     # Run all pre-commit hooks against all files
make ready              # Pre-PR check (format-check + lint + test + validate-data + pre-commit)
make docker-up          # Start frontend in Docker container
```

### 10.2 CI Pipeline (`.github/workflows/ci.yml`)
- **`frontend-ci`:** Runs Prettier check, ESLint (`--max-warnings=0`), `tsc --noEmit`, and `vite build`.
- **`data-validate`:** Validates JSON syntax and required schema keys for `site.json`, `hero.json`, and 8-plan constraint in `plans.json`.
- **`lighthouse`:** Runs Lighthouse CI on PRs to `main` to enforce Core Web Vitals thresholds (Performance ≥ 90, CLS < 0.1, LCP < 2.5s).
- **`ci-gate`:** Required PR status check ensuring all jobs pass.

### 10.3 Pre-Commit Enforcement (`.pre-commit-config.yaml`)
- General checks: trailing whitespace, end-of-file newline, YAML/TOML/JSON syntax, large files (≤ 5MB), private keys, case conflicts.
- Branch protection: blocks direct commits to `main`.
- Secrets detection: Yelp `detect-secrets` with baseline.
- Code quality: Prettier, ESLint, TypeScript `tsc --noEmit`, JSON data validator, markdownlint.

---

## 11. Project Milestones & Deliverables Roadmap

### 11.1 Static Web Application Roadmap (v2.0)
```
Phase 0 │ Setup & Infrastructure            Week 1 (Days 1–2)   🟢 COMPLETED
Phase 1 │ Component Library & Public Pages  Week 1–2 (Days 3–10) 🟢 COMPLETED
Phase 2 │ Integrations, SEO & Launch        Week 3 (Days 11–15)  🟢 COMPLETED / READY FOR ASSETS
```

### 11.2 Phase 2 Future Backend Roadmap (Documented & Ready)
When client requests Member Portal, Admin Dashboard, and backend database:
1. Wire `publicService.ts` to FastAPI endpoints.
2. Deploy FastAPI on Render with `cron-job.org` keep-alive ping.
3. Provision Supabase Postgres instance and run 14 SQL migrations via `python -m db.migrate`.
4. Deploy Supabase Auth and configure Twilio for Phone OTP (if desired).
5. Activate Admin Dashboard (11 modules) and Member Portal (3 pages) in frontend.

---

## 12. Development Methodology & AI Agent Guidelines

### 12.1 Git Branching & Commit Conventions
- **Branches:** `main` (production), `develop` (integration), `feature/frontend/<desc>`, `chore/content/<desc>`, `fix/frontend/<desc>`.
- **Commit Format:** `<type>(<scope>): <description>` (e.g. `feat(frontend): add hero slideshow with crossfade`, `content(plans): update quarterly pricing`).

### 12.2 Ponytail Review & Complexity Elimination Gate
- **After every feature development or code change**, the AI agent **MUST** execute a `ponytail` / `ponytail-review` pass to eliminate dead code, over-engineering, and speculative abstractions.
- **Review Output Persistence:** The full review output **MUST** be saved to `review-docs/<feature-name>.md`.
- **Progression Gate:** No progress is permitted until all comments in `review-docs/` are addressed in code or explicitly rationalized.

### 12.3 Definition of Done (10 Binary Gates)
1. Code matches the specification exactly — no scope creep, no omissions.
2. Ponytail review output saved to `review-docs/<feature-name>.md` with 100% of comments resolved.
3. Feature tests and data file validations passing (`make test`).
4. Full regression suite passing (0 ESLint warnings, 0 TypeScript errors).
5. Pre-commit hooks passing (`make pre-commit-run`).
6. PR description completed with all checklist items verified.
7. CI pipeline green on GitHub Actions.
8. PR squash-merged to `develop`.
9. Feature branch deleted.
10. Zero `TODO`, `FIXME`, `console.log`, or leftover debug code.
