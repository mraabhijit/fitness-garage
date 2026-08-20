# Frontend Component Architecture Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0  
**Date:** 2026-08-15  
**Status:** Finalized  
**Prepared for:** LLM Agent Handover

---

## 1. Overview

### 1.1 Stack
| Concern | Technology |
|---|---|
| Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| PDF Invoices | react-pdf |
| Linting | ESLint + Prettier |
| Hosting | Vercel (free tier) |

### 1.2 Design Principles Applied
| Principle | Implementation |
|---|---|
| **DRY** | Single shared component library — every UI element defined once, used everywhere |
| **SOLID** | Each component has one responsibility — no component renders, fetches, and manages state simultaneously |
| **KISS** | Zustand over Redux — minimal boilerplate, maximum clarity |
| **YAGNI** | No animation libraries, no UI kits — custom components only, built to the brand |
| **Extensible** | Token-based design system — swap brand colors or typography in one file |
| **Replaceable** | API service layer abstracted — swap Axios for fetch or another client without touching components |

---

## 2. Design System

### 2.1 Brand Design Brief

**Subject:** Fitness Garage — a real, local gym.
**Audience:** Prospective and existing gym members.
**Page's single job:** Communicate strength, credibility, and energy. Convert visitors into members.

### 2.2 Color Tokens

All colors defined as Tailwind CSS custom tokens in `tailwind.config.ts`. No hardcoded hex values in components — only token names.

```ts
// tailwind.config.ts
colors: {
  // Primary palette
  'garage-black':    '#1A1A1A',   // Near-black — page background
  'garage-dark':     '#2C2C2C',   // Dark grey — card/panel backgrounds
  'garage-mid':      '#3D3D3D',   // Mid grey — borders, dividers
  'garage-chrome':   '#D4AF37',   // Yellowish chrome — primary accent (CTAs, highlights)
  'garage-chrome-dim':'#A88A1C',  // Dimmed chrome — hover state
  'garage-white':    '#F0F0F0',   // Off-white — body text
  'garage-muted':    '#9A9A9A',   // Muted grey — secondary text, captions

  // Semantic
  'status-active':   '#22C55E',   // Green — active membership
  'status-expired':  '#EF4444',   // Red — expired membership
  'status-pending':  '#F59E0B',   // Amber — pending
}
```

### 2.3 Typography Tokens

Two typeface roles — defined in `index.css` via Google Fonts imports:

| Role | Font | Usage |
|---|---|---|
| **Display** | `Bebas Neue` | Hero headings, section titles, stat numbers — bold, condensed, punchy |
| **Body** | `Inter` | Body copy, labels, navigation, form fields — clean and legible |

```css
/* index.css */
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'Bebas Neue', sans-serif;
  --font-body:    'Inter', sans-serif;
}
```

**Type Scale (Tailwind custom):**

```ts
fontSize: {
  'display-xl': ['6rem',  { lineHeight: '1',    letterSpacing: '0.02em' }], // Hero headline
  'display-lg': ['4rem',  { lineHeight: '1.05', letterSpacing: '0.02em' }], // Section headings
  'display-md': ['2.5rem',{ lineHeight: '1.1',  letterSpacing: '0.02em' }], // Card headings
  'display-sm': ['1.5rem',{ lineHeight: '1.2',  letterSpacing: '0.02em' }], // Subheadings
  'body-lg':    ['1.125rem',{ lineHeight: '1.7' }],
  'body-md':    ['1rem',    { lineHeight: '1.6' }],
  'body-sm':    ['0.875rem',{ lineHeight: '1.5' }],
  'label':      ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.1em' }], // Uppercase labels
}
```

### 2.4 Spacing & Layout Tokens

```ts
// Max content width
maxWidth: {
  'site': '1280px',
}

// Section vertical rhythm
spacing: {
  'section': '6rem',      // Top/bottom padding for all page sections
  'section-sm': '3rem',   // Mobile section padding
}
```

### 2.5 Signature Design Element

**The Chrome Slash** — A diagonal yellow-chrome slash (`/`) used as a visual separator between the display word and its context. Appears in the hero headline, section titles, and stat labels. Example:

```
PUSH /  BEYOND
YOUR LIMITS
```

This single element makes every heading instantly recognisable as Fitness Garage without additional decoration. It is implemented as a `<span className="text-garage-chrome">/</span>` inline element — zero dependency, fully replaceable.

