import siteData from '../data/site.json'
import heroData from '../data/hero.json'
import servicesData from '../data/services.json'
import plansData from '../data/plans.json'
import trainersData from '../data/trainers.json'
import galleryData from '../data/gallery.json'
import achievementsData from '../data/achievements.json'
import fallbackReviews from '../data/reviews.json'

import type {
  Achievement,
  GalleryItem,
  HeroData,
  MembershipPlan,
  Review,
  Service,
  SiteConfig,
  Trainer,
} from '../types'

/**
 * Replaceable Service Layer for public data.
 *
 * Phase 1 (Static): Loads content asynchronously from local version-controlled JSON data files.
 * Phase 2 (Backend Wired): Swap these implementations to make Axios calls to FastAPI endpoints.
 * Zero UI components or pages need to change.
 */
export const publicService = {
  async getSiteConfig(): Promise<SiteConfig> {
    return siteData as SiteConfig
  },

  async getHeroData(): Promise<HeroData> {
    return heroData as HeroData
  },

  async getServices(): Promise<Service[]> {
    return servicesData.services as Service[]
  },

  async getPlans(): Promise<MembershipPlan[]> {
    return plansData.plans as MembershipPlan[]
  },

  async getTrainers(): Promise<Trainer[]> {
    return trainersData.trainers as Trainer[]
  },

  async getGallery(folder?: string): Promise<GalleryItem[]> {
    const items = galleryData.items as GalleryItem[]
    if (!folder || folder === 'all') {
      return items
    }
    return items.filter(
      (item) =>
        item.folder === folder ||
        item.folder_path === folder ||
        item.folder_path === `assets/${folder}`
    )
  },

  async getAchievements(): Promise<Achievement[]> {
    return achievementsData.achievements as Achievement[]
  },

  async getReviews(): Promise<Review[]> {
    return fallbackReviews.reviews as Review[]
  },

  async getFallbackReviews(): Promise<Review[]> {
    return fallbackReviews.reviews as Review[]
  },

  async getReviewsSummary(): Promise<{ rating: number; total_reviews: number }> {
    return {
      rating: fallbackReviews.rating || 4.8,
      total_reviews: fallbackReviews.total_reviews || 108,
    }
  },
}
