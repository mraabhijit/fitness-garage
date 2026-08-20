# Member Portal Specification Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

---

## 1. Overview

### 1.1 Purpose
The Member Portal is a protected web interface accessible only to authenticated gym members. It is intentionally minimal — members can view their membership status, track their expiry date, and download invoices. No fitness tracking, no booking, no social features.

### 1.2 Design Philosophy
- **Minimal by design:** Only what a member genuinely needs post-login
- **Mobile-first:** Most members will access via phone
- **Clarity over features:** Every screen answers one question clearly
- **No dead ends:** Every page has a clear next action or exit

### 1.3 Access
| Entry Point | URL | Auth |
|---|---|---|
| Member Login | `/login` | Email+Password, Magic Link, or Phone OTP |
| Member Dashboard | `/member/dashboard` | JWT required, role: `member`, `admin`, or `dev` |
| Membership Status | `/member/membership` | JWT required |
| Payment History | `/member/payments` | JWT required |

### 1.4 Design Principles Applied
| Principle | Implementation |
|---|---|
| **DRY** | Shared layout, shared components with admin where applicable |
| **SOLID** | Each page has a single clear responsibility |
| **KISS** | Three pages total — no over-engineering |
| **YAGNI** | No fitness tracking, no booking, no notifications UI at launch |
| **Extensible** | Portal layout supports future pages (booking, profile edit) without restructuring |

---

## 2. Visual Theme

Member portal shares the same design token system as the public site and admin dashboard:

| Token | Value | Usage |
|---|---|---|
| `garage-black` | `#1A1A1A` | Page background |
| `garage-dark` | `#2C2C2C` | Card backgrounds |
| `garage-mid` | `#3D3D3D` | Borders, dividers |
| `garage-chrome` | `#D4AF37` | Accent, active states |
| `garage-white` | `#F0F0F0` | Primary text |
| `garage-muted` | `#9A9A9A` | Secondary text, labels |
| `status-active` | `#22C55E` | Active membership |
| `status-expired` | `#EF4444` | Expired membership |
| `status-pending` | `#F59E0B` | Pending membership |

Font: `Inter` throughout — same as admin. No display font (`Bebas Neue`) in the portal — clarity and legibility take priority over branding energy.

---

## 3. Member Layout

All member pages share a consistent layout wrapper (`MemberLayout`). Slim, functional, no sidebar.

