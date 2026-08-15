# Product Requirements Document (PRD)
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0  
**Date:** 2026-08-15  
**Status:** Finalized  
**Prepared for:** LLM Agent Handover

---

## 1. Project Overview

### 1.1 Purpose
Fitness Garage requires a full-stack gym website that serves as both a public-facing portfolio/marketing site and a functional member management platform. The website replaces no existing system — it is a greenfield build.

### 1.2 Problem Statement
Fitness Garage currently has no digital presence. Member management is informal, there is no online showcase of services, and member records/payments are managed manually. This system centralises these operations.

### 1.3 Stakeholders
| Role | Description |
|---|---|
| Gym Owner / Admin | Manages members, payments, content, and gym operations |
| Staff | Same access level as Admin (single admin role) |
| Members | View membership status, download invoices |
| Developer | Dev-level access for maintenance and debugging |
| Website Visitors | Prospective members browsing the public site |

---

## 2. Governing Principles

All development decisions must adhere to the following principles without exception:

| Principle | Mandate |
|---|---|
| **DRY** | No repeated logic — shared utilities, base classes, reusable components throughout |
| **SOLID** | Single responsibility per module/component; dependency injection in FastAPI |
| **KISS** | Simplest solution that works — no premature abstraction |
| **YAGNI** | Build only what is needed now — no speculative features |
| **Extensible** | New features must plug in without rewriting existing code |
| **Replaceable** | All external services (auth, SMS, hosting) must be swappable with minimal impact |

---

## 3. Target Audience

- **Primary:** Prospective gym members browsing for a local gym
- **Secondary:** Existing members checking membership status / invoices
- **Tertiary:** Gym admin and staff managing day-to-day operations

### 3.1 Scale at Launch
| Metric | Value |
|---|---|
| Existing Members | 200+ |
| Admin / Staff Users | 6 |
| Expected Monthly Growth | ~10 new members |
| Peak Concurrent Users | ~20 (read-heavy workload) |

---

## 4. Brand Identity

| Attribute | Value |
|---|---|
| Gym Name | Fitness Garage |
| Logo | Exists (to be provided by client) |
| Primary Color | Dark Grey |
| Accent Color | Yellowish Chrome |
| UI Tone | Bold, energetic, premium dark feel |
| Language | English only |

---

## 5. Feature Requirements

### 5.1 Public Website Pages

| Page / Section | Description | Admin Manageable |
|---|---|---|
| Home / Hero | Slideshow background, CTA buttons (View Plans, Join Now, Contact), Stats bar, Achievements | ✅ Yes |
| About | Gym story, mission, values | ✅ Yes |
| Services | All services listed below with image/icon and description | ✅ Yes |
| Membership Plans | 8 plan combinations (2 tiers × 4 durations), placeholder pricing | ✅ Yes |
| Trainer Profiles | 5 placeholder profiles (name, photo, specialization, experience, certifications, bio) | ✅ Yes |
| Gallery | Photos, transformation images, event photos, videos | ✅ Yes |
| Testimonials | Auto-synced from Google Reviews (name, text, date, star rating) | ✅ Auto |
| Contact | Google Maps embed, contact details, Google Form embed | ❌ Static |
| Member Login | Portal entry point | N/A |

### 5.2 Services Offered
The following services must each have a name, description, and image/icon managed from the admin dashboard:

1. Personal Training
2. Group Classes
3. Weight Loss Programs
4. Strength & Conditioning
5. Nutrition Coaching
6. Cardio Programs
7. Kids Dance
8. Zumba

### 5.3 Membership Plans

**Tiers:** Basic, Personal Training (PT)  
**Durations:** Monthly, Quarterly, Half Yearly, Annual  
**Pricing:** Placeholder at launch — admin sets pricing from dashboard

Matrix (8 combinations):

| | Monthly | Quarterly | Half Yearly | Annual |
|---|---|---|---|---|
| Basic | TBD | TBD | TBD | TBD |
| PT | TBD | TBD | TBD | TBD |

### 5.4 Home Page Stats & Achievements
Stats displayed on the hero/home section, managed from admin dashboard:
- Number of members
- Years in business
- Number of trainers
- Transformations achieved
- Awards / recognitions

### 5.5 Member Portal

Accessible only after authentication. Minimal feature set by design.

| Feature | Description |
|---|---|
| Membership Status | Current plan, tier, status (Active / Expired / Pending) |
| Membership Expiry | Expiry date clearly displayed |
| Payment History | List of all payments recorded by admin |
| Invoice Download | PDF invoice downloadable per payment record |

### 5.6 Admin Dashboard

Accessible only to admin and staff roles. Manages all dynamic content on the website.

| Module | Capabilities |
|---|---|
| Member Management | Add, edit, view, remove members; bulk import via CSV/Excel |
| Payment Management | Record payments manually, generate invoices |
| Membership Plans | Create, edit, delete plans and pricing |
| Services | Add, edit, remove services with image and description |
| Trainer Profiles | Add, edit, remove trainer profiles with photo |
| Gallery | Upload, delete photos, transformation images, event photos, videos |
| Stats & Achievements | Edit hero section stats and achievements |
| Testimonials | View auto-synced Google Reviews (read only in dashboard) |
| Enquiries | View enquiries submitted via Google Form (via Google Forms integration) |
| About Content | Edit gym story, mission, values |

### 5.7 Contact
- Google Maps embed (location TBD — placeholder)
- Contact details: address, phone, email (placeholder)
- Enquiry form: embedded Google Form

