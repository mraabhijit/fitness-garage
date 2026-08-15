# API Specification Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0  
**Date:** 2026-08-15  
**Status:** Finalized  
**Prepared for:** LLM Agent Handover

---

## 1. Overview

### 1.1 Base URL
| Environment | Base URL |
|---|---|
| Production | `https://api.fitness-garage.com/api/v1` |
| Development | `http://localhost:8000/api/v1` |

### 1.2 Design Conventions
- **Architecture:** REST
- **Format:** JSON request and response bodies throughout
- **Versioning:** URI versioning (`/v1/`) — future breaking changes use `/v2/`
- **Auth:** Bearer JWT (issued by Supabase Auth) on all protected routes
- **CORS:** Locked to Vercel frontend domain only
- **Auto-docs:** FastAPI Swagger UI at `/docs` — disabled in production, enabled in dev only
- **Principles:** DRY (shared base schemas), SOLID (one router per resource), KISS (no over-engineered response wrappers), YAGNI (no speculative endpoints)

### 1.3 Standard Response Envelopes

**Success:**
```json
{
  "data": { },
  "message": "Operation successful"
}
```

**Success (list):**
```json
{
  "data": [ ],
  "total": 42,
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "error": "RESOURCE_NOT_FOUND",
  "message": "Member with id abc-123 not found",
  "status": 404
}
```

### 1.4 Standard HTTP Status Codes

| Code | Meaning |
|---|---|
| `200` | Success |
| `201` | Created |
| `204` | No content (delete success) |
| `400` | Bad request / validation error |
| `401` | Unauthenticated — missing or invalid JWT |
| `403` | Forbidden — valid JWT but insufficient role |
| `404` | Resource not found |
| `409` | Conflict — duplicate resource |
| `422` | Unprocessable entity — Pydantic validation failure |
| `500` | Internal server error |

### 1.5 Authentication Header

All protected routes require:
```
Authorization: Bearer <supabase_jwt_token>
```

### 1.6 Route Access Summary

| Route Prefix | Auth Required | Role |
|---|---|---|
| `/api/v1/public/**` | No | — |
| `/api/v1/member/**` | Yes | `member`, `admin`, `dev` |
| `/api/v1/admin/**` | Yes | `admin`, `dev` |
| `/api/v1/health` | No | — |

---

## 2. Health Check

### `GET /health`
Keep-alive endpoint pinged by cron-job.org every 10 minutes.

**Auth:** None

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-08-15T10:00:00Z"
}
```

---

## 3. Public Endpoints

No authentication required. Read-only. Serves all public-facing website sections.

---

### 3.1 Site Configuration

#### `GET /public/site-config`
Returns all key-value pairs for site configuration (gym info, hero stats, about content).

**Response `200`:**
```json
{
  "data": {
    "gym_name": "Fitness Garage",
    "gym_address": "TBD",
    "gym_phone": "TBD",
    "gym_email": "TBD",
    "gym_maps_embed_url": "TBD",
    "gym_google_form_url": "TBD",
    "stat_members_count": "200+",
    "stat_years_in_business": "5+",
    "stat_trainers_count": "5+",
    "stat_transformations": "100+",
    "about_tagline": "TBD",
    "about_story": "TBD",
    "hero_slideshow_interval_ms": "5000"
  }
}
```

---

### 3.2 Hero Assets

#### `GET /public/assets/hero`
Returns list of all files in the `assets/hero/` Supabase Storage folder.
Frontend renders these as the hero slideshow automatically.

**Response `200`:**
```json
{
  "data": [
    {
      "file_name": "slide-1.jpg",
      "url": "https://supabase-storage-url/assets/hero/slide-1.jpg",
      "media_type": "image"
    },
    {
      "file_name": "slide-2.mp4",
      "url": "https://supabase-storage-url/assets/hero/slide-2.mp4",
      "media_type": "video"
    }
  ]
}
```

---

### 3.3 Achievements

#### `GET /public/achievements`
Returns all active achievements for the home page.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "label": "Best Gym Award 2024",
      "value": "#1",
      "display_order": 1
    }
  ]
}
```

