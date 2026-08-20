# Ponytail Audit — Repository Over-Engineering & Complexity Report

> **Date:** 2026-08-20  
> **Scope:** Full repository audit (`.`) for over-engineering in Phase 1 (Static Web Application)  
> **Rule:** Over-engineering, dead code, premature abstractions, and unused dependencies only.

---

## 1. Executive Summary

Fitness Garage is currently in **Phase 1 (Static Web Application)**, designed as a pure static React + TypeScript frontend driven by local JSON files (`src/data/*.json`) and static media assets. 

However, the codebase currently contains extensive premature implementations for **Phase 2 (Member Portal & Admin Dashboard)**, unused UI components, unreferenced custom hooks, duplicate utility functions, and unnecessary runtime dependencies (`zustand`, `axios`) that are not needed for a static web application.

---

## 2. Ranked Findings (Biggest Cut First)

1. `delete:` 10 Phase 2 Admin dashboard pages (Members, Payments, Plans, Services, Trainers, Gallery, Stats, Settings, Import, Dashboard) bundled into Phase 1 static frontend. Replacement: nothing (defer to Phase 2 branch/milestone). [`frontend/src/pages/admin/` (2,311 lines)]
2. `delete:` 3 Phase 2 Member portal pages (Dashboard, MembershipStatus, PaymentHistory) bundled into Phase 1 static frontend. Replacement: nothing. [`frontend/src/pages/member/` (759 lines)]
3. `delete:` 2 Phase 2 Auth login pages (MemberLoginPage, AdminLoginPage) with simulated login and OTP flows. Replacement: nothing. [`frontend/src/pages/auth/` (515 lines)]
4. `delete:` 2 Phase 2 Axios API service clients (adminService with 25 endpoints, memberService with 3 endpoints). Replacement: nothing. [`frontend/src/services/adminService.ts`, `frontend/src/services/memberService.ts` (251 lines)]
5. `delete:` 2 Phase 2 Portal layout wrappers (AdminSidebar with navigation, MemberLayout with tabs). Replacement: nothing. [`frontend/src/components/layout/AdminSidebar.tsx`, `frontend/src/components/layout/MemberLayout.tsx` (196 lines)]
6. `delete:` 2 Phase 2 Form controls (FileUpload with drag-and-drop, SelectField) only used in admin dashboard. Replacement: nothing. [`frontend/src/components/forms/FileUpload.tsx`, `frontend/src/components/forms/SelectField.tsx` (167 lines)]
7. `delete:` Unused generic `Modal` dialog component with backdrop and escape key handlers. Replacement: nothing. [`frontend/src/components/common/Modal.tsx` (77 lines)]
8. `delete:` 2 Phase 2 Protected route guards (ProtectedAdminRoute, ProtectedMemberRoute) mounted in static router. Replacement: nothing. [`frontend/src/router/ProtectedAdminRoute.tsx`, `frontend/src/router/ProtectedMemberRoute.tsx` (64 lines)]
9. `yagni:` `zustand` global state stores (authStore for mock JWTs, siteConfigStore for static JSON). Replacement: native React state / direct `publicService` imports. [`frontend/src/store/authStore.ts`, `frontend/src/store/siteConfigStore.ts`, `frontend/package.json` (63 lines, -1 dep)]
10. `delete:` Unused `GalleryGrid` component bypassed by inline grid in GalleryPage. Replacement: nothing. [`frontend/src/features/gallery/GalleryGrid.tsx` (56 lines)]
11. `delete:` Unused `EmptyState` component with custom icon and action button slots. Replacement: nothing. [`frontend/src/components/common/EmptyState.tsx` (42 lines)]
12. `delete:` Unused `status.ts` membership status badge configuration utility. Replacement: nothing. [`frontend/src/utils/status.ts` (40 lines)]
13. `delete:` Unused `useScrollReveal` custom IntersectionObserver hook. Replacement: nothing. [`frontend/src/hooks/useScrollReveal.ts` (39 lines)]
14. `native:` `axios` HTTP client dependency and custom interceptor wrapper. Replacement: native `fetch`. [`frontend/src/services/api.ts`, `frontend/package.json` (36 lines, -1 dep)]
15. `delete:` Unused `useMediaQuery` custom window listener hook. Replacement: native Tailwind CSS responsive classes. [`frontend/src/hooks/useMediaQuery.ts` (31 lines)]
16. `delete:` Unused `HeroPageBanner` wrapper component. Replacement: `<SectionHeading />` directly. [`frontend/src/components/layout/HeroPageBanner.tsx` (28 lines)]
17. `delete:` Unused `SectionWrapper` container component. Replacement: native `<section>` tags. [`frontend/src/components/layout/SectionWrapper.tsx` (27 lines)]
18. `delete:` Unused `ErrorMessage` alert component with retry button. Replacement: nothing. [`frontend/src/components/common/ErrorMessage.tsx` (25 lines)]
19. `delete:` Unused `Divider` component with slash ornament. Replacement: native `<hr className="border-garage-mid" />`. [`frontend/src/components/common/Divider.tsx` (20 lines)]
20. `delete:` Unused `useDebounce` hook. Replacement: nothing. [`frontend/src/hooks/useDebounce.ts` (20 lines)]
21. `delete:` Unused `storage.ts` Supabase storage URL generator. Replacement: nothing (`buildAssetUrl` handles assets). [`frontend/src/utils/storage.ts` (9 lines)]
22. `shrink:` Redundant `getFallbackReviews` alias duplicating `getReviews` in Replaceable Service Layer. Replacement: single `getReviews` method. [`frontend/src/services/publicService.ts:L66-72` (-6 lines)]

---

## 3. Net Impact

- **Net Lines Eliminable:** ~4,776 lines
- **Net Dependencies Eliminable:** -2 (`axios`, `zustand`)