### 2.6 Animation Principles

- **Bold and energetic** — purposeful, not decorative
- **Scroll-triggered reveals:** Sections fade + slide up on scroll using `IntersectionObserver` — no animation library dependency
- **Hero slideshow:** CSS `transition` for crossfade between slides — no library
- **Hover states:** Scale + brightness shift on cards and buttons — CSS only
- **Reduced motion:** All animations respect `prefers-reduced-motion` media query
- **No ambient or looping animations** — keeps the site feeling fast and professional

---

## 3. Project Structure

```
frontend/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── assets/
│   │   └── logo.svg                     # Fitness Garage logo
│   ├── components/                       # Reusable component library
│   │   ├── common/                       # Atomic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── SectionLabel.tsx          # Uppercase chrome label above headings
│   │   │   ├── SectionHeading.tsx        # Display font heading with chrome slash
│   │   │   ├── StatBlock.tsx             # Single stat number + label
│   │   │   ├── EmptyState.tsx
│   │   │   └── ErrorMessage.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── PageWrapper.tsx           # Consistent page padding + SEO meta
│   │   │   ├── SectionWrapper.tsx        # Section padding + scroll reveal
│   │   │   └── AdminSidebar.tsx
│   │   └── forms/
│   │       ├── FormField.tsx             # Label + Input + Error wrapper
│   │       ├── SelectField.tsx
│   │       ├── TextareaField.tsx
│   │       └── FileUpload.tsx
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── ServicesPage.tsx
│   │   │   ├── PlansPage.tsx
│   │   │   ├── TrainersPage.tsx
│   │   │   ├── GalleryPage.tsx
│   │   │   ├── TestimonialsPage.tsx
│   │   │   └── ContactPage.tsx
│   │   ├── auth/
│   │   │   ├── MemberLoginPage.tsx
│   │   │   └── AdminLoginPage.tsx
│   │   ├── member/
│   │   │   ├── MemberDashboardPage.tsx
│   │   │   ├── MembershipStatusPage.tsx
│   │   │   └── PaymentHistoryPage.tsx
│   │   └── admin/
│   │       ├── AdminDashboardPage.tsx
│   │       ├── MembersPage.tsx
│   │       ├── MemberDetailPage.tsx
│   │       ├── MemberImportPage.tsx
│   │       ├── PaymentsPage.tsx
│   │       ├── PlansAdminPage.tsx
│   │       ├── ServicesAdminPage.tsx
│   │       ├── TrainersAdminPage.tsx
│   │       ├── GalleryAdminPage.tsx
│   │       ├── StatsAdminPage.tsx
│   │       └── SettingsPage.tsx
│   ├── features/                         # Feature-scoped components (not reusable globally)
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
│   │   ├── reviews/
│   │   │   └── ReviewCard.tsx
│   │   ├── auth/
│   │   │   ├── EmailPasswordForm.tsx
│   │   │   ├── MagicLinkForm.tsx
│   │   │   └── PhoneOtpForm.tsx
│   │   ├── members/
│   │   │   ├── MemberTable.tsx
│   │   │   ├── MemberForm.tsx
│   │   │   └── MemberImportForm.tsx
│   │   └── payments/
│   │       ├── PaymentTable.tsx
│   │       └── PaymentForm.tsx
│   ├── hooks/                            # Custom React hooks
│   │   ├── useScrollReveal.ts            # IntersectionObserver scroll animations
│   │   ├── useMediaQuery.ts              # Responsive breakpoint detection
│   │   └── useDebounce.ts                # Input debounce for search
│   ├── services/                         # Axios API call abstractions
│   │   ├── api.ts                        # Axios instance + interceptors
│   │   ├── publicService.ts              # Public endpoint calls
│   │   ├── memberService.ts              # Member endpoint calls
│   │   └── adminService.ts               # Admin endpoint calls
│   ├── store/                            # Zustand global state
│   │   ├── authStore.ts                  # Auth state (user, role, JWT)
│   │   ├── siteConfigStore.ts            # Cached site config
│   │   └── adminStore.ts                 # Admin UI state (filters, pagination)
│   ├── types/                            # TypeScript interfaces
│   │   ├── auth.ts
│   │   ├── member.ts
│   │   ├── payment.ts
│   │   ├── plan.ts
│   │   ├── trainer.ts
│   │   ├── service.ts
│   │   ├── gallery.ts
│   │   ├── review.ts
│   │   └── siteConfig.ts
│   ├── utils/
│   │   ├── formatDate.ts
│   │   ├── formatCurrency.ts
│   │   ├── getMembershipStatus.ts        # Derives status color/label from expiry date
│   │   └── buildStorageUrl.ts            # Constructs Supabase Storage public URLs
│   ├── constants/
│   │   ├── routes.ts                     # All route path strings in one place
│   │   └── queryKeys.ts                  # React Query cache keys (if added later)
│   ├── router/
│   │   ├── index.tsx                     # Root router definition
│   │   ├── PublicRoute.tsx               # Passes through — no auth needed
│   │   ├── ProtectedMemberRoute.tsx      # Redirects to /login if not member
│   │   └── ProtectedAdminRoute.tsx       # Redirects to /admin/login if not admin
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.local                            # Gitignored
├── .env.example                          # Committed template
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Component Library

### 4.1 Common Components

#### `Button.tsx`
Single button component — all variants driven by props. No separate ButtonPrimary, ButtonSecondary files.

```tsx
type ButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
  type?: 'button' | 'submit'
  children: React.ReactNode
}

