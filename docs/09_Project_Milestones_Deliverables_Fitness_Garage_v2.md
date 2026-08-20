# Project Milestones & Deliverables Document
## Fitness Garage — Static Gym Website

**Version:** 2.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

> **v2.0 Amendment:** Scope reduced to static frontend only.
> 6 phases collapsed to 3. No backend, no auth, no member portal, no admin.

---

## 1. Project Summary

| Attribute | Detail |
|---|---|
| **Delivery** | Single delivery — all pages and features built and deployed together |
| **Stack** | React + TypeScript → Vercel (free) |
| **Timeline** | Estimated 3 weeks from kickoff to production deployment |
| **Phases** | 3 phases — sequential, each phase is a shippable increment |

---

## 2. Milestone Overview

```
Phase 0 │ Setup & Infrastructure            Week 1 (Days 1–2)
Phase 1 │ Component Library & Public Pages  Week 1–2 (Days 3–10)
Phase 2 │ Integrations, SEO & Launch        Week 3 (Days 11–15)
```

---

## 3. Phase 0 — Setup & Infrastructure

**Duration:** Days 1–2
**Milestone:** Repository live, Vercel auto-deploying, design tokens configured, placeholder assets uploaded.

### 3.1 Tasks

| # | Task |
|---|---|
| 0.1 | Create GitHub repository — `frontend/` directory |
| 0.2 | Initialise Vite + React + TypeScript |
| 0.3 | Install and configure Tailwind CSS with all custom design tokens (`tailwind.config.ts`) |
| 0.4 | Configure ESLint + Prettier (`eslint.config.js`, `.prettierrc.json`) |
| 0.5 | Install pre-commit hooks (`pre-commit install`) |
| 0.6 | Connect GitHub to Vercel — auto-deploy from `main` |
| 0.7 | Add `VITE_GOOGLE_PLACES_API_KEY` and `VITE_GOOGLE_PLACE_ID` to Vercel environment variables |
| 0.8 | Configure `vercel.json` — SPA rewrites, security headers, clean URLs |
| 0.9 | Set up Git branching: `main`, `develop`, `feature/**` |
| 0.10 | Create all `src/data/*.json` files with placeholder content |
| 0.11 | Create `public/assets/` folder structure — hero, about, services, trainers, gallery, transformations |
| 0.12 | Upload minimum placeholder assets (3 hero images, 8 service icons, 5 trainer placeholder photos) |
| 0.13 | Create `.env.example` with Google Places variables |
| 0.14 | Verify Vercel deployment: push to `main` → site live at Vercel URL |

### 3.2 Acceptance Criteria

- [ ] `git push` to `main` triggers Vercel deploy — site accessible at Vercel URL
- [ ] Tailwind custom tokens working — `text-garage-chrome` applies `#D4AF37`
- [ ] All 8 `src/data/*.json` files exist with valid JSON structure
- [ ] All `public/assets/<section>/` folders created
- [ ] Minimum placeholder assets present (site renders without broken images)
- [ ] ESLint and Prettier pass on initial codebase: `npm run lint` and `npm run build`
- [ ] Pre-commit hooks installed — `pre-commit run --all-files` passes

---

## 4. Phase 1 — Component Library & Public Pages

**Duration:** Days 3–10
**Milestone:** All 8 public pages built, fully responsive, brand-correct, and consuming data from `src/data/*.json` via `publicService.ts`.

### 4.1 Tasks

#### Infrastructure & Service Layer

| # | Task |
|---|---|
| 1.1 | Implement `src/services/publicService.ts` — all async functions reading from JSON data files |
| 1.2 | Implement all TypeScript types in `src/types/` |
| 1.3 | Implement utility functions: `buildAssetUrl`, `formatDate`, `formatCurrency` |
| 1.4 | Set up React Router v6 with all 8 routes + lazy loading + NotFoundPage |
| 1.5 | Add all route constants to `src/constants/routes.ts` |
| 1.6 | Implement custom hooks: `useScrollReveal`, `useMediaQuery`, `useDebounce` |
| 1.7 | Add Google Fonts (`Bebas Neue` + `Inter`) and `preconnect` to `index.html` |

#### Component Library

