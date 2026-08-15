# Database Schema Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.1  
**Date:** 2026-08-15  
**Status:** Finalized  
**Prepared for:** LLM Agent Handover

> **Amendment v1.1:** ORM (SQLAlchemy) and Alembic removed. All database access uses raw parameterized SQL via `asyncpg`. Migrations are plain `.sql` files run in order.

---

## 1. Overview

### 1.1 Database
- **Engine:** PostgreSQL 15+ (via Supabase)
- **Driver:** `asyncpg` — async Postgres driver, no ORM
- **Query Style:** Raw parameterized SQL only — no string interpolation, no ORM abstraction
- **Migrations:** Plain `.sql` files executed in numbered order — no migration framework
- **Auth:** Supabase Auth manages its own `auth.users` table — application DB links via `supabase_user_id`
- **Encryption:** All PII fields are AES-256 encrypted at the FastAPI service layer before write, decrypted on read. Postgres stores only ciphertext.
- **Row Level Security (RLS):** Enabled on all member-facing tables

### 1.2 Design Principles
- **DRY:** All tables share common audit columns (`created_at`, `updated_at`) defined once in a shared SQL snippet and reused across all migration files. Query functions are defined once per resource and reused across routers.
- **SOLID:** Each query module has a single, clear responsibility — one module per resource
- **KISS:** No over-normalisation — simple, flat relationships where possible. Raw SQL keeps the stack minimal and transparent.
- **Extensible:** Schema supports future additions (notifications, class schedules) without restructuring core tables
- **Replaceable:** No vendor-specific column types — standard Postgres types throughout. `asyncpg` can be swapped for any Postgres-compatible driver.

### 1.3 PII Fields (Encrypted at Rest)

The following fields are **always stored as ciphertext** in Postgres:

| Table | Field |
|---|---|
| `members` | `full_name` |
| `members` | `phone_number` |
| `members` | `email_address` |

All other fields are stored in plaintext.

---

## 2. Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE AUTH                                 │
│                           auth.users                                    │
│                    (id, email, phone, role)                             │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ supabase_user_id (FK)
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                              members                                    │
│  id │ supabase_user_id │ full_name* │ phone_number* │ email_address*   │
│  membership_plan_id │ status │ start_date │ expiry_date │ imported      │
└──────────────┬──────────────────────────────────┬───────────────────────┘
               │ member_id (FK)                   │ membership_plan_id (FK)
               │                                  │
┌──────────────▼──────────┐          ┌────────────▼──────────────────────┐
│        payments          │          │         membership_plans          │
│  id │ member_id         │          │  id │ tier │ duration │ price     │
│  amount │ payment_date  │          │  description │ is_active          │
│  payment_method         │          └───────────────────────────────────┘
│  membership_plan_id     │
│  invoice_path           │
│  notes                  │
└─────────────────────────┘

┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│      trainers       │   │      services        │   │       gallery       │
│  id │ name          │   │  id │ name           │   │  id │ folder_path   │
│  slug │ photo_path  │   │  slug │ description  │   │  file_name         │
│  specialization     │   │  icon_path          │   │  media_type         │
│  experience_years   │   │  display_order      │   │  display_order      │
│  certifications     │   │  is_active          │   │  is_active          │
│  bio │ display_order│   └─────────────────────┘   └─────────────────────┘
│  is_active          │
└─────────────────────┘

┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
│      reviews        │   │    site_config      │   │   achievements      │
│  id │ google_id     │   │  id │ config_key    │   │  id │ label         │
│  reviewer_name      │   │  config_value       │   │  value              │
│  review_text        │   │  updated_at         │   │  display_order      │
│  rating             │   └─────────────────────┘   │  is_active          │
│  review_date        │                             └─────────────────────┘
│  last_synced_at     │
└─────────────────────┘

* = PII field (AES-256 encrypted at rest)
```

---

## 3. Table Definitions

### 3.1 Common Audit Columns

Every table includes the following two audit columns. DRY — the `updated_at` trigger function is defined once and attached to every table in the migration files.

```sql
created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
```

**Shared trigger function — defined once in `000_init.sql`:**

```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Attached per table in each migration file:**

