# Dev Handover README
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

---

## 0. Read This First

This README is the single entry point for any developer or LLM agent building, maintaining, or extending the Fitness Garage application. Read it in full before writing a single line of code.

**Document Index — read in this order:**

| # | Document | Purpose |
|---|---|---|
| 1 | `01_PRD_Fitness_Garage.md` | What to build and why |
| 2 | `02_Technical_Architecture_Fitness_Garage.md` | How everything connects |
| 3 | `03_Database_Schema_Fitness_Garage.md` | Data model, raw SQL, asyncpg patterns |
| 4 | `04_API_Specification_Fitness_Garage.md` | All 35 endpoints — request/response shapes |
| 5 | `05_Frontend_Component_Architecture_Fitness_Garage.md` | React structure, design system, component library |
| 6 | `06_Admin_Dashboard_Specification_Fitness_Garage.md` | Every admin page — wireframes and interactions |
| 7 | `07_Member_Portal_Specification_Fitness_Garage.md` | Member login, dashboard, payments, invoices |
| 8 | `08_SEO_Strategy_Fitness_Garage.md` | Schema, meta, Core Web Vitals, local SEO |
| 9 | `09_Project_Milestones_Deliverables_Fitness_Garage.md` | Phase-by-phase tasks and acceptance criteria |
| 10 | `10_Dev_Handover_README.md` | This document — setup, conventions, operations |

**Golden Rules — never violate these:**
- **DRY:** Define once, use everywhere. No copy-pasted logic.
- **SOLID:** One responsibility per module, component, or function.
- **KISS:** Simplest solution that works. No speculative abstraction.
- **YAGNI:** If it is not in the spec, do not build it.
- **Extensible:** New features must plug in without rewriting existing code.
- **Replaceable:** All external services sit behind an abstraction layer.
- **Raw SQL only:** No ORM. All DB access via `asyncpg` parameterized queries.
- **Encrypt PII:** `full_name`, `phone_number`, `email_address` are always AES-256 encrypted before writing to Postgres.
- **Section-named storage folders:** Assets are served from Supabase Storage folders named after the section they appear in. Admin drops files into the folder — no file management UI needed.

---

## 1. Project Overview

**Fitness Garage** is a full-stack gym website for a real, single-location gym. It consists of:

| Part | Description |
|---|---|
| **Public Website** | 8-page marketing site — Home, About, Services, Plans, Trainers, Gallery, Testimonials, Contact |
| **Member Portal** | Protected portal — membership status, payment history, invoice download |
| **Admin Dashboard** | Full CMS + member/payment management — 11 modules |

**Stack at a glance:**

```
Frontend   React 18 + TypeScript + Tailwind CSS    → Vercel (free)
Backend    FastAPI + uv + asyncpg                   → Render (free)
Database   PostgreSQL 15+                           → Supabase (free)
Auth       Supabase Auth                            → Supabase (free)
Storage    Supabase Storage                         → Supabase (free)
Keep-alive cron-job.org ping every 10 min          → free
```

---

## 2. Repository Structure