---

### 3.4 Services

#### `GET /public/services`
Returns all active services with asset URLs constructed from `assets/services/` folder.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Personal Training",
      "slug": "personal-training",
      "description": "One-on-one personalised training sessions.",
      "icon_url": "https://supabase-storage-url/assets/services/personal-training.svg",
      "display_order": 1
    }
  ]
}
```

---

### 3.5 Membership Plans

#### `GET /public/plans`
Returns all active membership plans.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tier": "basic",
      "duration": "monthly",
      "price": 0.00,
      "description": null
    },
    {
      "id": "uuid",
      "tier": "pt",
      "duration": "annual",
      "price": 0.00,
      "description": null
    }
  ]
}
```

---

### 3.6 Trainers

#### `GET /public/trainers`
Returns all active trainer profiles. Photo URLs constructed from `assets/trainers/` folder.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Trainer One",
      "slug": "trainer-one",
      "specialization": "Personal Training",
      "experience_years": 5,
      "certifications": ["ACE Certified", "CPR Certified"],
      "bio": "Placeholder bio.",
      "photo_url": "https://supabase-storage-url/assets/trainers/trainer-one.jpg",
      "display_order": 1
    }
  ]
}
```

---

### 3.7 Gallery

#### `GET /public/gallery`
Returns all active gallery items. Includes both `gallery` and `transformations` folders.

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `type` | string | No | Filter by `gallery` or `transformations`. Returns all if omitted. |
| `media_type` | string | No | Filter by `image` or `video` |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "folder": "gallery",
      "file_name": "gym-floor-1.jpg",
      "url": "https://supabase-storage-url/assets/gallery/gym-floor-1.jpg",
      "media_type": "image",
      "caption": "Our main gym floor.",
      "display_order": 1
    }
  ]
}
```

---

### 3.8 Reviews

#### `GET /public/reviews`
Returns all visible Google Reviews from cache. Triggers a background sync if cache is older than 24 hours.

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `min_rating` | integer | No | Filter reviews by minimum star rating (1–5) |
| `limit` | integer | No | Number of reviews to return. Default: 10 |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "reviewer_name": "John D.",
      "review_text": "Amazing gym with great trainers!",
      "rating": 5,
      "review_date": "2026-07-10"
    }
  ],
  "total": 42,
  "last_synced_at": "2026-08-15T06:00:00Z"
}
```

---

### 3.9 About Assets

#### `GET /public/assets/about`
Returns all files in `assets/about/` folder for the About section.

**Response `200`:**
```json
{
  "data": [
    {
      "file_name": "about-gym.jpg",
      "url": "https://supabase-storage-url/assets/about/about-gym.jpg",
      "media_type": "image"
    }
  ]
}
```

---

## 4. Member Endpoints

Requires valid JWT with role `member`, `admin`, or `dev`.
All PII fields are decrypted by FastAPI before returning to the client.

---

### 4.1 Member Profile

#### `GET /member/me`
Returns the authenticated member's own profile and membership details.

**Auth:** Bearer JWT (member)

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "full_name": "Jane Smith",
    "email_address": "jane@example.com",
    "phone_number": "+91-9999999999",
    "membership": {
      "tier": "basic",
      "duration": "monthly",
      "status": "active",
      "start_date": "2026-07-01",
      "expiry_date": "2026-08-01"
    }
  }
}
```

---

### 4.2 Member Payment History

#### `GET /member/payments`
Returns all payment records for the authenticated member.