```sql
-- Example: applied to members table
CREATE TRIGGER trg_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

The same trigger pattern is repeated for every table that has an `updated_at` column.

---

### 3.2 `members`

Stores all gym member records. PII fields encrypted at FastAPI layer.

```sql
CREATE TABLE members (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_user_id    UUID UNIQUE,                          -- Links to auth.users; NULL for imported members until they register
    full_name           TEXT NOT NULL,                        -- ENCRYPTED (AES-256)
    phone_number        TEXT,                                  -- ENCRYPTED (AES-256)
    email_address       TEXT,                                  -- ENCRYPTED (AES-256)
    membership_plan_id  UUID REFERENCES membership_plans(id) ON DELETE SET NULL,
    status              TEXT NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'expired', 'pending', 'suspended')),
    start_date          DATE NOT NULL,
    expiry_date         DATE NOT NULL,
    imported            BOOLEAN NOT NULL DEFAULT FALSE,        -- TRUE if bulk imported from Excel
    notes               TEXT,                                  -- Internal admin notes (not shown to member)
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_expiry_date ON members(expiry_date);
CREATE INDEX idx_members_supabase_user_id ON members(supabase_user_id);

-- RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_own_data" ON members
    FOR SELECT USING (auth.uid() = supabase_user_id);

CREATE POLICY "admin_full_access" ON members
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'dev')
    );
```

**Field Notes:**
| Field | Notes |
|---|---|
| `supabase_user_id` | NULL for imported members who haven't registered yet. Set when member logs in for the first time. |
| `full_name` | Encrypted. Searchable only after decryption in FastAPI. |
| `imported` | Flags bulk-imported records for audit trail |
| `notes` | Admin-only internal field — not exposed to member portal |

---

### 3.3 `membership_plans`

Defines all available gym membership plans. Admin manages these from the dashboard.

```sql
CREATE TABLE membership_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier            TEXT NOT NULL CHECK (tier IN ('basic', 'pt')),
    duration        TEXT NOT NULL CHECK (duration IN ('monthly', 'quarterly', 'half_yearly', 'annual')),
    price           NUMERIC(10, 2) NOT NULL DEFAULT 0.00,     -- Placeholder pricing at launch
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (tier, duration)                                    -- Prevents duplicate plan combinations
);

-- Seed: 8 plan combinations (placeholder pricing)
INSERT INTO membership_plans (tier, duration, price) VALUES
    ('basic', 'monthly',     0.00),
    ('basic', 'quarterly',   0.00),
    ('basic', 'half_yearly', 0.00),
    ('basic', 'annual',      0.00),
    ('pt',    'monthly',     0.00),
    ('pt',    'quarterly',   0.00),
    ('pt',    'half_yearly', 0.00),
    ('pt',    'annual',      0.00);
```

---

### 3.4 `payments`

Records all payments made by members. Payments are manually entered by admin.

```sql
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    membership_plan_id  UUID REFERENCES membership_plans(id) ON DELETE SET NULL,
    amount              NUMERIC(10, 2) NOT NULL,
    payment_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method      TEXT NOT NULL DEFAULT 'cash'
                            CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'other')),
    invoice_path        TEXT,                                  -- Supabase Storage path: invoices/<member_id>/<payment_id>.pdf
    notes               TEXT,
    recorded_by         UUID,                                  -- Supabase user ID of admin who recorded payment
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_member_id ON payments(member_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);

-- RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_own_payments" ON payments
    FOR SELECT USING (
        member_id IN (
            SELECT id FROM members WHERE supabase_user_id = auth.uid()
        )
    );

CREATE POLICY "admin_full_access" ON payments
    FOR ALL USING (
        auth.jwt() ->> 'role' IN ('admin', 'dev')
    );
```

---

### 3.5 `trainers`

Stores trainer profiles. Admin can add, edit, remove trainers from dashboard.
Assets (photos) are stored in Supabase Storage under `assets/trainers/` folder.

```sql
CREATE TABLE trainers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    slug                TEXT NOT NULL UNIQUE,                  -- URL-friendly name e.g. "john-doe"
    specialization      TEXT NOT NULL,
    experience_years    INTEGER NOT NULL DEFAULT 0,
    certifications      TEXT[],                                -- Array of certification strings
    bio                 TEXT,
    photo_filename      TEXT,                                  -- Filename only e.g. "john-doe.jpg"
                                                               -- Full path: assets/trainers/<photo_filename>
    display_order       INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_trainers_is_active ON trainers(is_active);
