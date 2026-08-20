# Admin Dashboard Specification Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

---

## 1. Overview

### 1.1 Purpose
The Admin Dashboard is a protected web interface accessible only to users with role `admin` or `dev`. It is the single control plane for all dynamic content on the Fitness Garage website and all member and payment management operations.

### 1.2 Access
| Entry Point | URL | Auth |
|---|---|---|
| Admin Login | `/admin/login` | Email + Password via Supabase Auth |
| Dashboard Home | `/admin/dashboard` | JWT required, role: `admin` or `dev` |

### 1.3 Design Principles Applied
| Principle | Implementation |
|---|---|
| **DRY** | Shared table, form, and modal components across all modules |
| **SOLID** | Each module is a self-contained page with its own service calls |
| **KISS** | No complex workflows — every action is at most 2 steps (list → form) |
| **YAGNI** | No analytics charts, no export reports, no audit logs at launch |
| **Extensible** | New admin modules plug into `AdminSidebar` without changing existing pages |

### 1.4 Layout

All admin pages share a consistent two-panel layout:

```
┌─────────────────────────────────────────────────────────────────────┐
│  NAVBAR: [Logo]  Admin Panel                    [Admin Name] [Logout]│
├──────────────────┬──────────────────────────────────────────────────┤
│                  │                                                   │
│  SIDEBAR         │  MAIN CONTENT AREA                               │
│  ─────────────   │                                                   │
│  Dashboard       │  [Page Title]          [Primary Action Button]   │
│  Members       ← │  ─────────────────────────────────────────────── │
│  Payments        │                                                   │
│  Plans           │  [Module content renders here]                   │
│  Services        │                                                   │
│  Trainers        │                                                   │
│  Gallery         │                                                   │
│  Stats           │                                                   │
│  Settings        │                                                   │
│  ─────────────   │                                                   │
│  [Logout]        │                                                   │
│                  │                                                   │
└──────────────────┴───────────────────────────────────────────────── ┘
```

**Mobile (< 768px):** Sidebar collapses to a top hamburger menu. Main content takes full width.

### 1.5 Visual Theme
Admin dashboard uses the same design tokens as the public site:
- Background: `garage-black` (`#1A1A1A`)
- Panels/Cards: `garage-dark` (`#2C2C2C`)
- Borders: `garage-mid` (`#3D3D3D`)
- Accent / Actions: `garage-chrome` (`#D4AF37`)
- Body text: `garage-white` (`#F0F0F0`)
- Muted text: `garage-muted` (`#9A9A9A`)
- Font: `Inter` throughout (no display font in admin — clarity over style)

---

## 2. Admin Login Page (`/admin/login`)

Single email + password form. Visually distinct from the member login page.

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│           [LOGO]  FITNESS GARAGE                     │
│           Admin Panel                                │
│                                                      │
│  Email                                               │
│  ┌──────────────────────────────────────────┐        │
│  │ admin@fitnessgarage.com                  │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Password                                            │
│  ┌──────────────────────────────────────────┐        │
│  │ ••••••••••••                             │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  [          Sign In          ]                       │
│                                                      │
│  ← Back to website                                   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Behaviour:**
- On success: JWT stored in `authStore`, redirect to `/admin/dashboard`
- On failure: Inline error message — "Invalid email or password"
- No "forgot password" link at launch (admin password managed via Supabase dashboard)
- No self-registration — admin accounts are created manually via Supabase Auth dashboard

---

## 3. Dashboard Home (`/admin/dashboard`)