// Variant styles (Tailwind classes):
// primary:   bg-garage-chrome text-garage-black hover:bg-garage-chrome-dim font-semibold
// secondary: border border-garage-chrome text-garage-chrome hover:bg-garage-chrome/10
// ghost:     text-garage-white hover:text-garage-chrome
// danger:    bg-red-600 text-white hover:bg-red-700
```

#### `SectionHeading.tsx`
Renders the display-font heading with the Chrome Slash signature element.

```tsx
type SectionHeadingProps = {
  label?: string     // Uppercase label above heading e.g. "OUR SERVICES"
  before: string     // Text before the slash e.g. "WHAT WE"
  after: string      // Text after the slash e.g. "OFFER"
  align?: 'left' | 'center'
}

// Output:
// <p class="label text-garage-chrome tracking-widest">OUR SERVICES</p>
// <h2 class="display-lg">
//   WHAT WE <span class="text-garage-chrome">/</span> OFFER
// </h2>
```

#### `StatBlock.tsx`
Renders a single stat number + label for the hero stats bar and achievements.

```tsx
type StatBlockProps = {
  value: string    // e.g. "200+"
  label: string    // e.g. "Members"
}
```

#### `Badge.tsx`
Status badge for membership status display.

```tsx
type BadgeProps = {
  status: 'active' | 'expired' | 'pending' | 'suspended'
}

// active:    bg-status-active/20 text-status-active
// expired:   bg-status-expired/20 text-status-expired
// pending:   bg-status-pending/20 text-status-pending
// suspended: bg-garage-mid text-garage-muted
```

#### `Card.tsx`
Base card wrapper used by ServiceCard, TrainerCard, PlanCard.

```tsx
type CardProps = {
  hover?: boolean       // Enables scale + brightness hover effect
  children: React.ReactNode
  className?: string
}
// Base: bg-garage-dark border border-garage-mid rounded-lg p-6
// Hover: transition-transform hover:scale-[1.02] hover:brightness-110
```

#### `Modal.tsx`
Accessible modal dialog for forms and confirmations.

```tsx
type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}
// Backdrop: bg-garage-black/80 backdrop-blur-sm
// Panel: bg-garage-dark border border-garage-mid rounded-xl
```

---

### 4.2 Layout Components

#### `Navbar.tsx`
Responsive navigation bar. Collapses to hamburger on mobile.

```
Desktop:
┌──────────────────────────────────────────────────────────────┐
│ [LOGO]   Home  About  Services  Plans  Trainers  Gallery     │
│                                    [Contact]  [Member Login] │
└──────────────────────────────────────────────────────────────┘

