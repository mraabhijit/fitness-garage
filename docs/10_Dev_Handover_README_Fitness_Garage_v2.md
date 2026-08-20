# Dev Handover README
## Fitness Garage — Static Gym Website

**Version:** 2.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

> **v2.0 Amendment:** Static frontend only. No backend setup, no migrations,
> no Docker in production. Backend docs retained for Phase 2.

---

## 0. Read This First

**Active documents (Phase 1 — Static Site):**

| # | Document | Purpose |
|---|---|---|
| 1 | `01_PRD_Fitness_Garage_v2.md` | What to build and why |
| 2 | `02_Technical_Architecture_Fitness_Garage_v2.md` | Architecture + Phase 2 swap design |
| 5 | `05_Frontend_Component_Architecture_Fitness_Garage_v2.md` | Components, pages, data layer |
| 8 | `08_SEO_Strategy_Fitness_Garage.md` | Schema, meta, Core Web Vitals |
| 9 | `09_Project_Milestones_Deliverables_Fitness_Garage_v2.md` | Tasks and acceptance criteria |
| 10 | `10_Dev_Handover_README_Fitness_Garage_v2.md` | This document |
| 11 | `11_Dev_Methodology_Fitness_Garage.md` | Git workflow, pre-commit, CI |

**Archived documents (Phase 2 — Backend, when ready):**

| # | Document | Purpose |
|---|---|---|
| 3 | `03_Database_Schema_Fitness_Garage.md` | Postgres schema, asyncpg queries |
| 4 | `04_API_Specification_Fitness_Garage.md` | All 35 FastAPI endpoints |
| 6 | `06_Admin_Dashboard_Specification_Fitness_Garage.md` | Admin UI |
| 7 | `07_Member_Portal_Specification_Fitness_Garage.md` | Member portal |

**Golden Rules — never violate these:**
- **DRY:** Define once, use everywhere — no copy-pasted components or logic
- **SOLID:** Components consume from `publicService` only — never import from `data/` directly
- **KISS:** `useState` only — no Zustand, no Context, no Redux
- **YAGNI:** No backend wiring, no auth, no forms — only what is in the spec
- **Replaceable:** `publicService.ts` is the single Phase 2 swap point — never bypass it
- **Section-named assets:** Files in `public/assets/<section>/` — same convention as Phase 2 storage

---

## 1. Project Overview

Fitness Garage is a pure static marketing website for a real gym. It has:

- 8 public pages — Home, About, Services, Plans, Trainers, Gallery, Testimonials, Contact
- Live Google Reviews via Google Places API (browser-side, `sessionStorage` cached)
- Contact form via Google Forms embed
- All other content from `src/data/*.json` files

**Stack:**

```
React 18 + TypeScript → Vercel CDN (free, global)
```

Nothing else. No server. No database.

---

## 2. Repository Structure

```
fitness-garage/
├── frontend/
│   ├── public/
│   │   ├── robots.txt
│   │   ├── sitemap.xml
│   │   ├── og-default.jpg
│   │   └── assets/
│   │       ├── hero/
│   │       ├── about/
│   │       ├── services/
│   │       ├── trainers/
│   │       ├── gallery/
│   │       └── transformations/
│   └── src/
│       ├── data/              ← ALL STATIC CONTENT — edit JSON to update site
│       ├── components/        ← Reusable component library
│       ├── pages/             ← 8 public pages + 404
│       ├── features/          ← Feature-scoped components
│       ├── services/
│       │   └── publicService.ts  ← PHASE 2 SWAP POINT
│       ├── hooks/
│       ├── types/
│       ├── utils/
│       ├── constants/
│       └── router/
│
└── docs/                      ← All specification documents
    ├── ACTIVE/                ← Phase 1 docs
    └── ARCHIVED/              ← Phase 2 docs (backend)
```

---

## 3. Environment Variables

```env
# frontend/.env.example
VITE_GOOGLE_PLACES_API_KEY=<domain-restricted-key>
VITE_GOOGLE_PLACE_ID=<fitness-garage-place-id>
```

**Only two variables.** Both used exclusively in `useGoogleReviews.ts`.

Set in Vercel: Project → Settings → Environment Variables.

### Obtaining the Google Place ID

1. Go to: `https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder`
2. Search "Fitness Garage [City]"
3. Copy the Place ID (format: `ChIJ...`)
4. Add to Vercel as `VITE_GOOGLE_PLACE_ID`

### Restricting the Google Places API Key

1. Go to Google Cloud Console → Credentials → select the API key
2. Under "Application restrictions" → select "Websites"
3. Add: `https://fitnessgarage.vercel.app/*` (and custom domain when available)
4. Under "API restrictions" → select "Places API"
5. Save

---

## 4. Local Development Setup

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Git | Latest |

### Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Add VITE_GOOGLE_PLACES_API_KEY and VITE_GOOGLE_PLACE_ID to .env.local
npm run dev
# → http://localhost:5173
```

### Available Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build (TypeScript compile + bundle)
npm run preview    # Preview production build locally
npm run lint       # ESLint
npm run format     # Prettier
```

Or use the Makefile:

```bash
make setup         # First-time setup (install + pre-commit)
make dev-frontend  # Start dev server
make lint-frontend # Run ESLint + tsc
make format-frontend # Run Prettier
make test-frontend # Type check + build
make ready         # Full pre-PR check: lint + test + pre-commit
```

---

## 5. Content Updates

All website content lives in `src/data/*.json`. To update any content:

1. Edit the JSON file
2. Commit and push to `main`
3. Vercel auto-deploys — live in < 2 minutes

### Content File Reference

| File | What it controls |
|---|---|
| `src/data/site.json` | Gym name, tagline, address, phone, email, Google Maps URL, Google Form URL, opening hours, about story |
| `src/data/hero.json` | Hero slideshow filenames, headline text, CTA buttons, stats values |
| `src/data/services.json` | 8 services — name, description, icon filename |
| `src/data/plans.json` | 8 plan combinations — pricing, descriptions |
| `src/data/trainers.json` | Trainer profiles — name, bio, photo filename, specialization |
| `src/data/gallery.json` | Gallery items — filename, folder, caption |
| `src/data/achievements.json` | Gym awards and milestones |
| `src/data/reviews.json` | Static fallback reviews (used only if Google Places API fails) |

### Asset Updates

| Action | Steps |
|---|---|
| Add hero slide | Add file to `public/assets/hero/` → add entry to `src/data/hero.json` slides array |
| Update trainer photo | Replace file in `public/assets/trainers/<slug>.jpg` (same filename) |
| Add gallery image | Add file to `public/assets/gallery/` → add entry to `src/data/gallery.json` |
| Add service icon | Add file to `public/assets/services/<slug>.svg` → ensure slug matches in `services.json` |
| Add trainer | Add entry to `trainers.json` → upload photo to `public/assets/trainers/<slug>.jpg` |

---

## 6. The Phase 2 Swap — How It Works

When the client wants a backend, member portal, and admin dashboard, **only these files change in the frontend:**

### Files that change

| File | Change |
|---|---|
| `src/services/publicService.ts` | Swap JSON reads → Axios API calls |
| `src/utils/buildAssetUrl.ts` | Swap `/assets/` path → Supabase Storage URL |
| `package.json` | Add `axios`, `@supabase/supabase-js`, `zustand`, `react-hook-form`, `zod` |
| `.env.example` | Add `VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_STORAGE_URL` |

### Files that are added (new)

| File | Purpose |
|---|---|
| `src/services/api.ts` | Axios instance with JWT interceptor |
| `src/store/authStore.ts` | Zustand auth state |
| `src/pages/auth/MemberLoginPage.tsx` | 3-tab member login |
| `src/pages/auth/AdminLoginPage.tsx` | Admin login |
| `src/pages/member/` | 3 member portal pages |
| `src/pages/admin/` | 11 admin dashboard pages |
| `src/router/ProtectedMemberRoute.tsx` | Member auth guard |
| `src/router/ProtectedAdminRoute.tsx` | Admin auth guard |

### Files that never change

Everything else: all 8 public pages, all components, all feature components, all hooks, all types, all SEO implementation, the design system, routing for public pages.

**The components are backend-agnostic by design.**

---

## 7. Key Conventions

### Component Conventions

| Convention | Rule |
|---|---|
| Data access | Components only call `publicService.*` — never import from `data/` directly |
| Asset URLs | Always via `buildAssetUrl(folder, filename)` — never hardcoded paths |
| Colors | Always Tailwind tokens (`text-garage-chrome`) — never raw hex values |
| Route strings | Always `ROUTES.*` constants — never hardcoded strings |
| Headings | All section headings via `<SectionHeading>` — Chrome Slash pattern |
| Loading | Every data fetch shows `<Spinner>` while pending |
| Errors | Every data fetch has an error state — no crashes |
| Accessibility | All images have `alt`, all inputs have `<label>`, no color-only indicators |

### Git Conventions

```bash
# Branch from develop
git checkout develop && git pull && git checkout -b feature/frontend/<description>

# Commit format
git commit -m "feat(frontend): add hero slideshow with crossfade"
git commit -m "content(plans): update quarterly pricing"
git commit -m "fix(frontend): correct gallery lightbox keyboard navigation"
```

### Content Commit Format

For JSON data file updates (no code changes):

```bash
git commit -m "content(<section>): <what changed>"

# Examples:
git commit -m "content(plans): update all pricing to client values"
git commit -m "content(trainers): add trainer five profile"
git commit -m "content(hero): add slide-4 and update stats"
```