```
┌──────────────────────────────────────────────────────────────────────┐
│ NAVBAR                                                               │
│ [FG Logo]   Fitness Garage Member Portal        [Name ▾] [Logout]   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  TAB NAVIGATION (below navbar, above content)                        │
│  [Dashboard]   [Membership]   [Payments]                             │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│                   MAIN CONTENT AREA                                  │
│              (max-width: 768px, centered)                            │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                               │
│ © 2026 Fitness Garage  ·  Need help? Contact us                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Mobile (< 768px):**
```
┌──────────────────────────────────┐
│ [FG Logo]            [Name] [☰]  │
├──────────────────────────────────┤
│ [Dashboard] [Membership] [Payments]│
├──────────────────────────────────┤
│                                  │
│   MAIN CONTENT                   │
│                                  │
└──────────────────────────────────┘
```

**Navbar Behaviour:**
- Logo links to `/` (public site homepage)
- Name dropdown: shows member's full name, single option "Logout"
- Active tab underlined in `garage-chrome`
- Sticky at top on scroll

---

## 4. Member Login Page (`/login`)

Three-tab authentication interface. Shares the `MemberLoginPage.tsx` component.

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                     [FG LOGO]                                        │
│                   FITNESS GARAGE                                     │
│                   Member Login                                       │
│                                                                      │
│  ┌─────────────────┬──────────────────┬──────────────────┐          │
│  │ Email & Password│   Magic Link     │   Phone OTP      │          │
│  └─────────────────┴──────────────────┴──────────────────┘          │
│                                                                      │
│  [Active tab form renders here — see sections below]                 │
│                                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  Not a member yet?                                                   │
│  Contact the gym to sign up. → [Contact Fitness Garage]              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Notes:**
- "Contact Fitness Garage" links to `/contact`
- No self-registration — members are added by admin only
- Admin login is entirely separate at `/admin/login` — no link or reference shown here

---

### 4.1 Tab 1 — Email & Password (`EmailPasswordForm.tsx`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Email Address                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ jane@example.com                                             │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Password                                                            │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ ••••••••••••                                          [👁]   │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [            Sign In            ]                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Behaviour:**
- Email and password submitted to Supabase Auth `signInWithPassword()`
- On success: JWT stored in `authStore`, redirect to `/member/dashboard`
- On failure: Inline error — "Incorrect email or password"
- Password field has show/hide toggle
- No "Forgot Password" at launch — member contacts gym directly

---

### 4.2 Tab 2 — Magic Link (`MagicLinkForm.tsx`)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Email Address                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ jane@example.com                                             │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [        Send Magic Link        ]                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**After submit — success state:**
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│       ✉  Check your email                                            │
│                                                                      │
│       We sent a sign-in link to                                      │
│       jane@example.com                                               │
│                                                                      │
│       Click the link in the email to sign in.                        │
│       The link expires in 1 hour.                                    │
│                                                                      │
│       [← Try a different method]                                     │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Behaviour:**
- Calls Supabase Auth `signInWithOtp({ email })` — sends magic link
- On click from email: Supabase handles redirect, JWT exchanged automatically
- Error: "No account found with this email" if email not in Supabase Auth

---

### 4.3 Tab 3 — Phone OTP (`PhoneOtpForm.tsx`)

Two-step flow — phone number first, then OTP entry.

**Step 1 — Phone Entry:**
```
┌──────────────────────────────────────────────────────────────────────┐
│  Mobile Number                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │ +91  9999999999                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  [         Send OTP         ]                                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Step 2 — OTP Entry (replaces step 1 in-place):**
```
┌──────────────────────────────────────────────────────────────────────┐
│  Enter the 6-digit code sent to +91 9999999999                       │
│                                                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                         │
│  │ 4  │ │ 8  │ │ 2  │ │ 1  │ │ 6  │ │ 9  │                         │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                         │
│                                                                      │
│  [         Verify OTP        ]                                       │
│                                                                      │
│  Didn't receive it? [Resend OTP]  (available after 30 seconds)      │
│  [← Change number]                                                   │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Behaviour:**
- Step 1: Calls Supabase Auth `signInWithOtp({ phone })` — sends SMS OTP
- OTP input: 6 individual single-character inputs — auto-advances focus on entry, auto-submits on last digit
- Step 2: Calls Supabase Auth `verifyOtp({ phone, token, type: 'sms' })`
- On success: JWT stored in `authStore`, redirect to `/member/dashboard`
- Resend OTP: Disabled for 30 seconds after sending — countdown displayed
- Error: "Invalid or expired code. Please try again."

---

### 4.4 First-Time Login — Account Linking

When an imported member logs in for the first time (their record exists in `members` table with `supabase_user_id = NULL`):

```
Flow:
1. Member authenticates via any method
2. Supabase Auth creates / returns user with supabase_user_id
3. FastAPI checks: does a member record exist with this email/phone but no supabase_user_id?
4. If yes: UPDATE members SET supabase_user_id = <auth_uid> WHERE email_address = <encrypted_email>
5. Member is now linked — proceed to dashboard
6. If no match found: show error "No membership found. Contact the gym."
```

This is handled transparently — the member sees a normal login flow with no extra steps.

---

## 5. Member Dashboard (`/member/dashboard`)

Quick-glance summary page. Answers: "What is my membership status right now?"

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Dashboard]   [Membership]   [Payments]                             │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  Welcome back,                                                       │
│  Jane Smith                                                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  MEMBERSHIP                                                  │    │
│  │  ─────────────────────────────────────────────────────────── │    │
│  │  Status         [● ACTIVE]                                   │    │
│  │  Plan           Basic — Monthly                              │    │
│  │  Expiry Date    01 Sep 2026                                  │    │
│  │  Days Remaining 17 days                                      │    │
│  │                                                              │    │
│  │                    [View Membership Details →]               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  RECENT PAYMENTS                                             │    │
│  │  ─────────────────────────────────────────────────────────── │    │
│  │  01 Aug 2026   Basic Monthly   ₹1,500   [↓ Invoice]         │    │
│  │  01 Jul 2026   Basic Monthly   ₹1,500   [↓ Invoice]         │    │
│  │  01 Jun 2026   Basic Monthly   ₹1,500   [↓ Invoice]         │    │
│  │                                                              │    │
│  │                          [View All Payments →]               │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Mobile layout** — stacks vertically, cards full width:

```
┌──────────────────────────┐
│  Welcome back,           │
│  Jane Smith              │
│                          │
│  ┌──────────────────┐    │
│  │  MEMBERSHIP      │    │
│  │  [● ACTIVE]      │    │
│  │  Basic Monthly   │    │
│  │  Expires: 1 Sep  │    │
│  │  17 days left    │    │
│  │  [View Details]  │    │
│  └──────────────────┘    │
│                          │
│  ┌──────────────────┐    │
│  │  RECENT PAYMENTS │    │
│  │  01 Aug ₹1,500 ↓ │    │
│  │  01 Jul ₹1,500 ↓ │    │
│  │  [View All]      │    │
│  └──────────────────┘    │
└──────────────────────────┘
```

**Expiry Warning States:**

The membership card changes appearance based on expiry proximity:

| Condition | Visual treatment |
|---|---|
| Active, > 14 days remaining | `status-active` green badge, no warning |
| Active, 7–14 days remaining | `status-pending` amber badge + "Renew soon" note |
| Active, < 7 days remaining | `status-expired` red badge + "Expiring soon — contact the gym" |
| Expired | `status-expired` red badge + "Your membership has expired — contact the gym to renew" |
| Pending | `status-pending` amber badge + "Your membership is pending. Contact the gym." |

**Data Sources:**
| Element | API Call |
|---|---|
| Member name, status, plan, expiry | `GET /member/me` |
| Recent payments (last 3) | `GET /member/payments?limit=3` |

**Days Remaining calculation:** Client-side — `Math.ceil((new Date(expiry_date) - new Date()) / (1000*60*60*24))`

---

## 6. Membership Status Page (`/member/membership`)

Full membership detail view. Answers: "What exactly is my membership?"

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Dashboard]   [Membership]   [Payments]                             │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  Membership Details                                                  │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │                                                              │    │
│  │   STATUS                                                     │    │
│  │   ● ACTIVE                                                   │    │
│  │                                                              │    │
│  │   ─────────────────────────────────────────────────────────  │    │
│  │                                                              │    │
│  │   PLAN DETAILS                                               │    │
│  │   Tier           Basic                                       │    │
│  │   Duration       Monthly                                     │    │
│  │   Plan Name      Basic — Monthly                             │    │
│  │                                                              │    │
│  │   ─────────────────────────────────────────────────────────  │    │
│  │                                                              │    │
│  │   MEMBERSHIP PERIOD                                          │    │
│  │   Start Date     01 Aug 2026                                 │    │
│  │   Expiry Date    01 Sep 2026                                 │    │
│  │   Days Remaining 17 days                                     │    │
│  │                                                              │    │
│  │   ─────────────────────────────────────────────────────────  │    │
│  │                                                              │    │
│  │   MEMBER INFORMATION                                         │    │
│  │   Name           Jane Smith                                  │    │
│  │   Email          jane@example.com                            │    │
│  │   Phone          +91-9999999999                              │    │
│  │   Member Since   01 Jan 2025                                 │    │
│  │                                                              │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  ℹ  To renew or change your plan, contact Fitness Garage.    │    │
│  │     [Contact the Gym →]                                      │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Expiry Warning Banner:**

Shown above the card when expiry is within 14 days or already expired:

```
┌──────────────────────────────────────────────────────────────────────┐
│  ⚠  Your membership expires in 7 days. Contact the gym to renew.    │
│     [Contact Fitness Garage]                                         │
└──────────────────────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────────────────────┐
│  ✕  Your membership expired on 01 Aug 2026. Contact the gym          │
│     to renew your membership.  [Contact Fitness Garage]              │
└──────────────────────────────────────────────────────────────────────┘
```

**"Contact Fitness Garage" link:** Links to `/contact` (public site contact page)

**Data Source:** `GET /member/me` — single API call, all fields returned

---

## 7. Payment History Page (`/member/payments`)

Full paginated list of all payments with invoice download. Answers: "What have I paid and when?"

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Dashboard]   [Membership]   [Payments]                             │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  Payment History                                                     │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  Date           Plan              Amount    Invoice                  │
│  ─────────────────────────────────────────────────────────────────── │
│  01 Aug 2026    Basic Monthly     ₹1,500    [↓ Download]            │
│  01 Jul 2026    Basic Monthly     ₹1,500    [↓ Download]            │
│  01 Jun 2026    Basic Monthly     ₹1,500    [↓ Download]            │
│  01 May 2026    Basic Monthly     ₹1,500    [↓ Download]            │
│  01 Apr 2026    Basic Monthly     ₹1,500    [↓ Download]            │
│  ─────────────────────────────────────────────────────────────────── │
│                                                                      │
│  [← Prev]   Page 1 of 3   [Next →]                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Mobile layout** — table becomes cards:

```
┌──────────────────────────┐
│  01 Aug 2026             │
│  Basic — Monthly         │
│  ₹ 1,500                 │
│  [↓ Download Invoice]    │
│  ─────────────────────── │
│  01 Jul 2026             │
│  Basic — Monthly         │
│  ₹ 1,500                 │
│  [↓ Download Invoice]    │
└──────────────────────────┘
```

**Interactions:**
- **Download Invoice:** Calls `GET /member/payments/:id/invoice` → receives signed URL → opens PDF in new tab
- **Pagination:** Cursor-based — "Prev" and "Next" buttons. 20 records per page.

**Empty State** (no payments recorded yet):
```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│       🧾  No payment records yet                                     │
│                                                                      │
│       Your payment history will appear here once                     │
│       your first payment has been recorded.                          │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Data Source:** `GET /member/payments` — paginated, cursor-based. Sorted by `payment_date DESC`.