**Auth:** Bearer JWT (member)

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `limit` | integer | No | Records per page. Default: 20 |
| `cursor` | string | No | Cursor for next page (payment UUID) |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 1500.00,
      "payment_date": "2026-07-01",
      "payment_method": "cash",
      "membership_plan": {
        "tier": "basic",
        "duration": "monthly"
      },
      "invoice_url": "https://signed-url/invoices/member-id/payment-id.pdf"
    }
  ],
  "total": 12,
  "next_cursor": "uuid-of-last-record"
}
```

---

### 4.3 Invoice Download

#### `GET /member/payments/{payment_id}/invoice`
Returns a signed URL for the invoice PDF. URL is valid for 60 minutes.

**Auth:** Bearer JWT (member)

**Path Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `payment_id` | UUID | Yes | Payment record ID |

**Response `200`:**
```json
{
  "data": {
    "invoice_url": "https://signed-url/invoices/member-id/payment-id.pdf",
    "expires_at": "2026-08-15T11:00:00Z"
  }
}
```

**Error `403`:** Returned if the payment does not belong to the authenticated member.

---

## 5. Admin Endpoints

Requires valid JWT with role `admin` or `dev`.
All PII fields are decrypted on read, encrypted on write by FastAPI.

---

### 5.1 Members

#### `GET /admin/members`
Returns paginated list of all members.

**Auth:** Bearer JWT (admin)

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `status` | string | No | Filter by `active`, `expired`, `pending`, `suspended` |
| `tier` | string | No | Filter by `basic` or `pt` |
| `search` | string | No | Search by decrypted name (server-side) |
| `limit` | integer | No | Records per page. Default: 20 |
| `cursor` | string | No | Cursor-based pagination |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "full_name": "Jane Smith",
      "email_address": "jane@example.com",
      "phone_number": "+91-9999999999",
      "membership_plan": {
        "tier": "basic",
        "duration": "monthly"
      },
      "status": "active",
      "start_date": "2026-07-01",
      "expiry_date": "2026-08-01",
      "imported": false
    }
  ],
  "total": 200,
  "next_cursor": "uuid"
}
```

---

#### `GET /admin/members/{member_id}`
Returns a single member's full profile.

**Auth:** Bearer JWT (admin)

**Response `200`:**
```json
{
  "data": {
    "id": "uuid",
    "full_name": "Jane Smith",
    "email_address": "jane@example.com",
    "phone_number": "+91-9999999999",
    "membership_plan": {
      "id": "uuid",
      "tier": "basic",
      "duration": "monthly",
      "price": 1500.00
    },
    "status": "active",
    "start_date": "2026-07-01",
    "expiry_date": "2026-08-01",
    "notes": "Internal admin note.",
    "imported": false,
    "created_at": "2026-07-01T09:00:00Z"
  }
}
```

---

#### `POST /admin/members`
Creates a new member record.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "email_address": "jane@example.com",
  "phone_number": "+91-9999999999",
  "membership_plan_id": "uuid",
  "start_date": "2026-08-01",
  "expiry_date": "2026-09-01",
  "status": "active",
  "notes": ""
}
```

**Response `201`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Member created successfully"
}
```

---

#### `PUT /admin/members/{member_id}`
Updates an existing member record.

**Auth:** Bearer JWT (admin)

**Request Body:** Same as POST — all fields optional (partial update supported).

