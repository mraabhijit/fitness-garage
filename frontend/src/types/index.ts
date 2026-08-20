export type UserRole = 'member' | 'admin' | 'dev'

export type MembershipStatus = 'active' | 'expired' | 'pending' | 'suspended'

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other'

export type PlanTier = 'basic' | 'pt'

export type PlanDuration = 'monthly' | 'quarterly' | 'half_yearly' | 'annual'

export interface UserProfile {
  id: string
  email: string | null
  role: UserRole
}

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

export interface Member {
  id: string
  supabase_user_id: string | null
  full_name: string
  phone_number: string | null
  email_address: string | null
  membership_plan_id: string | null
  plan: MembershipPlan | null
  status: MembershipStatus
  start_date: string
  expiry_date: string
  imported: boolean
  notes: string | null
  created_at?: string
  updated_at?: string
}

export interface Payment {
  id: string
  member_id: string
  membership_plan_id: string | null
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  invoice_path: string | null
  notes: string | null
  recorded_by: string | null
  member_name?: string | null
  plan_name?: string | null
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
  google_form_url: string
  google_place_id: string
  opening_hours: string
  [key: string]: string
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

export interface SiteConfigItem {
  id: string
  config_key: string
  config_value: string
  description: string | null
  updated_at?: string
}

export interface ApiResponse<T> {
  data: T
  message: string
}

export interface PaginatedApiResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  next_cursor?: string | null
  message: string
}