```
fitness-garage/
├── frontend/                          # React + TypeScript
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   └── og-default.jpg
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   ├── components/
│   │   │   ├── common/                # Button, Badge, Card, Modal, Spinner, etc.
│   │   │   ├── layout/                # Navbar, Footer, PageWrapper, SectionWrapper, AdminSidebar
│   │   │   └── forms/                 # FormField, SelectField, TextareaField, FileUpload
│   │   ├── pages/
│   │   │   ├── public/                # HomePage, AboutPage, ServicesPage, etc.
│   │   │   ├── auth/                  # MemberLoginPage, AdminLoginPage
│   │   │   ├── member/                # MemberDashboardPage, MembershipStatusPage, PaymentHistoryPage
│   │   │   └── admin/                 # All admin pages
│   │   ├── features/                  # Feature-scoped components
│   │   │   ├── hero/
│   │   │   ├── services/
│   │   │   ├── plans/
│   │   │   ├── trainers/
│   │   │   ├── gallery/
│   │   │   ├── reviews/
│   │   │   ├── auth/
│   │   │   ├── members/
│   │   │   └── payments/
│   │   ├── hooks/                     # useScrollReveal, useMediaQuery, useDebounce
│   │   ├── services/                  # api.ts, publicService, memberService, adminService
│   │   ├── store/                     # authStore, siteConfigStore, adminStore
│   │   ├── types/                     # TypeScript interfaces
│   │   ├── utils/                     # buildStorageUrl, formatDate, formatCurrency, getMembershipStatus
│   │   ├── constants/                 # routes.ts, queryKeys.ts
│   │   ├── router/                    # index.tsx, PublicRoute, ProtectedMemberRoute, ProtectedAdminRoute
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.local                     # GITIGNORED
│   ├── .env.example                   # Committed
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                           # FastAPI + uv
│   ├── app/
│   │   ├── main.py                    # FastAPI app, lifespan, router registration
│   │   ├── core/
│   │   │   ├── config.py              # All env vars loaded here — single source
│   │   │   ├── security.py            # AES-256 encrypt/decrypt
│   │   │   └── auth.py                # JWT verification, role guards
│   │   ├── db/
│   │   │   ├── connection.py          # asyncpg pool init/close, get_pool dependency
│   │   │   ├── migrate.py             # Migration runner
│   │   │   ├── migrations/            # 000_init.sql → 013_seed_site_config.sql
│   │   │   └── queries/               # One module per resource
│   │   │       ├── member_queries.py
│   │   │       ├── payment_queries.py
│   │   │       ├── plan_queries.py
│   │   │       ├── trainer_queries.py
│   │   │       ├── service_queries.py
│   │   │       ├── gallery_queries.py
│   │   │       ├── review_queries.py
│   │   │       ├── site_config_queries.py
│   │   │       └── achievement_queries.py
│   │   ├── schemas/                   # Pydantic request/response schemas
│   │   │   ├── base.py
│   │   │   ├── member.py
│   │   │   ├── payment.py
│   │   │   ├── plan.py
│   │   │   ├── trainer.py
│   │   │   ├── service.py
│   │   │   ├── gallery.py
│   │   │   ├── review.py
│   │   │   ├── site_config.py
│   │   │   └── achievement.py
│   │   ├── services/                  # Business logic
│   │   │   ├── invoice_service.py     # PDF generation (reportlab)
│   │   │   ├── import_service.py      # CSV/Excel bulk import (pandas)
│   │   │   ├── reviews_service.py     # Google Places API sync
│   │   │   └── storage_service.py     # Supabase Storage operations
│   │   ├── routers/
│   │   │   ├── public/                # /public/** — no auth
│   │   │   ├── member/                # /member/** — member JWT required
│   │   │   └── admin/                 # /admin/** — admin JWT required
│   │   └── middleware/
│   │       └── error_handler.py       # Global error envelope
│   ├── tests/
│   │   └── test_*.py                  # pytest test suite
│   ├── .env                           # GITIGNORED
│   ├── .env.example                   # Committed
│   ├── pyproject.toml                 # uv project config + dependencies
│   └── uv.lock
│
└── docs/                              # All specification documents
    ├── 01_PRD_Fitness_Garage.md
    ├── 02_Technical_Architecture_Fitness_Garage.md
    ├── 03_Database_Schema_Fitness_Garage.md
    ├── 04_API_Specification_Fitness_Garage.md
    ├── 05_Frontend_Component_Architecture_Fitness_Garage.md
    ├── 06_Admin_Dashboard_Specification_Fitness_Garage.md
    ├── 07_Member_Portal_Specification_Fitness_Garage.md
    ├── 08_SEO_Strategy_Fitness_Garage.md
    ├── 09_Project_Milestones_Deliverables_Fitness_Garage.md
    └── 10_Dev_Handover_README.md
```

---

## 3. Environment Variables