**Response `200`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Member updated successfully"
}
```

---

#### `DELETE /admin/members/{member_id}`
Soft-deletes a member (sets status to `suspended`). Hard delete not supported — preserves payment history.

**Auth:** Bearer JWT (admin)

**Response `204`:** No content.

---

#### `POST /admin/members/import`
Bulk imports members from a CSV or Excel file.

**Auth:** Bearer JWT (admin)

**Request:** Multipart form data

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | file | Yes | `.csv` or `.xlsx` file |

**Expected CSV/Excel Columns:**
```
full_name | email_address | phone_number | tier | duration | start_date | expiry_date | status
```

**Response `200`:**
```json
{
  "data": {
    "total_rows": 210,
    "imported": 205,
    "skipped": 3,
    "errors": 2,
    "error_details": [
      { "row": 12, "reason": "Invalid expiry date format" },
      { "row": 47, "reason": "Unknown membership tier" }
    ]
  },
  "message": "Import complete"
}
```

---

### 5.2 Payments

#### `GET /admin/payments`
Returns paginated list of all payments across all members.

**Auth:** Bearer JWT (admin)

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `member_id` | UUID | No | Filter by member |
| `from_date` | date | No | Filter from date (YYYY-MM-DD) |
| `to_date` | date | No | Filter to date (YYYY-MM-DD) |
| `limit` | integer | No | Default: 20 |
| `cursor` | string | No | Cursor pagination |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "member": {
        "id": "uuid",
        "full_name": "Jane Smith"
      },
      "amount": 1500.00,
      "payment_date": "2026-07-01",
      "payment_method": "cash",
      "membership_plan": {
        "tier": "basic",
        "duration": "monthly"
      },
      "invoice_url": "https://signed-url/invoices/member-id/payment-id.pdf",
      "notes": ""
    }
  ],
  "total": 450,
  "next_cursor": "uuid"
}
```

---

#### `POST /admin/payments`
Records a new payment and generates an invoice PDF.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "member_id": "uuid",
  "membership_plan_id": "uuid",
  "amount": 1500.00,
  "payment_date": "2026-08-01",
  "payment_method": "cash",
  "notes": ""
}
```

**Response `201`:**
```json
{
  "data": {
    "id": "uuid",
    "invoice_url": "https://signed-url/invoices/member-id/payment-id.pdf"
  },
  "message": "Payment recorded and invoice generated"
}
```

---

#### `GET /admin/payments/{payment_id}/invoice`
Returns a signed URL for a specific invoice PDF. Valid for 60 minutes.

**Auth:** Bearer JWT (admin)

**Response `200`:**
```json
{
  "data": {
    "invoice_url": "https://signed-url/invoices/member-id/payment-id.pdf",
    "expires_at": "2026-08-15T11:00:00Z"
  }
}
```

---

### 5.3 Membership Plans

#### `GET /admin/plans`
Returns all plans including inactive ones (admin view).

**Auth:** Bearer JWT (admin)

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "tier": "basic",
      "duration": "monthly",
      "price": 1500.00,
      "description": "Basic monthly access",
      "is_active": true
    }
  ]
}
```

---

#### `PUT /admin/plans/{plan_id}`
Updates plan price, description, or active status.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "price": 1500.00,
  "description": "Full gym access, monthly.",
  "is_active": true
}
```

**Response `200`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Plan updated successfully"
}
```

Note: Plans cannot be created or deleted via API — 8 fixed combinations are seeded. Only price, description, and active status are editable.

---

### 5.4 Services

#### `GET /admin/services`
Returns all services including inactive.

**Auth:** Bearer JWT (admin)

**Response `200`:** Same shape as public endpoint, plus `is_active` field.

---

#### `POST /admin/services`
Creates a new service.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "name": "Boxing",
  "slug": "boxing",
  "description": "Boxing fitness classes for all levels.",
  "icon_filename": "boxing.svg",
  "display_order": 9,
  "is_active": true
}
```

**Response `201`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Service created. Upload icon to assets/services/boxing.svg in storage."
}
```

---

#### `PUT /admin/services/{service_id}`
Updates a service.

**Auth:** Bearer JWT (admin)

**Request Body:** Same as POST — all fields optional.

**Response `200`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Service updated successfully"
}
```

---

#### `DELETE /admin/services/{service_id}`
Soft-deletes a service (sets `is_active = false`).

**Auth:** Bearer JWT (admin)

**Response `204`:** No content.

---

### 5.5 Trainers

#### `GET /admin/trainers`
Returns all trainer profiles including inactive.

**Auth:** Bearer JWT (admin)

**Response `200`:** Same shape as public endpoint, plus `is_active` field.

---

#### `POST /admin/trainers`
Creates a new trainer profile.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "name": "John Doe",
  "slug": "john-doe",
  "specialization": "Strength & Conditioning",
  "experience_years": 7,
  "certifications": ["ACE Certified", "CPR Certified"],
  "bio": "John has 7 years of experience...",
  "photo_filename": "john-doe.jpg",
  "display_order": 6,
  "is_active": true
}
```

