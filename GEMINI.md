# Fitness Garage — Project Context & Developer Guidelines

> **Single Source of Truth** for AI Agents and Developers working on the **Fitness Garage** full-stack gym platform.
> Compiled from official requirements in [`docs/`](file:///home/arch/projects/fitness-garage/docs).

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

### 5.2 Endpoint Catalog
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

## 10. AI Agent Workflow & Specialized Skill Guidelines

### 10.1 Mandatory Post-Feature Ponytail Review
* **After every feature development or code change**, the AI agent **MUST** perform a `ponytail` / `ponytail-review` pass to review diffs for unnecessary complexity, over-engineering, unused flexibility, and dead code.
* The codebase must remain minimal, lean, and strictly YAGNI-compliant (`net: -<N> lines possible` or `Lean already. Ship.`).

### 10.2 Proactive Domain Skill Utilization
The agent **MUST** proactively leverage the best specialized skills available at its disposal across all phases of the project:
* **Database & SQL:** `sql-pro` for schema audits, migrations, parameterized query design, indexing, and PostgreSQL performance.
* **Backend API:** `fastapi-developer` / `backend-developer` / `python-pro` for async REST endpoints, Pydantic schemas, dependency injection, and security.
* **Frontend Web:** `react-specialist` / `frontend-developer` / `typescript-pro` for React 18 component architecture, Zustand state management, Tailwind tokens, and form validation.
* **Design & UX:** `ui-designer` / `accessibility-tester` for visual hierarchy, dark industrial aesthetics, responsive layout, and WCAG compliance.
* **Security & Quality:** `security-auditor` / `code-reviewer` for Fernet AES-256 encryption, Supabase RLS verification, and token handling.
* **Complexity & Debt Management:** `ponytail` / `ponytail-review` / `ponytail-debt` / `ponytail-gain` to ruthlessly eliminate bloat.