Mobile:
┌──────────────────────────────────────────────────────────────┐
│ [LOGO]                                              [☰ MENU] │
└──────────────────────────────────────────────────────────────┘
```

- Fixed at top, dark background (`bg-garage-black/95 backdrop-blur`)
- Active link highlighted in `text-garage-chrome`
- "Member Login" renders as a `Button` (`variant="secondary"`)
- "Contact" renders as a `Button` (`variant="primary"`)
- Mobile menu: full-screen overlay with slide-down animation

#### `Footer.tsx`
Site footer with gym info, quick links, and social links (if added later).

```
┌──────────────────────────────────────────────────────────────┐
│  FITNESS GARAGE          Quick Links        Contact          │
│  [tagline]               Home               [phone]         │
│                          Services           [email]         │
│                          Plans              [address]       │
│                          Trainers                           │
│  ─────────────────────────────────────────────────────────  │
│  © 2026 Fitness Garage. All rights reserved.               │
└──────────────────────────────────────────────────────────────┘
```

#### `PageWrapper.tsx`
Wraps every page. Injects SEO meta tags per page, enforces consistent outer padding.

```tsx
type PageWrapperProps = {
  title: string           // <title> tag
  description: string     // <meta name="description">
  ogImage?: string        // Open Graph image URL
  children: React.ReactNode
}
```

#### `SectionWrapper.tsx`
Wraps every page section. Applies vertical rhythm and scroll reveal animation.

```tsx
type SectionWrapperProps = {
  id?: string             // Anchor link target
  dark?: boolean          // bg-garage-dark vs transparent
  children: React.ReactNode
  className?: string
}
// Applies IntersectionObserver via useScrollReveal hook
// Animates: opacity 0→1, translateY 20px→0, duration 500ms
```

#### `AdminSidebar.tsx`
Left sidebar navigation for all admin pages.

```
┌──────────────────┐
│  FITNESS GARAGE  │
│  Admin Panel     │
│  ─────────────   │
│  Dashboard       │
│  Members         │
│  Payments        │
│  Plans           │
│  Services        │
│  Trainers        │
│  Gallery         │
│  Stats           │
│  Settings        │
│  ─────────────   │
│  [Logout]        │
└──────────────────┘
```

---

## 5. Page Specifications

### 5.1 Public Pages

---

#### `HomePage.tsx`
Composed of section components in order:

```
<HeroSection />             → Full-screen slideshow + headline + CTA buttons + stats bar
<AboutSnippet />            → Short gym intro + link to About page
<ServicesSection />         → Grid of ServiceCard components (top 4 featured)
<StatsSection />            → Full-width dark band with 4 stat blocks
<PlansSection />            → Membership plan cards (all 8 combinations)
<TrainersSection />         → Horizontal scroll trainer cards (mobile) / grid (desktop)
<TestimonialsSection />     → Google Reviews carousel
<AchievementsSection />     → Achievements list
<GallerySnippet />          → 6-image preview grid + "View All" link
<ContactCTA />              → Chrome banner with "Join Now" and "Contact Us" buttons
```

**Hero Section Detail:**
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Background Slideshow — crossfade, 5s interval]            │
│  [Dark overlay: bg-garage-black/60]                         │
│                                                              │
│       PUSH /                                                 │
│       BEYOND YOUR LIMITS                                     │
│                                                              │
│       [View Plans]    [Join Now]    [Contact]                │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│  200+        5+           5+         100+                    │
│  Members     Years        Trainers   Transformations         │
└──────────────────────────────────────────────────────────────┘
```

- Images/videos pulled from `assets/hero/` Supabase Storage folder
- Slideshow managed in `HeroSlideshow.tsx` — cycles through all files in folder
- Stats pulled from `site_config` via `publicService.getSiteConfig()`
- CTA buttons: View Plans → `/plans`, Join Now → `/contact`, Contact → `/contact`

---

#### `AboutPage.tsx`
```
<PageWrapper title="About — Fitness Garage">
  <HeroPageBanner />          → Page title banner (reused across all inner pages)
  <AboutStorySection />       → Gym story text + about image from assets/about/
  <MissionSection />          → Mission/values — pulled from site_config
  <StatsSection />            → Same stats bar as home page (reused component)
  <TrainersSection />         → Full trainer grid
</PageWrapper>
```

---

#### `ServicesPage.tsx`
```
<PageWrapper title="Services — Fitness Garage">
  <HeroPageBanner />
  <ServicesGrid />            → All 8 services in a responsive grid
                                Each card: icon from assets/services/ + name + description
</PageWrapper>
```

---

