# SEO Strategy Document
## Fitness Garage — Full Stack Gym Website

**Version:** 1.0
**Date:** 2026-08-15
**Status:** Finalized
**Prepared for:** LLM Agent Handover

---

## 1. Overview

### 1.1 SEO Objective
Fitness Garage is a single-location, physical gym. The primary SEO goal is **local search visibility** — appearing at the top of Google results when someone nearby searches for a gym, personal trainer, or fitness class. Secondary goal is brand presence — when someone searches "Fitness Garage" directly, the website must appear first.

### 1.2 SEO Scope
| In Scope | Out of Scope |
|---|---|
| On-page SEO (meta, headings, content) | Paid advertising (Google Ads) |
| Local SEO (schema, Google Business) | Link building campaigns |
| Technical SEO (performance, sitemap, robots) | Social media SEO |
| Open Graph (social sharing) | Multilingual SEO |
| Core Web Vitals optimization | Blog / content marketing |

### 1.3 Design Principles Applied
| Principle | Implementation |
|---|---|
| **KISS** | No SEO plugins or complex tooling — clean HTML, meta tags, JSON-LD |
| **DRY** | SEO meta injected via single `PageWrapper` component — defined once |
| **Extensible** | Schema markup structured to add new entity types (classes, events) without refactoring |
| **YAGNI** | No automated rank tracking, no A/B testing tools at launch |

---

## 2. Target Keywords

### 2.1 Primary Keywords
These are the highest-priority search terms. Location placeholder `[City]` to be replaced with the gym's actual city before launch.

| Keyword | Intent | Target Page |
|---|---|---|
| `gym in [City]` | Local — find a gym | Home |
| `fitness gym [City]` | Local — find a gym | Home |
| `personal trainer [City]` | Local — hire a trainer | Trainers |
| `gym membership [City]` | Local — join a gym | Plans |
| `fitness classes [City]` | Local — find classes | Services |
| `weight loss gym [City]` | Local — specific goal | Services |
| `zumba classes [City]` | Local — specific class | Services |
| `kids dance classes [City]` | Local — kids activity | Services |
| `Fitness Garage` | Brand | Home |
| `Fitness Garage [City]` | Brand + local | Home |

### 2.2 Secondary Keywords
Supporting keywords for inner pages:

| Keyword | Target Page |
|---|---|
| `gym near me` | Home (geo-targeted) |
| `affordable gym [City]` | Plans |
| `best gym [City]` | Home |
| `strength training [City]` | Services |
| `nutrition coaching [City]` | Services |
| `cardio gym [City]` | Services |
| `gym trainers [City]` | Trainers |
| `group fitness classes [City]` | Services |
| `gym membership plans [City]` | Plans |
| `gym transformation [City]` | Gallery / Home |

### 2.3 Long-Tail Keywords
High-intent, low-competition — valuable for local businesses:

| Keyword | Target Page |
|---|---|
| `best personal trainer in [City]` | Trainers |
| `gym with personal training [City]` | Plans |
| `monthly gym membership [City]` | Plans |
| `annual gym membership [City]` | Plans |
| `weight loss personal trainer [City]` | Trainers / Services |
| `kids fitness classes [City]` | Services |

---

## 3. On-Page SEO

### 3.1 Page Title Tags

Title tags follow the pattern: `[Page Topic] — Fitness Garage, [City]`
Max 60 characters to avoid truncation in SERPs.

| Page | Title Tag |
|---|---|
| Home | `Fitness Garage — Gym in [City]` |
| About | `About Us — Fitness Garage, [City]` |
| Services | `Gym Services & Classes — Fitness Garage, [City]` |
| Plans | `Gym Membership Plans & Pricing — Fitness Garage` |
| Trainers | `Our Personal Trainers — Fitness Garage, [City]` |
| Gallery | `Gym Gallery — Fitness Garage, [City]` |
| Testimonials | `Member Reviews — Fitness Garage, [City]` |
| Contact | `Contact Us — Fitness Garage, [City]` |

### 3.2 Meta Descriptions

Compelling, action-oriented descriptions. Max 155 characters.