### 3.1 Frontend (`frontend/.env.example`)

```env
# Supabase
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_SUPABASE_STORAGE_URL=https://<project-ref>.supabase.co/storage/v1/object/public

# Backend API
VITE_API_BASE_URL=https://<render-service>.onrender.com/api/v1

# Google Maps (for Contact page embed — loaded from site_config, not here)
# No frontend Google Maps API key needed — embed URL stored in site_config
```

### 3.2 Backend (`backend/.env.example`)

```env
# Database
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_KEY=<supabase-service-role-key>

# Encryption
AES_ENCRYPTION_KEY=<32-byte-base64-encoded-key>

# Google Places API
GOOGLE_PLACES_API_KEY=<google-places-api-key>

# CORS
CORS_ORIGINS=https://<vercel-project>.vercel.app,http://localhost:5173

# Environment
ENVIRONMENT=production
```

### 3.3 Generating the AES Encryption Key

Run once to generate a secure 32-byte key:

```python
import secrets, base64
key = base64.urlsafe_b64encode(secrets.token_bytes(32)).decode()
print(key)
# → Paste this value into AES_ENCRYPTION_KEY on Render
```

**Never commit this key. Never log this key. Never hardcode this key.**

---

## 4. Local Development Setup

### 4.1 Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | `https://nodejs.org` |
| Python | 3.12+ | `https://python.org` |
| uv | Latest | `pip install uv` |
| Git | Latest | `https://git-scm.com` |

### 4.2 Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Fill in .env.local with dev values (use Supabase dev project)
npm run dev
# → http://localhost:5173
```

### 4.3 Backend Setup

```bash
cd backend
uv sync                          # Installs all dependencies from uv.lock
cp .env.example .env
# Fill in .env with dev values
uv run python -m app.db.migrate  # Run database migrations
uv run uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
# → Swagger docs: http://localhost:8000/docs
```

### 4.4 Running Tests

```bash
cd backend
uv run pytest tests/ -v
```

### 4.5 Local Development Flow

```
Frontend (localhost:5173) ──► Backend (localhost:8000) ──► Supabase (cloud)
```

Both frontend and backend point to the same Supabase project in development. Use a separate Supabase project for dev vs production if data isolation is needed.

---

## 5. Database Operations

### 5.1 Running Migrations

Migrations run automatically on startup via `db/migrate.py`. To run manually:

```bash
cd backend
uv run python -m app.db.migrate
```

Migration files live in `app/db/migrations/`. They are numbered and idempotent — safe to run multiple times.

### 5.2 Adding a New Migration

1. Create a new file: `app/db/migrations/014_<description>.sql`
2. Write idempotent SQL using `IF NOT EXISTS` guards
3. Run `uv run python -m app.db.migrate` — it will apply only the new file

```sql
-- Example: 014_add_member_photo.sql
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS photo_filename TEXT;
```

### 5.3 Viewing Raw Data (Supabase Dashboard)

- Go to `https://supabase.com/dashboard` → your project → Table Editor
- PII fields (`full_name`, `phone_number`, `email_address`) will appear as ciphertext — this is correct
- Never attempt to decrypt data outside of the FastAPI application layer

### 5.4 Query Pattern — Mandatory

All database access must follow this pattern. **No exceptions.**

```python
# ✅ CORRECT — parameterized query
result = await pool.fetchrow(
    "SELECT * FROM members WHERE id = $1",
    member_id,
)

# ❌ WRONG — string interpolation (SQL injection risk)
result = await pool.fetchrow(
    f"SELECT * FROM members WHERE id = '{member_id}'"
)
```

---

## 6. Encryption — PII Fields

### 6.1 Encrypted Fields

Only these three fields are encrypted. Nothing else.

| Table | Field |
|---|---|
| `members` | `full_name` |
| `members` | `phone_number` |
| `members` | `email_address` |

### 6.2 Usage Pattern

Encryption and decryption are handled **only** in the FastAPI service/router layer — never in query modules and never in the frontend.