#### `PlansPage.tsx`
```
<PageWrapper title="Membership Plans — Fitness Garage">
  <HeroPageBanner />
  <PlansGrid />               → 2×4 grid (tier rows × duration columns)
  <PlansCompareNote />        → "Not sure which plan? Contact us." CTA
</PageWrapper>
```

---

#### `TrainersPage.tsx`
```
<PageWrapper title="Our Trainers — Fitness Garage">
  <HeroPageBanner />
  <TrainersGrid />            → All active trainers in responsive grid
                                Each card: photo from assets/trainers/ + profile details
</PageWrapper>
```

---

#### `GalleryPage.tsx`
```
<PageWrapper title="Gallery — Fitness Garage">
  <HeroPageBanner />
  <GalleryFilter />           → Tab: All | Gym | Transformations | Videos
  <GalleryGrid />             → Masonry-style image/video grid
  <GalleryLightbox />         → Full-screen lightbox on item click
</PageWrapper>
```

---

#### `TestimonialsPage.tsx`
```
<PageWrapper title="What Members Say — Fitness Garage">
  <HeroPageBanner />
  <ReviewsGrid />             → Grid of ReviewCard components (all visible reviews)
  <GoogleReviewsBadge />      → "Reviews powered by Google" attribution
</PageWrapper>
```

---

#### `ContactPage.tsx`
```
<PageWrapper title="Contact — Fitness Garage">
  <HeroPageBanner />
  <ContactLayout />           → Two-column layout:
    Left:  Gym info (address, phone, email) + Google Maps embed
    Right: Embedded Google Form iframe
</PageWrapper>
```

---

### 5.2 Auth Pages

#### `MemberLoginPage.tsx`
Three-tab login interface:

```
┌──────────────────────────────────────────────────────┐
│              FITNESS GARAGE MEMBER LOGIN             │
│                                                      │
│  [Email & Password]  [Magic Link]  [Phone OTP]      │
│  ─────────────────────────────────────────────────── │
│  {Active tab form renders here}                      │
│                                                      │
│  Not a member? → Contact the gym to join.           │
└──────────────────────────────────────────────────────┘
```

- Tab state managed locally via `useState` — not in Zustand (YAGNI)
- Each tab renders a separate feature form component:
  - `EmailPasswordForm.tsx` — email + password fields + submit
  - `MagicLinkForm.tsx` — email field + "Send Link" button
  - `PhoneOtpForm.tsx` — phone field → OTP field (two-step)
- On success: JWT stored in `authStore`, redirect to `/member/dashboard`

#### `AdminLoginPage.tsx`
Simple email + password form. Separate route and separate page from member login.

```
┌──────────────────────────────────────────────────────┐
│           FITNESS GARAGE ADMIN LOGIN                 │
│                                                      │
│  Email ________________________________              │
│  Password _____________________________              │
│                                                      │
│  [Sign In]                                           │
└──────────────────────────────────────────────────────┘
```

---

### 5.3 Member Portal Pages

All member pages share a `MemberLayout` wrapper — slim top navbar with logout + member name.

#### `MemberDashboardPage.tsx`
```
┌──────────────────────────────────────────────────────┐
│  Welcome back, [Name]                                │
│                                                      │
│  ┌────────────────────┐  ┌────────────────────────┐ │
│  │ Membership Status  │  │ Next Payment Due        │ │
│  │ [ACTIVE badge]     │  │ [expiry date]           │ │
│  │ Basic — Monthly    │  │                         │ │
│  └────────────────────┘  └────────────────────────┘ │
│                                                      │
│  Recent Payments                                     │
│  [Last 3 payments with download links]               │
│  [View All Payments →]                               │
└──────────────────────────────────────────────────────┘
```

#### `MembershipStatusPage.tsx`
Full membership details — plan, tier, duration, start date, expiry, status badge.

#### `PaymentHistoryPage.tsx`
Paginated table of all payments. Each row has a "Download Invoice" button that calls `memberService.getInvoiceUrl(paymentId)` and opens the signed PDF URL in a new tab.

---

### 5.4 Admin Pages

All admin pages share `AdminLayout` — `AdminSidebar` + main content area.

Refer to the **Admin Dashboard Specification Document** for full admin page details.

---

## 6. Routing Architecture

### 6.1 Route Definitions (`router/index.tsx`)