| # | Task |
|---|---|
| 1.8 | Build `Button.tsx` — all variants (primary, secondary, ghost, danger) + href support |
| 1.9 | Build `Card.tsx` — with optional hover state |
| 1.10 | Build `Badge.tsx` |
| 1.11 | Build `Spinner.tsx` |
| 1.12 | Build `SectionLabel.tsx` |
| 1.13 | Build `SectionHeading.tsx` — Chrome Slash signature element |
| 1.14 | Build `StatBlock.tsx` |
| 1.15 | Build `ErrorMessage.tsx` |
| 1.16 | Build `Navbar.tsx` — desktop + mobile hamburger menu |
| 1.17 | Build `Footer.tsx` — gym info from `publicService.getSiteConfig()` |
| 1.18 | Build `PageWrapper.tsx` — SEO meta injection per page |
| 1.19 | Build `SectionWrapper.tsx` — padding + scroll reveal |
| 1.20 | Build `HeroPageBanner.tsx` — inner page header banner |

#### Feature Components

| # | Task |
|---|---|
| 1.21 | Build `HeroSlideshow.tsx` — image/video crossfade, auto-cycle |
| 1.22 | Build `HeroStats.tsx` — stats bar from hero.json |
| 1.23 | Build `ServiceCard.tsx` — icon + name + description |
| 1.24 | Build `PlanCard.tsx` — tier/duration/price + "Contact for pricing" if 0 |
| 1.25 | Build `TrainerCard.tsx` — photo + profile details |
| 1.26 | Build `GalleryGrid.tsx` — masonry grid, lazy images |
| 1.27 | Build `GalleryLightbox.tsx` — full-screen, keyboard navigation |
| 1.28 | Build `ReviewCard.tsx` — star rating + text + name + date |
| 1.29 | Build `GoogleReviews.tsx` — orchestrates `useGoogleReviews` hook |
| 1.30 | Implement `useGoogleReviews.ts` — Places API + sessionStorage cache + fallback |

#### Pages

| # | Task |
|---|---|
| 1.31 | Build `HomePage.tsx` — all 10 sections, parallel data fetch |
| 1.32 | Build `AboutPage.tsx` |
| 1.33 | Build `ServicesPage.tsx` |
| 1.34 | Build `PlansPage.tsx` |
| 1.35 | Build `TrainersPage.tsx` |
| 1.36 | Build `GalleryPage.tsx` — filter tabs + lightbox state |
| 1.37 | Build `TestimonialsPage.tsx` |
| 1.38 | Build `ContactPage.tsx` — Maps embed + Google Form embed |
| 1.39 | Build `NotFoundPage.tsx` |
| 1.40 | Apply scroll reveal animations to all section entries |
| 1.41 | Apply `prefers-reduced-motion` via CSS media query |

### 4.2 Deliverables

- [ ] `src/services/publicService.ts` — all async functions implemented
- [ ] All 9 common components built
- [ ] All 5 layout components built
- [ ] All 9 feature components built
- [ ] All 9 pages built (8 public + 404)
- [ ] All 4 custom hooks implemented
- [ ] All 3 utility functions implemented
- [ ] Responsive verified at 375px, 768px, 1280px

### 4.3 Acceptance Criteria

- [ ] Home page loads all 10 sections — no blank sections, no broken images
- [ ] Hero slideshow cycles between ≥ 3 images with crossfade
- [ ] Hero stats rendered from `hero.json` — not hardcoded
- [ ] Services page shows all 8 services with icons
- [ ] Plans page shows all 8 combinations — `₹0` displays as "Contact for pricing"
- [ ] Trainers page shows all 5 placeholders with photos
- [ ] Gallery filter tabs work — All / Gym / Transformations / Videos
- [ ] Gallery lightbox opens on click, closes on Escape or backdrop click
- [ ] Lightbox supports keyboard navigation (← →)
- [ ] Testimonials page: `Spinner` shown while Google Places API loads
- [ ] Testimonials page: fallback reviews render if API fails
- [ ] Contact page: Google Maps embed visible, Google Form embed visible
- [ ] Footer contact info sourced from `site.json`
- [ ] Navbar hamburger menu works on mobile — all links functional
- [ ] Chrome Slash (`/`) visible in hero headline and all section headings
- [ ] Scroll reveal fires on all sections (opacity + translateY transition)
- [ ] All images have descriptive `alt` attributes
- [ ] No `console.error` in browser on any page
- [ ] `npm run build` produces zero TypeScript errors
- [ ] `npm run lint` produces zero ESLint errors

