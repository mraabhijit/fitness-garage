# Technical Architecture Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0  
**Date:** 2026-08-15  
**Status:** Finalized  
**Prepared for:** LLM Agent Handover

---

## 1. Architecture Overview

Fitness Garage follows a **decoupled, three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│         React + TypeScript (Vercel — Free Tier)             │
│   Public Website │ Member Portal │ Admin Dashboard          │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS + JWT
┌─────────────────────────▼───────────────────────────────────┐
│                        API LAYER                            │
│         FastAPI + uv (Render — Free Tier)                   │
│   REST API │ Business Logic │ AES-256 Encryption Layer      │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
┌──────────▼──────────┐     ┌────────────▼───────────────────┐
│    DATA LAYER       │     │       AUTH LAYER               │
│  Supabase Postgres  │     │     Supabase Auth              │
│  (Free Tier)        │     │  Email │ SSO │ Phone OTP       │
└─────────────────────┘     └────────────────────────────────┘
```

### 1.1 Architecture Principles Applied

| Principle | Implementation |
|---|---|
| **DRY** | Shared service layer, reusable React component library, common utilities |
| **SOLID** | Repository pattern in FastAPI, single-responsibility routers, interface-driven services |
| **KISS** | Minimal layers — no message queues, no caching layer, no API gateway at launch |
| **YAGNI** | No speculative infrastructure — scale only when needed |
| **Extensible** | Service interfaces allow new providers (SMS, payments) without touching core logic |
| **Replaceable** | Auth, DB, and hosting are behind abstraction layers — swappable independently |

---

## 2. Technology Stack

### 2.1 Full Stack Summary

| Layer | Technology | Version | Hosting | Cost |
|---|---|---|---|---|
| Frontend | React + TypeScript | Latest stable | Vercel | Free |
| Styling | Tailwind CSS | Latest stable | — | Free |
| Backend | FastAPI + uv | Latest stable | Render | Free |
| Database | PostgreSQL (via Supabase) | 15+ | Supabase | Free |
| Authentication | Supabase Auth | Latest | Supabase | Free |
| Google Reviews | Google Places API | v1 | Google Cloud | Free ($200 credit) |
| Keep-alive | cron-job.org | — | cron-job.org | Free |
| Domain | TBD | — | TBD | Paid (future) |
| Media Storage | Supabase Storage | — | Supabase | Free (1GB) |

### 2.2 Frontend Stack Detail

| Concern | Technology | Rationale |
|---|---|---|
| Framework | React 18+ with TypeScript | Type safety, component reusability |
| Routing | React Router v6 | Client-side routing, code splitting |
| State Management | Zustand | Lightweight, KISS-compliant (no Redux overhead) |
| Styling | Tailwind CSS | Utility-first, consistent design system |
| UI Components | Custom component library | Brand-specific, DRY, no heavy UI lib dependency |
| Forms | React Hook Form + Zod | Validation, type-safe schemas |
| HTTP Client | Axios | Interceptors for JWT injection, error handling |
| PDF Generation | react-pdf | Invoice PDF generation client-side |
| Build Tool | Vite | Fast builds, optimized output |
| Linting | ESLint + Prettier | Code consistency |

### 2.3 Backend Stack Detail

| Concern | Technology | Rationale |
|---|---|---|
| Framework | FastAPI | Async, auto-docs, Pythonic, SOLID-friendly |
| Package Manager | uv | Fast, modern Python package management |
| ORM | SQLAlchemy 2.0 (async) | Repository pattern compatible, Postgres native |
| Migrations | Alembic | Version-controlled schema migrations |
| Validation | Pydantic v2 | FastAPI-native, type-safe request/response |
| Encryption | cryptography (Fernet/AES-256) | PII encryption/decryption |
| Auth Integration | supabase-py | Supabase Auth JWT verification |
| Excel/CSV Import | openpyxl + pandas | Bulk member import |
| Invoice Generation | reportlab | Server-side PDF invoice generation |
| Environment Config | python-dotenv | Environment variable management |
| Testing | pytest + httpx | Async-compatible API testing |

---

## 3. Infrastructure Architecture

### 3.1 Hosting Topology

```
┌────────────────────────────────────────────────────────────────┐
│                         INTERNET                               │
└───────────────┬────────────────────────────┬───────────────────┘
                │                            │
    ┌───────────▼──────────┐    ┌────────────▼─────────────┐
    │       VERCEL         │    │    cron-job.org           │
    │  React + TypeScript  │    │  GET /health every 10min  │
    │  CDN + HTTPS auto    │    │  (keeps Render warm)      │
    │  Free tier           │    └────────────┬─────────────┘
    └───────────┬──────────┘                 │
                │ HTTPS + JWT                │
    ┌───────────▼────────────────────────────▼─────────────┐
    │                      RENDER                          │
    │            FastAPI Application Server                │
    │         AES-256 Encryption/Decryption Layer          │
    │                  HTTPS auto                          │
    │                  Free tier                           │
    └───────────┬──────────────────────────────────────────┘
                │
    ┌───────────▼──────────────────────────────────────────┐
    │                    SUPABASE                          │
    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
    │  │  PostgreSQL  │  │  Auth       │  │  Storage    │ │
    │  │  (Encrypted) │  │  (JWT/OTP)  │  │  (Media)    │ │
    │  └─────────────┘  └─────────────┘  └─────────────┘ │
    │                  Free tier                           │
    └──────────────────────────────────────────────────────┘