### 5.8 Google Reviews Integration
- Source: Google Places API
- Sync: Automatic (live pull)
- Display fields: Member name, review text, date, star rating
- Google Places API free tier: $200/month credit (sufficient at this scale)

---

## 6. Authentication & Authorization

### 6.1 Member Authentication
Three login methods supported via Supabase Auth (self-hosted / free tier):

| Method | Provider |
|---|---|
| Email + Password | Supabase Auth |
| Email SSO (Magic Link) | Supabase Auth |
| Phone + OTP | Supabase Auth |

### 6.2 Admin Authentication
- Separate login page from member portal
- Single admin role (no sub-roles within admin)
- JWT-based session via Supabase Auth

### 6.3 Developer Access
- Separate dev role in Supabase with elevated access
- Used for maintenance and debugging only

### 6.4 Route Protection
| Route Type | Protection |
|---|---|
| Public website pages | Open — no auth required |
| Member portal routes | JWT required (member role) |
| Admin dashboard routes | JWT required (admin role) |
| Dev routes | JWT required (dev role) |

---

## 7. Security Requirements

| Concern | Approach |
|---|---|
| PII (name, phone, email) | AES-256 encrypted at rest; encrypted in FastAPI before write, decrypted on read |
| Passwords | Handled by Supabase Auth (bcrypt) — not stored in application DB |
| Data isolation | Supabase Row Level Security (RLS) — members only access their own records |
| Transport security | HTTPS enforced via Vercel (frontend) and Render (backend) |
| CORS | Locked to Vercel frontend domain only |
| API authorization | JWT validated on all protected endpoints |
| Encryption key | Stored as environment variable on Render; never committed to git |
| Future migration | Encryption key moves to AWS Secrets Manager when scaling to AWS |

---

## 8. Data & Migration

### 8.1 Existing Data
- 200+ existing members with generic data (name, phone, email, membership type, dates)
- Payment history records
- Source: Excel/CSV provided by client

### 8.2 Migration Approach
- Admin dashboard includes a **bulk CSV/Excel import tool**
- Field mapping defined during import
- PII encrypted automatically during import process

### 8.3 Member Data Fields
| Field | Type | Notes |
|---|---|---|
| Full Name | String | Encrypted |
| Phone Number | String | Encrypted |
| Email Address | String | Encrypted |
| Membership Tier | Enum | Basic / PT |
| Membership Duration | Enum | Monthly / Quarterly / Half Yearly / Annual |
| Start Date | Date | |
| Expiry Date | Date | |
| Status | Enum | Active / Expired / Pending |
| Payment History | Relation | Linked payment records |

---

## 9. Notifications

Notifications are **deferred to a future phase**. No notification system to be built at launch.

**Future Enhancement (Phase 2):**
- Membership expiry reminders (SMS)
- Payment confirmation (SMS)
- Welcome message on signup (SMS)
- Provider: TBD (Fast2SMS / MSG91 recommended for India)

---

## 10. SEO Requirements

Full local SEO setup:

| SEO Element | Requirement |
|---|---|
| Meta titles & descriptions | Per page, unique and keyword-optimized |
| Open Graph tags | For social sharing previews on all pages |
| Schema markup | LocalBusiness, GymOrSportsClub structured data |
| Google Business Profile | Integrated |
| Sitemap | Auto-generated (sitemap.xml) |
| robots.txt | Configured |
| Canonical URLs | Set on all pages |
| Mobile optimization | Fully responsive — passes Core Web Vitals |

---

## 11. Non-Functional Requirements

| Requirement | Specification |
|---|---|
| Responsiveness | Fully responsive — desktop, tablet, mobile |
| Performance | Optimized for Core Web Vitals (LCP, CLS, FID) |
| Browser support | Modern browsers (Chrome, Firefox, Safari, Edge) |
| Accessibility | WCAG 2.1 AA baseline |
| Uptime | 99%+ via free tier hosting (Vercel + Render + cron keep-alive) |
| Scalability | Architecture must support migration to AWS without rewrite |

---

## 12. Out of Scope (Explicitly Excluded)

The following are explicitly out of scope for this delivery:

- Online payment processing
- Class schedule / timetable
- WhatsApp notifications
- Native mobile app (iOS / Android)
- Multi-language support
- Multiple gym locations
- Fitness tracking inside member portal
- Rate limiting / API gateway
- Multiple admin roles / permissions

---

## 13. Future Enhancements (Documented, Not Built)

| Enhancement | Notes |
|---|---|
| SMS notifications | Expiry reminders, payment confirmations, welcome messages |
| Online payments | Razorpay / Stripe integration |
| Class schedule | Timetable with booking |
| AWS migration | Straightforward — architecture is cloud-ready |
| WhatsApp notifications | After budget allows |
| Native mobile app | Post-launch if demand exists |

---

## 14. Assumptions & Constraints

| Item | Assumption / Constraint |
|---|---|
| Logo | Provided by client before development starts |
| Location details | Placeholder — client to provide address, phone, email |
| Membership pricing | Placeholder — client to set via admin dashboard post-launch |
| Trainer profiles | 5 placeholder profiles — content filled post-launch |
| Google Places API key | To be obtained by client or developer |
| Domain name | Not yet purchased — TBD |
| Budget | Shoestring — all infrastructure on free tiers at launch |
| Compliance | DPDP Act (India) addressed via PII encryption and RLS; no formal audit required at launch |

---

*End of PRD — Fitness Garage v1.0*
