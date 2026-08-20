export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PLANS: '/plans',
  TRAINERS: '/trainers',
  GALLERY: '/gallery',
  TESTIMONIALS: '/testimonials',
  CONTACT: '/contact',

  // Auth
  MEMBER_LOGIN: '/login',
  ADMIN_LOGIN: '/admin/login',

  // Member Portal
  MEMBER_DASHBOARD: '/member/dashboard',
  MEMBER_MEMBERSHIP: '/member/membership',
  MEMBER_PAYMENTS: '/member/payments',

  // Admin Dashboard
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MEMBERS: '/admin/members',
  ADMIN_MEMBER_NEW: '/admin/members/new',
  ADMIN_MEMBER_DETAIL: '/admin/members/:id',
  ADMIN_MEMBER_IMPORT: '/admin/members/import',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_PLANS: '/admin/plans',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_TRAINERS: '/admin/trainers',
  ADMIN_GALLERY: '/admin/gallery',
  ADMIN_STATS: '/admin/stats',
  ADMIN_SETTINGS: '/admin/settings',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
