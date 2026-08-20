# Frontend Component Architecture Document
## Fitness Garage — Static Gym Website

**Version:** 2.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

> **v2.0 Amendment:** Static site only. No auth, no member portal, no admin dashboard,
> no Axios, no Zustand. Service layer retained as the single Phase 2 swap point.

---

## 1. Stack

| Concern | Technology | Notes |
|---|---|---|
| Framework | React 18 + TypeScript | |
| Build | Vite | |
| Routing | React Router v6 | Public routes only |
| Styling | Tailwind CSS | Custom design tokens |
| State | React `useState` only | No Zustand — KISS |
| HTTP | Native `fetch` | Google Places API only |
| Linting | ESLint + Prettier | |
| Hosting | Vercel | Auto-deploy from `main` |

---

## 2. Design System

### 2.1 Color Tokens (`tailwind.config.ts`)

```typescript
colors: {
  'garage-black':     '#1A1A1A',  // Page background
  'garage-dark':      '#2C2C2C',  // Card/section backgrounds
  'garage-mid':       '#3D3D3D',  // Borders, dividers
  'garage-chrome':    '#D4AF37',  // Primary accent — CTAs, highlights
  'garage-chrome-dim':'#A88A1C',  // Chrome hover state
  'garage-white':     '#F0F0F0',  // Primary text
  'garage-muted':     '#9A9A9A',  // Secondary text, captions
}
```

### 2.2 Typography

| Role | Font | Usage |
|---|---|---|
| Display | `Bebas Neue` | Hero headlines, section titles, stat numbers |
| Body | `Inter` | Body copy, nav, labels, captions |

```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap');
```

### 2.3 Chrome Slash Signature Element

All section headings use the `<SectionHeading>` component with the Chrome Slash pattern:

```
WHAT WE / OFFER
```

```tsx
<SectionHeading label="OUR SERVICES" before="WHAT WE" after="OFFER" />
// Renders: WHAT WE <span class="text-garage-chrome">/</span> OFFER
```

### 2.4 Animation Rules

- Scroll reveal: `IntersectionObserver` via `useScrollReveal` — no library
- Hero slideshow: CSS `transition` crossfade — no library
- Hover: Tailwind `hover:scale-[1.02]` + `hover:brightness-110` — no library
- All animations respect `prefers-reduced-motion`

---

## 3. Full Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── og-default.jpg
│   └── assets/
│       ├── hero/              → slide-1.jpg, slide-2.jpg, slide-3.mp4
│       ├── about/             → about-gym.jpg
│       ├── services/          → personal-training.svg, zumba.svg ...
│       ├── trainers/          → trainer-one.jpg, trainer-two.jpg ...
│       ├── gallery/           → gym-floor-1.jpg, event-1.mp4 ...
│       └── transformations/   → transform-1.jpg ...
│
├── src/
│   ├── data/                  ← STATIC CONTENT — edit JSON, push, deploy
│   │   ├── site.json
│   │   ├── hero.json
│   │   ├── services.json
│   │   ├── plans.json
│   │   ├── trainers.json
│   │   ├── gallery.json
│   │   ├── achievements.json
│   │   └── reviews.json       ← fallback only
│   │
│   ├── components/
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
│   │   └── layout/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── PageWrapper.tsx
│   │       ├── SectionWrapper.tsx
│   │       └── HeroPageBanner.tsx
│   │
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── AboutPage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── PlansPage.tsx
│   │   ├── TrainersPage.tsx
│   │   ├── GalleryPage.tsx
│   │   ├── TestimonialsPage.tsx
│   │   ├── ContactPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── features/
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
│   │       └── GoogleReviews.tsx
│   │
│   ├── services/
│   │   └── publicService.ts   ← SINGLE PHASE 2 SWAP POINT
│   │
│   ├── hooks/
│   │   ├── useScrollReveal.ts
│   │   ├── useMediaQuery.ts
│   │   ├── useGoogleReviews.ts
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
│   │   ├── buildAssetUrl.ts
│   │   ├── formatDate.ts
│   │   └── formatCurrency.ts
│   │
│   ├── constants/
│   │   └── routes.ts
│   │
│   ├── router/
│   │   └── index.tsx
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env.example
├── .env.local               ← GITIGNORED
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 4. Component Library