```

### 3.2 AWS Migration Path (Future)

The architecture is designed for zero-rewrite AWS migration:

| Current (Free Tier) | AWS Equivalent |
|---|---|
| Vercel | S3 + CloudFront |
| Render | ECS Fargate or EC2 |
| Supabase Postgres | RDS PostgreSQL |
| Supabase Auth | Amazon Cognito or retain Supabase |
| Supabase Storage | S3 |
| Environment vars | AWS Secrets Manager |
| cron-job.org | AWS EventBridge |

---

## 4. Application Architecture

### 4.1 Frontend Application Structure

```
src/
├── assets/                  # Static assets (logo, icons, images)
├── components/              # Reusable UI component library
│   ├── common/              # Button, Input, Modal, Card, Badge, etc.
│   ├── layout/              # Navbar, Footer, Sidebar, PageWrapper
│   └── forms/               # FormField, FileUpload, etc.
├── pages/                   # Page-level components
│   ├── public/              # Home, About, Services, Plans, Trainers,
│   │                        # Gallery, Testimonials, Contact
│   ├── member/              # MemberDashboard, MembershipStatus,
│   │                        # PaymentHistory, InvoiceDownload
│   └── admin/               # AdminDashboard, Members, Payments,
│                            # Services, Trainers, Gallery, Plans,
│                            # Stats, Settings
├── features/                # Feature-specific logic
│   ├── auth/                # Login flows (email, SSO, OTP)
│   ├── members/             # Member CRUD operations
│   ├── payments/            # Payment recording, invoice
│   ├── gallery/             # Gallery upload/display
│   └── reviews/             # Google Reviews display
├── hooks/                   # Custom React hooks
├── services/                # API call abstractions (Axios instances)
├── store/                   # Zustand global state stores
├── types/                   # TypeScript interfaces and types
├── utils/                   # Shared utility functions
├── constants/               # App-wide constants
└── router/                  # Route definitions, guards
```

### 4.2 Backend Application Structure

```
app/
├── main.py                  # FastAPI app entry point
├── core/
│   ├── config.py            # Environment-driven configuration
│   ├── security.py          # AES-256 encryption/decryption utilities
│   ├── auth.py              # Supabase JWT verification, role extraction
│   └── database.py          # Async SQLAlchemy engine and session factory
├── models/                  # SQLAlchemy ORM models (DB schema)
│   ├── member.py
│   ├── payment.py
│   ├── membership_plan.py
│   ├── trainer.py
│   ├── service.py
│   ├── gallery.py
│   └── site_config.py
├── schemas/                 # Pydantic request/response schemas
│   ├── member.py
│   ├── payment.py
│   ├── membership_plan.py
│   ├── trainer.py
│   ├── service.py
│   ├── gallery.py
│   └── site_config.py
├── repositories/            # Data access layer (Repository Pattern)
│   ├── base.py              # Generic CRUD base repository
│   ├── member_repo.py
│   ├── payment_repo.py
│   ├── membership_plan_repo.py
│   ├── trainer_repo.py
│   ├── service_repo.py
│   ├── gallery_repo.py
│   └── site_config_repo.py
├── services/                # Business logic layer
│   ├── member_service.py
│   ├── payment_service.py
│   ├── invoice_service.py   # PDF invoice generation
│   ├── import_service.py    # CSV/Excel bulk import
│   ├── reviews_service.py   # Google Places API integration
│   └── storage_service.py   # Supabase Storage abstraction
├── routers/                 # FastAPI route handlers
│   ├── public/              # Open endpoints (no auth)
│   │   ├── services.py
│   │   ├── trainers.py
│   │   ├── gallery.py
│   │   ├── plans.py
│   │   ├── reviews.py
│   │   └── site_config.py
│   ├── member/              # Member-protected endpoints
│   │   ├── membership.py
│   │   └── payments.py
│   └── admin/               # Admin-protected endpoints
│       ├── members.py
│       ├── payments.py
│       ├── plans.py
│       ├── services.py
│       ├── trainers.py
│       ├── gallery.py
│       └── site_config.py
├── middleware/              # CORS, logging, error handling
└── migrations/              # Alembic migration files
```

### 4.3 Repository Pattern

All database access goes through repositories. Business logic never touches the database directly.

```
Router → Service → Repository → Database
           ↑
    Encryption/Decryption applied here (PII fields only)