Quick-glance overview of key gym metrics. No charts — YAGNI. Data pulled from existing endpoints.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Dashboard                                                           │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ Total Members   │ │ Active Members  │ │ Expiring Soon   │        │
│  │      214        │ │      198        │ │      12         │        │
│  │                 │ │                 │ │  (next 7 days)  │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│                                                                      │
│  ┌─────────────────┐ ┌─────────────────┐                            │
│  │ Payments This   │ │ Expired Members │                            │
│  │   Month         │ │      16         │                            │
│  │    ₹ 45,000     │ │                 │                            │
│  └─────────────────┘ └─────────────────┘                            │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  Recent Members                              [View All Members →]    │
│  ─────────────────────────────────────────────────────────────────── │
│  Name            Plan           Status     Joined                    │
│  Jane Smith      Basic Monthly  ACTIVE     01 Aug 2026               │
│  Raj Kumar       PT Annual      ACTIVE     29 Jul 2026               │
│  ...             ...            ...        ...                       │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  Recent Payments                            [View All Payments →]    │
│  ─────────────────────────────────────────────────────────────────── │
│  Member          Amount    Method    Date                            │
│  Jane Smith      ₹1,500    Cash      01 Aug 2026                     │
│  Raj Kumar       ₹8,000    UPI       29 Jul 2026                     │
└──────────────────────────────────────────────────────────────────────┘
```

**Data Sources:**
| Metric | Source |
|---|---|
| Total Members | `GET /admin/members` → `total` field |
| Active Members | `GET /admin/members?status=active` → `total` field |
| Expiring Soon | `GET /admin/members` → client-side filter: `expiry_date` within 7 days |
| Expired Members | `GET /admin/members?status=expired` → `total` field |
| Payments This Month | `GET /admin/payments?from_date=<month_start>&to_date=<today>` → sum `amount` |
| Recent Members | `GET /admin/members?limit=5` |
| Recent Payments | `GET /admin/payments?limit=5` |

---

## 4. Members Module (`/admin/members`)

### 4.1 Members List Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Members                                    [+ Add Member] [Import]  │
│  ─────────────────────────────────────────────────────────────────── │
│  [Search by name...]  [Status ▾]  [Tier ▾]                          │
│  ─────────────────────────────────────────────────────────────────── │
│  Name           Email              Plan           Status   Expiry    │
│  ─────────────────────────────────────────────────────────────────── │
│  Jane Smith     jane@example.com   Basic Monthly  ACTIVE   01 Sep    │
│  Raj Kumar      raj@example.com    PT Annual      ACTIVE   01 Jan 27 │
│  Priya S.       —                  Basic Qtrly    EXPIRED  01 Jun    │
│  ─────────────────────────────────────────────────────────────────── │
│  [← Prev]   Page 1 of 11   [Next →]                                 │
└──────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Search:** Debounced (400ms) input — calls `GET /admin/members?search=<term>` on change
- **Status filter:** Dropdown — `All`, `Active`, `Expired`, `Pending`, `Suspended`
- **Tier filter:** Dropdown — `All`, `Basic`, `PT`
- **Row click:** Navigates to `/admin/members/:id`
- **+ Add Member:** Opens Add Member modal
- **Import:** Navigates to `/admin/members/import`
- **Pagination:** Cursor-based — "Next" and "Prev" buttons

**Table Columns:**
| Column | Source | Notes |
|---|---|---|
| Name | `full_name` (decrypted) | Truncated to 30 chars |
| Email | `email_address` (decrypted) | Shows `—` if null |
| Plan | `tier` + `duration` | Formatted: "Basic Monthly" |
| Status | `status` | Rendered as `<Badge>` component |
| Expiry | `expiry_date` | Formatted date. Red if expired |

---

### 4.2 Member Detail Page (`/admin/members/:id`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Members   Jane Smith                  [Edit] [Record Payment]     │
│  ─────────────────────────────────────────────────────────────────── │
│  MEMBER DETAILS                                                      │
│  ┌───────────────────────────┬────────────────────────────────────┐  │
│  │ Full Name   Jane Smith    │ Status      [ACTIVE]               │  │
│  │ Email       jane@...      │ Plan        Basic — Monthly        │  │
│  │ Phone       +91-99999     │ Start Date  01 Jul 2026            │  │
│  │ Member ID   abc-123       │ Expiry      01 Aug 2026            │  │
│  │ Imported    No            │ Notes       —                      │  │
│  └───────────────────────────┴────────────────────────────────────┘  │
│                                                                      │
│  PAYMENT HISTORY                          [+ Record Payment]         │
│  ─────────────────────────────────────────────────────────────────── │
│  Date          Plan           Amount    Method    Invoice            │
│  01 Jul 2026   Basic Monthly  ₹1,500    Cash      [↓ Download]      │
│  01 Jun 2026   Basic Monthly  ₹1,500    Cash      [↓ Download]      │
│  ─────────────────────────────────────────────────────────────────── │
│                                                     [Remove Member]  │
└──────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Edit:** Opens Edit Member modal (pre-filled with current data)
- **Record Payment:** Opens Record Payment modal (member pre-selected)
- **Download Invoice:** Calls `GET /admin/payments/:id/invoice` → opens signed PDF URL in new tab
- **Remove Member:** Confirmation modal → `DELETE /admin/members/:id` (soft delete — sets status to `suspended`)

---

### 4.3 Add / Edit Member Modal

Single modal component — pre-filled for edit, empty for add. DRY — same form for both operations.

```
┌──────────────────────────────────────────────────────┐
│  Add Member                                    [✕]   │
│  ─────────────────────────────────────────────────── │
│  Full Name *                                         │
│  ┌──────────────────────────────────────────┐        │
│  │ Jane Smith                               │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Email                    Phone                      │
│  ┌──────────────────┐     ┌──────────────────┐       │
│  │ jane@example.com │     │ +91-9999999999   │       │
│  └──────────────────┘     └──────────────────┘       │
│                                                      │
│  Membership Plan *        Status *                   │
│  ┌──────────────────┐     ┌──────────────────┐       │
│  │ Basic — Monthly ▾│     │ Active          ▾│       │
│  └──────────────────┘     └──────────────────┘       │
│                                                      │
│  Start Date *             Expiry Date *              │
│  ┌──────────────────┐     ┌──────────────────┐       │
│  │ 01 Aug 2026      │     │ 01 Sep 2026      │       │
│  └──────────────────┘     └──────────────────┘       │
│                                                      │
│  Notes (internal)                                    │
│  ┌──────────────────────────────────────────┐        │
│  │                                          │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  [Cancel]                          [Save Member]     │
└──────────────────────────────────────────────────────┘
```

**Validation (Zod schema):**
| Field | Rule |
|---|---|
| `full_name` | Required, min 2 chars |
| `email_address` | Valid email format if provided |
| `phone_number` | Non-empty string if provided |
| `membership_plan_id` | Required — selected from dropdown of active plans |
| `start_date` | Required, valid date |
| `expiry_date` | Required, must be after `start_date` |
| `status` | Required, one of: active / expired / pending / suspended |

**Auto-fill:** When a plan is selected, `expiry_date` is auto-calculated from `start_date` + plan duration. Admin can override.

---

### 4.4 Bulk Import Page (`/admin/members/import`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  ← Members   Import Members                                          │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  Upload a CSV or Excel file to bulk import members.                  │
│  Download template: [📄 CSV Template]  [📄 Excel Template]           │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │         📁 Drop CSV or Excel file here                        │  │
│  │              or click to browse                               │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [Import Members]                                                    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  EXPECTED COLUMNS                                                    │
│  full_name | email_address | phone_number | tier | duration |        │
│  start_date | expiry_date | status                                   │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  [Import result renders here after upload]                           │
│                                                                      │
│  ✅ 205 members imported successfully                                │
│  ⚠️  3 rows skipped (duplicates)                                      │
│  ❌ 2 rows failed — see details:                                      │
│     Row 12: Invalid expiry date format                               │
│     Row 47: Unknown membership tier "vip"                            │
└──────────────────────────────────────────────────────────────────────┘
```