### 4.1 `Button.tsx`

```tsx
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  href?: string        // Renders as <a> if provided
  onClick?: () => void // Renders as <button> if provided
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}
// primary:   bg-garage-chrome text-garage-black hover:bg-garage-chrome-dim
// secondary: border border-garage-chrome text-garage-chrome hover:bg-garage-chrome/10
// ghost:     text-garage-white hover:text-garage-chrome
```

### 4.2 `SectionHeading.tsx`

```tsx
type SectionHeadingProps = {
  label?: string      // Uppercase chrome label e.g. "OUR SERVICES"
  before: string      // Text before slash e.g. "WHAT WE"
  after: string       // Text after slash e.g. "OFFER"
  align?: 'left' | 'center'
}
```

### 4.3 `StatBlock.tsx`

```tsx
type StatBlockProps = {
  value: string   // e.g. "200+"
  label: string   // e.g. "Members"
}
```

### 4.4 `Card.tsx`

```tsx
type CardProps = {
  hover?: boolean
  className?: string
  children: React.ReactNode
}
// Base: bg-garage-dark border border-garage-mid rounded-lg p-6
// Hover: transition-transform hover:scale-[1.02] hover:brightness-110
```

### 4.5 `Spinner.tsx`

```tsx
type SpinnerProps = { size?: 'sm' | 'md' | 'lg' }
// Used for Google Reviews loading state
```

### 4.6 `PageWrapper.tsx`

```tsx
type PageWrapperProps = {
  title: string
  description: string
  ogImage?: string
  breadcrumbs?: { name: string; path: string }[]
  children: React.ReactNode
}
// Injects: <title>, meta description, canonical, OG tags, breadcrumb JSON-LD
```

### 4.7 `SectionWrapper.tsx`

```tsx
type SectionWrapperProps = {
  id?: string
  dark?: boolean    // bg-garage-dark vs transparent background
  className?: string
  children: React.ReactNode
}
// Applies: section padding, IntersectionObserver scroll reveal
```

### 4.8 `Navbar.tsx`

Desktop:
```
[LOGO]  Home  About  Services  Plans  Trainers  Gallery  [Contact ▶]
```
Mobile: hamburger → full-screen overlay with all links.

- Fixed at top, `bg-garage-black/95 backdrop-blur`
- Active link: `text-garage-chrome`
- Contact: `Button variant="primary"`

### 4.9 `Footer.tsx`

```
FITNESS GARAGE      Quick Links       Contact
[tagline]           Home              [phone]
                    About             [email]
                    Services          [address]
                    Plans
                    Trainers
────────────────────────────────────────────
© 2026 Fitness Garage. All rights reserved.
```

All content from `publicService.getSiteConfig()`.

### 4.10 `HeroPageBanner.tsx`

Reused across all inner pages (About, Services, Plans, etc.):

```tsx
type HeroPageBannerProps = {
  title: string        // e.g. "OUR SERVICES"
  subtitle?: string
}
// Dark gradient banner with page title in Bebas Neue display font
```

---

## 5. Feature Components

### 5.1 `HeroSlideshow.tsx`

```tsx
// Props: slides from hero.json, interval from hero.json
// - Cycles through slides array
// - Images: <img> tag
// - Videos: <video autoPlay muted loop playsInline>
// - Crossfade via CSS opacity transition
// - First slide preloaded via useEffect → <link rel="preload">
// - Dark overlay: bg-garage-black/60
```

### 5.2 `HeroStats.tsx`

```tsx
// Props: stats[] from hero.json
// Renders a row of StatBlock components
// Full-width dark band below hero content
```

### 5.3 `ServiceCard.tsx`

```tsx
type ServiceCardProps = {
  service: Service
}
// Card with:
// - Icon from buildAssetUrl('assets/services', service.icon_filename)
// - Service name (display font)
// - Description (body font)
// - Hover scale effect
```

### 5.4 `PlanCard.tsx`

```tsx
type PlanCardProps = {
  plan: Plan
  featured?: boolean   // Chrome border highlight for recommended plan
}
// Card with:
// - Tier badge (Basic / Personal Training)
// - Duration label
// - Price (₹ or "Contact Us" if 0)
// - Description
// - "Enquire Now" CTA → links to /contact
```