---

## 5. Phase 2 — Integrations, SEO & Launch

**Duration:** Days 11–15
**Milestone:** Google Reviews live, full SEO implemented, Core Web Vitals passing, production deployment live.

### 5.1 Tasks

#### Google Reviews

| # | Task |
|---|---|
| 2.1 | Obtain Google Place ID for Fitness Garage |
| 2.2 | Create Google Places API key in Google Cloud Console — restrict to Vercel domain |
| 2.3 | Add `VITE_GOOGLE_PLACES_API_KEY` and `VITE_GOOGLE_PLACE_ID` to Vercel env vars |
| 2.4 | Test `useGoogleReviews` hook — verify live reviews load |
| 2.5 | Verify `sessionStorage` cache — reviews persist across page navigation |
| 2.6 | Verify fallback — reviews from `data/reviews.json` render when API key is missing |
| 2.7 | Add "Powered by Google" attribution below reviews |

#### SEO

| # | Task |
|---|---|
| 2.8 | Implement `GymOrSportsClub` JSON-LD in `index.html` (populated from env/site.json) |
| 2.9 | Implement `BreadcrumbList` JSON-LD in `PageWrapper.tsx` for all inner pages |
| 2.10 | Implement dynamic `ItemList` schema on `ServicesPage` from services data |
| 2.11 | Implement dynamic `Person` schema on `TrainersPage` from trainers data |
| 2.12 | Implement `Review` aggregate schema on `TestimonialsPage` from reviews data |
| 2.13 | Verify Open Graph tags on all 8 pages (Facebook Sharing Debugger) |
| 2.14 | Verify Twitter Card tags on all 8 pages |
| 2.15 | Verify `robots.txt` accessible and correct |
| 2.16 | Verify `sitemap.xml` accessible and contains all 8 public URLs |
| 2.17 | Validate structured data using Google Rich Results Test |

#### Performance

| # | Task |
|---|---|
| 2.18 | Add `<link rel="preload">` for hero first slide in `index.html` |
| 2.19 | Verify all content images have `loading="lazy"` and declared `width`/`height` |
| 2.20 | Configure Vite manual chunk splitting: `vendor` (react/react-dom/router) |
| 2.21 | Run Lighthouse audit — target Performance ≥ 90, LCP < 2.5s, CLS < 0.1 |
| 2.22 | Fix any Lighthouse issues |

#### QA & Launch

| # | Task |
|---|---|
| 2.23 | Cross-browser test: Chrome, Firefox, Safari, Edge — all 8 pages |
| 2.24 | Mobile test: iOS Safari (375px), Android Chrome (390px) |
| 2.25 | Connect custom domain to Vercel (when available) |
| 2.26 | Update canonical URLs, sitemap, and schema with production domain |
| 2.27 | Replace all placeholder content in `src/data/*.json` with real gym content |
| 2.28 | Upload real assets (hero images, trainer photos, gallery images, service icons) |
| 2.29 | Submit sitemap to Google Search Console |
| 2.30 | Set up Google Business Profile (client task) |
| 2.31 | Tag production release: `git tag v1.0.0` |

### 5.2 Acceptance Criteria

- [ ] Google Reviews loading live on Testimonials and Home pages
- [ ] `sessionStorage` cache verified — no repeated API calls on navigation
- [ ] Fallback reviews render correctly when API unavailable
- [ ] Google Rich Results Test passes for GymOrSportsClub schema
- [ ] `robots.txt` blocks no public pages; allows all 8 pages
- [ ] `sitemap.xml` contains all 8 public URLs
- [ ] Open Graph preview correct in Facebook Sharing Debugger
- [ ] Lighthouse Performance ≥ 90 on mobile
- [ ] Lighthouse LCP < 2.5 seconds
- [ ] Lighthouse CLS < 0.1
- [ ] Zero TypeScript errors: `npm run build`
- [ ] Zero ESLint errors: `npm run lint`
- [ ] All pre-commit hooks pass: `pre-commit run --all-files`
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge all passing
- [ ] Mobile: iOS Safari 375px and Android Chrome 390px correct layout
- [ ] Real gym content visible — no "TBD" or "Placeholder" text visible to visitors
- [ ] All real assets loading — no broken images
- [ ] Production deployment live and accessible