| Page | Meta Description |
|---|---|
| Home | `Fitness Garage — [City]'s premier gym offering personal training, group classes, zumba, kids dance, and more. Join today.` |
| About | `Learn the story behind Fitness Garage — a [City] gym built for real results. Meet our team and discover our mission.` |
| Services | `Explore our full range of fitness services — personal training, weight loss, strength, cardio, zumba, and kids dance in [City].` |
| Plans | `Flexible gym memberships for every goal — Basic and Personal Training plans, monthly to annual. No hidden fees.` |
| Trainers | `Meet the expert trainers at Fitness Garage, [City]. Certified professionals in personal training, strength, zumba, and nutrition.` |
| Gallery | `See inside Fitness Garage — gym facilities, transformations, and events in [City].` |
| Testimonials | `Real reviews from Fitness Garage members in [City]. See what our community says about training with us.` |
| Contact | `Find Fitness Garage in [City]. Get directions, contact details, and send us an enquiry today.` |

### 3.3 Heading Hierarchy

Every page must follow a strict heading hierarchy — one `H1` per page, supporting `H2` and `H3` for sections.

| Page | H1 | H2 Examples |
|---|---|---|
| Home | `The Only Gym You Need in [City]` | `Our Services`, `Membership Plans`, `What Members Say` |
| About | `About Fitness Garage` | `Our Story`, `Our Mission` |
| Services | `Our Fitness Services` | `Personal Training`, `Zumba`, `Kids Dance` |
| Plans | `Gym Membership Plans` | `Basic Membership`, `Personal Training` |
| Trainers | `Meet Our Trainers` | Individual trainer names as H2 |
| Gallery | `Fitness Garage Gallery` | `Gym Facilities`, `Transformations` |
| Testimonials | `What Our Members Say` | Reviewer names or star ratings as H3 |
| Contact | `Contact Fitness Garage` | `Find Us`, `Send an Enquiry` |

**Rules:**
- `H1` contains the primary keyword for that page
- Service names (`Personal Training`, `Zumba`, `Kids Dance`) are always `H2` or `H3`
- Never skip heading levels (no jumping from H1 to H3)
- No heading used purely for styling — use CSS classes instead

### 3.4 Image ALT Text

Every image must have descriptive `alt` text containing relevant keywords where natural.

| Image | ALT Text Pattern |
|---|---|
| Hero slideshow | `alt="Fitness Garage gym floor — [City]"` |
| Trainer photos | `alt="[Trainer Name], personal trainer at Fitness Garage [City]"` |
| Service icons | `alt="[Service Name] at Fitness Garage"` |
| Gallery images | `alt="[Description] at Fitness Garage, [City]"` |
| Transformation | `alt="Member transformation at Fitness Garage [City]"` |
| Logo | `alt="Fitness Garage logo"` |
| About image | `alt="Inside Fitness Garage gym, [City]"` |

**Rules:**
- No keyword stuffing — ALT text describes the image naturally
- No `alt=""` on content images — only decorative images use empty alt
- `buildStorageUrl` utility generates src; ALT text is defined in DB (`caption` field for gallery, hardcoded for trainer/service images)

### 3.5 URL Structure

Clean, descriptive, hyphenated URLs. No query strings on public pages.

| Page | URL |
|---|---|
| Home | `https://fitnessgarage.com/` |
| About | `https://fitnessgarage.com/about` |
| Services | `https://fitnessgarage.com/services` |
| Plans | `https://fitnessgarage.com/plans` |
| Trainers | `https://fitnessgarage.com/trainers` |
| Gallery | `https://fitnessgarage.com/gallery` |
| Testimonials | `https://fitnessgarage.com/testimonials` |
| Contact | `https://fitnessgarage.com/contact` |

**Rules:**
- All lowercase, hyphens only — no underscores, no camelCase
- No trailing slashes except root `/`
- Member and admin routes (`/member/**`, `/admin/**`) excluded from sitemap and `noindexed`

---

## 4. Technical SEO

### 4.1 Canonical URLs

Every public page declares a self-referencing canonical URL to prevent duplicate content.

```tsx
// In PageWrapper.tsx — injected per page
<link rel="canonical" href={`https://fitnessgarage.com${pathname}`} />
```

### 4.2 robots.txt

Placed in `/public/robots.txt`. Allows all public pages, blocks all member and admin routes.

```txt
User-agent: *
Allow: /
Allow: /about
Allow: /services
Allow: /plans
Allow: /trainers
Allow: /gallery
Allow: /testimonials
Allow: /contact