Price display rule: if `price === 0` show "Contact for pricing" instead of `₹0`.

### 5.5 `TrainerCard.tsx`

```tsx
type TrainerCardProps = {
  trainer: Trainer
}
// Card with:
// - Photo from buildAssetUrl('assets/trainers', trainer.photo_filename)
// - Name, specialization
// - Experience years + certifications
// - Short bio (truncated to 3 lines, full on hover/click)
```

### 5.6 `GalleryGrid.tsx`

```tsx
type GalleryGridProps = {
  items: GalleryItem[]
  onItemClick: (item: GalleryItem) => void
}
// Responsive masonry-style grid
// Images: <img loading="lazy">
// Videos: thumbnail with play button overlay
// Click: opens GalleryLightbox
```

### 5.7 `GalleryLightbox.tsx`

```tsx
type GalleryLightboxProps = {
  item: GalleryItem | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}
// Full-screen overlay: bg-garage-black/95
// Images: full-size
// Videos: <video controls autoPlay>
// Close: backdrop click or Escape key
// Navigate: arrow keys or prev/next buttons
```

### 5.8 `ReviewCard.tsx`

```tsx
type ReviewCardProps = {
  review: Review
}
// Card with:
// - Star rating (filled/empty stars in garage-chrome)
// - Review text (truncated to 4 lines)
// - Reviewer name
// - Review date (formatted)
```

### 5.9 `GoogleReviews.tsx`

Orchestrator component — handles API call, loading, fallback, and rendering.

```tsx
// 1. Calls useGoogleReviews(placeId, apiKey)
// 2. Shows Spinner while loading
// 3. Renders ReviewCard for each review
// 4. Shows "Powered by Google" attribution
// 5. If from fallback: no attribution shown
// 6. Shows average star rating + total count above cards
```

---

## 6. Pages

### 6.1 `HomePage.tsx`

```tsx
// Data: publicService.getSiteConfig(), getHeroData(),
//       getServices(), getPlans(), getTrainers(), getAchievements()
// All fetched in parallel via Promise.all on mount

const [siteConfig, heroData, services, plans, trainers, achievements] =
  await Promise.all([
    publicService.getSiteConfig(),
    publicService.getHeroData(),
    publicService.getServices(),
    publicService.getPlans(),
    publicService.getTrainers(),
    publicService.getAchievements(),
  ])

// Sections (in order):
<HeroSection />            // Slideshow + headline + CTAs + stats
<AboutSnippet />           // Short intro + link to /about
<SectionWrapper dark>
  <ServicesPreview />      // Top 4 services (slice first 4)
</SectionWrapper>
<StatsBand />              // Full-width dark stats
<PlansSection />           // All 8 plan cards
<TrainersPreview />        // Trainer cards
<SectionWrapper dark>
  <GoogleReviews />        // Live reviews + fallback
</SectionWrapper>
<AchievementsSection />    // Awards list
<GalleryPreview />         // 6-item grid + "View All" link
<ContactCTA />             // Chrome banner + CTA buttons
```

### 6.2 `AboutPage.tsx`

```tsx
// Data: publicService.getSiteConfig(), getHeroData() (stats), getTrainers()
<PageWrapper title="About — Fitness Garage" ...>
  <HeroPageBanner title="ABOUT / US" />
  <AboutStorySection />    // story + about image
  <MissionSection />       // tagline + mission text
  <StatsBand />            // reused stats
  <TrainersGrid />         // all trainers
</PageWrapper>
```

### 6.3 `ServicesPage.tsx`

```tsx
// Data: publicService.getServices()
<PageWrapper title="Services — Fitness Garage" ...>
  <HeroPageBanner title="OUR / SERVICES" />
  <ServicesGrid />         // all 8 services in responsive grid
</PageWrapper>
```

### 6.4 `PlansPage.tsx`

```tsx
// Data: publicService.getPlans()
<PageWrapper title="Membership Plans — Fitness Garage" ...>
  <HeroPageBanner title="MEMBERSHIP / PLANS" />
  <PlansGrid />            // 2×4 grid — tier rows, duration columns
  <ContactNote />          // "Not sure? Contact us" CTA
</PageWrapper>
```

