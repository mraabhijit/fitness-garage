# Technical Architecture Document
## Fitness Garage — Static Gym Website

**Version:** 2.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

> **v2.0 Amendment:** Architecture reduced to a pure static frontend.
> No backend, no database, no auth, no Docker in production.
> The service layer is structured for zero-friction backend wiring in Phase 2.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     VISITOR BROWSER                             │
│                                                                 │
│   React + TypeScript SPA (fully static — no SSR)               │
│   Served from Vercel CDN edge nodes globally                    │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  src/data/*.json                                         │  │
│   │  Static content — services, plans, trainers, gallery     │  │
│   │  Read at component mount — no network call               │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Google Places API                                       │  │
│   │  Live reviews — browser-side fetch, sessionStorage cache │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Google Maps embed (iframe)                              │  │
│   │  Google Form embed (iframe)                              │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Hosting: Vercel (free tier)
Assets:  Vercel /public/ CDN
```

### 1.1 Architecture Principles Applied

| Principle | Implementation |
|---|---|
| **DRY** | Single component library — defined once, reused everywhere |
| **SOLID** | Components consume from services only — never from data files directly |
| **KISS** | No state management library, no Axios, no backend — `fetch` + `useState` only |
| **YAGNI** | No backend wiring, no auth, no CMS at launch |
| **Extensible** | New page sections plug in without touching existing components |
| **Replaceable** | `publicService.ts` is the single swap point — backend wiring requires changes to this file only |

---

## 2. The Replaceable Service Layer

This is the most important architectural decision in the entire project.

### 2.1 Current State (Phase 1 — Static)

```
Component
    └── publicService.ts
              └── src/data/*.json   ← reads local JSON files
```

### 2.2 Future State (Phase 2 — Backend Wired)

```
Component
    └── publicService.ts
              └── Axios instance    ← calls FastAPI backend
                      └── Render (FastAPI) → Supabase (Postgres)
```

**The component never changes. Only `publicService.ts` changes.**

### 2.3 Service Interface Contract

`publicService.ts` exports an object of async functions. Every function returns a Promise. Components `await` these functions — they don't care whether the data comes from a JSON file or an API.

```typescript
// src/services/publicService.ts

// Phase 1 — reads from local JSON files
import siteData      from '../data/site.json'
import heroData      from '../data/hero.json'
import servicesData  from '../data/services.json'
import plansData     from '../data/plans.json'
import trainersData  from '../data/trainers.json'
import galleryData   from '../data/gallery.json'
import achievementsData from '../data/achievements.json'
import fallbackReviews  from '../data/reviews.json'

export const publicService = {
  getSiteConfig:   async () => siteData,
  getHeroData:     async () => heroData,
  getServices:     async () => servicesData.services,
  getPlans:        async () => plansData.plans,
  getTrainers:     async () => trainersData.trainers,
  getGallery:      async (filter?: string) =>
    filter
      ? galleryData.items.filter(i => i.folder === filter)
      : galleryData.items,
  getAchievements: async () => achievementsData.achievements,
  getFallbackReviews: async () => fallbackReviews.reviews,
}

// ─────────────────────────────────────────────────────
// Phase 2 swap — replace the above with:
// import api from './api'
// export const publicService = {
//   getSiteConfig:   () => api.get('/public/site-config').then(r => r.data.data),
//   getHeroData:     () => api.get('/public/assets/hero').then(r => r.data.data),
//   getServices:     () => api.get('/public/services').then(r => r.data.data),
//   getPlans:        () => api.get('/public/plans').then(r => r.data.data),
//   getTrainers:     () => api.get('/public/trainers').then(r => r.data.data),
//   getGallery:      (filter?) => api.get('/public/gallery', { params: { type: filter } }).then(r => r.data.data),
//   getAchievements: () => api.get('/public/achievements').then(r => r.data.data),
// }
// ─────────────────────────────────────────────────────
```

---

## 3. Technology Stack

| Layer | Technology | Version | Hosting | Cost |
|---|---|---|---|---|
| Framework | React + TypeScript | 18+ / 5+ | — | Free |
| Build Tool | Vite | Latest | — | Free |
| Styling | Tailwind CSS | Latest | — | Free |
| Routing | React Router v6 | Latest | — | Free |
| Reviews | Google Places API | v1 | Browser | Free |
| Hosting | Vercel | — | Vercel | Free |
| Domain | TBD | — | TBD | Paid |

### 3.1 Deliberately Excluded (Phase 1)

| Technology | Reason Excluded |
|---|---|
| Axios | No API calls — native `fetch` for Google Places only |
| Zustand | No global state — `useState` + props sufficient |
| React Hook Form / Zod | No forms — Google Forms embed handles contact |
| Supabase | No auth, no DB, no storage in Phase 1 |
| FastAPI / uv | Backend not wired — kept in docs for Phase 2 |
| Docker (production) | Not needed — Vercel handles deployment |
| react-pdf | No invoices in Phase 1 |

---

## 4. Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── og-default.jpg
│   └── assets/                    ← All static media served by Vercel CDN
│       ├── hero/                   → Slideshow images/videos
│       ├── about/                  → About section images
│       ├── services/               → Service icons (slug.svg/png)
│       ├── trainers/               → Trainer photos (slug.jpg)
│       ├── gallery/                → Gallery photos/videos
│       └── transformations/        → Before/after photos
│
├── src/
│   ├── data/                      ← ALL STATIC CONTENT LIVES HERE
│   │   ├── site.json               → Gym info, about, integrations
│   │   ├── hero.json               → Slideshow, stats, CTAs
│   │   ├── services.json           → 8 services
│   │   ├── plans.json              → 8 membership plans
│   │   ├── trainers.json           → Trainer profiles
│   │   ├── gallery.json            → Gallery items
│   │   ├── achievements.json       → Awards and milestones
│   │   └── reviews.json            → Fallback reviews (Google API fail)
│   │
│   ├── components/                ← Reusable component library
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── SectionLabel.tsx
│   │   │   ├── SectionHeading.tsx
│   │   │   ├── StatBlock.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageWrapper.tsx
│   │   │   ├── SectionWrapper.tsx
│   │   │   └── HeroPageBanner.tsx
│   │   └── forms/
│   │       └── (reserved for Phase 2)
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── PlansPage.tsx
│   │   ├── TrainersPage.tsx
│   │   ├── GalleryPage.tsx
│   │   ├── TestimonialsPage.tsx
│   │   └── ContactPage.tsx
│   │
│   ├── features/                  ← Feature-scoped components
│   │   ├── hero/
│   │   │   ├── HeroSlideshow.tsx
│   │   │   └── HeroStats.tsx
│   │   ├── services/
│   │   │   └── ServiceCard.tsx
│   │   ├── plans/
│   │   │   └── PlanCard.tsx
│   │   ├── trainers/
│   │   │   └── TrainerCard.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx
│   │   │   └── GalleryLightbox.tsx
│   │   └── reviews/
│   │       ├── ReviewCard.tsx
│   │       └── GoogleReviews.tsx   ← Handles API call + fallback
│   │
│   ├── services/
│   │   └── publicService.ts       ← THE SINGLE SWAP POINT FOR PHASE 2
│   │
│   ├── hooks/
│   │   ├── useScrollReveal.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useGoogleReviews.ts    ← Google Places API + sessionStorage cache
│   │   └── useDebounce.ts
│   │
│   ├── types/
│   │   ├── site.ts
│   │   ├── service.ts
│   │   ├── plan.ts
│   │   ├── trainer.ts
│   │   ├── gallery.ts
│   │   ├── review.ts
│   │   └── achievement.ts
│   │
│   ├── utils/
│   │   ├── buildAssetUrl.ts       ← Constructs /public/assets/ URL
│   │   ├── formatDate.ts
│   │   └── formatCurrency.ts
│   │
│   ├── constants/
│   │   └── routes.ts
│   │
│   ├── router/
│   │   └── index.tsx              ← Public routes only (no protected routes)
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.local                     ← GITIGNORED
├── .env.example                   ← Committed
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Data Layer — JSON File Schemas

### `src/data/site.json`

```json
{
  "gym_name": "Fitness Garage",
  "tagline": "TBD",
  "about_story": "TBD",
  "address": "TBD",
  "phone": "TBD",
  "email": "TBD",
  "google_maps_embed_url": "TBD",
  "google_form_url": "TBD",
  "google_place_id": "TBD",
  "opening_hours": "Mon–Sun: 6:00 AM – 10:00 PM"
}
```

### `src/data/hero.json`

```json
{
  "slideshow_interval_ms": 5000,
  "slides": [
    { "filename": "slide-1.jpg", "media_type": "image", "alt": "Fitness Garage gym floor" },
    { "filename": "slide-2.jpg", "media_type": "image", "alt": "Fitness Garage training area" },
    { "filename": "slide-3.mp4", "media_type": "video", "alt": "Fitness Garage in action" }
  ],
  "headline_before": "PUSH",
  "headline_after": "BEYOND YOUR LIMITS",
  "cta_buttons": [
    { "label": "View Plans", "href": "/plans", "variant": "primary" },
    { "label": "Join Now",   "href": "/contact", "variant": "secondary" },
    { "label": "Contact",   "href": "/contact", "variant": "ghost" }
  ],
  "stats": [
    { "value": "200+", "label": "Members" },
    { "value": "5+",   "label": "Years" },
    { "value": "5+",   "label": "Trainers" },
    { "value": "100+", "label": "Transformations" }
  ]
}
```

### `src/data/services.json`

```json
{
  "services": [
    {
      "id": "1",
      "name": "Personal Training",
      "slug": "personal-training",
      "description": "One-on-one sessions tailored to your personal fitness goals.",
      "icon_filename": "personal-training.svg"
    }
  ]
}
```

### `src/data/plans.json`

```json
{
  "plans": [
    { "id": "1", "tier": "basic", "duration": "monthly",     "price": 0, "description": null },
    { "id": "2", "tier": "basic", "duration": "quarterly",   "price": 0, "description": null },
    { "id": "3", "tier": "basic", "duration": "half_yearly", "price": 0, "description": null },
    { "id": "4", "tier": "basic", "duration": "annual",      "price": 0, "description": null },
    { "id": "5", "tier": "pt",    "duration": "monthly",     "price": 0, "description": null },
    { "id": "6", "tier": "pt",    "duration": "quarterly",   "price": 0, "description": null },
    { "id": "7", "tier": "pt",    "duration": "half_yearly", "price": 0, "description": null },
    { "id": "8", "tier": "pt",    "duration": "annual",      "price": 0, "description": null }
  ]
}
```

### `src/data/trainers.json`

```json
{
  "trainers": [
    {
      "id": "1",
      "name": "Trainer One",
      "slug": "trainer-one",
      "specialization": "Personal Training",
      "experience_years": 5,
      "certifications": ["ACE Certified", "CPR Certified"],
      "bio": "Placeholder bio — to be filled by client.",
      "photo_filename": "trainer-one.jpg",
      "display_order": 1
    }
  ]
}
```

### `src/data/gallery.json`

```json
{
  "items": [
    {
      "id": "1",
      "folder": "gallery",
      "filename": "gym-floor-1.jpg",
      "media_type": "image",
      "caption": "Our main gym floor.",
      "display_order": 1
    },
    {
      "id": "2",
      "folder": "transformations",
      "filename": "transform-1.jpg",
      "media_type": "image",
      "caption": "Member transformation — 3 months.",
      "display_order": 1
    }
  ]
}
```

### `src/data/achievements.json`

```json
{
  "achievements": [
    { "id": "1", "label": "Best Gym Award 2024", "value": "#1", "display_order": 1 },
    { "id": "2", "label": "Top Rated Gym",        "value": null, "display_order": 2 },
    { "id": "3", "label": "500+ Transformations", "value": "500+", "display_order": 3 }
  ]
}
```

### `src/data/reviews.json` (fallback only)

```json
{
  "reviews": [
    {
      "id": "1",
      "reviewer_name": "John D.",
      "review_text": "Amazing gym with great trainers and equipment!",
      "rating": 5,
      "review_date": "2026-07-01"
    }
  ]
}
```

---

## 6. Google Reviews — Browser-Side Integration

### 6.1 Flow

```
Component mounts
    │
    ├── Check sessionStorage for cached reviews
    │       ├── Cache exists → render cached reviews immediately
    │       └── No cache → call Google Places API
    │                           │
    │                   API success → store in sessionStorage → render
    │                   API failure → load fallback from data/reviews.json → render
```

### 6.2 Hook — `useGoogleReviews.ts`

```typescript
const CACHE_KEY = 'fg_reviews_cache'

export const useGoogleReviews = (placeId: string, apiKey: string) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [fromCache, setFromCache] = useState(false)

  useEffect(() => {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      setReviews(JSON.parse(cached))
      setFromCache(true)
      setLoading(false)
      return
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json`
             + `?place_id=${placeId}&fields=reviews&key=${apiKey}`

    fetch(url)
      .then(res => res.json())
      .then(data => {
        const googleReviews = data?.result?.reviews ?? []
        const mapped = googleReviews.map(mapGoogleReview)
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(mapped))
        setReviews(mapped)
      })
      .catch(async () => {
        // Fallback to static reviews
        const fallback = await publicService.getFallbackReviews()
        setReviews(fallback)
      })
      .finally(() => setLoading(false))
  }, [placeId, apiKey])

  return { reviews, loading, fromCache }
}
```

### 6.3 Environment Variables

```env
# frontend/.env.local
VITE_GOOGLE_PLACES_API_KEY=<restricted-to-domain>
VITE_GOOGLE_PLACE_ID=<gym-place-id>
```

Note: `VITE_*` variables are embedded in the browser bundle at build time. The Google Places API key **must** be restricted to the production domain in Google Cloud Console. This prevents unauthorised usage.

---

## 7. Routing

Public routes only. No protected routes. No auth.

```typescript
// src/router/index.tsx
const HomePage         = lazy(() => import('../pages/HomePage'))
const AboutPage        = lazy(() => import('../pages/AboutPage'))
const ServicesPage     = lazy(() => import('../pages/ServicesPage'))
const PlansPage        = lazy(() => import('../pages/PlansPage'))
const TrainersPage     = lazy(() => import('../pages/TrainersPage'))
const GalleryPage      = lazy(() => import('../pages/GalleryPage'))
const TestimonialsPage = lazy(() => import('../pages/TestimonialsPage'))
const ContactPage      = lazy(() => import('../pages/ContactPage'))
const NotFoundPage     = lazy(() => import('../pages/NotFoundPage'))
```

| Route | Page |
|---|---|
| `/` | HomePage |
| `/about` | AboutPage |
| `/services` | ServicesPage |
| `/plans` | PlansPage |
| `/trainers` | TrainersPage |
| `/gallery` | GalleryPage |
| `/testimonials` | TestimonialsPage |
| `/contact` | ContactPage |
| `*` | NotFoundPage (404) |

All routes are code-split via `React.lazy()` + `Suspense`.

---

## 8. Asset URL Convention

Assets live in `/public/assets/<section>/`. URL construction is handled by a single utility.

```typescript
// src/utils/buildAssetUrl.ts
// Phase 1: serves from Vercel /public/
// Phase 2: swap to Supabase Storage URL — same interface

export const buildAssetUrl = (folder: string, filename: string): string =>
  `/assets/${folder}/${filename}`

// Phase 2 swap (one line change):
// const STORAGE_BASE = import.meta.env.VITE_SUPABASE_STORAGE_URL
// export const buildAssetUrl = (folder: string, filename: string): string =>
//   `${STORAGE_BASE}/${folder}/${filename}`
```

---

## 9. State Management

No global state library. React `useState` is sufficient for a static site.

| State | Location | Why |
|---|---|---|
| Page data (services, plans, trainers) | Component `useState` — fetched on mount | Component-local, no sharing needed |
| Google Reviews | `useGoogleReviews` hook + `sessionStorage` | Cross-navigation cache only |
| Gallery filter tab | `GalleryPage` `useState` | Local UI state |
| Lightbox open/close | `GalleryPage` `useState` | Local UI state |
| Slideshow index | `HeroSlideshow` `useState` | Local UI state |
| Navbar mobile menu | `Navbar` `useState` | Local UI state |

No Zustand. No Context. No Redux.

---

## 10. Performance Strategy

| Concern | Implementation |
|---|---|
| Code splitting | All pages lazy-loaded via `React.lazy()` |
| Image optimisation | `loading="lazy"` on all below-fold images, `width`/`height` declared |
| Hero preload | First hero slide preloaded via `<link rel="preload">` |
| Font loading | Google Fonts with `display=swap` + `preconnect` |
| CSS | Tailwind purging removes unused classes at build |
| Reviews cache | `sessionStorage` prevents repeated Google Places API calls |
| JSON data | Bundled at build time — zero network latency for content |
| Vite chunking | Vendor chunk split: react/react-dom, router |

---

## 11. Environment Variables

```env
# frontend/.env.example

# Google Reviews
VITE_GOOGLE_PLACES_API_KEY=<your-domain-restricted-key>
VITE_GOOGLE_PLACE_ID=<fitness-garage-place-id>
```

Only two environment variables needed for Phase 1. No database credentials. No server secrets.

---

## 12. Deployment Pipeline

```
Developer edits src/data/*.json or src/components/**
    │
git push origin main
    │
Vercel detects push → builds: npm run build
    │
Vite compiles → dist/
    │
Vercel deploys dist/ to CDN edge nodes globally
    │
Live in < 2 minutes
```

Zero server config. Zero Docker. Zero SSH.

---

## 13. Phase 2 — Backend Wiring Checklist

When the client is ready to add member portal, admin dashboard, and backend:

**Frontend changes (minimal):**
- [ ] Add `Axios` dependency
- [ ] Add `src/services/api.ts` — Axios instance
- [ ] Rewrite `src/services/publicService.ts` — swap JSON reads for API calls
- [ ] Add `src/store/authStore.ts` — Zustand auth store
- [ ] Add `src/pages/auth/` — MemberLoginPage, AdminLoginPage
- [ ] Add `src/pages/member/` — member portal pages
- [ ] Add `src/pages/admin/` — admin dashboard pages
- [ ] Add `ProtectedMemberRoute` and `ProtectedAdminRoute` to router
- [ ] Add `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` to env

**Zero changes to:**
- All 8 public pages
- All components in `components/`
- All feature components in `features/`
- All hooks in `hooks/`
- All types in `types/`
- All utilities in `utils/`
- Design system (Tailwind tokens)
- Routing for public pages

---

*End of Technical Architecture Document — Fitness Garage v2.0 (Static Website)*