Disallow: /member/
Disallow: /admin/
Disallow: /login
Disallow: /api/

Sitemap: https://fitnessgarage.com/sitemap.xml
```

### 4.3 Sitemap

Static `sitemap.xml` placed in `/public/sitemap.xml`. Updated manually when pages are added. Member and admin routes excluded.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>https://fitnessgarage.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://fitnessgarage.com/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://fitnessgarage.com/services</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://fitnessgarage.com/plans</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://fitnessgarage.com/trainers</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://fitnessgarage.com/gallery</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://fitnessgarage.com/testimonials</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://fitnessgarage.com/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

</urlset>
```

### 4.4 Meta Robots — Noindex on Protected Routes

All member and admin pages must be explicitly excluded from indexing.

```tsx
// ProtectedMemberRoute.tsx and ProtectedAdminRoute.tsx
// Inject noindex meta on all protected pages
<meta name="robots" content="noindex, nofollow" />
```

### 4.5 HTTPS

Enforced automatically by Vercel — no configuration required. All HTTP traffic is redirected to HTTPS at the CDN layer.

### 4.6 Trailing Slash Consistency

Vercel config enforces no trailing slashes on all URLs (except root):

```json
// vercel.json
{
  "trailingSlash": false,
  "cleanUrls": true
}
```

---

## 5. Structured Data (Schema Markup)

JSON-LD structured data is injected in `index.html` as static script tags. Values are populated from environment variables at Vite build time using `import.meta.env`.

### 5.1 GymOrSportsClub Schema

Primary schema — tells Google this is a gym business with a physical location.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GymOrSportsClub",
  "name": "Fitness Garage",
  "url": "https://fitnessgarage.com",
  "logo": "https://fitnessgarage.com/logo.svg",
  "image": "https://fitnessgarage.com/og-image.jpg",
  "description": "Fitness Garage is a full-service gym in [City] offering personal training, group classes, zumba, kids dance, nutrition coaching, and more.",
  "telephone": "[Phone Number]",
  "email": "[Email Address]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "postalCode": "[PIN Code]",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[Latitude]",
    "longitude": "[Longitude]"
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "06:00",
      "closes": "22:00"
    }
  ],
  "priceRange": "₹₹",
  "currenciesAccepted": "INR",
  "paymentAccepted": "Cash, Card, UPI",
  "amenityFeature": [
    { "@type": "LocationFeatureSpecification", "name": "Personal Training", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Group Classes", "value": true },
    { "@type": "LocationFeatureSpecification", "name": "Locker Room", "value": true }
  ],
  "sameAs": [
    "https://maps.google.com/?cid=[Google_Place_ID]"
  ]
}
</script>
```

### 5.2 LocalBusiness BreadcrumbList Schema

Breadcrumb schema for inner pages — helps Google understand site structure and display breadcrumbs in SERPs.

```html
<!-- Injected per page via PageWrapper.tsx -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://fitnessgarage.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "[Current Page Name]",
      "item": "https://fitnessgarage.com/[current-page]"
    }
  ]
}
</script>
```

Breadcrumb data is passed as a prop to `PageWrapper`:

```tsx
<PageWrapper
  title="Our Trainers — Fitness Garage, [City]"
  description="..."
  breadcrumbs={[{ name: 'Trainers', path: '/trainers' }]}
/>
```

### 5.3 ItemList Schema — Services Page

Helps Google display individual services in rich results.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Fitness Garage Services",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Service",
        "name": "Personal Training",
        "provider": { "@type": "GymOrSportsClub", "name": "Fitness Garage" },
        "areaServed": "[City]"
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Service",
        "name": "Zumba Classes",
        "provider": { "@type": "GymOrSportsClub", "name": "Fitness Garage" },
        "areaServed": "[City]"
      }
    }
    // ... one entry per active service, generated dynamically from services API
  ]
}
</script>
```

This schema is **dynamically generated** in `ServicesPage.tsx` using the services fetched from `GET /public/services`. As admin adds or removes services, the schema updates automatically.

### 5.4 Person Schema — Trainers Page