### 6.5 `TrainersPage.tsx`

```tsx
// Data: publicService.getTrainers()
<PageWrapper title="Our Trainers — Fitness Garage" ...>
  <HeroPageBanner title="OUR / TRAINERS" />
  <TrainersGrid />         // all trainers
</PageWrapper>
```

### 6.6 `GalleryPage.tsx`

```tsx
// Data: publicService.getGallery()
// Local state: activeFilter ('all' | 'gallery' | 'transformations' | 'video')
// Local state: lightboxItem (GalleryItem | null)
<PageWrapper title="Gallery — Fitness Garage" ...>
  <HeroPageBanner title="OUR / GALLERY" />
  <GalleryFilter />        // tab buttons
  <GalleryGrid />          // filtered items
  <GalleryLightbox />      // rendered if lightboxItem !== null
</PageWrapper>
```

### 6.7 `TestimonialsPage.tsx`

```tsx
// Data: useGoogleReviews hook
<PageWrapper title="Member Reviews — Fitness Garage" ...>
  <HeroPageBanner title="WHAT MEMBERS / SAY" />
  <GoogleReviews />        // full reviews grid (no limit)
</PageWrapper>
```

### 6.8 `ContactPage.tsx`

```tsx
// Data: publicService.getSiteConfig()
<PageWrapper title="Contact — Fitness Garage" ...>
  <HeroPageBanner title="CONTACT / US" />
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    <ContactInfo />        // address, phone, email, hours + Maps embed
    <ContactForm />        // Google Form <iframe>
  </div>
</PageWrapper>
```

### 6.9 `NotFoundPage.tsx`

```tsx
// Static — no data fetch
// "404 / PAGE NOT FOUND"
// Link back to Home
```

---

## 7. Types

```typescript
// types/site.ts
export type SiteConfig = {
  gym_name: string
  tagline: string
  about_story: string
  address: string
  phone: string
  email: string
  google_maps_embed_url: string
  google_form_url: string
  google_place_id: string
  opening_hours: string
}

// types/service.ts
export type Service = {
  id: string
  name: string
  slug: string
  description: string | null
  icon_filename: string
}

// types/plan.ts
export type MembershipTier = 'basic' | 'pt'
export type MembershipDuration = 'monthly' | 'quarterly' | 'half_yearly' | 'annual'
export type Plan = {
  id: string
  tier: MembershipTier
  duration: MembershipDuration
  price: number
  description: string | null
}

// types/trainer.ts
export type Trainer = {
  id: string
  name: string
  slug: string
  specialization: string
  experience_years: number
  certifications: string[]
  bio: string | null
  photo_filename: string
  display_order: number
}

// types/gallery.ts
export type GalleryItem = {
  id: string
  folder: 'gallery' | 'transformations'
  filename: string
  media_type: 'image' | 'video'
  caption: string | null
  display_order: number
}

// types/review.ts
export type Review = {
  id: string
  reviewer_name: string
  review_text: string | null
  rating: number           // 1–5
  review_date: string      // ISO date string
}

// types/achievement.ts
export type Achievement = {
  id: string
  label: string
  value: string | null
  display_order: number
}

// types/hero.ts
export type HeroSlide = {
  filename: string
  media_type: 'image' | 'video'
  alt: string
}
export type HeroStat = { value: string; label: string }
export type CTAButton = { label: string; href: string; variant: 'primary' | 'secondary' | 'ghost' }
export type HeroData = {
  slideshow_interval_ms: number
  slides: HeroSlide[]
  headline_before: string
  headline_after: string
  cta_buttons: CTAButton[]
  stats: HeroStat[]
}
```

---

## 8. Custom Hooks

### `useScrollReveal.ts`

```typescript
// Attaches IntersectionObserver to a ref
// Adds 'revealed' class when element enters viewport
// CSS handles the animation:
//   .reveal-target { opacity: 0; transform: translateY(20px); transition: all 500ms ease; }
//   .revealed      { opacity: 1; transform: translateY(0); }
// @media (prefers-reduced-motion) .revealed { transition: none; }

export const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => { /* IntersectionObserver logic */ }, [threshold])
  return ref
}
```

### `useMediaQuery.ts`