All route path strings are defined in `constants/routes.ts` and imported — no hardcoded strings in JSX.

```tsx
// constants/routes.ts
export const ROUTES = {
  HOME:              '/',
  ABOUT:             '/about',
  SERVICES:          '/services',
  PLANS:             '/plans',
  TRAINERS:          '/trainers',
  GALLERY:           '/gallery',
  TESTIMONIALS:      '/testimonials',
  CONTACT:           '/contact',
  MEMBER_LOGIN:      '/login',
  ADMIN_LOGIN:       '/admin/login',
  MEMBER_DASHBOARD:  '/member/dashboard',
  MEMBER_MEMBERSHIP: '/member/membership',
  MEMBER_PAYMENTS:   '/member/payments',
  ADMIN_DASHBOARD:   '/admin/dashboard',
  ADMIN_MEMBERS:     '/admin/members',
  ADMIN_MEMBER_NEW:  '/admin/members/new',
  ADMIN_MEMBER_DETAIL: '/admin/members/:id',
  ADMIN_MEMBER_IMPORT: '/admin/members/import',
  ADMIN_PAYMENTS:    '/admin/payments',
  ADMIN_PLANS:       '/admin/plans',
  ADMIN_SERVICES:    '/admin/services',
  ADMIN_TRAINERS:    '/admin/trainers',
  ADMIN_GALLERY:     '/admin/gallery',
  ADMIN_STATS:       '/admin/stats',
  ADMIN_SETTINGS:    '/admin/settings',
} as const
```

### 6.2 Route Guards

```tsx
// router/ProtectedMemberRoute.tsx
// Reads authStore — if no JWT or role !== member/admin/dev → redirect to /login
const ProtectedMemberRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to={ROUTES.MEMBER_LOGIN} replace />
  if (!['member','admin','dev'].includes(user.role)) return <Navigate to={ROUTES.HOME} replace />
  return children
}

// router/ProtectedAdminRoute.tsx
// If no JWT or role !== admin/dev → redirect to /admin/login
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuthStore()
  if (!user) return <Navigate to={ROUTES.ADMIN_LOGIN} replace />
  if (!['admin','dev'].includes(user.role)) return <Navigate to={ROUTES.HOME} replace />
  return children
}
```

### 6.3 Code Splitting

Every page is lazy-loaded via `React.lazy()` — initial bundle only loads layout and router.

```tsx
// router/index.tsx
const HomePage        = lazy(() => import('../pages/public/HomePage'))
const AboutPage       = lazy(() => import('../pages/public/AboutPage'))
const MemberLoginPage = lazy(() => import('../pages/auth/MemberLoginPage'))
const AdminDashboard  = lazy(() => import('../pages/admin/AdminDashboardPage'))
// ... all pages lazy loaded

// Wrapped in <Suspense fallback={<Spinner />}>
```

---

## 7. State Management

### 7.1 Zustand Stores

#### `authStore.ts`
```ts
type AuthState = {
  user: {
    id: string
    role: 'member' | 'admin' | 'dev'
    name: string
  } | null
  jwt: string | null             // In-memory only — never localStorage
  setAuth: (user, jwt) => void
  clearAuth: () => void
}
```

- JWT stored **in memory only** — never `localStorage` or `sessionStorage` (XSS prevention)
- On page refresh: user must re-authenticate (Supabase session cookie handles this transparently)
- Axios interceptor reads `jwt` from store and injects `Authorization` header

#### `siteConfigStore.ts`
```ts
type SiteConfigState = {
  config: Record<string, string> | null
  setConfig: (config) => void
}
```
- Populated once on app load from `GET /public/site-config`
- Accessed throughout the public site without repeated API calls

#### `adminStore.ts`
```ts
type AdminState = {
  memberFilters: { status: string | null, search: string }
  paymentFilters: { memberId: string | null, fromDate: string | null, toDate: string | null }
  setMemberFilters: (filters) => void
  setPaymentFilters: (filters) => void
}
```
- Persists filter/pagination state while navigating between admin pages
- Cleared on logout

---

## 8. API Service Layer

### 8.1 Axios Instance (`services/api.ts`)

Single Axios instance with interceptors. DRY — all services import from here.