One `Person` schema block per trainer — helps Google surface trainer profiles in search.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Fitness Garage Trainers",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Person",
        "name": "[Trainer Name]",
        "jobTitle": "Personal Trainer",
        "worksFor": { "@type": "GymOrSportsClub", "name": "Fitness Garage" },
        "knowsAbout": ["[Specialization]"],
        "image": "[Trainer Photo URL]"
      }
    }
  ]
}
</script>
```

Dynamically generated from trainers fetched via `GET /public/trainers`.

### 5.5 Review Schema — Testimonials Page

Aggregated review schema — enables star ratings in Google SERPs.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GymOrSportsClub",
  "name": "Fitness Garage",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "[average_rating]",
    "reviewCount": "[total_reviews]",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "author": { "@type": "Person", "name": "[reviewer_name]" },
      "reviewBody": "[review_text]",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "[rating]",
        "bestRating": "5"
      },
      "datePublished": "[review_date]"
    }
  ]
}
</script>
```

Dynamically generated from visible reviews fetched via `GET /public/reviews`. Average rating and total count computed client-side.

---

## 6. Open Graph & Social Sharing

Open Graph tags ensure the website displays correctly when shared on WhatsApp, Facebook, Twitter/X, and other platforms.

### 6.1 Default OG Tags (injected in `index.html`)

```html
<meta property="og:site_name" content="Fitness Garage" />
<meta property="og:type" content="website" />
<meta property="og:locale" content="en_IN" />
```

### 6.2 Per-Page OG Tags (injected via `PageWrapper.tsx`)

```html
<meta property="og:title" content="[Page Title]" />
<meta property="og:description" content="[Page Meta Description]" />
<meta property="og:url" content="https://fitnessgarage.com/[page-path]" />
<meta property="og:image" content="[OG Image URL]" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="[Page Title] — Fitness Garage" />
```

### 6.3 Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="[Page Title]" />
<meta name="twitter:description" content="[Page Meta Description]" />
<meta name="twitter:image" content="[OG Image URL]" />
```

### 6.4 OG Image Specification

| Page | OG Image |
|---|---|
| Home | Hero image from `assets/hero/` — first slide |
| About | About section image from `assets/about/` |
| Services | Gym floor image or collage |
| Plans | Gym branding graphic |
| Trainers | Group trainer photo or collage |
| Gallery | Best gallery image |
| Testimonials | Member review graphic with star rating |
| Contact | Google Maps static image of location |
| Default fallback | `og-default.jpg` — placed in `/public/` |

**OG Image Requirements:**
- Dimensions: 1200 × 630px (standard)
- Format: JPG (smaller file size, universal support)
- Must not contain critical text (cropped on some platforms)
- Stored in `/public/` — served from Vercel CDN

---

## 7. Local SEO

### 7.1 Google Business Profile

The gym's Google Business Profile (GBP) is the single most important local SEO factor. It must be set up and verified separately from the website — this is an operational task for the gym owner, not a code task.

**GBP Setup Checklist (handover to gym owner):**
- [ ] Claim or create Google Business Profile at `business.google.com`
- [ ] Verify the listing (postcard or phone verification)
- [ ] Set business name exactly as: **Fitness Garage**
- [ ] Set primary category: **Gym**
- [ ] Set secondary categories: **Personal Trainer**, **Fitness Centre**
- [ ] Add complete address, phone, email, website URL
- [ ] Set opening hours accurately
- [ ] Upload high-quality photos (minimum 10): exterior, interior, equipment, trainers
- [ ] Enable the "Book" button if supported (future — when online booking is added)
- [ ] Add all services offered
- [ ] Enable Google Reviews — respond to all reviews (positive and negative)

### 7.2 NAP Consistency

NAP = **N**ame, **A**ddress, **P**hone. These must be **identical** across every online presence to build local authority.

| Platform | Must Match |
|---|---|
| Website (Contact page, footer, schema) | Fitness Garage, [Address], [Phone] |
| Google Business Profile | Exactly as above |
| Supabase `site_config` | Exactly as above |
| Any future directory listings | Exactly as above |

**This is enforced in code:** All contact information on the website is pulled from `site_config` — there is no hardcoded address or phone number anywhere in the frontend. Updating `site_config` updates the website, the schema, and the footer simultaneously.

### 7.3 Google Maps Embed

The Contact page embeds Google Maps using the iframe embed URL from `site_config.gym_maps_embed_url`. This signals to Google that the business has a verified physical location.

```tsx
// ContactPage.tsx
<iframe
  src={siteConfig.gym_maps_embed_url}
  width="100%"
  height="450"
  loading="lazy"
  allowFullScreen
  title="Fitness Garage location on Google Maps"
  referrerPolicy="no-referrer-when-downgrade"