```python
# core/security.py
from cryptography.fernet import Fernet
import os

_fernet = Fernet(os.environ["AES_ENCRYPTION_KEY"].encode())

def encrypt(value: str) -> str:
    return _fernet.encrypt(value.encode()).decode()

def decrypt(value: str) -> str:
    return _fernet.decrypt(value.encode()).decode()

def encrypt_pii(data: dict) -> dict:
    """Encrypt all PII fields in a member data dict before DB write."""
    pii_fields = {"full_name", "phone_number", "email_address"}
    return {
        k: encrypt(v) if k in pii_fields and v is not None else v
        for k, v in data.items()
    }

def decrypt_pii(data: dict) -> dict:
    """Decrypt all PII fields in a member data dict after DB read."""
    pii_fields = {"full_name", "phone_number", "email_address"}
    return {
        k: decrypt(v) if k in pii_fields and v is not None else v
        for k, v in data.items()
    }
```

**Always encrypt before write. Always decrypt after read. Always in the router/service layer.**

---

## 7. Authentication

### 7.1 How It Works

```
Member/Admin submits credentials
        ↓
Supabase Auth validates → returns JWT
        ↓
Frontend stores JWT in Zustand authStore (memory only — NOT localStorage)
        ↓
Axios interceptor injects: Authorization: Bearer <JWT> on every request
        ↓
FastAPI core/auth.py verifies JWT signature using Supabase public key
        ↓
Role extracted from JWT claims → route access granted or 403 returned
```

### 7.2 Role System

| Role | Set In | Access Level |
|---|---|---|
| `member` | Supabase Auth user metadata | `/member/**` routes |
| `admin` | Supabase Auth user metadata | `/admin/**` + `/member/**` routes |
| `dev` | Supabase Auth user metadata | All routes including debug |

### 7.3 Creating an Admin User

Admin accounts are created via the Supabase Auth dashboard — not through the website.

1. Go to Supabase Dashboard → Authentication → Users → Invite User
2. Enter the staff member's email
3. After user is created, go to Auth → Users → click the user → User Metadata
4. Add: `{ "role": "admin" }`
5. Save — the user now has admin access

### 7.4 Creating a Dev User

Same as admin but set metadata to: `{ "role": "dev" }`

### 7.5 FastAPI Auth Dependencies

```python
# core/auth.py — use these as FastAPI Depends() in routers

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Verifies JWT, extracts role, returns typed User object
    ...

async def require_member(user = Depends(get_current_user)) -> User:
    # Allows member, admin, dev
    if user.role not in ["member", "admin", "dev"]:
        raise HTTPException(status_code=403)
    return user

async def require_admin(user = Depends(get_current_user)) -> User:
    # Allows admin and dev only
    if user.role not in ["admin", "dev"]:
        raise HTTPException(status_code=403)
    return user
```

---

## 8. Supabase Storage — Asset Convention

**This is a core architectural decision. Do not deviate from it.**

Assets are stored in section-named folders. The frontend lists files in the relevant folder and renders them automatically. Admin adds or removes files directly in Supabase Storage — no file management UI is required.

### 8.1 Folder Structure

```
assets/          ← Public bucket
├── hero/        ← Hero slideshow images and videos
├── about/       ← About section images
├── services/    ← Service card icons (filename = service slug + extension)
├── trainers/    ← Trainer profile photos (filename = trainer slug + extension)
├── gallery/     ← Gallery photos and videos
└── transformations/ ← Before/after transformation photos

invoices/        ← Private bucket
└── <member_id>/
    └── <payment_id>.pdf
```

### 8.2 URL Construction

```typescript
// frontend/src/utils/buildStorageUrl.ts
const STORAGE_BASE = import.meta.env.VITE_SUPABASE_STORAGE_URL

export const buildStorageUrl = (folder: string, filename: string): string =>
  `${STORAGE_BASE}/${folder}/${filename}`

// Examples:
buildStorageUrl('assets/hero', 'slide-1.jpg')
// → https://<project>.supabase.co/storage/v1/object/public/assets/hero/slide-1.jpg

buildStorageUrl('assets/trainers', 'trainer-one.jpg')
// → https://<project>.supabase.co/storage/v1/object/public/assets/trainers/trainer-one.jpg
```

