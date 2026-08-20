# Product Requirements Document (PRD)
## Fitness Garage — Static Gym Website

**Version:** 2.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

> **v2.0 Amendment:** Scope reduced to a pure static frontend website.
> No backend, no database, no auth, no member portal, no admin dashboard.
> All content is stored in static JSON data files. Services layer is
> architected for zero-friction backend wiring in a future phase.

---

## 1. Project Overview

### 1.1 Purpose
Fitness Garage requires a modern, fast, fully responsive static website that serves as a digital presence and lead-generation tool for the gym. The site must convert visitors into enquiries and walk-ins.

### 1.2 Problem Statement
Fitness Garage has no digital presence. Prospective members cannot find the gym online, view its services or pricing, or make an enquiry. This website solves that.

### 1.3 What This Is
- A **pure static frontend** built with React + TypeScript
- Hosted on **Vercel free tier** — globally distributed CDN, zero server cost
- All content stored in **local JSON data files** — updated by a developer
- Google Reviews pulled **live from Google Places API** (browser-side)
- Contact form handled via **Google Forms embed**

### 1.4 What This Is Not
- Not a member portal (no login, no membership status)
- Not an admin dashboard (no CMS, no backend)
- Not a dynamic application (no database, no server)
- Not a native mobile app

### 1.5 Future-Readiness
The service layer is deliberately abstracted so that wiring a backend in a future phase requires **only changes to `src/services/publicService.ts`** — zero changes to any page or component. This is the single point of future integration.

---

## 2. Governing Principles

| Principle | Implementation |
|---|---|
| **DRY** | Single component library — every UI element defined once |
| **SOLID** | Components consume from services — never from data files directly |
| **KISS** | No state management library — React `useState` and props only |
| **YAGNI** | No backend, no auth, no CMS — build only what is needed now |
| **Extensible** | New sections plug into the page without restructuring existing components |
| **Replaceable** | `publicService.ts` is the single swap point for future backend wiring |

---

## 3. Target Audience

| Audience | Goal |
|---|---|
| Prospective members | Find the gym, understand services, view pricing, make enquiry |
| Existing members | Confirm opening hours, contact info, find social links |
| Search engines | Index the gym for local search — "gym in [City]" |

---

## 4. Brand Identity

| Attribute | Value |
|---|---|
| Gym Name | Fitness Garage |
| Logo | Exists — provided by client |
| Primary Color | Dark Grey (`#1A1A1A`, `#2C2C2C`) |
| Accent Color | Yellowish Chrome (`#D4AF37`) |
| UI Tone | Bold, energetic, premium dark feel |
| Signature Element | Chrome Slash (`/`) in all section headings |
| Language | English only |

---

## 5. Pages & Sections

### 5.1 Page List

| Page | URL | Description |
|---|---|---|
| Home | `/` | Hero, stats, services preview, plans, trainers, reviews, achievements, gallery preview, contact CTA |
| About | `/about` | Gym story, mission, stats, trainer grid |
| Services | `/services` | All 8 services with icons and descriptions |
| Plans | `/plans` | All 8 membership plan combinations |
| Trainers | `/trainers` | All trainer profiles |
| Gallery | `/gallery` | Full gallery — photos, videos, transformations |
| Testimonials | `/testimonials` | Full Google Reviews grid |
| Contact | `/contact` | Gym info, Google Maps embed, Google Form embed |

### 5.2 Home Page Sections (in order)

| Section | Content |
|---|---|
| Hero | Slideshow (images from `assets/hero/`), headline with Chrome Slash, CTA buttons (View Plans, Join Now, Contact), stats bar |
| About Snippet | Short gym intro, link to About page |
| Services Preview | Top 4 service cards, link to Services page |
| Stats Band | Full-width dark stats bar (members, years, trainers, transformations) |
| Plans Preview | All 8 membership plan cards |
| Trainers Preview | Trainer cards, horizontal scroll on mobile |
| Google Reviews | Live reviews from Google Places API |
| Achievements | List of gym awards and milestones |
| Gallery Preview | 6-image grid, link to Gallery page |
| Contact CTA | Chrome banner with "Join Now" and "Contact Us" buttons |

---

## 6. Features

### 6.1 Google Reviews Integration

- **Source:** Google Places API — called directly from the browser
- **API key:** Restricted to production domain (Vercel URL / custom domain)
- **Display fields:** Reviewer name, review text, star rating, date
- **Caching:** Reviews cached in browser `sessionStorage` for the session — reduces API calls, prevents flickering on navigation
- **Fallback:** If API call fails or key is unavailable, a set of static fallback reviews from `data/reviews.json` is displayed
- **Attribution:** "Powered by Google" attribution displayed per Google's terms

### 6.2 Contact Form

- **Implementation:** Google Forms embedded as an `<iframe>`
- **Google Form URL:** Stored in `data/site.json` — updated by developer when form URL changes
- **No backend required** — form submissions go directly to Google

### 6.3 Gallery

