export type PlanTier = 'basic' | 'pt'

export type PlanDuration = 'monthly' | 'quarterly' | 'half_yearly' | 'annual'

export interface MembershipPlan {
  id: string
  tier: PlanTier
  duration: PlanDuration
  price: number
  description: string | null
  features?: string[]
  badge?: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Trainer {
  id: string
  name: string
  slug: string
  specialization: string
  experience_years: number
  certifications: string[]
  bio: string | null
  photo_filename: string | null
  photo_url?: string | null
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Service {
  id: string
  name: string
  slug: string
  description: string | null
  icon_filename: string | null
  icon_url?: string | null
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface GalleryItem {
  id: string
  folder?: 'gallery' | 'transformations' | string
  folder_path?: 'assets/gallery' | 'assets/transformations' | string
  filename?: string
  file_name?: string
  media_type: 'image' | 'video'
  caption: string | null
  url?: string | null
  display_order?: number
  is_active?: boolean
  uploaded_by?: string | null
  created_at?: string
  updated_at?: string
}

export interface Review {
  id: string
  google_review_id?: string
  reviewer_name: string
  review_text: string | null
  rating: number
  review_date: string
  last_synced_at?: string
  is_visible?: boolean
  created_at?: string
  updated_at?: string
}

export interface Achievement {
  id: string
  label: string
  value: string | null
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface SiteConfig {
  gym_name: string
  tagline: string
  about_story: string
  address: string
  phone: string
  email: string
  google_maps_embed_url: string
  google_maps_place_url?: string
  google_form_url: string
  google_place_id: string
  opening_hours: string
  [key: string]: string | undefined
}

export interface HeroSlide {
  filename: string
  media_type: 'image' | 'video'
  alt: string
}

export interface HeroStat {
  value: string
  label: string
}

export interface CTAButton {
  label: string
  href: string
  variant: 'primary' | 'secondary' | 'ghost'
}

export interface HeroData {
  slideshow_interval_ms: number
  slides: HeroSlide[]
  headline_before: string
  headline_after: string
  cta_buttons: CTAButton[]
  stats: HeroStat[]
}