```

**Base Repository (DRY):**
```python
class BaseRepository(Generic[T]):
    def get(id) -> T
    def get_all() -> List[T]
    def create(obj) -> T
    def update(id, obj) -> T
    def delete(id) -> bool
```

All entity repositories extend `BaseRepository` and override only what is specific to that entity.

---

## 5. Authentication Architecture

### 5.1 Auth Flow — Member

```
Member visits Login Page
        │
        ├── Email + Password ──► Supabase Auth ──► JWT returned
        ├── Magic Link (SSO)  ──► Supabase Auth ──► JWT returned
        └── Phone + OTP       ──► Supabase Auth ──► JWT returned
                                        │
                              JWT stored in memory
                              (not localStorage — XSS prevention)
                                        │
                              Axios interceptor injects
                              Authorization: Bearer <JWT>
                                        │
                              FastAPI verifies JWT
                              Extracts role = "member"
                              Applies RLS in Supabase
```

### 5.2 Auth Flow — Admin

```
Admin visits /admin/login (separate route)
        │
        └── Email + Password ──► Supabase Auth ──► JWT returned
                                        │
                              FastAPI verifies JWT
                              Extracts role = "admin"
                              All admin routes accessible
```

### 5.3 Role Definitions

| Role | Set In | Access |
|---|---|---|
| `member` | Supabase Auth user metadata | Member portal only |
| `admin` | Supabase Auth user metadata | Admin dashboard + member portal |
| `dev` | Supabase Auth user metadata | All routes + debug endpoints |

### 5.4 JWT Verification (FastAPI)

```python
# core/auth.py — single reusable dependency
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    # Verify JWT with Supabase public key
    # Extract role from token claims
    # Return typed User object

async def require_member(user = Depends(get_current_user)) -> User:
    if user.role not in ["member", "admin", "dev"]:
        raise HTTPException(403)
    return user

async def require_admin(user = Depends(get_current_user)) -> User:
    if user.role not in ["admin", "dev"]:
        raise HTTPException(403)
    return user
```

---

## 6. Security Architecture

### 6.1 PII Encryption Layer

All PII fields are encrypted before reaching Postgres and decrypted after retrieval. The database never stores plaintext PII.

```
FastAPI Service
    │
    ├── WRITE: encrypt(plaintext, AES_KEY) → ciphertext → Postgres
    └── READ:  decrypt(ciphertext, AES_KEY) → plaintext → Response