CREATE INDEX idx_trainers_display_order ON trainers(display_order);

-- Seed: 5 placeholder trainers
INSERT INTO trainers (name, slug, specialization, experience_years, display_order) VALUES
    ('Trainer One',   'trainer-one',   'Personal Training',      5, 1),
    ('Trainer Two',   'trainer-two',   'Strength & Conditioning', 4, 2),
    ('Trainer Three', 'trainer-three', 'Weight Loss',             3, 3),
    ('Trainer Four',  'trainer-four',  'Zumba & Dance',           6, 4),
    ('Trainer Five',  'trainer-five',  'Nutrition Coaching',      2, 5);
```

**Storage Convention:**
```
assets/trainers/
├── trainer-one.jpg
├── trainer-two.jpg
└── ...
```
Admin uploads photo to `assets/trainers/` with filename matching `slug`. Backend constructs full URL dynamically.

---

### 3.6 `services`

Stores all gym services offered. Admin manages from dashboard.
Assets (images/icons) stored in Supabase Storage under `assets/services/` folder.

```sql
CREATE TABLE services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            TEXT NOT NULL UNIQUE,                      -- e.g. "personal-training"
    description     TEXT,
    icon_filename   TEXT,                                      -- Filename only e.g. "personal-training.svg"
                                                               -- Full path: assets/services/<icon_filename>
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_services_display_order ON services(display_order);

-- Seed: 8 services
INSERT INTO services (name, slug, display_order) VALUES
    ('Personal Training',       'personal-training',       1),
    ('Group Classes',           'group-classes',           2),
    ('Weight Loss Programs',    'weight-loss-programs',    3),
    ('Strength & Conditioning', 'strength-conditioning',   4),
    ('Nutrition Coaching',      'nutrition-coaching',      5),
    ('Cardio Programs',         'cardio-programs',         6),
    ('Kids Dance',              'kids-dance',              7),
    ('Zumba',                   'zumba',                   8);
```

**Storage Convention:**
```
assets/services/
├── personal-training.svg
├── group-classes.svg
├── weight-loss-programs.svg
└── ...
```

---

### 3.7 `gallery`

Tracks metadata for gallery assets. Actual files live in Supabase Storage section-named folders.

```sql
CREATE TABLE gallery (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_path     TEXT NOT NULL                              -- Supabase Storage folder
                        CHECK (folder_path IN (
                            'assets/gallery',
                            'assets/transformations'
                        )),
    file_name       TEXT NOT NULL,                            -- Filename in the folder
    media_type      TEXT NOT NULL
                        CHECK (media_type IN ('image', 'video')),
    caption         TEXT,
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    uploaded_by     UUID,                                     -- Admin supabase_user_id
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (folder_path, file_name)
);

-- Index
CREATE INDEX idx_gallery_folder ON gallery(folder_path);
CREATE INDEX idx_gallery_is_active ON gallery(is_active);
```

**Storage Convention:**
```
assets/gallery/
├── gym-floor-1.jpg
├── equipment-rack.jpg
└── event-2025.mp4

