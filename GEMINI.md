# Fitness Garage — Project Context & Developer Guidelines

> **Single Source of Truth** for AI Agents and Developers working on the **Fitness Garage** full-stack gym platform.
> Compiled from official requirements in [`docs/`](file:///home/arch/projects/fitness-garage/docs).

---

## 0. Official Documentation Index

| # | Document | Purpose |
|---|---|---|
| 1 | [`01_PRD_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/01_PRD_Fitness_Garage.md) | Product requirements, problem statement, features, and user personas |
| 2 | [`02_Technical_Architecture_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/02_Technical_Architecture_Fitness_Garage.md) | System topology, component interactions, cloud topology, and stack |
| 3 | [`03_Database_Schema_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/03_Database_Schema_Fitness_Garage.md) | PostgreSQL schema, raw parameterized SQL with asyncpg, migrations, RLS |
| 4 | [`04_API_Specification_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/04_API_Specification_Fitness_Garage.md) | Complete REST API reference (35 endpoints), schemas, error envelopes |
| 5 | [`05_Frontend_Component_Architecture_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/05_Frontend_Component_Architecture_Fitness_Garage.md) | React 18+ component tree, Tailwind tokens, Zustand stores, router |
| 6 | [`06_Admin_Dashboard_Specification_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/06_Admin_Dashboard_Specification_Fitness_Garage.md) | 11 admin modules, wireframes, CRUD workflows, bulk import |
| 7 | [`07_Member_Portal_Specification_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/07_Member_Portal_Specification_Fitness_Garage.md) | Member portal, 3-way auth, status badges, payment history, invoices |
| 8 | [`08_SEO_Strategy_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/08_SEO_Strategy_Fitness_Garage.md) | Local SEO, 5 JSON-LD schemas, Core Web Vitals, Open Graph, sitemap |
| 9 | [`09_Project_Milestones_Deliverables_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/09_Project_Milestones_Deliverables_Fitness_Garage.md) | 6 project phases, timeline, deliverables register, risk mitigations |
| 10 | [`10_Dev_Handover_README_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/10_Dev_Handover_README_Fitness_Garage.md) | Developer setup, operational guides, storage conventions, checklists |
| 11 | [`11_Dev_Methodology_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/11_Dev_Methodology_Fitness_Garage.md) | Branching, 11-step workflow, Ponytail review, Definition of Done |

---

## 1. Project Overview & Identity

### 1.1 Purpose & Problem Statement
Fitness Garage is a greenfield full-stack gym website serving as both:
1. **Public Marketing & Portfolio Site:** Showcase gym amenities, services, membership plans, trainer profiles, transformations, gallery media, achievements, and live Google Reviews to prospective members.
2. **Member & Admin Portal:** Lightweight member self-service portal (view membership status, expiry date, download invoices) and a centralized administrative control plane (member CRUD, bulk CSV/Excel import, payment recording with automated PDF invoice generation, content & site configuration management).

### 1.2 Stakeholders & Roles
| Role | Description | Access Level |
|---|---|---|
| **Website Visitor** | Prospective members browsing public information | Public routes only |
| **Member** | Authenticated gym member | Member Portal (`/member/**`) |
| **Admin / Staff** | Gym owner & staff managing operations (single unified admin role) | Admin Dashboard (`/admin/**`) + Member Portal |
| **Developer** | Maintenance and debugging role | All routes + Dev endpoints |

### 1.3 Launch Scale & Constraints
- **Members at launch:** 200+ existing members (bulk imported from Excel/CSV).
- **Admin/Staff users:** 6 users.
- **Growth:** ~10 new members/month.
- **Concurrency:** Peak ~20 concurrent users (read-heavy).
- **Budget:** Shoestring — zero-cost operational tier across all providers.

### 1.4 Governing Architectural Principles
* **DRY (Don't Repeat Yourself):** Reusable base components, single API service abstractions, shared SQL trigger functions, unified modal/table patterns.
* **SOLID:** Single-responsibility routers, dedicated query modules per resource, dependency injection via FastAPI.
* **KISS (Keep It Simple, Stupid):** Flat data models, raw parameterized SQL with `asyncpg`, Zustand stores instead of Redux, no premature message queues or caching layers.
* **YAGNI (You Aren't Gonna Need It):** Build strictly what is required for v1.0. No speculative features (no online payments, no class booking, no analytics charts).
* **Extensible:** Decoupled service layers allow new integrations (SMS notifications, payment gateways) without touching core business logic.
* **Replaceable:** Infrastructure behind abstraction boundaries (swappable to AWS without code rewrites).

### 1.5 Brand & Design Tokens
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
  * **Semantic Status:**
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

### 2.1 Technology Stack Summary
| Area | Technology | Choice & Version | Details |
|---|---|---|---|
| **Frontend** | React 18+, TypeScript, Vite | Latest stable | Hosted on Vercel |
| **Styling** | Tailwind CSS | Latest stable | Custom tokens (`garage-*`), mobile-first |
| **State Management**| Zustand | Latest stable | Lightweight, in-memory auth & filter state |
| **Forms & Validation**| React Hook Form + Zod | Latest stable | Type-safe schema validation |
| **Icons** | Lucide React | Latest stable | Clean, tree-shakeable icons |
| **Backend Framework**| FastAPI | Python >= 3.14 | Async REST API, Pydantic v2 schemas |
| **Package Manager** | `uv` | Latest | High-performance Python packaging |
| **Database Driver** | `asyncpg` | Latest | Raw parameterized SQL (No ORM, No Alembic) |
| **Database Engine** | PostgreSQL 15+ | Supabase Free Tier | RLS enabled for member tables |
| **Authentication** | Supabase Auth | Free Tier | Email/Password, Magic Link (SSO), Phone OTP |
| **Storage (Media)** | Supabase Storage | 1 GB Free | Buckets for assets and private invoices |
| **PII Encryption** | `cryptography` (Fernet) | AES-256 | App-level encryption for name/phone/email |
| **PDF Generation** | `reportlab` | Latest | Server-side invoice generation |
| **Bulk Import** | `pandas` + `openpyxl` | Latest | CSV & Excel parser |
| **Reviews Sync** | Google Places API | v1 | Cached in DB; refreshed every 24 hours |
| **Keep-Alive** | cron-job.org | Free | Pings `GET /health` every 10 min to keep Render warm |

---

## 3. Security & Data Protection Architecture

### 3.1 Application-Level PII Encryption (AES-256)
To ensure compliance and privacy, all Personally Identifiable Information (PII) is encrypted before writing to PostgreSQL and decrypted only upon API response generation.
- **Encrypted Fields in `members` table:**
  1. `full_name`
  2. `phone_number`
  3. `email_address`
- **Mechanism:** Fernet symmetric encryption (`AES-256-CBC` with `HMAC-SHA256`) via Python's `cryptography` package.
- **Key Storage:** `AES_ENCRYPTION_KEY` stored in environment variables (never committed).
- **Execution Boundary:** Handled **strictly** in the FastAPI router/service layer — never in raw query modules, and never exposed to the frontend.

### 3.2 Row Level Security (RLS)
Postgres Row Level Security provides defense-in-depth:
- `members`: Members can only `SELECT` their own row where `auth.uid() = supabase_user_id`.
- `payments`: Members can only `SELECT` payments linked to their `member_id`.
- `admin` and `dev` roles bypass RLS policies using the Supabase Service Role Key at the backend layer.

### 3.3 JWT & Token Management
- Supabase Auth issues JWTs containing the user role (`member`, `admin`, `dev`) in user metadata.
- **Client Storage:** JWT is held strictly **in-memory** in Zustand (`authStore.ts`) — **never in `localStorage` or `sessionStorage`** to prevent XSS leakage.
- **Transport:** Axios request interceptor injects `Authorization: Bearer <token>`. 401 errors clear auth state and redirect to `/login`.

---

## 4. Database Architecture & Schema (`asyncpg`)

> **Architectural Decision (v1.1):** No ORM (SQLAlchemy) and no Alembic. Database operations use raw parameterized SQL via `asyncpg` with `$1, $2, ...` placeholders. Migrations are ordered `.sql` files executed via `db/migrate.py` tracked in a `_migrations` table.

### 4.1 ER Diagram
```
auth.users (Supabase Auth)
    │
    │ supabase_user_id (UUID)
    ▼
members (PII Encrypted: full_name, phone_number, email_address)
    │
    ├── member_id ──► payments (amount, payment_date, method, invoice_path)
    │
    └── membership_plan_id ──► membership_plans (tier, duration, price)

trainers (slug, specialization, photo_filename, display_order)
services (slug, description, icon_filename, display_order)
gallery (folder_path, file_name, media_type, display_order)
reviews (google_review_id, reviewer_name, review_text, rating, is_visible)
site_config (config_key, config_value, description)
achievements (label, value, display_order, is_active)
```

### 4.2 Core Tables Summary

#### 1. `members`
- `id` (UUID PK), `supabase_user_id` (UUID, nullable, unique), `full_name` (TEXT encrypted), `phone_number` (TEXT encrypted), `email_address` (TEXT encrypted), `membership_plan_id` (UUID FK -> `membership_plans`), `status` (TEXT: `active`, `expired`, `pending`, `suspended`), `start_date` (DATE), `expiry_date` (DATE), `imported` (BOOLEAN), `notes` (TEXT admin-only), `created_at`, `updated_at`.

#### 2. `membership_plans`
- `id` (UUID PK), `tier` (TEXT: `basic`, `pt`), `duration` (TEXT: `monthly`, `quarterly`, `half_yearly`, `annual`), `price` (NUMERIC(10,2)), `description` (TEXT), `is_active` (BOOLEAN), `created_at`, `updated_at`.
- Unique constraint on `(tier, duration)`. 8 pre-seeded fixed combinations.

#### 3. `payments`
- `id` (UUID PK), `member_id` (UUID FK -> `members`), `membership_plan_id` (UUID FK -> `membership_plans`), `amount` (NUMERIC(10,2)), `payment_date` (DATE), `payment_method` (TEXT: `cash`, `card`, `upi`, `bank_transfer`, `other`), `invoice_path` (TEXT), `notes` (TEXT), `recorded_by` (UUID), `created_at`, `updated_at`.

#### 4. `trainers`
- `id` (UUID PK), `name` (TEXT), `slug` (TEXT unique), `specialization` (TEXT), `experience_years` (INTEGER), `certifications` (TEXT[]), `bio` (TEXT), `photo_filename` (TEXT), `display_order` (INTEGER), `is_active` (BOOLEAN), `created_at`, `updated_at`.

#### 5. `services`
- `id` (UUID PK), `name` (TEXT), `slug` (TEXT unique), `description` (TEXT), `icon_filename` (TEXT), `display_order` (INTEGER), `is_active` (BOOLEAN), `created_at`, `updated_at`.

#### 6. `gallery`
- `id` (UUID PK), `folder_path` (TEXT: `assets/gallery`, `assets/transformations`), `file_name` (TEXT), `media_type` (TEXT: `image`, `video`), `caption` (TEXT), `display_order` (INTEGER), `is_active` (BOOLEAN), `uploaded_by` (UUID), `created_at`, `updated_at`. Unique `(folder_path, file_name)`.

#### 7. `reviews`
- `id` (UUID PK), `google_review_id` (TEXT unique), `reviewer_name` (TEXT), `review_text` (TEXT), `rating` (INTEGER 1-5), `review_date` (DATE), `last_synced_at` (TIMESTAMPTZ), `is_visible` (BOOLEAN default true), `created_at`, `updated_at`.

#### 8. `site_config`
- `id` (UUID PK), `config_key` (TEXT unique), `config_value` (TEXT), `description` (TEXT), `updated_at`.
- Keys: `stat_members_count`, `stat_years_in_business`, `stat_trainers_count`, `stat_transformations`, `achievement_*`, `gym_name`, `gym_address`, `gym_phone`, `gym_email`, `gym_maps_embed_url`, `gym_google_form_url`, `gym_google_place_id`, `reviews_last_synced_at`, `hero_slideshow_interval_ms`, `about_tagline`, `about_story`.

#### 9. `achievements`
- `id` (UUID PK), `label` (TEXT), `value` (TEXT), `display_order` (INTEGER), `is_active` (BOOLEAN), `created_at`, `updated_at`.

### 4.3 Supabase Storage Conventions
* Public Bucket (`assets`):
  * `assets/hero/` — Slideshow images/videos
  * `assets/about/` — About section photos
  * `assets/services/` — Service icons (`.svg` / `.png`)
  * `assets/trainers/` — Trainer photos (`<slug>.jpg`)
  * `assets/gallery/` — General gym photos & videos
  * `assets/transformations/` — Member transformation photos
  * `assets/plans/` — Plan graphics
* Private Bucket (`invoices`):
  * `invoices/<member_id>/<payment_id>.pdf` — Signed URL access only (60 min expiry).

---

## 5. API Specification & Endpoints Reference

**Base URL:** `/api/v1`

### 5.1 Envelopes
* **Success Single:** `{ "data": { ... }, "message": "Operation successful" }`
* **Success List:** `{ "data": [ ... ], "total": 42, "next_cursor": "uuid", "message": "Operation successful" }`
* **Error:** `{ "error": "ERROR_CODE", "message": "Detailed description", "status": 400 }`

### 5.2 Endpoint Catalog (35 Total Endpoints)
| Method | Route | Auth Role | Description |
|---|---|---|---|
| `GET` | `/health` | Open | Health check & keep-alive ping |
| `GET` | `/public/site-config` | Open | Site configuration key-values |
| `GET` | `/public/assets/hero` | Open | List hero slideshow media files |
| `GET` | `/public/assets/about` | Open | List about section media files |
| `GET` | `/public/achievements` | Open | Active home page achievements |
| `GET` | `/public/services` | Open | Active services list with icon URLs |
| `GET` | `/public/plans` | Open | Active membership plans matrix |
| `GET` | `/public/trainers` | Open | Active trainer profiles with photo URLs |
| `GET` | `/public/gallery` | Open | Gallery & transformation media items |
| `GET` | `/public/reviews` | Open | Cached Google Reviews (24h background sync) |
| `GET` | `/member/me` | Member/Admin | Current authenticated member details |
| `GET` | `/member/payments` | Member/Admin | Paginated payment history for self |
| `GET` | `/member/payments/{id}/invoice` | Member/Admin | Signed temporary download URL for invoice PDF |
| `GET` | `/admin/members` | Admin/Dev | Paginated & searchable member list |
| `GET` | `/admin/members/{id}` | Admin/Dev | Full member detail view |
| `POST` | `/admin/members` | Admin/Dev | Create new member (encrypts PII) |
| `PUT` | `/admin/members/{id}` | Admin/Dev | Partial/full member update |
| `DELETE` | `/admin/members/{id}` | Admin/Dev | Soft-delete member (sets `status='suspended'`) |
| `POST` | `/admin/members/import` | Admin/Dev | Bulk CSV/Excel member import |
| `GET` | `/admin/payments` | Admin/Dev | Paginated payment list with date/member filters |
| `POST` | `/admin/payments` | Admin/Dev | Record payment & generate invoice PDF |
| `GET` | `/admin/payments/{id}/invoice` | Admin/Dev | Signed temporary download URL for invoice |
| `GET` | `/admin/plans` | Admin/Dev | All plans (including inactive) |
| `PUT` | `/admin/plans/{id}` | Admin/Dev | Update plan pricing, description, active state |
| `GET` | `/admin/services` | Admin/Dev | All services |
| `POST` | `/admin/services` | Admin/Dev | Create service |
| `PUT` | `/admin/services/{id}` | Admin/Dev | Update service |
| `DELETE` | `/admin/services/{id}` | Admin/Dev | Soft-delete service |
| `GET` | `/admin/trainers` | Admin/Dev | All trainer profiles |
| `POST` | `/admin/trainers` | Admin/Dev | Create trainer profile |
| `PUT` | `/admin/trainers/{id}` | Admin/Dev | Update trainer profile |
| `DELETE` | `/admin/trainers/{id}` | Admin/Dev | Soft-delete trainer profile |
| `GET` | `/admin/gallery` | Admin/Dev | All gallery items |
| `POST` | `/admin/gallery` | Admin/Dev | Register uploaded storage asset |
| `PUT` | `/admin/gallery/{id}` | Admin/Dev | Update caption, order, visibility |
| `DELETE` | `/admin/gallery/{id}` | Admin/Dev | Delete gallery DB record and storage file |
| `GET` | `/admin/site-config` | Admin/Dev | All site config keys with descriptions |
| `PUT` | `/admin/site-config` | Admin/Dev | Bulk update site config keys |
| `GET` | `/admin/achievements` | Admin/Dev | All achievements |
| `POST` | `/admin/achievements` | Admin/Dev | Create achievement |
| `PUT` | `/admin/achievements/{id}` | Admin/Dev | Update achievement |
| `DELETE` | `/admin/achievements/{id}` | Admin/Dev | Soft-delete achievement |
| `GET` | `/admin/reviews` | Admin/Dev | All reviews (including hidden) |
| `PUT` | `/admin/reviews/{id}` | Admin/Dev | Toggle review visibility (`is_visible`) |
| `POST` | `/admin/reviews/sync` | Admin/Dev | Force manual sync from Google Places API |

---

## 6. Frontend Architecture & Page Directory

### 6.1 Directory Map
```
frontend/src/
├── assets/                     # Static assets (logo.svg)
├── components/
│   ├── common/                 # Button, Badge, Card, Modal, Spinner, Divider,
│   │                           # SectionHeading, StatBlock, EmptyState, ErrorMessage
│   ├── layout/                 # Navbar, Footer, PageWrapper, SectionWrapper, AdminSidebar
│   └── forms/                  # FormField, SelectField, TextareaField, FileUpload
├── pages/
│   ├── public/                 # HomePage, AboutPage, ServicesPage, PlansPage,
│   │                           # TrainersPage, GalleryPage, TestimonialsPage, ContactPage
│   ├── auth/                   # MemberLoginPage, AdminLoginPage
│   ├── member/                 # MemberDashboardPage, MembershipStatusPage, PaymentHistoryPage
│   └── admin/                  # AdminDashboardPage, MembersPage, MemberDetailPage,
│                               # MemberImportPage, PaymentsPage, PlansAdminPage,
│                               # ServicesAdminPage, TrainersAdminPage, GalleryAdminPage,
│                               # StatsAdminPage, SettingsPage
├── features/                   # Scoped modules (hero slideshow, member table, payment forms)
├── hooks/                      # useScrollReveal, useMediaQuery, useDebounce
├── services/                   # api.ts (Axios), publicService.ts, memberService.ts, adminService.ts
├── store/                      # authStore.ts (in-memory JWT), siteConfigStore.ts, adminStore.ts
├── types/                      # TypeScript interfaces (auth, member, payment, plan, trainer, etc.)
├── utils/                      # formatDate, formatCurrency, getMembershipStatus, buildStorageUrl
├── constants/                  # routes.ts, queryKeys.ts
└── router/                     # index.tsx, PublicRoute.tsx, ProtectedMemberRoute, ProtectedAdminRoute
```

### 6.2 Frontend Routes Matrix (`constants/routes.ts`)
| Route Constant | Path | Protection |
|---|---|---|
| `ROUTES.HOME` | `/` | Public |
| `ROUTES.ABOUT` | `/about` | Public |
| `ROUTES.SERVICES` | `/services` | Public |
| `ROUTES.PLANS` | `/plans` | Public |
| `ROUTES.TRAINERS` | `/trainers` | Public |
| `ROUTES.GALLERY` | `/gallery` | Public |
| `ROUTES.TESTIMONIALS` | `/testimonials` | Public |
| `ROUTES.CONTACT` | `/contact` | Public |
| `ROUTES.MEMBER_LOGIN` | `/login` | Public (Redirects if logged in) |
| `ROUTES.ADMIN_LOGIN` | `/admin/login` | Public (Redirects if logged in) |
| `ROUTES.MEMBER_DASHBOARD` | `/member/dashboard` | `ProtectedMemberRoute` (`member`, `admin`, `dev`) |
| `ROUTES.MEMBER_MEMBERSHIP` | `/member/membership` | `ProtectedMemberRoute` |
| `ROUTES.MEMBER_PAYMENTS` | `/member/payments` | `ProtectedMemberRoute` |
| `ROUTES.ADMIN_DASHBOARD` | `/admin/dashboard` | `ProtectedAdminRoute` (`admin`, `dev`) |
| `ROUTES.ADMIN_MEMBERS` | `/admin/members` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_MEMBER_NEW` | `/admin/members/new` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_MEMBER_DETAIL` | `/admin/members/:id` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_MEMBER_IMPORT` | `/admin/members/import` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_PAYMENTS` | `/admin/payments` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_PLANS` | `/admin/plans` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_SERVICES` | `/admin/services` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_TRAINERS` | `/admin/trainers` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_GALLERY` | `/admin/gallery` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_STATS` | `/admin/stats` | `ProtectedAdminRoute` |
| `ROUTES.ADMIN_SETTINGS` | `/admin/settings` | `ProtectedAdminRoute` |

---

## 7. Backend Structure & Code Organization (`backend/`)

```
backend/
├── app/
│   ├── main.py                  # FastAPI instantiation + Lifespan connection pool
│   ├── core/
│   │   ├── config.py            # Environment settings (Pydantic BaseSettings)
│   │   ├── security.py          # Fernet AES-256 encrypt/decrypt helper functions
│   │   └── auth.py              # Supabase JWT decoding, verify dependencies
│   ├── schemas/                 # Pydantic v2 schemas for request/response validation
│   │   ├── member.py
│   │   ├── payment.py
│   │   ├── plan.py
│   │   ├── trainer.py
│   │   ├── service.py
│   │   ├── gallery.py
│   │   ├── review.py
│   │   └── site_config.py
│   ├── services/                # Business logic & integrations
│   │   ├── member_service.py
│   │   ├── payment_service.py
│   │   ├── invoice_service.py   # ReportLab PDF invoice generator
│   │   ├── import_service.py    # pandas/openpyxl bulk member importer
│   │   ├── reviews_service.py   # Google Places API client
│   │   └── storage_service.py   # Supabase Storage helper (signed URLs)
│   └── routers/
│       ├── public/              # services, trainers, gallery, plans, reviews, site_config
│       ├── member/              # me, payments, invoice
│       └── admin/               # members, payments, plans, services, trainers, gallery, stats, settings
└── db/
    ├── connection.py            # asyncpg connection pool init and dependency injection
    ├── migrate.py               # SQL migrations runner against _migrations table
    ├── migrations/              # Plain .sql migration scripts (000_init.sql ... 013_seed_site_config.sql)
    └── queries/                 # Parameterized SQL query modules per resource
        ├── member_queries.py
        ├── payment_queries.py
        ├── plan_queries.py
        ├── trainer_queries.py
        ├── service_queries.py
        ├── gallery_queries.py
        ├── review_queries.py
        ├── site_config_queries.py
        └── achievement_queries.py
```

---

## 8. Development & Operational Commands

### 8.1 Backend (Python + uv)
```bash
# Install dependencies
uv sync

# Run database migrations
uv run python -m db.migrate

# Start local backend dev server
uv run uvicorn app.main:app --reload --port 8000

# Run backend test suite
uv run pytest
```

### 8.2 Frontend (React + Vite)
```bash
# Install dependencies
npm install

# Start local frontend dev server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

---

## 9. Explicit Boundaries: In-Scope vs Out-of-Scope

### 9.1 In-Scope for Launch (v1.0)
* Full responsive public marketing site (Home, About, Services, Plans, Trainers, Gallery, Testimonials, Contact).
* Admin Dashboard for member CRUD, bulk import, manual payment entry, invoice generation, and full site content configuration.
* Member Portal for viewing membership status, expiry alerts, and downloading invoices.
* Google Reviews auto-sync with 24-hour cache.
* AES-256 PII field encryption & Supabase RLS policies.
* 100% free-tier zero-cost architecture with keep-alive cron ping.

### 9.2 Explicitly Out of Scope (Phase 2+ / Deferred)
* ❌ Online payment gateways (Razorpay/Stripe) — payments recorded manually by admin.
* ❌ SMS / WhatsApp automated notifications (deferred to Phase 2).
* ❌ Class booking / timetable scheduling system.
* ❌ Member workout/fitness tracking logs.
* ❌ Multi-branch / multiple gym location support.
* ❌ Native iOS/Android mobile apps.

---

## 10. SEO Strategy & Technical Implementation

> Extracted from [`docs/08_SEO_Strategy_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/08_SEO_Strategy_Fitness_Garage.md).

### 10.1 SEO Objectives & NAP Consistency
* **Objective:** Local search visibility for "[City] gym", "personal trainer [City]", "fitness classes [City]" and brand dominance for "Fitness Garage".
* **NAP (Name, Address, Phone):** Must be identical across website footer, Contact page, Google Business Profile, and schema markup.
* **Single Source of Truth:** All contact information and map embeds are pulled dynamically from `site_config` (`gym_name`, `gym_address`, `gym_phone`, `gym_email`, `gym_maps_embed_url`). No hardcoded addresses in JSX.

### 10.2 Structured Data (JSON-LD Schemas)
1. **`GymOrSportsClub` (Home / `index.html`):** Static/dynamic injection with `PostalAddress`, `GeoCoordinates`, `openingHoursSpecification`, `amenityFeature`, and `sameAs` Google Place CID.
2. **`BreadcrumbList` (`PageWrapper.tsx`):** Injected dynamically on inner pages via `breadcrumbs` prop.
3. **`ItemList` (Services Page):** Dynamically generated list of `Service` items populated from `GET /public/services`.
4. **`Person` (Trainers Page):** Dynamic `ItemList` of `Person` schemas generated from `GET /public/trainers`.
5. **`AggregateRating` & `Review` (Testimonials Page):** Aggregated rating and individual reviews generated from `GET /public/reviews`.

### 10.3 Technical SEO & Metadata Pattern (`PageWrapper`)
* Every public page is wrapped in `<PageWrapper>` which injects:
  - Canonical URL `<link rel="canonical" href="..." />`
  - Unique `<title>` (Pattern: `[Page Topic] — Fitness Garage, [City]` ≤ 60 chars)
  - Unique `<meta name="description">` (≤ 155 chars)
  - Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
  - Twitter Card tags (`twitter:card="summary_large_image"`, etc.)
* **Robots & Indexing:**
  - `public/robots.txt` allows all public pages and explicitly disallows `/member/`, `/admin/`, `/login`, `/api/`.
  - `public/sitemap.xml` lists all 8 public routes with priority and change frequencies.
  - Protected routes (`ProtectedMemberRoute`, `ProtectedAdminRoute`) inject `<meta name="robots" content="noindex, nofollow" />`.

### 10.4 Core Web Vitals Optimization
* **LCP (< 2.5s):** Preload first hero slide with `<link rel="preload" as="image" href="..." />`. Supabase Storage CDN delivery.
* **CLS (< 0.1):** Explicit `width` and `height` on all `<img>` tags. Skeleton loading states during data fetch.
* **FID / INP (< 200ms):** Vite manual chunk splitting (`vendor`, `auth`, `forms`), lazy loading routes with `React.lazy()`.
* **Font Loading:** Google Fonts preconnected with `display=swap`.

---

## 11. Project Milestones, Phases & Deliverables

> Extracted from [`docs/09_Project_Milestones_Deliverables_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/09_Project_Milestones_Deliverables_Fitness_Garage.md).

### 11.1 6-Phase Roadmap Overview
```
Phase 0 │ Project Setup & Infrastructure         (Week 1)
Phase 1 │ Database & Backend Foundation          (Week 2)
Phase 2 │ Public Website Frontend                (Weeks 3–4)
Phase 3 │ Admin Dashboard                        (Weeks 5–6)
Phase 4 │ Member Portal                          (Week 7)
Phase 5 │ Integrations & SEO                     (Week 8, First Half)
Phase 6 │ QA, Hardening & Deployment             (Week 8, Second Half)
```

### 11.2 Milestone Acceptance Highlights
* **Phase 0:** Monorepo setup, Vite + React frontend, FastAPI backend, Supabase project, Vercel/Render CI/CD, AES key generation, keep-alive ping.
* **Phase 1:** 14 SQL migrations (000–013), `db/migrate.py`, connection pool, AES-256 encrypt/decrypt helper, Supabase JWT auth guards, 9 query modules, 4 service layers, 35 endpoints, pytest suite.
* **Phase 2:** 8 public marketing pages, Tailwind design tokens, Zustand stores, custom hooks, component primitives, responsive layouts (375px, 768px, 1280px).
* **Phase 3:** 11 admin modules, `AdminSidebar`, CRUD for all entities, bulk Excel/CSV importer, invoice PDF generator, toast alerts, confirmation modals.
* **Phase 4:** 3-way member auth (Email/Password, Magic Link, Phone OTP), auto-linking for imported members, expiry countdowns with 14-day amber / red alerts, signed invoice downloads, mobile payment cards.
* **Phase 5:** Google Places API sync (24h cache), 5 JSON-LD schemas, robots.txt, sitemap.xml, Core Web Vitals optimization (Lighthouse ≥ 85).
* **Phase 6:** End-to-end user testing, security penetration tests (PII ciphertext verification, RLS bypass checks), 200+ member import, 6 admin accounts setup, `v1.0.0` release.

---

## 12. Development Methodology & Workflow Protocol

> Extracted from [`docs/11_Dev_Methodology_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/11_Dev_Methodology_Fitness_Garage.md).

### 12.1 Git Branching & Commit Conventions
* **Branch Structure:**
  - `main`: Production-only code. Deploys automatically to Vercel and Render.
  - `develop`: Integration branch. All features merge here first.
  - `feature/<scope>/<description>`: Feature branches created from `develop`.
  - `fix/<scope>/<description>`: Bug fixes created from `develop`.
  - `chore/<scope>/<description>`: Config, deps, docs.
* **Scopes:** `frontend`, `backend`, `db`, `infra`, `docs`.
* **Commit Message Format:** `<type>(<scope>): <description>` (e.g. `feat(backend): add bulk member import endpoint`).
* **Release Tagging:** Semantic versioning (`v1.0.0` at launch).

### 12.2 11-Step Feature Lifecycle
```
Step 1: Create feature branch from develop (git checkout -b feature/<scope>/<desc>)
Step 2: Build feature using specialized domain skills (FastAPI, React, asyncpg, Tailwind)
Step 3: Review using Ponytail Skill (ponytail-review for DRY, SOLID, KISS, YAGNI, PII, SQL)
Step 4: Save review output to review-docs/<feature-name>.md
Step 5: Implement review changes (No progress allowed until review output is saved in review-docs/ and each comment is resolved/addressed, or explicitly documented with technical rationale if omitted)
Step 6: Test feature (pytest unit tests, Swagger manual verification, responsive viewport checks)
Step 7: Run regression suite (full pytest suite + frontend npm run build && npm run lint)
Step 8: Pre-commit checks (black, isort, flake8, mypy, bandit, eslint, prettier)
Step 9: Commit changes with conventional commit syntax
Step 10: Push branch and create PR to develop with standard PR template
Step 11: PR review, squash-merge into develop, and delete feature branch immediately
```

### 12.3 Definition of Done (10 Binary Gates)
1. Code matches the specification exactly — no scope creep, no omissions.
2. Ponytail review output saved to `review-docs/<feature-name>.md` with 100% of comments resolved in code or explicitly rationalized.
3. Feature tests passing.
4. Full regression suite passing.
5. Pre-commit hooks passing.
6. PR description completed with all checklist items verified.
7. CI pipeline green.
8. PR squash-merged to `develop`.
9. Feature branch deleted.
10. Zero `TODO`, `FIXME`, `console.log`, `print()`, or leftover debug code.

---

## 13. Operational Handbook & Common Development Tasks

> Extracted from [`docs/10_Dev_Handover_README_Fitness_Garage.md`](file:///home/arch/projects/fitness-garage/docs/10_Dev_Handover_README_Fitness_Garage.md).

### 13.1 Supabase Storage & Section-Named Folders
* Assets are stored in section-named folders. Admin drops media into the respective folder in Supabase Storage — no custom file manager UI needed.
* Use `buildStorageUrl(folder, filename)` to construct public URLs.
* Invoices are stored in the private bucket `invoices/<member_id>/<payment_id>.pdf` and accessed **strictly** via temporary signed URLs (60-min expiry).

### 13.2 Common Developer Tasks Guide
* **Add a Public Endpoint:**
  1. Add SQL function in `db/queries/<resource>_queries.py`.
  2. Add Pydantic schema in `schemas/<resource>.py`.
  3. Add router endpoint in `routers/public/<resource>.py`.
  4. Add API call in `frontend/src/services/publicService.ts`.
  5. Add test in `backend/tests/test_<resource>.py`.
* **Add an Admin Module:**
  1. Add query in `db/queries/`, schema in `schemas/`, router in `routers/admin/` with `require_admin`.
  2. Register router in `main.py`.
  3. Add nav item to `AdminSidebar.tsx`.
  4. Create page in `pages/admin/<Page>Page.tsx` and register in `router/index.tsx` inside `ProtectedAdminRoute`.
  5. Add route constant in `constants/routes.ts` and service in `adminService.ts`.
* **Key Rotation (AES-256):** Must be executed via transactional migration script (read all rows, decrypt with old key, re-encrypt with new key, commit, update `AES_ENCRYPTION_KEY` on Render). Never update key without migrating data.

### 13.3 Known Constraints & Gotchas
* **Render Free Tier Spin-Down:** Mitigated via cron-job.org keep-alive pinging `GET /health` every 10 min. First request after deployment takes ~30s.
* **Phone OTP / Twilio:** Supabase Phone OTP requires Twilio credentials in Supabase Dashboard. If Twilio is not configured, the Phone OTP tab must be hidden.
* **PII Search Filter:** Member search (`?search=<term>`) decrypts member records in memory on the backend. For 200+ members this is instant (<10ms).
* **Invoice Number Sequence:** `invoice_last_sequence` in `site_config` must be incremented using a PostgreSQL `SELECT ... FOR UPDATE` row lock during payment creation.
* **`asyncpg.Record` Immutability:** `asyncpg` returns read-only records. Convert to dict before mutation: `row = dict(record)`.

---

## 14. AI Agent Workflow & Specialized Skill Guidelines

### 14.1 Mandatory Post-Feature Ponytail Review & Output Persistence
* **After every feature development or code change on a branch**, the AI agent **MUST** perform a `ponytail` / `ponytail-review` pass to review diffs for unnecessary complexity, over-engineering, unused flexibility, and dead code.
* **Output Persistence in `review-docs/`:** The full `ponytail-review` output **MUST** be saved into the `review-docs/` directory named directly against the feature being developed (e.g. `review-docs/<feature-name>.md` or `review-docs/feature-frontend-member-portal-and-seo.md`).
* **Enforced Progression Gate:** **No progress is permitted** until:
  1. The review output file is saved in `review-docs/`.
  2. Each comment, warning, and failure identified in the review is explicitly addressed and resolved in code.
  3. If any comment is intentionally not addressed in code, its technical rationale must be explicitly documented in the review file explaining why it was omitted.
* The codebase must remain minimal, lean, and strictly YAGNI-compliant (`net: -<N> lines possible` or `Lean already. Ship.`).

### 14.2 Proactive Domain Skill Utilization
The agent **MUST** proactively leverage the best specialized skills available at its disposal across all phases of the project:
* **Database & SQL:** `sql-pro` for schema audits, migrations, parameterized query design, indexing, and PostgreSQL performance.
* **Backend API:** `fastapi-developer` / `backend-developer` / `python-pro` for async REST endpoints, Pydantic schemas, dependency injection, and security.
* **Frontend Web:** `react-specialist` / `frontend-developer` / `typescript-pro` for React 18 component architecture, Zustand state management, Tailwind tokens, and form validation.
* **Design & UX:** `ui-designer` / `accessibility-tester` for visual hierarchy, dark industrial aesthetics, responsive layout, and WCAG compliance.
* **Security & Quality:** `security-auditor` / `code-reviewer` for Fernet AES-256 encryption, Supabase RLS verification, and token handling.
* **Complexity & Debt Management:** `ponytail` / `ponytail-review` / `ponytail-debt` / `ponytail-gain` to ruthlessly eliminate bloat.