---

## 6. Deliverables Register

### 6.1 Documentation

| # | Document | Status |
|---|---|---|
| D-01 | PRD v2 | ✅ Complete |
| D-02 | Technical Architecture v2 | ✅ Complete |
| D-03 | Database Schema v1.1 | 📦 Archived (Phase 2) |
| D-04 | API Specification | 📦 Archived (Phase 2) |
| D-05 | Frontend Component Architecture v2 | ✅ Complete |
| D-06 | Admin Dashboard Specification | 📦 Archived (Phase 2) |
| D-07 | Member Portal Specification | 📦 Archived (Phase 2) |
| D-08 | SEO Strategy | ✅ Unchanged |
| D-09 | Project Milestones v2 | ✅ This document |
| D-10 | Dev Handover README v2 | ✅ Complete |
| D-11 | Dev Methodology | ✅ Unchanged |

### 6.2 Code Deliverables

| # | Deliverable | Phase |
|---|---|---|
| C-01 | GitHub repository — `frontend/` | 0 |
| C-02 | Vite + React + TypeScript configured | 0 |
| C-03 | Tailwind design tokens | 0 |
| C-04 | All `src/data/*.json` files | 0 |
| C-05 | `public/assets/` folder structure + placeholder assets | 0 |
| C-06 | `publicService.ts` — JSON data source (Phase 2 swap point) | 1 |
| C-07 | All TypeScript types (7 type files) | 1 |
| C-08 | All utility functions (3 files) | 1 |
| C-09 | All custom hooks (4 files) | 1 |
| C-10 | Common component library (9 components) | 1 |
| C-11 | Layout components (5 components) | 1 |
| C-12 | Feature components (9 components) | 1 |
| C-13 | All 8 public pages + 404 | 1 |
| C-14 | Google Reviews integration + fallback | 2 |
| C-15 | Full SEO implementation (5 schema types, OG, robots, sitemap) | 2 |
| C-16 | Core Web Vitals optimisation | 2 |
| C-17 | Production deployment on Vercel | 2 |

### 6.3 Infrastructure Deliverables

| # | Deliverable | Phase |
|---|---|---|
| I-01 | Vercel project — auto-deploy from `main` | 0 |
| I-02 | Google Places API key (domain-restricted) | 2 |
| I-03 | Custom domain connected (when available) | 2 |
| I-04 | Google Search Console verified | 2 |

---

## 7. Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Google Places API key exposed in bundle | Low | Medium | Domain restriction in Google Cloud Console; key is read-only and scoped to Places only |
| Google Places API returns < 5 reviews | Medium | Low | Fallback reviews in `data/reviews.json` always displayed if API fails |
| Client content not ready at launch | High | Medium | Deploy with placeholder content first; update JSON files and redeploy |
| Hero assets not provided by client | Medium | Medium | Placeholder images included — site is functional at launch |
| Custom domain not purchased | Medium | Low | Site works on Vercel subdomain; domain connected when purchased |
| Google Place ID incorrect | Low | Low | Reviews fall back to static data; no crash |

---

## 8. Phase 2 — Future Backend (Documented, Not Built)

When client is ready:

| Deliverable | Effort |
|---|---|
| Wire `publicService.ts` to FastAPI backend | 1 day |
| Deploy FastAPI on Render | 1 day |
| Set up Supabase (Postgres + Auth + Storage) | 1 day |
| Run database migrations | 1 hour |
| Build member portal (3 pages) | 1 week |
| Build admin dashboard (11 modules) | 2 weeks |
| Bulk import 200+ members | 1 day |

All Phase 2 specs are ready in the archived documents.

---

*End of Project Milestones & Deliverables Document — Fitness Garage v2.0 (Static Website)*