assets/transformations/
├── member-transform-1.jpg
└── ...
```

Admin uploads to the relevant folder. Backend lists files and syncs with gallery table.

---

### 3.8 `reviews`

Caches Google Reviews synced via Google Places API. Refreshed every 24 hours.

```sql
CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_review_id    TEXT NOT NULL UNIQUE,                  -- Google's review identifier
    reviewer_name       TEXT NOT NULL,
    review_text         TEXT,
    rating              INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_date         DATE NOT NULL,
    last_synced_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_visible          BOOLEAN NOT NULL DEFAULT TRUE,         -- Admin can hide individual reviews
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_review_date ON reviews(review_date DESC);
CREATE INDEX idx_reviews_is_visible ON reviews(is_visible);
```

---

### 3.9 `site_config`

Key-value store for all admin-manageable site configuration. Single source of truth for hero stats, achievements, gym info, and sync timestamps.

```sql
CREATE TABLE site_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key      TEXT NOT NULL UNIQUE,
    config_value    TEXT NOT NULL,
    description     TEXT,                                      -- Human-readable description for admin UI
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: Default config values
INSERT INTO site_config (config_key, config_value, description) VALUES
    -- Hero Stats
    ('stat_members_count',        '200+',   'Number of members shown in hero stats'),
    ('stat_years_in_business',    '5+',     'Years in business shown in hero stats'),
    ('stat_trainers_count',       '5+',     'Number of trainers shown in hero stats'),
    ('stat_transformations',      '100+',   'Transformations achieved shown in hero stats'),

    -- Achievements
    ('achievement_1_label',       'Best Gym Award 2024',  'Achievement label 1'),
    ('achievement_2_label',       'Top Rated Gym',        'Achievement label 2'),
    ('achievement_3_label',       '',                     'Achievement label 3 (placeholder)'),

    -- Gym Info
    ('gym_name',                  'Fitness Garage',        'Gym display name'),
    ('gym_address',               'TBD',                   'Full gym address'),
    ('gym_phone',                 'TBD',                   'Contact phone number'),
    ('gym_email',                 'TBD',                   'Contact email address'),
    ('gym_maps_embed_url',        'TBD',                   'Google Maps embed URL'),
    ('gym_google_form_url',       'TBD',                   'Google Form embed URL for contact'),
    ('gym_google_place_id',       'TBD',                   'Google Place ID for reviews sync'),

    -- Reviews Sync
    ('reviews_last_synced_at',    '2000-01-01T00:00:00Z', 'Timestamp of last Google Reviews sync'),

    -- Hero Slideshow
    ('hero_slideshow_interval_ms','5000',   'Milliseconds between hero slideshow slides'),

    -- About Section
    ('about_tagline',             'TBD',    'Gym tagline/mission statement'),
    ('about_story',               'TBD',    'Gym story paragraph');
```

---

### 3.10 `achievements`

Stores gym achievements displayed on the home page. Separate from `site_config` to allow an ordered, manageable list.

```sql
CREATE TABLE achievements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label           TEXT NOT NULL,                             -- e.g. "Best Gym Award 2024"
    value           TEXT,                                      -- Optional numeric/text value e.g. "#1"
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed: 3 placeholder achievements
INSERT INTO achievements (label, display_order) VALUES
    ('Best Gym Award 2024', 1),
    ('Top Rated Gym',       2),
    ('500+ Transformations',3);
```

---

## 4. Supabase Storage Structure

All media assets are stored in Supabase Storage. Folder names match the section they serve — admin drops files into the correct folder, backend serves them automatically.

```
supabase-storage/
├── assets/
│   ├── hero/                  → Hero slideshow images/videos
│   │   ├── slide-1.jpg
│   │   ├── slide-2.jpg
│   │   └── slide-3.mp4
│   │
│   ├── about/                 → About section images
│   │   └── about-gym.jpg
│   │
│   ├── services/              → Service card images/icons
│   │   ├── personal-training.svg
│   │   ├── group-classes.svg
│   │   └── ...
│   │
│   ├── trainers/              → Trainer profile photos
│   │   ├── trainer-one.jpg
│   │   └── ...
│   │
│   ├── gallery/               → General gallery photos/videos
│   │   ├── gym-floor-1.jpg
│   │   └── event-2025.mp4
│   │
│   ├── transformations/       → Before/after transformation photos
│   │   └── member-transform-1.jpg
│   │
│   └── plans/                 → Membership plan visuals (optional)
│
└── invoices/                  → Generated PDF invoices (private bucket)
    └── <member_id>/
        └── <payment_id>.pdf