**Behaviour:**
- Downloadable CSV and Excel templates pre-filled with correct column headers
- File validation client-side: only `.csv` and `.xlsx` accepted
- On submit: `POST /admin/members/import` (multipart form)
- Result summary shown inline — success count, skipped count, error count + row details
- Import sets `imported = TRUE` on all created records for audit trail

---

## 5. Payments Module (`/admin/payments`)

### 5.1 Payments List Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Payments                                    [+ Record Payment]       │
│  ─────────────────────────────────────────────────────────────────── │
│  [From Date]  [To Date]  [Member search...]                          │
│  ─────────────────────────────────────────────────────────────────── │
│  Member        Plan            Amount    Method    Date       Invoice │
│  ─────────────────────────────────────────────────────────────────── │
│  Jane Smith    Basic Monthly   ₹1,500    Cash      01 Aug     [↓]    │
│  Raj Kumar     PT Annual       ₹8,000    UPI       29 Jul     [↓]    │
│  ─────────────────────────────────────────────────────────────────── │
│  [← Prev]   Page 1 of 23   [Next →]                                 │
└──────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Date range filter:** From/To date pickers — filters payments by `payment_date`
- **Member search:** Debounced search by member name
- **Download Invoice:** `GET /admin/payments/:id/invoice` → signed PDF in new tab
- **+ Record Payment:** Opens Record Payment modal