---

## 8. Invoice PDF Specification

Invoices are generated server-side by FastAPI (`invoice_service.py` using `reportlab`) when admin records a payment. The PDF is stored in Supabase Storage under `invoices/<member_id>/<payment_id>.pdf`. Members access via a signed URL (60-minute expiry).

**Invoice Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  [LOGO]   FITNESS GARAGE                                             │
│           [Address]                                                  │
│           [Phone]  [Email]                                           │
│                                                              INVOICE  │
│  ─────────────────────────────────────────────────────────────────── │
│  Invoice No.    INV-0042                                             │
│  Date           01 Aug 2026                                          │
│  ─────────────────────────────────────────────────────────────────── │
│  BILLED TO                                                           │
│  Jane Smith                                                          │
│  jane@example.com                                                    │
│  +91-9999999999                                                      │
│  ─────────────────────────────────────────────────────────────────── │
│  Description                     Amount                              │
│  ─────────────────────────────────────────────────────────────────── │
│  Basic Membership — Monthly                                          │
│  Period: 01 Aug 2026 – 01 Sep 2026          ₹ 1,500.00              │
│  ─────────────────────────────────────────────────────────────────── │
│                                   Total      ₹ 1,500.00             │
│  ─────────────────────────────────────────────────────────────────── │
│  Payment Method   Cash                                               │
│  Payment Date     01 Aug 2026                                        │
│  ─────────────────────────────────────────────────────────────────── │
│  Thank you for being a member of Fitness Garage.                     │
└──────────────────────────────────────────────────────────────────────┘
```

**Invoice Fields:**
| Field | Source |
|---|---|
| Invoice No. | Auto-incremented: `INV-<zero-padded sequence>` |
| Date | `payment.payment_date` |
| Member Name | `member.full_name` (decrypted) |
| Member Email | `member.email_address` (decrypted) |
| Member Phone | `member.phone_number` (decrypted) |
| Description | `plan.tier` + `plan.duration` formatted |
| Period | `member.start_date` → `member.expiry_date` |
| Amount | `payment.amount` |
| Payment Method | `payment.payment_method` |
| Gym Logo | Fetched from `assets/` on generation |
| Gym Info | From `site_config` (address, phone, email) |

**Invoice Numbering:**
- Stored as a sequence in `site_config` under key `invoice_last_sequence`
- On each new invoice: `invoice_last_sequence` incremented atomically
- Format: `INV-0001`, `INV-0002`, etc.

---

## 9. Auth State Flows

### 9.1 Successful Login Flow

```
Member submits credentials
        │
        ▼