**Response `201`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Trainer created. Upload photo to assets/trainers/john-doe.jpg in storage."
}
```

---

#### `PUT /admin/trainers/{trainer_id}`
Updates a trainer profile.

**Auth:** Bearer JWT (admin)

**Request Body:** Same as POST — all fields optional.

**Response `200`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Trainer updated successfully"
}
```

---

#### `DELETE /admin/trainers/{trainer_id}`
Soft-deletes a trainer (sets `is_active = false`).

**Auth:** Bearer JWT (admin)

**Response `204`:** No content.

---

### 5.6 Gallery

#### `GET /admin/gallery`
Returns all gallery items including inactive ones.

**Auth:** Bearer JWT (admin)

**Response `200`:** Same shape as public endpoint plus `is_active`, `uploaded_by`, `created_at`.

---

#### `POST /admin/gallery`
Registers a new gallery item after file has been uploaded to Supabase Storage.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "folder_path": "assets/gallery",
  "file_name": "gym-floor-2.jpg",
  "media_type": "image",
  "caption": "Updated gym floor layout.",
  "display_order": 5,
  "is_active": true
}
```

**Response `201`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Gallery item registered successfully"
}
```

---

#### `PUT /admin/gallery/{gallery_id}`
Updates gallery item metadata (caption, display order, visibility).

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "caption": "Updated caption.",
  "display_order": 3,
  "is_active": false
}
```

**Response `200`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Gallery item updated"
}
```

---

#### `DELETE /admin/gallery/{gallery_id}`
Removes gallery item record and deletes the file from Supabase Storage.

**Auth:** Bearer JWT (admin)

**Response `204`:** No content.

---

### 5.7 Site Configuration

#### `GET /admin/site-config`
Returns all site config key-value pairs (admin view — same as public but includes descriptions).

**Auth:** Bearer JWT (admin)

**Response `200`:**
```json
{
  "data": [
    {
      "config_key": "stat_members_count",
      "config_value": "200+",
      "description": "Number of members shown in hero stats"
    }
  ]
}
```

---

#### `PUT /admin/site-config`
Updates one or more site config values in a single request.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "updates": [
    { "config_key": "stat_members_count", "config_value": "250+" },
    { "config_key": "gym_phone", "config_value": "+91-9876543210" }
  ]
}
```

**Response `200`:**
```json
{
  "message": "Site configuration updated successfully"
}
```

---

### 5.8 Achievements

#### `GET /admin/achievements`
Returns all achievements including inactive.

**Auth:** Bearer JWT (admin)

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "label": "Best Gym Award 2024",
      "value": "#1",
      "display_order": 1,
      "is_active": true
    }
  ]
}
```

---

#### `POST /admin/achievements`
Creates a new achievement.

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "label": "500+ Transformations",
  "value": "500+",
  "display_order": 4,
  "is_active": true
}
```

**Response `201`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Achievement created successfully"
}
```

---

#### `PUT /admin/achievements/{achievement_id}`
Updates an achievement.

**Auth:** Bearer JWT (admin)

**Request Body:** Same as POST — all fields optional.

**Response `200`:**
```json
{
  "data": { "id": "uuid" },
  "message": "Achievement updated successfully"
}
```

---

#### `DELETE /admin/achievements/{achievement_id}`
Soft-deletes an achievement (sets `is_active = false`).

**Auth:** Bearer JWT (admin)

**Response `204`:** No content.

---

### 5.9 Reviews

#### `GET /admin/reviews`
Returns all reviews including hidden ones.