---

### 5.2 Record Payment Modal

```
┌──────────────────────────────────────────────────────┐
│  Record Payment                                [✕]   │
│  ─────────────────────────────────────────────────── │
│  Member *                                            │
│  ┌──────────────────────────────────────────┐        │
│  │ Search member...                        ▾│        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Membership Plan *                                   │
│  ┌──────────────────────────────────────────┐        │
│  │ Basic — Monthly                         ▾│        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Amount (₹) *             Payment Method *           │
│  ┌──────────────────┐     ┌──────────────────┐       │
│  │ 1500.00          │     │ Cash            ▾│       │
│  └──────────────────┘     └──────────────────┘       │
│                                                      │
│  Payment Date *                                      │
│  ┌──────────────────────────────────────────┐        │
│  │ 15 Aug 2026                              │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Notes                                               │
│  ┌──────────────────────────────────────────┐        │
│  │                                          │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  [Cancel]                    [Record & Generate Invoice] │
└──────────────────────────────────────────────────────┘
```

**Behaviour:**
- Member dropdown: searchable select — fetches `GET /admin/members` with search
- Plan dropdown: auto-populated with active plans
- Amount: Pre-filled from selected plan's price — admin can override
- On submit: `POST /admin/payments` → invoice PDF auto-generated server-side
- Success toast: "Payment recorded. Invoice generated." with download link
- Member's `expiry_date` automatically updated based on plan duration after payment

**Validation:**
| Field | Rule |
|---|---|
| `member_id` | Required |
| `membership_plan_id` | Required |
| `amount` | Required, must be > 0 |
| `payment_date` | Required, valid date, not in future |
| `payment_method` | Required, one of: cash / card / upi / bank_transfer / other |

---

## 6. Membership Plans Module (`/admin/plans`)

### 6.1 Plans Management Page

Displays all 8 plan combinations in a grid. Plans cannot be created or deleted — only price, description, and active status are editable.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Membership Plans                                                    │
│  Edit pricing and descriptions for each plan combination.            │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  BASIC TIER                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │ Monthly      │ │ Quarterly    │ │ Half Yearly  │ │ Annual       ││
│  │ ₹ 0.00      │ │ ₹ 0.00      │ │ ₹ 0.00      │ │ ₹ 0.00      ││
│  │ [Edit]       │ │ [Edit]       │ │ [Edit]       │ │ [Edit]       ││
│  │ ● Active     │ │ ● Active     │ │ ● Active     │ │ ● Active     ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
│                                                                      │
│  PERSONAL TRAINING TIER                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │ Monthly      │ │ Quarterly    │ │ Half Yearly  │ │ Annual       ││
│  │ ₹ 0.00      │ │ ₹ 0.00      │ │ ₹ 0.00      │ │ ₹ 0.00      ││
│  │ [Edit]       │ │ [Edit]       │ │ [Edit]       │ │ [Edit]       ││
│  │ ● Active     │ │ ● Active     │ │ ● Active     │ │ ● Active     ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 6.2 Edit Plan Modal

```
┌──────────────────────────────────────────────────────┐
│  Edit Plan: Basic — Monthly                    [✕]   │
│  ─────────────────────────────────────────────────── │
│  Price (₹) *                                         │
│  ┌──────────────────────────────────────────┐        │
│  │ 1500.00                                  │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Description                                         │
│  ┌──────────────────────────────────────────┐        │
│  │ Full gym access for one month.           │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  ┌──┐ Active (visible on public website)             │
│  └──┘                                                │
│                                                      │
│  [Cancel]                           [Save Changes]   │
└──────────────────────────────────────────────────────┘
```