Supabase Auth validates
        │
        ▼
JWT returned → stored in authStore (memory only)
        │
        ▼
FastAPI /member/me called with JWT
        │
        ├── member found → redirect to /member/dashboard
        └── no member record linked → attempt account linking
                  │
                  ├── match found by email/phone → link + redirect to dashboard
                  └── no match → show error: "No membership found. Contact the gym."
```

### 9.2 Session Expiry Flow

```
Member is on a portal page
        │
JWT expires (Supabase default: 1 hour, refreshed automatically by Supabase client)
        │
If refresh fails (e.g. revoked):
        │
Axios interceptor catches 401 response
        │
authStore.clearAuth() called
        │
Redirect to /login
        │
"Your session has expired. Please sign in again." shown on login page
```

### 9.3 Logout Flow

```
Member clicks Logout
        │
Supabase Auth signOut() called
        │
authStore.clearAuth() called
        │
Redirect to / (public homepage)
```

---

## 10. Error States

### 10.1 Page-Level Errors

If `GET /member/me` fails on dashboard load:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│       ⚠  Unable to load your membership details                      │
│                                                                      │
│       Please check your connection and try again.                    │
│                                                                      │
│       [Try Again]                                                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 10.2 Invoice Download Errors

If signed URL request fails:

```
Toast: "Unable to retrieve invoice. Please try again."
```

### 10.3 No Membership Linked

If authenticated but no member record found in DB:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│       ℹ  No membership found                                         │
│                                                                      │
│       We could not find a membership linked to your account.         │
│       Please contact Fitness Garage for assistance.                  │
│                                                                      │
│       [Contact the Gym]   [Sign Out]                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 11. Loading States

Every data-fetching operation shows a loading state:

| Component | Loading Treatment |
|---|---|
| Dashboard membership card | Skeleton card with pulsing animation |
| Dashboard recent payments | 3 skeleton rows |
| Membership status page | Full skeleton of the detail card |
| Payment history table | 5 skeleton rows |
| Invoice download button | Button shows spinner, becomes disabled |

Skeleton uses Tailwind `animate-pulse` on `bg-garage-mid` placeholder blocks — no external library.

---

## 12. Member Portal Data Flow

```
Member Browser (JWT in memory via authStore)
    │
    ├── GET /member/me
    │       └── FastAPI verifies JWT
    │               └── Extracts supabase_user_id from token
    │                       └── member_queries.get_member_by_supabase_id()
    │                               └── Returns encrypted row
    │                                       └── security.decrypt_pii(row)
    │                                               └── Returns decrypted member data
    │                                                       └── Pydantic serialises
    │                                                               └── JSON response to browser
    │
    ├── GET /member/payments
    │       └── FastAPI verifies JWT
    │               └── Supabase RLS: only rows where member_id matches auth.uid()
    │                       └── payment_queries.list_member_payments()
    │                               └── Returns payment rows (no PII in payments table)
    │                                       └── JSON response to browser
    │
    └── GET /member/payments/:id/invoice
            └── FastAPI verifies JWT
                    └── Confirms payment.member_id matches requesting member
                            └── Supabase Storage: generate signed URL (60 min expiry)
                                    └── Returns signed URL to browser
                                            └── Browser opens PDF in new tab
