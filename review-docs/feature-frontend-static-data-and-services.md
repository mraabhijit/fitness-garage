# Ponytail Review — `feature/frontend/static-data-and-services`

> **Date:** 2026-08-20  
> **Branch:** `feature/frontend/static-data-and-services`  
> **Review Scope:** Implementation of Phase 1 Static Data Layer, Replaceable Service Layer, and Feature Components  
> **Status:** ✅ ALL FINDINGS RESOLVED / PASSING

---

## 1. Review Findings & Resolution Register

| # | File & Location | Finding / Critique | Resolution Status | Resolution Details |
|---|---|---|---|---|
| 1 | `HomePage.tsx:L104-118` | `shrink:` Inline duplicated service card markup. | ✅ Resolved | Replaced with `<ServiceCard />` primitive from `features/services/`. |
| 2 | `HomePage.tsx:L140-174` | `shrink:` Inline duplicated plan card markup. | ✅ Resolved | Replaced with `<PlanCard />` primitive from `features/plans/`. |
| 3 | `HomePage.tsx:L187-219` | `shrink:` Inline review fetching and card rendering. | ✅ Resolved | Replaced with `<GoogleReviews limit={3} />` orchestrator. |
| 4 | `PlansPage.tsx:L91-158` | `shrink:` Inline duplicated plan card markup. | ✅ Resolved | Replaced with `<PlanCard />` primitive from `features/plans/`. |
| 5 | `TrainersPage.tsx:L63-126` | `shrink:` Inline duplicated trainer card markup. | ✅ Resolved | Replaced with `<TrainerCard />` primitive from `features/trainers/`. |
| 6 | `TestimonialsPage.tsx:L11-109` | `shrink:` Redundant review fetching and schema markup. | ✅ Resolved | Replaced with `<GoogleReviews />` orchestrator. |
| 7 | `publicService.ts` | `native:` Async promises wrapping static JSON files. | ✅ Resolved | Implemented Replaceable Service Layer as single swap point. |
| 8 | `useGoogleReviews.ts` | `native:` Direct browser fetch with `sessionStorage` cache. | ✅ Resolved | Native implementation with 0 new dependencies. |

---

## 2. Net Code Reduction & Complexity Metric
- **Lines Removed:** ~210 lines of duplicated card and fetch markup across 4 public pages.
- **Lines Added (Modular & Reusable):** ~45 lines.
- **Net Result:** -165 lines eliminated across public pages while increasing modularity.
- **Unnecessary Dependencies:** 0 added.

---

## 3. Verification Gates
- [x] All 8 `src/data/*.json` files valid JSON and conform to schemas.
- [x] `plans.json` has exactly 8 plan combinations (`basic`/`pt` × 4 durations).
- [x] All asset directories created in `public/assets/` with `.gitkeep`.
- [x] Replaceable Service Layer in `publicService.ts` and `buildAssetUrl.ts` fully operational.
- [x] All 8 review findings resolved and verified.