```ts
// services/api.ts
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // e.g. https://api.fitness-garage.com/api/v1
  timeout: 10000,
})

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const jwt = useAuthStore.getState().jwt
  if (jwt) config.headers.Authorization = `Bearer ${jwt}`
  return config
})

// Handle 401 globally — clear auth and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
```

### 8.2 Service Modules

Each service module groups related API calls. Components import from service modules — never from `api.ts` directly.

```ts
// services/publicService.ts
export const publicService = {
  getSiteConfig:   () => api.get('/public/site-config'),
  getHeroAssets:   () => api.get('/public/assets/hero'),
  getAboutAssets:  () => api.get('/public/assets/about'),
  getAchievements: () => api.get('/public/achievements'),
  getServices:     () => api.get('/public/services'),
  getPlans:        () => api.get('/public/plans'),
  getTrainers:     () => api.get('/public/trainers'),
  getGallery:      (params?) => api.get('/public/gallery', { params }),
  getReviews:      (params?) => api.get('/public/reviews', { params }),
}

// services/memberService.ts
export const memberService = {
  getMe:          () => api.get('/member/me'),
  getPayments:    (params?) => api.get('/member/payments', { params }),
  getInvoiceUrl:  (paymentId) => api.get(`/member/payments/${paymentId}/invoice`),
}

// services/adminService.ts
export const adminService = {
  // Members
  getMembers:     (params?) => api.get('/admin/members', { params }),
  getMember:      (id) => api.get(`/admin/members/${id}`),
  createMember:   (data) => api.post('/admin/members', data),
  updateMember:   (id, data) => api.put(`/admin/members/${id}`, data),
  deleteMember:   (id) => api.delete(`/admin/members/${id}`),
  importMembers:  (file) => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/admin/members/import', form)
  },

  // Payments
  getPayments:    (params?) => api.get('/admin/payments', { params }),
  createPayment:  (data) => api.post('/admin/payments', data),
  getInvoiceUrl:  (id) => api.get(`/admin/payments/${id}/invoice`),

  // Plans
  getPlans:       () => api.get('/admin/plans'),
  updatePlan:     (id, data) => api.put(`/admin/plans/${id}`, data),

  // Services
  getServices:    () => api.get('/admin/services'),
  createService:  (data) => api.post('/admin/services', data),
  updateService:  (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService:  (id) => api.delete(`/admin/services/${id}`),

  // Trainers
  getTrainers:    () => api.get('/admin/trainers'),
  createTrainer:  (data) => api.post('/admin/trainers', data),
  updateTrainer:  (id, data) => api.put(`/admin/trainers/${id}`, data),
  deleteTrainer:  (id) => api.delete(`/admin/trainers/${id}`),

  // Gallery
  getGallery:     () => api.get('/admin/gallery'),
  createGallery:  (data) => api.post('/admin/gallery', data),
  updateGallery:  (id, data) => api.put(`/admin/gallery/${id}`, data),
  deleteGallery:  (id) => api.delete(`/admin/gallery/${id}`),

  // Site Config
  getSiteConfig:  () => api.get('/admin/site-config'),
  updateSiteConfig: (updates) => api.put('/admin/site-config', { updates }),

  // Achievements
  getAchievements:  () => api.get('/admin/achievements'),
  createAchievement:(data) => api.post('/admin/achievements', data),
  updateAchievement:(id, data) => api.put(`/admin/achievements/${id}`, data),
  deleteAchievement:(id) => api.delete(`/admin/achievements/${id}`),

  // Reviews
  getReviews:     () => api.get('/admin/reviews'),
  updateReview:   (id, data) => api.put(`/admin/reviews/${id}`, data),
  syncReviews:    () => api.post('/admin/reviews/sync'),
}
```

---

## 9. TypeScript Types

### 9.1 Core Types (`types/`)