**Auth:** Bearer JWT (admin)

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "reviewer_name": "John D.",
      "review_text": "Amazing gym!",
      "rating": 5,
      "review_date": "2026-07-10",
      "is_visible": true,
      "last_synced_at": "2026-08-15T06:00:00Z"
    }
  ],
  "total": 42
}
```

---

#### `PUT /admin/reviews/{review_id}`
Toggles visibility of a review (show/hide on public site).

**Auth:** Bearer JWT (admin)

**Request Body:**
```json
{
  "is_visible": false
}
```

**Response `200`:**
```json
{
  "message": "Review visibility updated"
}
```

---

#### `POST /admin/reviews/sync`
Manually triggers a Google Reviews sync (outside the 24-hour auto-sync).

**Auth:** Bearer JWT (admin)

**Response `200`:**
```json
{
  "data": {
    "synced": 5,
    "total_reviews": 47
  },
  "message": "Reviews synced successfully"
}
```

---

## 6. Pydantic Schema Reference

### 6.1 Shared Base Schemas (DRY)

```python
# schemas/base.py

class TimestampSchema(BaseModel):
    created_at: datetime
    updated_at: datetime

class UUIDSchema(BaseModel):
    id: UUID4

class SuccessResponse(BaseModel):
    message: str

class ErrorResponse(BaseModel):
    error: str
    message: str
    status: int
```

### 6.2 Member Schemas

```python
class MemberBase(BaseModel):
    full_name: str
    email_address: EmailStr | None
    phone_number: str | None
    membership_plan_id: UUID4
    start_date: date
    expiry_date: date
    status: Literal["active", "expired", "pending", "suspended"]
    notes: str | None

class MemberCreate(MemberBase): pass

class MemberUpdate(MemberBase):
    # All fields optional for partial update
    full_name: str | None = None
    membership_plan_id: UUID4 | None = None
    start_date: date | None = None
    expiry_date: date | None = None
    status: Literal[...] | None = None

class MemberResponse(MemberBase, UUIDSchema, TimestampSchema):
    membership_plan: MembershipPlanResponse | None
    imported: bool
```

### 6.3 Payment Schemas

```python
class PaymentCreate(BaseModel):
    member_id: UUID4
    membership_plan_id: UUID4
    amount: Decimal
    payment_date: date
    payment_method: Literal["cash", "card", "upi", "bank_transfer", "other"]
    notes: str | None

class PaymentResponse(PaymentCreate, UUIDSchema, TimestampSchema):
    member: MemberSummary
    invoice_url: str | None
```

### 6.4 Validation Rules

| Field | Rule |
|---|---|
| `expiry_date` | Must be after `start_date` |
| `amount` | Must be greater than 0 |
| `slug` | Lowercase, hyphens only, no spaces |
| `display_order` | Must be >= 0 |
| `rating` | Integer between 1 and 5 |
| `email_address` | Valid email format if provided |
| `phone_number` | Non-empty string if provided |

---

## 7. Storage Asset Endpoints

Asset files are served directly from Supabase Storage public URLs. No FastAPI proxy needed for public assets — frontend constructs URLs directly.

**Public Asset URL Pattern:**
```
https://<supabase-project>.supabase.co/storage/v1/object/public/<folder>/<filename>
```

**Private Invoice URL Pattern (Signed):**
```
https://<supabase-project>.supabase.co/storage/v1/object/sign/invoices/<member_id>/<payment_id>.pdf?token=<jwt>&expiresIn=3600
```

Signed URLs are generated server-side by FastAPI using the Supabase service key.

---

## 8. Google Reviews Sync Logic

```
POST /admin/reviews/sync  (manual trigger)
OR
Auto-trigger on GET /public/reviews if last_synced_at > 24 hours ago

Flow:
1. Read gym_google_place_id from site_config
2. Call Google Places API: GET /maps/api/place/details/json
   ?place_id=<id>&fields=reviews&key=<API_KEY>