---

## 7. Services Module (`/admin/services`)

### 7.1 Services List Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Services                                          [+ Add Service]   │
│  ─────────────────────────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ ⠿  [icon] Personal Training     personal-training    ● [Edit][✕]│
│  │ ⠿  [icon] Group Classes         group-classes        ● [Edit][✕]│
│  │ ⠿  [icon] Weight Loss Programs  weight-loss-programs ● [Edit][✕]│
│  │ ⠿  [icon] Strength & Cond.      strength-conditioning● [Edit][✕]│
│  │ ⠿  [icon] Nutrition Coaching    nutrition-coaching   ● [Edit][✕]│
│  │ ⠿  [icon] Cardio Programs       cardio-programs      ● [Edit][✕]│
│  │ ⠿  [icon] Kids Dance            kids-dance           ● [Edit][✕]│
│  │ ⠿  [icon] Zumba                 zumba                ● [Edit][✕]│
│  └──────────────────────────────────────────────────────────────┘    │
│  ⠿ = drag handle for reordering display_order                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Drag to reorder:** Updates `display_order` via `PUT /admin/services/:id`
- **Edit:** Opens Edit Service modal
- **✕ (deactivate):** Confirmation → `DELETE /admin/services/:id` (soft delete)
- **+ Add Service:** Opens Add Service modal
- **Icon preview:** Small thumbnail pulled from `assets/services/<slug>.<ext>` in Supabase Storage

### 7.2 Add / Edit Service Modal

```
┌──────────────────────────────────────────────────────┐
│  Add Service                                   [✕]   │
│  ─────────────────────────────────────────────────── │
│  Name *                                              │
│  ┌──────────────────────────────────────────┐        │
│  │ Personal Training                        │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Slug * (auto-generated, editable)                   │
│  ┌──────────────────────────────────────────┐        │
│  │ personal-training                        │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Description                                         │
│  ┌──────────────────────────────────────────┐        │
│  │ One-on-one sessions tailored to your     │        │
│  │ personal fitness goals.                  │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Icon Filename                                       │
│  ┌──────────────────────────────────────────┐        │
│  │ personal-training.svg                    │        │
│  └──────────────────────────────────────────┘        │
│  ℹ Upload icon to assets/services/ in Supabase       │
│    Storage with this exact filename.                  │
│                                                      │
│  ┌──┐ Active                                         │
│  └──┘                                                │
│                                                      │
│  [Cancel]                           [Save Service]   │
└──────────────────────────────────────────────────────┘
```

**Behaviour:**
- Slug is auto-generated from name (lowercase, hyphens) — admin can edit
- Icon is uploaded separately to Supabase Storage — admin is shown the expected filename and path
- On save: `POST /admin/services` or `PUT /admin/services/:id`

---

## 8. Trainers Module (`/admin/trainers`)

### 8.1 Trainers List Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Trainers                                          [+ Add Trainer]   │
│  ─────────────────────────────────────────────────────────────────── │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ ⠿ [photo] Trainer One    Personal Training      5 yrs ● [Edit][✕]│
│  │ ⠿ [photo] Trainer Two    Strength & Cond.       4 yrs ● [Edit][✕]│
│  │ ⠿ [photo] Trainer Three  Weight Loss            3 yrs ● [Edit][✕]│
│  │ ⠿ [photo] Trainer Four   Zumba & Dance          6 yrs ● [Edit][✕]│
│  │ ⠿ [photo] Trainer Five   Nutrition Coaching     2 yrs ● [Edit][✕]│
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### 8.2 Add / Edit Trainer Modal