```ts
// types/auth.ts
export type UserRole = 'member' | 'admin' | 'dev'
export type AuthUser = { id: string; role: UserRole; name: string }

// types/member.ts
export type MemberStatus = 'active' | 'expired' | 'pending' | 'suspended'
export type MembershipTier = 'basic' | 'pt'
export type MembershipDuration = 'monthly' | 'quarterly' | 'half_yearly' | 'annual'
export type Member = {
  id: string
  full_name: string
  email_address: string | null
  phone_number: string | null
  membership_plan: Plan | null
  status: MemberStatus
  start_date: string
  expiry_date: string
  imported: boolean
  notes?: string
  created_at: string
}

// types/payment.ts
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other'
export type Payment = {
  id: string
  member: { id: string; full_name: string }
  membership_plan: Plan | null
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  invoice_url: string | null
  notes?: string
}

// types/plan.ts
export type Plan = {
  id: string
  tier: MembershipTier
  duration: MembershipDuration
  price: number
  description: string | null
  is_active: boolean
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
  photo_url: string | null
  display_order: number
  is_active: boolean
}

// types/review.ts
export type Review = {
  id: string
  reviewer_name: string
  review_text: string | null
  rating: number
  review_date: string
  is_visible?: boolean
}
```

---

## 10. Utility Functions

### `buildStorageUrl.ts`
Constructs Supabase Storage public URL from folder and filename. DRY — called wherever an asset URL is needed.

```ts
const STORAGE_BASE = import.meta.env.VITE_SUPABASE_STORAGE_URL
// e.g. https://<project>.supabase.co/storage/v1/object/public

export const buildStorageUrl = (folder: string, filename: string): string =>
  `${STORAGE_BASE}/${folder}/${filename}`

// Usage:
// buildStorageUrl('assets/trainers', 'trainer-one.jpg')
// → https://xxx.supabase.co/storage/v1/object/public/assets/trainers/trainer-one.jpg
```

### `getMembershipStatus.ts`
Derives display label and color from expiry date — keeps status logic in one place.

```ts
export const getMembershipStatus = (expiryDate: string): MemberStatus => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  if (expiry < today) return 'expired'
  return 'active'
}
```

### `formatDate.ts`
```ts
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
// → "01 Aug 2026"
```

### `formatCurrency.ts`
```ts
export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
// → "₹1,500.00"
```

---

## 11. Custom Hooks

### `useScrollReveal.ts`
Attaches IntersectionObserver to a ref. No animation library dependency.

```ts
export const useScrollReveal = (threshold = 0.15) => {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('revealed') },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return ref
}
// CSS: .revealed { opacity: 1; transform: translateY(0); transition: all 500ms ease; }
// Initial: opacity: 0; transform: translateY(20px);
// Respects prefers-reduced-motion via CSS media query on .revealed
```

### `useMediaQuery.ts`
```ts
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])
  return matches
}
// Usage: const isMobile = useMediaQuery('(max-width: 768px)')
```

### `useDebounce.ts`
```ts
export const useDebounce = <T>(value: T, delay = 400): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
// Usage: const debouncedSearch = useDebounce(searchInput, 400)
```

---

## 12. SEO Implementation

### 12.1 Per-Page Meta via `PageWrapper.tsx`

Every page passes unique `title` and `description` to `PageWrapper`, which injects:

```tsx
<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImage ?? defaultOgImage} />
<meta property="og:type" content="website" />
<link rel="canonical" href={canonicalUrl} />
```

### 12.2 Structured Data

`LocalBusiness` schema injected in `index.html` as a static JSON-LD script. Populated from environment variables at build time.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GymOrSportsClub",
  "name": "Fitness Garage",
  "address": { "@type": "PostalAddress", "streetAddress": "TBD" },
  "telephone": "TBD",
  "url": "https://fitness-garage.com",
  "openingHours": "Mo-Su 06:00-22:00"
}
</script>
```

### 12.3 `robots.txt` and `sitemap.xml`

Static files in `/public/`. Sitemap lists all public page URLs. Admin and member routes excluded.

---

## 13. Environment Variables

```
# frontend/.env.example

VITE_API_BASE_URL=https://api.fitness-garage.com/api/v1
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SUPABASE_STORAGE_URL=https://<project>.supabase.co/storage/v1/object/public
VITE_GOOGLE_MAPS_API_KEY=<key>
```

---

## 14. Responsive Breakpoints

Tailwind default breakpoints used throughout:

| Breakpoint | Width | Layout change |
|---|---|---|
| `sm` | 640px | Stack mobile-first single column |
| `md` | 768px | 2-column grids appear |
| `lg` | 1024px | 3-column grids, sidebar layouts |
| `xl` | 1280px | Max site width reached |

All components are mobile-first. Desktop styles added via `md:` and `lg:` prefixes.

---

*End of Frontend Component Architecture Document — Fitness Garage v1.0*