3. Parse response: reviewer name, text, rating, time
4. Upsert into reviews table by google_review_id
5. Update reviews_last_synced_at in site_config
6. Return updated reviews
```

---

## 9. Invoice Generation Flow

```
POST /admin/payments triggers invoice_service.py:

1. Fetch member details (decrypt PII)
2. Fetch membership plan details
3. Generate PDF via reportlab:
   - Fitness Garage header + logo
   - Invoice number (auto-incremented)
   - Member name, membership plan, period
   - Amount paid, payment method, date
   - Footer with gym contact details
4. Upload PDF to Supabase Storage:
   Path: invoices/<member_id>/<payment_id>.pdf
5. Save invoice_path to payments record
6. Return signed URL (valid 60 mins)
```

---

## 10. Endpoint Index

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Keep-alive health check |
| GET | `/public/site-config` | None | Site configuration |
| GET | `/public/assets/hero` | None | Hero slideshow assets |
| GET | `/public/assets/about` | None | About section assets |
| GET | `/public/achievements` | None | Home page achievements |
| GET | `/public/services` | None | All active services |
| GET | `/public/plans` | None | All active membership plans |
| GET | `/public/trainers` | None | All active trainer profiles |
| GET | `/public/gallery` | None | Gallery and transformation assets |
| GET | `/public/reviews` | None | Cached Google Reviews |
| GET | `/member/me` | Member | Own profile + membership |
| GET | `/member/payments` | Member | Own payment history |
| GET | `/member/payments/{id}/invoice` | Member | Signed invoice URL |
| GET | `/admin/members` | Admin | All members (paginated) |
| GET | `/admin/members/{id}` | Admin | Single member detail |
| POST | `/admin/members` | Admin | Create member |
| PUT | `/admin/members/{id}` | Admin | Update member |
| DELETE | `/admin/members/{id}` | Admin | Soft-delete member |
| POST | `/admin/members/import` | Admin | Bulk CSV/Excel import |
| GET | `/admin/payments` | Admin | All payments (paginated) |
| POST | `/admin/payments` | Admin | Record payment + generate invoice |
| GET | `/admin/payments/{id}/invoice` | Admin | Signed invoice URL |
| GET | `/admin/plans` | Admin | All plans (incl. inactive) |
| PUT | `/admin/plans/{id}` | Admin | Update plan pricing/description |
| GET | `/admin/services` | Admin | All services (incl. inactive) |
| POST | `/admin/services` | Admin | Create service |
| PUT | `/admin/services/{id}` | Admin | Update service |
| DELETE | `/admin/services/{id}` | Admin | Soft-delete service |
| GET | `/admin/trainers` | Admin | All trainers (incl. inactive) |
| POST | `/admin/trainers` | Admin | Create trainer |
| PUT | `/admin/trainers/{id}` | Admin | Update trainer |
| DELETE | `/admin/trainers/{id}` | Admin | Soft-delete trainer |
| GET | `/admin/gallery` | Admin | All gallery items (incl. inactive) |
| POST | `/admin/gallery` | Admin | Register gallery item |
| PUT | `/admin/gallery/{id}` | Admin | Update gallery item metadata |
| DELETE | `/admin/gallery/{id}` | Admin | Delete gallery item + file |
| GET | `/admin/site-config` | Admin | All site config with descriptions |
| PUT | `/admin/site-config` | Admin | Bulk update site config |
| GET | `/admin/achievements` | Admin | All achievements |
| POST | `/admin/achievements` | Admin | Create achievement |
| PUT | `/admin/achievements/{id}` | Admin | Update achievement |
| DELETE | `/admin/achievements/{id}` | Admin | Soft-delete achievement |
| GET | `/admin/reviews` | Admin | All reviews (incl. hidden) |
| PUT | `/admin/reviews/{id}` | Admin | Toggle review visibility |
| POST | `/admin/reviews/sync` | Admin | Manual Google Reviews sync |

---

*End of API Specification Document — Fitness Garage v1.0*