### 8.3 Backend Storage Service

```python
# services/storage_service.py
async def list_folder(bucket: str, folder: str) -> list[dict]:
    """List all files in a Supabase Storage folder."""
    ...

async def delete_file(bucket: str, path: str) -> None:
    """Delete a file from Supabase Storage."""
    ...

async def get_signed_url(bucket: str, path: str, expires_in: int = 3600) -> str:
    """Generate a signed URL for private bucket access (invoices)."""
    ...
```

---

## 9. Key Conventions

### 9.1 Backend Conventions

| Convention | Rule |
|---|---|
| Router naming | One router file per resource, prefix matches route: `routers/admin/members.py` → `/admin/members` |
| Query naming | `list_<resource>`, `get_<resource>_by_id`, `create_<resource>`, `update_<resource>`, `soft_delete_<resource>` |
| PII handling | Encrypt in router before passing to query. Decrypt in router after query returns. Never in query module. |
| Error responses | Always use the standard error envelope: `{ "error": "CODE", "message": "...", "status": 404 }` |
| Soft deletes | Members: set `status = 'suspended'`. Services/Trainers/Achievements: set `is_active = false`. No hard deletes except gallery (file + record both removed). |
| Pagination | Cursor-based on all list endpoints. Default `limit = 20`. |
| Response shape | Always wrap in `{ "data": ..., "message": "..." }` for single items and `{ "data": [...], "total": n }` for lists |

### 9.2 Frontend Conventions

| Convention | Rule |
|---|---|
| Route strings | All route paths defined in `constants/routes.ts` — never hardcoded in components |
| API calls | Always via service modules (`publicService`, `memberService`, `adminService`) — never direct `axios` calls in components |
| Auth state | JWT stored in Zustand `authStore` in memory only — never `localStorage` |
| Asset URLs | Always via `buildStorageUrl()` — never hardcoded Supabase URLs |
| Colors | Always Tailwind token names (`text-garage-chrome`) — never raw hex values |
| Headings | All section headings use `<SectionHeading>` component with Chrome Slash pattern |
| Empty states | Every list/table view has an `<EmptyState>` for zero results |
| Loading states | Every data fetch shows `<Spinner>` or skeleton — never blank content area |
| Error states | Every data fetch has an error state with "Try again" CTA |
| Destructive actions | Always require confirmation modal before proceeding |
| Forms | React Hook Form + Zod for all forms — no uncontrolled inputs |

### 9.3 Git Conventions

```
Branches:
  main        → production (auto-deploys to Vercel + Render)
  develop     → staging / integration
  feature/**  → feature branches (merged to develop via PR)

Commit message format:
  <type>(<scope>): <description>

  Types: feat, fix, docs, style, refactor, test, chore
  Scope: frontend, backend, db, infra, docs

Examples:
  feat(backend): add bulk member import endpoint
  fix(frontend): correct expiry warning threshold to 14 days
  feat(db): add invoice_last_sequence to site_config seed
  chore(infra): configure cron-job.org keep-alive
```

---

## 10. External Services

### 10.1 Supabase

| Item | Location | Notes |
|---|---|---|
| Dashboard | `https://supabase.com/dashboard` | Auth, Storage, DB management |
| API Keys | Dashboard → Settings → API | `anon` key for frontend, `service_role` key for backend only |
| Auth Users | Dashboard → Authentication → Users | Create admin users here |
| Storage | Dashboard → Storage | Upload assets to section-named folders |
| SQL Editor | Dashboard → SQL Editor | Run queries directly (PII appears encrypted) |

### 10.2 Vercel