PII Fields Encrypted:
    - member.full_name
    - member.phone_number
    - member.email_address
```

**Encryption Implementation:**
- Algorithm: AES-256 via Python `cryptography` library (Fernet symmetric encryption)
- Key storage: `AES_ENCRYPTION_KEY` environment variable on Render
- Key rotation: Documented as future enhancement — new key + re-encryption job

### 6.2 Supabase Row Level Security (RLS)

RLS policies ensure members can only query their own rows:

```sql
-- Members table RLS
CREATE POLICY "members_own_data" ON members
    FOR ALL USING (auth.uid() = supabase_user_id);

-- Payments table RLS
CREATE POLICY "payments_own_data" ON payments
    FOR ALL USING (
        member_id IN (
            SELECT id FROM members WHERE supabase_user_id = auth.uid()
        )
    );
```

Admin role bypasses RLS (Supabase service role key used server-side).

### 6.3 CORS Configuration

```python
# Only the Vercel frontend domain is allowed
CORS_ORIGINS = [
    "https://fitness-garage.vercel.app",  # Production
    "http://localhost:5173",              # Development
]
```

### 6.4 Environment Variables

| Variable | Description | Location |
|---|---|---|
| `AES_ENCRYPTION_KEY` | 32-byte AES key | Render env vars |
| `SUPABASE_URL` | Supabase project URL | Render + Vercel env vars |
| `SUPABASE_ANON_KEY` | Public Supabase key | Vercel env vars |
| `SUPABASE_SERVICE_KEY` | Private Supabase key (admin) | Render env vars only |
| `GOOGLE_PLACES_API_KEY` | Google Places API key | Render env vars |
| `DATABASE_URL` | Postgres connection string | Render env vars |
| `CORS_ORIGINS` | Allowed frontend origin | Render env vars |

---

## 7. Data Architecture

### 7.1 Data Flow — Public Website

```
Visitor Browser
    └──► GET /api/public/** (no auth)
              └──► FastAPI Router
                        └──► Repository
                                  └──► Supabase Postgres
                                  └──► Supabase Storage (media URLs)
                                  └──► Google Places API (reviews)
```

### 7.2 Data Flow — Member Portal

```
Member Browser (JWT in memory)
    └──► GET /api/member/** (JWT required)
              └──► FastAPI (verify JWT, role=member)
                        └──► Repository (RLS active)
                                  └──► Supabase Postgres
                                            └──► Decrypt PII fields
                                            └──► Return member data
```

### 7.3 Data Flow — Admin Dashboard

```
Admin Browser (JWT in memory)
    └──► GET/POST/PUT/DELETE /api/admin/** (JWT required, role=admin)
              └──► FastAPI (verify JWT, role=admin)
                        └──► Service Layer (business logic)
                                  └──► Repository (RLS bypassed via service key)
                                            └──► Supabase Postgres
                                            └──► Encrypt PII on write
                                            └──► Decrypt PII on read
```

### 7.4 Media Storage

All images and videos are stored in Supabase Storage:

| Bucket | Contents | Access |
|---|---|---|
| `gallery` | Gym photos, event photos, videos | Public |
| `transformations` | Before/after photos | Public |
| `trainers` | Trainer profile photos | Public |
| `services` | Service icons/images | Public |
| `invoices` | Generated PDF invoices | Private (member only) |

---

## 8. Google Reviews Integration

```
FastAPI reviews_service.py
    │
    ├── Cache: Reviews cached in Postgres (refresh every 24 hours)
    │          (Prevents excessive Google API calls on free tier)
    │
    └── Flow:
        1. Check last_synced timestamp in site_config
        2. If > 24 hours → call Google Places API
        3. Parse reviews (name, text, date, rating)
        4. Upsert into reviews table
        5. Return from DB (always fast, no live API latency for visitors)
```

---

## 9. Invoice Generation

```
Admin records payment
    │
    └──► payment_service creates payment record
              └──► invoice_service generates PDF (reportlab)
                        └──► PDF stored in Supabase Storage (invoices bucket)
                                  └──► Signed URL returned to admin/member
                                            └──► Member downloads via portal
```

---

## 10. Bulk Import Architecture

```
Admin uploads CSV/Excel
    │
    └──► /api/admin/members/import (multipart form)
              └──► import_service.py
                        ├── Parse with pandas/openpyxl
                        ├── Validate each row (Pydantic)
                        ├── Encrypt PII fields per row
                        ├── Bulk insert to Postgres
                        └──► Return import summary (success count, errors)
```

---

## 11. Frontend Routing

| Route | Page | Auth Required | Role |
|---|---|---|---|
| `/` | Home | No | — |
| `/about` | About | No | — |
| `/services` | Services | No | — |
| `/plans` | Membership Plans | No | — |
| `/trainers` | Trainer Profiles | No | — |
| `/gallery` | Gallery | No | — |
| `/testimonials` | Testimonials | No | — |
| `/contact` | Contact | No | — |
| `/login` | Member Login | No | — |
| `/member/dashboard` | Member Home | Yes | member |
| `/member/membership` | Membership Status | Yes | member |
| `/member/payments` | Payment History | Yes | member |
| `/admin/login` | Admin Login | No | — |
| `/admin/dashboard` | Admin Home | Yes | admin |
| `/admin/members` | Member Management | Yes | admin |
| `/admin/members/import` | Bulk Import | Yes | admin |
| `/admin/payments` | Payment Management | Yes | admin |
| `/admin/plans` | Membership Plans | Yes | admin |
| `/admin/services` | Services Management | Yes | admin |
| `/admin/trainers` | Trainer Management | Yes | admin |
| `/admin/gallery` | Gallery Management | Yes | admin |
| `/admin/stats` | Stats & Achievements | Yes | admin |
| `/admin/settings` | Site Settings | Yes | admin |

---

## 12. API Design Conventions

- **REST** architecture — no GraphQL (KISS)
- **Base URL:** `https://api.fitness-garage.com/api/v1`
- **Versioning:** URI versioning (`/v1/`) — allows non-breaking future versions
- **Response format:** JSON throughout
- **Error format:**
```json
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "Member with id 123 not found",
  "status": 404
}
```
- **Success format:**
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```
- **Pagination:** Cursor-based for large lists (members, payments)
- **Auto-docs:** FastAPI Swagger at `/docs` (dev/staging only, disabled in production)

---

## 13. Development Environment

### 13.1 Local Setup

```
Frontend: http://localhost:5173  (Vite dev server)
Backend:  http://localhost:8000  (uvicorn)
Database: Supabase hosted (same instance, dev project)
```

### 13.2 Git Strategy

```
main         → Production (auto-deploys to Vercel + Render)
develop      → Staging / Integration
feature/**   → Feature branches (merged to develop via PR)
```

### 13.3 Environment Files

```
frontend/
├── .env.local          # Local dev (gitignored)
├── .env.example        # Committed template

backend/
├── .env                # Local dev (gitignored)
├── .env.example        # Committed template
```

---

## 14. Performance Considerations

| Concern | Approach |
|---|---|
| Images | Served via Supabase Storage CDN; compressed on upload |
| Google Reviews | Cached in DB, refreshed every 24 hours |
| Frontend bundle | Code-split by route via React Router lazy loading |
| Render cold starts | Mitigated by cron-job.org keep-alive ping every 10 minutes |
| Read-heavy workload | Postgres handles 20 concurrent reads comfortably at free tier |
| Core Web Vitals | Tailwind CSS purging, Vite build optimization, lazy image loading |

---

## 15. Monitoring & Observability (Minimal / YAGNI)

At launch, monitoring is minimal:

| Tool | Purpose | Cost |
|---|---|---|
| Render dashboard | Backend uptime, logs | Free |
| Vercel dashboard | Frontend deploy status, analytics | Free |
| Supabase dashboard | DB usage, auth events | Free |
| cron-job.org | Keep-alive success/failure alerts | Free |

Full observability (Sentry, Datadog, etc.) deferred to AWS migration phase.

---

*End of Technical Architecture Document — Fitness Garage v1.0*