- **Images and videos** displayed in a masonry grid
- **Tab filter:** All | Gym | Transformations | Videos
- **Lightbox:** Full-screen lightbox on image click
- **Source:** Image paths stored in `data/gallery.json` — files served from Vercel `/public/assets/` or Supabase Storage
- **Future:** Will swap to `GET /public/gallery` API call with zero component changes

### 6.4 Hero Slideshow

- **Images:** Listed in `data/hero.json` — paths point to assets in `/public/assets/hero/`
- **Crossfade transition:** CSS only — no animation library
- **Interval:** Configurable in `data/hero.json`
- **Videos:** Supported — `<video>` tag auto-plays muted for video assets

---

## 7. Content Management

All website content is stored in JSON data files under `src/data/`. A developer edits these files and redeploys to update content. Vercel auto-deploys from `main` branch on push.

| File | Content |
|---|---|
| `src/data/site.json` | Gym name, address, phone, email, Google Maps embed URL, Google Form URL, Google Place ID, tagline, about story |
| `src/data/hero.json` | Slideshow asset paths, interval, CTA labels, stats values |
| `src/data/services.json` | All 8 services — name, slug, description, icon path |
| `src/data/plans.json` | All 8 plan combinations — tier, duration, price, description |
| `src/data/trainers.json` | All trainer profiles — name, slug, specialization, experience, certifications, bio, photo path |
| `src/data/gallery.json` | Gallery items — folder, filename, media type, caption |
| `src/data/achievements.json` | Gym achievements and awards |
| `src/data/reviews.json` | Static fallback reviews (used if Google Places API fails) |

### 7.1 Asset Management

All static images and videos are stored in `/public/assets/` — same section-named folder convention as originally designed, now served directly by Vercel.

```
public/
└── assets/
    ├── hero/              → Hero slideshow images/videos
    ├── about/             → About section images
    ├── services/          → Service icons (filename = slug)
    ├── trainers/          → Trainer photos (filename = slug)
    ├── gallery/           → Gallery photos/videos
    └── transformations/   → Before/after transformation photos
```

**Convention:** Add file to the correct folder → update the corresponding JSON data file → push to `main` → Vercel deploys automatically.

---

## 8. Future Backend Wiring (Phase 2)

When the client is ready for a backend, member portal, and admin dashboard:

**Only one file changes in the frontend:**

```typescript
// src/services/publicService.ts

// CURRENT (static):
import heroData from '../data/hero.json'
export const publicService = {
  getHeroData: async () => heroData,
  ...
}

// FUTURE (backend wired):
import api from './api'
export const publicService = {
  getHeroData: async () => api.get('/public/assets/hero'),
  ...
}
```

All pages, components, hooks, and types remain completely unchanged.

The backend specification documents (API Spec, Database Schema, Technical Architecture v1) are retained and version-controlled for this future phase.

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Performance | Lighthouse Performance ≥ 90 on mobile |
| LCP | < 2.5 seconds |
| CLS | < 0.1 |
| Responsiveness | Desktop (1280px), Tablet (768px), Mobile (375px) |
| Browser support | Chrome, Firefox, Safari, Edge — latest 2 versions |
| Accessibility | WCAG 2.1 AA baseline |
| Uptime | 99.9%+ — Vercel global CDN |
| Deploy time | < 2 minutes from git push to live |

---

## 10. Hosting & Infrastructure

| Layer | Service | Cost |
|---|---|---|
| Frontend | Vercel (free tier) | Free |
| Assets | Vercel `/public/` CDN | Free |
| Google Reviews | Google Places API ($200/month credit) | Free |
| Contact Form | Google Forms | Free |
| Domain | TBD — client to purchase | Paid |

No server. No database. No authentication. No Docker in production.

---

## 11. Out of Scope — Phase 1

| Feature | Phase |
|---|---|
| Member login portal | Phase 2 |
| Admin dashboard / CMS | Phase 2 |
| Online payment | Phase 2 |
| Class schedule | Phase 2 |
| SMS / WhatsApp notifications | Phase 2 |
| Native mobile app | Phase 3 |
| Multi-location support | Phase 3 |

All Phase 2 backend specifications are documented and ready:
- `02_Technical_Architecture_Fitness_Garage.md`
- `03_Database_Schema_Fitness_Garage.md`
- `04_API_Specification_Fitness_Garage.md`
- `06_Admin_Dashboard_Specification_Fitness_Garage.md`
- `07_Member_Portal_Specification_Fitness_Garage.md`

---

## 12. Assumptions & Constraints

| Item | Detail |
|---|---|
| Logo | Provided by client before development |
| Location details | Placeholder in `data/site.json` — client provides |
| Pricing | Placeholder `0.00` — client provides |
| Trainer content | 5 placeholders — client provides names, bios, photos |
| Google Place ID | Required for live reviews — client or developer obtains |
| Google Places API key | Developer creates, restricts to domain, stores in Vercel env vars |
| Google Form URL | Client creates form and provides embed URL |
| Domain | Not yet purchased — Vercel URL used until connected |
| Content updates | Developer edits JSON files and pushes to deploy |

---

*End of PRD — Fitness Garage v2.0 (Static Website)*