| Item | Location | Notes |
|---|---|---|
| Dashboard | `https://vercel.com/dashboard` | Deploy status, logs, env vars |
| Environment Variables | Project → Settings → Environment Variables | `VITE_*` vars only |
| Deployment Logs | Project → Deployments → click deploy | Build output and errors |

### 10.3 Render

| Item | Location | Notes |
|---|---|---|
| Dashboard | `https://render.com/dashboard` | Service status, logs, env vars |
| Environment Variables | Service → Environment | All backend env vars live here |
| Logs | Service → Logs | FastAPI runtime logs |
| Manual Deploy | Service → Manual Deploy | Trigger redeploy without git push |

### 10.4 cron-job.org

| Item | Location | Notes |
|---|---|---|
| Dashboard | `https://console.cron-job.org` | Job status and history |
| Job Config | Execution every 10 minutes | `GET https://<render-url>/health` |
| Alert | Email alert on job failure | Set up on job creation |

### 10.5 Google Places API

| Item | Notes |
|---|---|
| Enable API | Google Cloud Console → APIs → Places API (New) |
| API Key | Restrict to Render server IP for security |
| Place ID | Find at `https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder` |
| Free Tier | $200/month credit — sufficient at this scale with 24-hour caching |

---

## 11. Common Development Tasks

### 11.1 Add a New Public API Endpoint

1. Add SQL query function to the relevant `db/queries/<resource>_queries.py`
2. Add Pydantic response schema to `schemas/<resource>.py`
3. Add route handler to `routers/public/<resource>.py`
4. Register router in `main.py` if new file
5. Add service module call to `frontend/src/services/publicService.ts`
6. Write one test in `tests/test_<resource>.py`

### 11.2 Add a New Admin Module

1. Write query functions in `db/queries/<resource>_queries.py`
2. Write Pydantic schemas in `schemas/<resource>.py`
3. Write router in `routers/admin/<resource>.py` with `require_admin` dependency
4. Register router in `main.py`
5. Add nav item to `AdminSidebar.tsx` `NAV_ITEMS` array
6. Create page component in `pages/admin/<Resource>AdminPage.tsx`
7. Add route to `router/index.tsx` wrapped in `<ProtectedAdminRoute>`
8. Add route constant to `constants/routes.ts`
9. Add API calls to `services/adminService.ts`

### 11.3 Add a New Member Portal Page

1. Create page component in `pages/member/<NewPage>.tsx`
2. Wrap in `<MemberLayout>` and `<PageWrapper noindex={true}>`
3. Add tab to `MemberLayout` tab navigation
4. Add route to `router/index.tsx` wrapped in `<ProtectedMemberRoute>`
5. Add route constant to `constants/routes.ts`
6. Add required API endpoint (if new) following section 11.1

### 11.4 Add a New Service to the Gym

Admin task — no code change needed:

1. Admin logs into dashboard → Services → Add Service
2. Enter name, slug, description, icon filename
3. Upload icon to `assets/services/<slug>.<ext>` in Supabase Storage
4. Service appears immediately on public website

### 11.5 Add a New Trainer

Admin task — no code change needed:

1. Admin logs into dashboard → Trainers → Add Trainer
2. Enter all details, set `photo_filename` to `<slug>.jpg`
3. Upload photo to `assets/trainers/<slug>.jpg` in Supabase Storage
4. Trainer appears immediately on public website

### 11.6 Update Hero Slideshow

Admin task — no code change needed:

1. Upload new image/video to `assets/hero/` in Supabase Storage
2. Image appears in slideshow immediately on next page load
3. To remove: delete the file from `assets/hero/` in Supabase Storage

### 11.7 Change Membership Pricing

Admin task — no code change needed:

1. Admin logs into dashboard → Plans → Edit plan
2. Enter new price and save
3. New price appears immediately on public plans page

### 11.8 Regenerate an Invoice

Developer task — if invoice PDF is missing or corrupted:

1. Call `POST /admin/payments` is not available for re-generation
2. Invoke `invoice_service.generate_invoice(payment_id)` directly in a maintenance script
3. Upload generated PDF to `invoices/<member_id>/<payment_id>.pdf` in Supabase Storage
4. Update `payments.invoice_path` with the correct path

### 11.9 Rotate the Encryption Key

Future task — requires a migration script:

1. Generate new AES key
2. Write script: fetch all member rows, decrypt with old key, re-encrypt with new key, update row
3. Run script in a transaction — rollback on any error
4. Update `AES_ENCRYPTION_KEY` on Render with new key
5. Redeploy backend

**Never rotate the key without the migration script. Data becomes unreadable.**

---

## 12. Deployment

### 12.1 Production Deployment Flow

```
Developer pushes to main branch
        ↓
GitHub triggers Vercel build → frontend deployed
GitHub triggers Render deploy → backend deployed
        ↓
Render starts → FastAPI lifespan → asyncpg pool initialised
        ↓
On first request (or manual trigger): db/migrate.py runs — applies any new migrations
        ↓
cron-job.org pings /health every 10 minutes → Render stays warm
```

### 12.2 Deploying a Database Migration

1. Add numbered SQL file to `app/db/migrations/`
2. Push to `main`
3. Render redeploys backend
4. On startup, `db/migrate.py` automatically applies the new migration
5. Verify in Supabase SQL Editor: `SELECT * FROM _migrations ORDER BY applied_at DESC LIMIT 5`

### 12.3 Environment Variable Changes

**Frontend (Vercel):**
- Vercel Dashboard → Project → Settings → Environment Variables
- Add/edit variable → Redeploy required (manual or push to main)

**Backend (Render):**
- Render Dashboard → Service → Environment
- Add/edit variable → Service automatically restarts

### 12.4 Rollback

**Frontend:**
- Vercel Dashboard → Deployments → click previous deployment → Promote to Production

**Backend:**
- Render Dashboard → Deploys → click previous deploy → Rollback

**Database:**
- No automated rollback — write a `015_rollback_<description>.sql` migration to undo changes
- Alembic downgrade is not available (raw SQL migrations)

---

## 13. Monitoring

Minimal monitoring at launch — all free tier tools.

| Tool | What to Check | How Often |
|---|---|---|
| Render Dashboard | Service uptime, error logs | When issues reported |
| Vercel Dashboard | Build status, function errors | After each deployment |
| Supabase Dashboard | DB size, Auth events | Monthly |
| cron-job.org | Job execution history | Weekly |
| Google Search Console | Crawl errors, indexing | Monthly (after domain connected) |

**If the site is slow or down:**
1. Check Render → Logs for backend errors
2. Check Vercel → Functions for frontend errors
3. Check cron-job.org → if keep-alive failed, Render may have had a cold start
4. Check Supabase → Status page at `https://status.supabase.com`

---

## 14. Security Reminders

| Rule | Where |
|---|---|
| Never commit `.env` files | `.gitignore` must include `.env` and `.env.local` |
| Never log PII | No `print()` or `logger.info()` with member name, email, or phone |
| Never expose `SUPABASE_SERVICE_KEY` | Backend only — never in frontend env vars |
| Never expose `AES_ENCRYPTION_KEY` | Render env var only — never in code or logs |
| Never bypass RLS | Always use service key on server — never disable RLS entirely |
| Signed URLs only for invoices | Never expose raw Supabase Storage paths for private invoice bucket |
| CORS locked | `CORS_ORIGINS` must only include the Vercel production URL and `localhost:5173` |
| Admin accounts via Supabase dashboard only | No self-registration endpoint for admin role |

---

## 15. Known Constraints & Gotchas

