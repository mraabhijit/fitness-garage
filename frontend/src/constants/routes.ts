export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PLANS: '/plans',
  TRAINERS: '/trainers',
  GALLERY: '/gallery',
  TESTIMONIALS: '/testimonials',
  CONTACT: '/contact',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