```
┌──────────────────────────────────────────────────────┐
│  Add Trainer                                   [✕]   │
│  ─────────────────────────────────────────────────── │
│  Full Name *                                         │
│  ┌──────────────────────────────────────────┐        │
│  │ John Doe                                 │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Slug * (auto-generated)                             │
│  ┌──────────────────────────────────────────┐        │
│  │ john-doe                                 │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Specialization *                                    │
│  ┌──────────────────────────────────────────┐        │
│  │ Strength & Conditioning                  │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Experience (years) *     Photo Filename             │
│  ┌──────────────────┐     ┌──────────────────┐       │
│  │ 7                │     │ john-doe.jpg     │       │
│  └──────────────────┘     └──────────────────┘       │
│                                                      │
│  Certifications (one per line)                       │
│  ┌──────────────────────────────────────────┐        │
│  │ ACE Certified                            │        │
│  │ CPR Certified                            │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Bio                                                 │
│  ┌──────────────────────────────────────────┐        │
│  │ John has 7 years of experience...        │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  ℹ Upload photo to assets/trainers/ in Supabase      │
│    Storage with filename matching the slug.           │
│                                                      │
│  ┌──┐ Active                                         │
│  └──┘                                                │
│                                                      │
│  [Cancel]                           [Save Trainer]   │
└──────────────────────────────────────────────────────┘
```

**Behaviour:**
- Certifications entered as newline-separated text — split and stored as `TEXT[]` array
- Photo uploaded separately to `assets/trainers/` in Supabase Storage
- Admin is shown the exact path to upload to

---

## 9. Gallery Module (`/admin/gallery`)

### 9.1 Gallery Management Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Gallery                                      [+ Register Item]      │
│  ─────────────────────────────────────────────────────────────────── │
│  [All ▾]   [Gallery]   [Transformations]                             │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │ [image]     │  │ [image]     │  │ [video]     │  │ [image]   │  │
│  │ gym-floor-1 │  │ equipment   │  │ event-2025  │  │ transform │  │
│  │ Gallery     │  │ Gallery     │  │ Gallery     │  │ Transform │  │
│  │ ● [Edit][✕] │  │ ● [Edit][✕] │  │ ● [Edit][✕] │  │● [Edit][✕]│  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
│                                                                      │
│  ℹ Upload files directly to assets/gallery/ or assets/transformations│
│    in Supabase Storage, then register them here.                     │
└──────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Tab filter:** All / Gallery / Transformations
- **Edit:** Opens Edit Gallery Item modal (caption, order, visibility)
- **✕:** Confirmation → `DELETE /admin/gallery/:id` (removes DB record + file from storage)
- **+ Register Item:** Opens Register Gallery Item modal

### 9.2 Register Gallery Item Modal

```
┌──────────────────────────────────────────────────────┐
│  Register Gallery Item                         [✕]   │
│  ─────────────────────────────────────────────────── │
│  Folder *                                            │
│  ┌──────────────────────────────────────────┐        │
│  │ assets/gallery                          ▾│        │
│  │ assets/transformations                   │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Filename *                                          │
│  ┌──────────────────────────────────────────┐        │
│  │ gym-floor-2.jpg                          │        │
│  └──────────────────────────────────────────┘        │
│  ℹ File must already be uploaded to Supabase Storage │
│                                                      │
│  Media Type *                                        │
│  ○ Image   ○ Video                                   │
│                                                      │
│  Caption                                             │
│  ┌──────────────────────────────────────────┐        │
│  │ Our newly renovated gym floor.           │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  ┌──┐ Active (show on public site)                   │
│  └──┘                                                │
│                                                      │
│  [Cancel]                       [Register Item]      │
└──────────────────────────────────────────────────────┘
```

---

## 10. Stats & Achievements Module (`/admin/stats`)

### 10.1 Stats & Achievements Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Stats & Achievements                                                │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  HERO STATS                                   [Save Stats]           │
│  These numbers appear in the hero section stats bar.                 │
│  ─────────────────────────────────────────────────────────────────── │
│  Members Count          Years in Business                            │
│  ┌──────────────────┐   ┌──────────────────┐                         │
│  │ 200+             │   │ 5+               │                         │
│  └──────────────────┘   └──────────────────┘                         │
│                                                                      │
│  Trainers Count         Transformations                              │
│  ┌──────────────────┐   ┌──────────────────┐                         │
│  │ 5+               │   │ 100+             │                         │
│  └──────────────────┘   └──────────────────┘                         │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  ACHIEVEMENTS                                 [+ Add Achievement]    │
│  ─────────────────────────────────────────────────────────────────── │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ ⠿  Best Gym Award 2024    #1       ●  [Edit] [✕]               │ │
│  │ ⠿  Top Rated Gym          —        ●  [Edit] [✕]               │ │
│  │ ⠿  500+ Transformations   500+     ●  [Edit] [✕]               │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Save Stats:** Calls `PUT /admin/site-config` with all 4 stat values in one request
- **Add Achievement:** Opens Add Achievement modal
- **Edit Achievement:** Opens Edit Achievement modal (pre-filled)
- **✕ Achievement:** Confirmation → `DELETE /admin/achievements/:id` (soft delete)
- **Drag to reorder:** Updates `display_order`