/>
```

### 7.4 Google Reviews — Local SEO Signal

Auto-synced Google Reviews (via Places API) displayed on the website serve dual purpose:
1. **Conversion:** Social proof for website visitors
2. **Local SEO signal:** Fresh review content and high average rating improve local pack ranking

Reviews are refreshed every 24 hours — keeping the content fresh for Googlebot.

---

## 8. Core Web Vitals

Google uses Core Web Vitals as a ranking signal. Targets:

| Metric | Target | Strategy |
|---|---|---|
| **LCP** (Largest Contentful Paint) | < 2.5s | Hero image preloaded via `<link rel="preload">`, Supabase Storage CDN delivery |
| **CLS** (Cumulative Layout Shift) | < 0.1 | Image dimensions always declared, skeleton loaders prevent layout jumps |
| **FID / INP** (Interaction to Next Paint) | < 200ms | Minimal JS, code splitting, no heavy UI libraries |

### 8.1 Image Optimisation

```tsx
// All content images use lazy loading except above-the-fold hero
<img
  src={buildStorageUrl('assets/gallery', item.file_name)}
  alt={item.caption ?? 'Fitness Garage gallery'}
  loading="lazy"           // Below fold
  decoding="async"
  width={800}              // Always declare dimensions — prevents CLS
  height={600}
/>

// Hero first slide — preload to minimise LCP
<link rel="preload" as="image" href={heroSlides[0].url} />
```

### 8.2 Font Loading

```html
<!-- index.html — preconnect to Google Fonts to reduce latency -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />

<!-- Font loaded with display=swap — prevents invisible text during load -->
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

### 8.3 JavaScript Bundle

| Optimisation | Implementation |
|---|---|
| Code splitting | All pages lazy-loaded via `React.lazy()` |
| Tree shaking | Vite handles automatically |
| Tailwind purging | Vite + Tailwind removes unused CSS classes at build |
| No heavy UI library | Custom component library only |
| No jQuery | React only |

### 8.4 Vite Build Configuration

```ts
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          auth:   ['@supabase/supabase-js'],
          forms:  ['react-hook-form', 'zod'],
        }
      }
    }
  }
})
```

---

## 9. PageWrapper Implementation

Single component — all SEO metadata injected here. DRY — no scattered meta tags across pages.

```tsx
// components/layout/PageWrapper.tsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

type Breadcrumb = { name: string; path: string }

type PageWrapperProps = {
  title: string
  description: string
  ogImage?: string
  breadcrumbs?: Breadcrumb[]
  noindex?: boolean
  children: React.ReactNode
}

const SITE_URL = 'https://fitnessgarage.com'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`

const PageWrapper = ({
  title,
  description,
  ogImage,
  breadcrumbs,
  noindex = false,
  children,
}: PageWrapperProps) => {
  const { pathname } = useLocation()
  const canonicalUrl = `${SITE_URL}${pathname}`
  const ogImageUrl = ogImage ?? DEFAULT_OG_IMAGE

  useEffect(() => {
    document.title = title

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
      }
      el.setAttribute('href', href)
    }

    // Standard meta
    setMeta('description', description)
    setMeta('robots', noindex ? 'noindex, nofollow' : 'index, follow')
    setLink('canonical', canonicalUrl)

    // Open Graph
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:url', canonicalUrl, true)
    setMeta('og:image', ogImageUrl, true)
    setMeta('og:image:width', '1200', true)
    setMeta('og:image:height', '630', true)
    setMeta('og:image:alt', title, true)

    // Twitter
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', ogImageUrl)

    // Breadcrumb JSON-LD
    if (breadcrumbs && breadcrumbs.length > 0) {
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          ...breadcrumbs.map((b, i) => ({
            '@type': 'ListItem',
            position: i + 2,
            name: b.name,
            item: `${SITE_URL}${b.path}`,
          })),
        ],
      }
      let el = document.querySelector('#breadcrumb-schema')
      if (!el) {
        el = document.createElement('script')
        el.setAttribute('type', 'application/ld+json')
        el.setAttribute('id', 'breadcrumb-schema')
        document.head.appendChild(el)
      }
      el.textContent = JSON.stringify(schema)
    }
  }, [title, description, canonicalUrl, ogImageUrl, breadcrumbs, noindex])

  return <>{children}</>
}