```typescript
export const useMediaQuery = (query: string): boolean
// Usage: const isMobile = useMediaQuery('(max-width: 768px)')
```

### `useGoogleReviews.ts`

```typescript
export const useGoogleReviews = (placeId: string, apiKey: string) => {
  return { reviews: Review[], loading: boolean, fromCache: boolean }
}
// sessionStorage cache key: 'fg_reviews_cache'
// Falls back to publicService.getFallbackReviews() on API error
```

### `useDebounce.ts`

```typescript
export const useDebounce = <T>(value: T, delay = 400): T
// Retained for gallery search if added later — YAGNI for now
```

---

## 9. Utility Functions

### `buildAssetUrl.ts`

```typescript
// Phase 1: /assets/<folder>/<filename>
// Phase 2: swap to Supabase Storage URL (one line)
export const buildAssetUrl = (folder: string, filename: string): string =>
  `/assets/${folder}/${filename}`
```

### `formatDate.ts`

```typescript
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
// → "01 Aug 2026"
```

### `formatCurrency.ts`

```typescript
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
// → "₹1,500.00"
// Used in PlanCard
```

---

## 10. Routes

```typescript
// src/constants/routes.ts
export const ROUTES = {
  HOME:          '/',
  ABOUT:         '/about',
  SERVICES:      '/services',
  PLANS:         '/plans',
  TRAINERS:      '/trainers',
  GALLERY:       '/gallery',
  TESTIMONIALS:  '/testimonials',
  CONTACT:       '/contact',
} as const

// Reserved for Phase 2 (not built yet):
// MEMBER_LOGIN:     '/login',
// ADMIN_LOGIN:      '/admin/login',
// MEMBER_DASHBOARD: '/member/dashboard',
// ADMIN_DASHBOARD:  '/admin/dashboard',
```

---

## 11. Environment Variables

```env
# frontend/.env.example
VITE_GOOGLE_PLACES_API_KEY=<domain-restricted-key>
VITE_GOOGLE_PLACE_ID=<fitness-garage-place-id>
```

Both variables are used only in `useGoogleReviews.ts`. No other env vars needed for Phase 1.

---

## 12. Content Update Workflow

Developer workflow for any content change:

```
1. Edit the relevant src/data/*.json file
2. If adding a new asset:
   → Add file to public/assets/<section>/
   → Update the JSON data file with the new filename
3. git add . && git commit -m "content(<section>): update <what changed>"
4. git push origin main
5. Vercel auto-deploys → live in < 2 minutes
```

**Examples:**

| Change | Files to edit |
|---|---|
| Update membership price | `src/data/plans.json` |
| Add a new trainer | `src/data/trainers.json` + `public/assets/trainers/<slug>.jpg` |
| Add hero slide | `src/data/hero.json` + `public/assets/hero/<filename>` |
| Add gallery photo | `src/data/gallery.json` + `public/assets/gallery/<filename>` |
| Update gym phone/address | `src/data/site.json` |
| Add a new service | `src/data/services.json` + `public/assets/services/<slug>.svg` |
| Update about story | `src/data/site.json` → `about_story` field |

---

## 13. SEO Implementation

All SEO requirements from `08_SEO_Strategy_Fitness_Garage.md` apply unchanged.

`PageWrapper.tsx` injects per-page:
- `<title>`, `<meta name="description">`, `<link rel="canonical">`
- Open Graph tags, Twitter Card tags
- `BreadcrumbList` JSON-LD (inner pages)

`index.html` contains:
- `GymOrSportsClub` JSON-LD schema (static — populated from `site.json` at build via Vite env injection)
- Google Fonts `preconnect`
- Hero first slide `<link rel="preload">`

`public/robots.txt` and `public/sitemap.xml` — static files, committed to repo.

---

## 14. Responsive Breakpoints

| Breakpoint | Width | Layout |
|---|---|---|
| Default (mobile-first) | < 640px | Single column |
| `sm` | 640px | 2-column grids begin |
| `md` | 768px | Wider grids, sidebar layouts |
| `lg` | 1024px | 3-column grids |
| `xl` | 1280px | Max site width |

All components are mobile-first. Desktop styles added via `md:` and `lg:` prefixes.

---

*End of Frontend Component Architecture Document — Fitness Garage v2.0 (Static Website)*