### 10.2 Add / Edit Achievement Modal

```
┌──────────────────────────────────────────────────────┐
│  Add Achievement                               [✕]   │
│  ─────────────────────────────────────────────────── │
│  Label *                                             │
│  ┌──────────────────────────────────────────┐        │
│  │ Best Gym Award 2024                      │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  Value (optional)                                    │
│  ┌──────────────────────────────────────────┐        │
│  │ #1                                       │        │
│  └──────────────────────────────────────────┘        │
│                                                      │
│  ┌──┐ Active                                         │
│  └──┘                                                │
│                                                      │
│  [Cancel]                      [Save Achievement]    │
└──────────────────────────────────────────────────────┘
```

---

## 11. Reviews Module (`/admin/reviews`)

### 11.1 Reviews Management Page

```
┌──────────────────────────────────────────────────────────────────────┐
│  Google Reviews                                  [↻ Sync Reviews]    │
│  Last synced: 15 Aug 2026, 06:00 AM                                  │
│  ─────────────────────────────────────────────────────────────────── │
│  [All ▾]   [Visible]   [Hidden]   [Min Rating ▾]                    │
│  ─────────────────────────────────────────────────────────────────── │
│  Reviewer       Rating   Date          Text              Visible      │
│  ─────────────────────────────────────────────────────────────────── │
│  John D.        ★★★★★   10 Jul 2026   Amazing gym...   ● [Hide]     │
│  Priya S.       ★★★★☆   05 Jul 2026   Great trainer... ● [Hide]     │
│  Anon User      ★★★☆☆   01 Jun 2026   Decent place...  ○ [Show]     │
│  ─────────────────────────────────────────────────────────────────── │
│  [← Prev]   Page 1 of 5   [Next →]                                  │
└──────────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- **Sync Reviews:** Calls `POST /admin/reviews/sync` — fetches latest from Google Places API
- **Hide/Show:** Calls `PUT /admin/reviews/:id` with `{ is_visible: false/true }`
- **Filter tabs:** All / Visible / Hidden
- **Min Rating filter:** Show only reviews >= selected star rating

---

## 12. Settings Module (`/admin/settings`)

### 12.1 Site Settings Page

Manages all `site_config` values that are not stats or achievements. Grouped into logical sections.

```
┌──────────────────────────────────────────────────────────────────────┐
│  Site Settings                                                       │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  GYM INFORMATION                              [Save Gym Info]        │
│  ─────────────────────────────────────────────────────────────────── │
│  Gym Name                                                            │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ Fitness Garage                                               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  Address                                                             │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ TBD                                                          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  Phone                      Email                                    │
│  ┌──────────────────┐        ┌────────────────────────────────┐      │
│  │ TBD              │        │ TBD                            │      │
│  └──────────────────┘        └────────────────────────────────┘      │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  ABOUT SECTION                                [Save About]           │
│  ─────────────────────────────────────────────────────────────────── │
│  Tagline                                                             │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ TBD                                                          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  Gym Story                                                           │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ TBD                                                          │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  INTEGRATIONS                                 [Save Integrations]    │
│  ─────────────────────────────────────────────────────────────────── │
│  Google Maps Embed URL                                               │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ TBD                                                          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  Google Form URL (Contact Form)                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ TBD                                                          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  Google Place ID (for Reviews Sync)                                  │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ TBD                                                          │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  HERO SLIDESHOW                               [Save Hero Settings]   │
│  ─────────────────────────────────────────────────────────────────── │
│  Slide Interval (milliseconds)                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ 5000                                                         │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  ℹ Upload slideshow images/videos to assets/hero/ in Supabase Storage│
└──────────────────────────────────────────────────────────────────────┘
```

**Behaviour:**
- Each section has its own "Save" button — calls `PUT /admin/site-config` with only that section's keys
- On save success: toast notification "Settings saved"
- All fields pre-populated from `GET /admin/site-config` on page load

---

## 13. Shared Admin UI Patterns

### 13.1 Toast Notifications
Lightweight toast system — no external library. Single `ToastContext` at app root.

| Event | Toast type | Message |
|---|---|---|
| Successful save | Success (green) | "Saved successfully" |
| Successful delete | Success (green) | "Removed successfully" |
| Payment recorded | Success (green) | "Payment recorded. Invoice generated." |
| Import complete | Success (green) | "Import complete — X members added." |
| Validation error | Error (red) | Field-specific message |
| API error | Error (red) | "Something went wrong. Please try again." |

### 13.2 Confirmation Modals
All destructive actions (delete, soft-delete, remove) require a confirmation modal before proceeding.

```
┌─────────────────────────────────────────────┐
│  Remove Service                       [✕]   │
│  ─────────────────────────────────────────── │
│  Are you sure you want to deactivate        │
│  "Personal Training"? It will no longer     │
│  appear on the public website.              │
│                                             │
│  [Cancel]                    [Yes, Remove]  │
└─────────────────────────────────────────────┘
```

### 13.3 Empty States
Every list/table shows a contextual empty state when no records exist.

```
┌──────────────────────────────────────────────┐
│                                              │
│       📋  No members found                   │
│       Add your first member or import        │
│       from a CSV file.                       │
│                                              │
│       [+ Add Member]   [Import CSV]          │
└──────────────────────────────────────────────┘
```

### 13.4 Loading States
Every data-fetching operation shows a `Spinner` component while in-flight. Tables show skeleton rows. Buttons show a loading spinner and become disabled during submission.

### 13.5 Error States
If an API call fails, an inline `ErrorMessage` component is shown with a "Try again" button. The page does not crash — errors are caught at the service call level.

---

## 14. Admin Navigation — Sidebar Detail

```tsx
// AdminSidebar.tsx — nav items definition (DRY — single source of truth)
const NAV_ITEMS = [
  { label: 'Dashboard',  icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD },
  { label: 'Members',    icon: Users,           path: ROUTES.ADMIN_MEMBERS   },
  { label: 'Payments',   icon: CreditCard,      path: ROUTES.ADMIN_PAYMENTS  },
  { label: 'Plans',      icon: Tag,             path: ROUTES.ADMIN_PLANS     },
  { label: 'Services',   icon: Dumbbell,        path: ROUTES.ADMIN_SERVICES  },
  { label: 'Trainers',   icon: UserCheck,       path: ROUTES.ADMIN_TRAINERS  },
  { label: 'Gallery',    icon: Image,           path: ROUTES.ADMIN_GALLERY   },
  { label: 'Stats',      icon: TrendingUp,      path: ROUTES.ADMIN_STATS     },
  { label: 'Settings',   icon: Settings,        path: ROUTES.ADMIN_SETTINGS  },
]
// Icons from lucide-react — consistent, lightweight, zero extra dependency
```

Active route is highlighted with `text-garage-chrome` and a left border in `garage-chrome`.

---

## 15. Access Control Summary

| Module | Admin | Dev |
|---|---|---|
| Dashboard | ✅ | ✅ |
| Members — View | ✅ | ✅ |
| Members — Add/Edit/Delete | ✅ | ✅ |
| Members — Import | ✅ | ✅ |
| Payments — View | ✅ | ✅ |
| Payments — Record | ✅ | ✅ |
| Plans — Edit | ✅ | ✅ |
| Services — All | ✅ | ✅ |
| Trainers — All | ✅ | ✅ |
| Gallery — All | ✅ | ✅ |
| Stats & Achievements | ✅ | ✅ |
| Reviews | ✅ | ✅ |
| Settings | ✅ | ✅ |

All routes enforce `ProtectedAdminRoute` guard — unauthenticated or member-role users are redirected to `/admin/login`.

---

*End of Admin Dashboard Specification Document — Fitness Garage v1.0*