export default PageWrapper
```

---

## 10. SEO Checklist for Agent

The following checklist must be completed before the website is considered SEO-ready for launch. Items marked `[CODE]` are implemented in the codebase. Items marked `[CLIENT]` require action from the gym owner.

### 10.1 Pre-Launch Code Checklist

| Task | Type | Status |
|---|---|---|
| `PageWrapper` injects title, description, canonical per page | CODE | To build |
| Unique title tag on every public page (≤ 60 chars) | CODE | To build |
| Unique meta description on every public page (≤ 155 chars) | CODE | To build |
| Single `H1` per page containing primary keyword | CODE | To build |
| All images have descriptive `alt` attributes | CODE | To build |
| `robots.txt` created and placed in `/public/` | CODE | To build |
| `sitemap.xml` created and placed in `/public/` | CODE | To build |
| `GymOrSportsClub` JSON-LD injected in `index.html` | CODE | To build |
| `BreadcrumbList` JSON-LD injected per inner page | CODE | To build |
| `ItemList` schema on Services page (dynamic) | CODE | To build |
| `Person` schema on Trainers page (dynamic) | CODE | To build |
| `Review` aggregate schema on Testimonials page (dynamic) | CODE | To build |
| Open Graph tags on all public pages | CODE | To build |
| Twitter Card tags on all public pages | CODE | To build |
| `noindex` on all member and admin routes | CODE | To build |
| Hero first slide preloaded (`<link rel="preload">`) | CODE | To build |
| All content images use `loading="lazy"` below fold | CODE | To build |
| All images declare `width` and `height` attributes | CODE | To build |
| Google Fonts loaded with `display=swap` | CODE | To build |
| `preconnect` to Google Fonts in `<head>` | CODE | To build |
| Vite manual chunk splitting configured | CODE | To build |
| Vercel `cleanUrls: true` and `trailingSlash: false` configured | CODE | To build |
| NAP information in footer and Contact page sourced from `site_config` | CODE | To build |
| Google Maps embed on Contact page | CODE | To build |

### 10.2 Pre-Launch Client Checklist

| Task | Type | Notes |
|---|---|---|
| Replace all `[City]` placeholders in title tags, descriptions, and schema | CLIENT | Via admin Settings page |
| Add gym address, phone, email to `site_config` via admin Settings | CLIENT | Populates footer, contact, schema |
| Add Google Maps embed URL to `site_config` | CLIENT | Go to Google Maps → Share → Embed |
| Add Google Place ID to `site_config` | CLIENT | Required for Reviews sync |
| Add Google Places API key to Render environment variables | CLIENT | Required for Reviews sync |
| Add OG default image (`og-default.jpg`) to `/public/` | CLIENT | 1200 × 630px JPG |
| Add page-specific OG images where applicable | CLIENT | Optional but recommended |
| Set up and verify Google Business Profile | CLIENT | `business.google.com` |
| Submit sitemap to Google Search Console | CLIENT | After domain is live |
| Verify website in Google Search Console | CLIENT | After domain is connected |
| Request Google to crawl the site | CLIENT | Via Search Console "URL Inspection" |

---

## 11. Post-Launch SEO Maintenance

Ongoing tasks for the gym owner after launch — no developer involvement needed:

| Task | Frequency | How |
|---|---|---|
| Respond to Google Reviews | Weekly | Via Google Business Profile |
| Upload new gallery images | Monthly | Supabase Storage → `assets/gallery/` |
| Update stats (members, trainers) | Quarterly | Admin Dashboard → Stats |
| Add new services if offered | As needed | Admin Dashboard → Services |
| Add new trainer profiles | As needed | Admin Dashboard → Trainers |
| Ensure NAP is consistent if phone/address changes | As needed | Admin Dashboard → Settings |

---

*End of SEO Strategy Document — Fitness Garage v1.0*