```

---

## 13. Accessibility

| Requirement | Implementation |
|---|---|
| Keyboard navigation | All interactive elements focusable, logical tab order |
| Focus indicators | Visible focus ring in `garage-chrome` on all inputs and buttons |
| Screen reader labels | All form inputs have `<label>` — no placeholder-only labels |
| Status announcements | Status badge has `aria-label` e.g. `aria-label="Membership status: Active"` |
| Invoice button | `aria-label="Download invoice for payment on 01 Aug 2026"` |
| OTP inputs | `aria-label="OTP digit 1 of 6"` etc. |
| Color not sole indicator | Status always shown as text + color (never color alone) |
| Reduced motion | All loading animations respect `prefers-reduced-motion` |

---

## 14. Security Considerations

| Concern | Implementation |
|---|---|
| JWT storage | Memory only — never `localStorage` or `sessionStorage` |
| Session refresh | Supabase client handles silently — transparent to member |
| Invoice access | Signed URLs — 60-minute expiry; member can only request their own invoices |
| PII display | Decrypted server-side — never stored or cached in frontend state beyond component lifetime |
| RLS enforcement | Supabase RLS ensures members only query their own records even if JWT is somehow misused |
| HTTPS | Enforced by Vercel — no mixed content |

---

## 15. Routes Summary

| Route | Page | Auth | Data Fetched |
|---|---|---|---|
| `/login` | Member Login | None | None |
| `/member/dashboard` | Dashboard | Member JWT | `/member/me`, `/member/payments?limit=3` |
| `/member/membership` | Membership Status | Member JWT | `/member/me` |
| `/member/payments` | Payment History | Member JWT | `/member/payments` (paginated) |

All `/member/**` routes are wrapped in `ProtectedMemberRoute` — unauthenticated users are redirected to `/login` with the original destination saved for post-login redirect.

**Post-login redirect:**
```ts
// On redirect to /login, save intended destination
navigate('/login', { state: { from: location.pathname } })

// On successful login, redirect to saved destination or default
const from = location.state?.from ?? ROUTES.MEMBER_DASHBOARD
navigate(from, { replace: true })
```

---

*End of Member Portal Specification Document — Fitness Garage v1.0*