| Constraint | Detail |
|---|---|
| Render free tier spin-down | Mitigated by cron-job.org. First request after any Render redeploy will be slow (~30 seconds). Expected behaviour. |
| Supabase Storage 1GB free limit | Monitor usage. Gallery videos consume storage quickly. Compress videos before upload. |
| Google Places API reviews limit | 5 reviews returned per API call on free tier. Cached for 24 hours to stay within $200 credit. |
| Phone OTP requires Twilio | Supabase Phone OTP requires a configured Twilio account. Client must provide Twilio SID and Auth Token. Set in Supabase Dashboard → Authentication → Providers → Phone. Without this, Phone OTP tab must be hidden. |
| PII search limitation | Member search (`?search=<term>`) requires server-side decryption of all member records before filtering. For 200 members this is fast. At ~5000+ members, consider a separate encrypted search index. |
| Invoice sequence | `invoice_last_sequence` in `site_config` is incremented per payment. If two payments are recorded simultaneously, use a Postgres `SELECT ... FOR UPDATE` lock on the sequence row to prevent duplicate invoice numbers. |
| No password reset UI | Admin passwords reset via Supabase Dashboard. Member passwords reset via Supabase magic link flow (handled by Supabase — no custom UI needed). |
| `asyncpg` records are read-only | `asyncpg.Record` objects cannot be mutated directly. Convert to `dict` before modifying: `row = dict(record)`. |

---

## 16. Placeholder Content Checklist

The following placeholders must be replaced by the client via the admin Settings dashboard before launch. **The agent does not need to hardcode these — they are all managed via `site_config`.**

| Placeholder | Location in Admin Dashboard | Notes |
|---|---|---|
| Gym address | Settings → Gym Information | Appears in footer, contact page, schema |
| Gym phone | Settings → Gym Information | Appears in footer, contact page, schema |
| Gym email | Settings → Gym Information | Appears in footer, contact page, schema |
| Google Maps embed URL | Settings → Integrations | Get from Google Maps → Share → Embed a map |
| Google Form URL | Settings → Integrations | Get from Google Forms → Send → Embed |
| Google Place ID | Settings → Integrations | Required for reviews sync |
| About tagline | Settings → About Section | Gym mission statement |
| About story | Settings → About Section | Gym origin story paragraph |
| Hero slideshow images | Supabase Storage → assets/hero/ | Minimum 3 images recommended |
| Service descriptions | Admin → Services → Edit each | 8 services need descriptions |
| Service icons | Supabase Storage → assets/services/ | One SVG/PNG per service |
| Trainer profiles | Admin → Trainers → Edit each | 5 placeholders need real data |
| Trainer photos | Supabase Storage → assets/trainers/ | One photo per trainer |
| Membership pricing | Admin → Plans → Edit each | All 8 plans need real prices |
| Stats numbers | Admin → Stats | Members count, years, transformations |
| Achievements | Admin → Stats → Achievements | Replace 3 placeholders with real awards |
| About section image | Supabase Storage → assets/about/ | One main about-page image |

---

## 17. Client Handover Checklist

On project completion, hand over the following to the gym owner:

**Access Credentials (share securely — never via email):**
- [ ] Supabase dashboard login
- [ ] Vercel dashboard login (or transfer project ownership)
- [ ] Render dashboard login (or transfer service ownership)
- [ ] cron-job.org account login
- [ ] Google Cloud Console access (for Places API key management)

**Admin Dashboard Walkthrough:**
- [ ] Demonstrate: adding a member manually
- [ ] Demonstrate: recording a payment and downloading the invoice
- [ ] Demonstrate: updating membership pricing
- [ ] Demonstrate: adding a trainer and uploading photo to Supabase Storage
- [ ] Demonstrate: updating hero slideshow (upload to assets/hero/)
- [ ] Demonstrate: editing site stats and achievements
- [ ] Demonstrate: managing Google Reviews visibility
- [ ] Demonstrate: updating gym info in Settings

**Post-Handover Client Tasks:**
- [ ] Replace all placeholder content (see Section 16)
- [ ] Set up Google Business Profile
- [ ] Connect custom domain
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Twilio account for Phone OTP (if required)
- [ ] Invite all 6 staff to admin via Supabase Auth

---

*End of Dev Handover README — Fitness Garage v1.0*