---

## 8. Deployment

```
Push to main
    ↓
Vercel detects push
    ↓
npm ci → npm run build (Vite)
    ↓
dist/ deployed to Vercel CDN edge nodes globally
    ↓
Live in < 2 minutes
```

### Manual Redeploy

If needed without a code push:
- Vercel Dashboard → Project → Deployments → Redeploy

### Rollback

- Vercel Dashboard → Project → Deployments → click previous deployment → Promote to Production

---

## 9. Common Development Tasks

### Add a New Page

1. Create `src/pages/<NewPage>.tsx`
2. Add route to `src/router/index.tsx` (lazy import)
3. Add route constant to `src/constants/routes.ts`
4. Add `<NewPage>` to `public/sitemap.xml`
5. Update `Navbar.tsx` if it's a primary nav link

### Add a New Service

1. Add entry to `src/data/services.json`
2. Add icon file to `public/assets/services/<slug>.svg`
3. Push to `main` — Vercel deploys

### Add a New Section to Home Page

1. Create feature component in `src/features/<section>/`
2. Import and add `<SectionWrapper>` block in `HomePage.tsx`
3. Add data to relevant JSON file (or create new one if new type)
4. Fetch in `HomePage.tsx` `Promise.all` call
5. Add types to `src/types/`

### Update Google Form

1. Create or update form at `forms.google.com`
2. Get embed URL: Send → Embed (copy the `src` from the iframe code)
3. Update `google_form_url` in `src/data/site.json`
4. Push to `main`

### Update Google Maps Embed

1. Go to Google Maps → search gym location → Share → Embed a map
2. Copy the `src` URL from the iframe code
3. Update `google_maps_embed_url` in `src/data/site.json`
4. Push to `main`

---

## 10. External Services

| Service | URL | Purpose |
|---|---|---|
| Vercel | `https://vercel.com/dashboard` | Hosting, env vars, deploy logs |
| Google Cloud Console | `https://console.cloud.google.com` | Places API key management |
| Google Search Console | `https://search.google.com/search-console` | Sitemap, indexing, crawl errors |
| Google Forms | `https://forms.google.com` | Contact form management |

---

## 11. Pre-Launch Checklist

### Developer tasks

- [ ] All `src/data/*.json` files updated with real gym content — no "TBD" values
- [ ] All real assets uploaded to `public/assets/<section>/`
- [ ] Google Places API key created and domain-restricted
- [ ] `VITE_GOOGLE_PLACES_API_KEY` and `VITE_GOOGLE_PLACE_ID` added to Vercel env vars
- [ ] Google Places reviews loading live (test on Vercel preview URL)
- [ ] All 8 pages rendering with real content
- [ ] Lighthouse Performance ≥ 90 on mobile
- [ ] `robots.txt` and `sitemap.xml` updated with production domain
- [ ] Schema JSON-LD updated with real gym address, phone, coordinates
- [ ] Custom domain connected in Vercel (when purchased)
- [ ] Canonical URLs updated to production domain
- [ ] `git tag v1.0.0` on `main`

### Client tasks

- [ ] Provide real trainer names, bios, and photos
- [ ] Provide real gym address, phone number, email
- [ ] Provide real membership pricing
- [ ] Provide hero slideshow images (minimum 3, minimum 1920×1080px)
- [ ] Provide service icons or approve placeholder icons
- [ ] Create Google Form for contact enquiries — provide embed URL
- [ ] Confirm Google Maps embed URL
- [ ] Set up and verify Google Business Profile at `business.google.com`
- [ ] Submit sitemap to Google Search Console after launch

---

## 12. Placeholder Replacement Reference

Every placeholder in the JSON data files:

| File | Key | Replace with |
|---|---|---|
| `site.json` | `tagline` | Gym motto / tagline |
| `site.json` | `about_story` | Real gym origin story |
| `site.json` | `address` | Full gym address |
| `site.json` | `phone` | Contact phone number |
| `site.json` | `email` | Contact email address |
| `site.json` | `google_maps_embed_url` | Maps embed iframe `src` URL |
| `site.json` | `google_form_url` | Google Form iframe `src` URL |
| `site.json` | `google_place_id` | Google Place ID (ChIJ...) |
| `hero.json` | `slides` | Real hero image/video filenames |
| `hero.json` | `stats[].value` | Real member count, years, etc. |
| `plans.json` | `price` | Real pricing for all 8 plans |
| `trainers.json` | All `name`, `bio`, `photo_filename` | Real trainer details |
| `services.json` | `description` | Real service descriptions |
| `achievements.json` | `label`, `value` | Real gym awards/milestones |
| `reviews.json` | All entries | Real curated reviews (fallback only) |

---

*End of Dev Handover README — Fitness Garage v2.0 (Static Website)*