```

**Access Rules:**
| Bucket/Folder | Access Policy |
|---|---|
| `assets/**` | Public read — no auth required |
| `invoices/**` | Private — member can only access their own folder via signed URL |

---

## 5. Migrations Strategy

### 5.1 Plain SQL Migration Files

No migration framework. Migrations are plain `.sql` files named with a numeric prefix and executed in order against Postgres. Each file is idempotent using `IF NOT EXISTS` guards.

```
backend/
└── db/
    └── migrations/
        ├── 000_init.sql                   # update_updated_at() trigger function
        ├── 001_create_membership_plans.sql
        ├── 002_create_members.sql
        ├── 003_create_payments.sql
        ├── 004_create_trainers.sql
        ├── 005_create_services.sql
        ├── 006_create_gallery.sql
        ├── 007_create_reviews.sql
        ├── 008_create_site_config.sql
        ├── 009_create_achievements.sql
        ├── 010_seed_membership_plans.sql
        ├── 011_seed_services.sql
        ├── 012_seed_trainers.sql
        └── 013_seed_site_config.sql
```

### 5.2 Migration Runner

A lightweight Python script applies migrations in order. It tracks applied migrations in a `_migrations` table to avoid re-running.

```sql
-- Auto-created on first run
CREATE TABLE IF NOT EXISTS _migrations (
    filename   TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

```python
# db/migrate.py — run once on deploy
import asyncio, asyncpg, os
from pathlib import Path

async def run_migrations():
    conn = await asyncpg.connect(os.environ["DATABASE_URL"])
    await conn.execute("""
        CREATE TABLE IF NOT EXISTS _migrations (
            filename TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    """)
    applied = {r["filename"] for r in await conn.fetch("SELECT filename FROM _migrations")}
    migration_files = sorted(Path("db/migrations").glob("*.sql"))

    for f in migration_files:
        if f.name not in applied:
            sql = f.read_text()
            await conn.execute(sql)
            await conn.execute(
                "INSERT INTO _migrations (filename) VALUES ($1)", f.name
            )
            print(f"Applied: {f.name}")

    await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migrations())
```

### 5.3 Migration Execution Order

Files must be applied in numeric order — dependencies are respected by the naming convention:

```
000_init.sql                   → Shared trigger function (no table deps)
001_create_membership_plans    → No dependencies
002_create_members             → Depends on: membership_plans
003_create_payments            → Depends on: members, membership_plans
004_create_trainers            → No dependencies
005_create_services            → No dependencies
006_create_gallery             → No dependencies
007_create_reviews             → No dependencies
008_create_site_config         → No dependencies
009_create_achievements        → No dependencies
010_seed_membership_plans      → Depends on: 001
011_seed_services              → Depends on: 005
012_seed_trainers              → Depends on: 004
013_seed_site_config           → Depends on: 008
```

---

## 5a. Database Connection — asyncpg

### 5a.1 Connection Pool Setup

A single shared connection pool is initialised at FastAPI startup and closed on shutdown. All query modules receive the pool via FastAPI dependency injection — no global state.

```python
# db/connection.py
import asyncpg
import os

_pool: asyncpg.Pool | None = None

async def init_pool():
    global _pool
    _pool = await asyncpg.create_pool(
        dsn=os.environ["DATABASE_URL"],
        min_size=2,
        max_size=10,
    )

async def close_pool():
    if _pool:
        await _pool.close()

async def get_pool() -> asyncpg.Pool:
    return _pool
```

```python
# main.py — lifespan events
from contextlib import asynccontextmanager
from fastapi import FastAPI
from db.connection import init_pool, close_pool

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_pool()
    yield
    await close_pool()

app = FastAPI(lifespan=lifespan)
```

### 5a.2 Raw Parameterized SQL Query Pattern

All database access uses `$1`, `$2`, ... positional parameters — never string interpolation. Query functions are grouped by resource into modules under `db/queries/`.

**Folder structure:**
```
backend/
└── db/
    ├── connection.py
    ├── migrate.py
    ├── migrations/
    │   └── *.sql
    └── queries/
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

**Example — `db/queries/member_queries.py`:**
```python
# DRY: one function per operation, reused by both admin and member routers
import asyncpg
from uuid import UUID

async def get_member_by_id(pool: asyncpg.Pool, member_id: UUID) -> asyncpg.Record | None:
    return await pool.fetchrow(
        """
        SELECT id, supabase_user_id, full_name, phone_number, email_address,
               membership_plan_id, status, start_date, expiry_date, notes,
               imported, created_at, updated_at
        FROM members
        WHERE id = $1
        """,
        member_id,
    )

async def get_member_by_supabase_id(pool: asyncpg.Pool, supabase_user_id: UUID) -> asyncpg.Record | None:
    return await pool.fetchrow(
        "SELECT * FROM members WHERE supabase_user_id = $1",
        supabase_user_id,
    )

async def list_members(
    pool: asyncpg.Pool,
    status: str | None,
    limit: int,
    cursor: UUID | None,
) -> list[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id, full_name, phone_number, email_address, membership_plan_id,
               status, start_date, expiry_date, imported, created_at
        FROM members
        WHERE ($1::text IS NULL OR status = $1)
          AND ($2::uuid IS NULL OR id > $2)
        ORDER BY created_at DESC
        LIMIT $3
        """,
        status, cursor, limit,
    )

async def create_member(pool: asyncpg.Pool, **fields) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO members
            (full_name, phone_number, email_address, membership_plan_id,
             status, start_date, expiry_date, notes, imported)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
        """,
        fields["full_name"], fields["phone_number"], fields["email_address"],
        fields["membership_plan_id"], fields["status"], fields["start_date"],
        fields["expiry_date"], fields.get("notes"), fields.get("imported", False),
    )

async def update_member(pool: asyncpg.Pool, member_id: UUID, **fields) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        UPDATE members SET
            full_name          = COALESCE($2, full_name),
            phone_number       = COALESCE($3, phone_number),
            email_address      = COALESCE($4, email_address),
            membership_plan_id = COALESCE($5, membership_plan_id),
            status             = COALESCE($6, status),
            start_date         = COALESCE($7, start_date),
            expiry_date        = COALESCE($8, expiry_date),
            notes              = COALESCE($9, notes)
        WHERE id = $1
        RETURNING id
        """,
        member_id,
        fields.get("full_name"), fields.get("phone_number"), fields.get("email_address"),
        fields.get("membership_plan_id"), fields.get("status"),
        fields.get("start_date"), fields.get("expiry_date"), fields.get("notes"),
    )

async def soft_delete_member(pool: asyncpg.Pool, member_id: UUID) -> None:
    await pool.execute(
        "UPDATE members SET status = 'suspended' WHERE id = $1",
        member_id,
    )
```

**Usage in FastAPI router (SOLID — router delegates to query, never touches SQL directly):**
```python
# routers/admin/members.py
from fastapi import APIRouter, Depends
from db.connection import get_pool
from db.queries.member_queries import get_member_by_id
from core.security import decrypt_pii

router = APIRouter(prefix="/admin/members")

@router.get("/{member_id}")
async def get_member(member_id: UUID, pool=Depends(get_pool)):
    row = await get_member_by_id(pool, member_id)
    if not row:
        raise HTTPException(404, "Member not found")
    return decrypt_pii(dict(row))   # PII decrypted here, never in query layer
```

---

## 6. Row Level Security Summary

| Table | RLS Enabled | Member Policy | Admin Policy |
|---|---|---|---|
| `members` | ✅ | SELECT own row only | Full access |
| `payments` | ✅ | SELECT own payments only | Full access |
| `membership_plans` | ❌ | Public read (via API) | Full access |
| `trainers` | ❌ | Public read (via API) | Full access |
| `services` | ❌ | Public read (via API) | Full access |
| `gallery` | ❌ | Public read (via API) | Full access |
| `reviews` | ❌ | Public read (via API) | Full access |
| `site_config` | ❌ | Public read (via API) | Full access |
| `achievements` | ❌ | Public read (via API) | Full access |

Note: All database access for public endpoints goes through FastAPI (not direct Supabase client from frontend). RLS is a defence-in-depth layer, not the primary access control.

---

## 7. Data Integrity Rules

| Rule | Implementation |
|---|---|
| Member must have a plan | `membership_plan_id` FK with SET NULL on plan delete — member record preserved |
| Expiry date > start date | Application-level validation in Pydantic schema |
| Plan tier + duration unique | `UNIQUE (tier, duration)` constraint on `membership_plans` |
| Gallery file unique per folder | `UNIQUE (folder_path, file_name)` on `gallery` |
| Google review unique | `UNIQUE` on `google_review_id` in `reviews` |
| Slug uniqueness | `UNIQUE` on `slug` in `trainers` and `services` |
| Payment amount > 0 | Application-level validation in Pydantic schema |
| Rating between 1–5 | `CHECK (rating BETWEEN 1 AND 5)` on `reviews` |

---

*End of Database Schema Document — Fitness Garage v1.1*
