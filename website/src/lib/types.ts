// Database types for the website (read-only, simplified versions)
export interface Property {
  id: string
  title: string
  slug: string
  description?: string
  property_info_1?: string
  property_info_2?: string
  category_id?: string
  property_type_text?: string
  specific_location?: string
  listing_type: 'rental' | 'sale' | 'both'
  rental_price?: number
  sale_price?: number
  price_on_request?: boolean
  currency: string
  bedrooms?: number
  beds?: number
  max_guests?: number
  hero_image_path?: string
  video_url?: string
  amenities: string[]
  meta_title?: string
  meta_description?: string
  focus_keyword?: string
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  is_active: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  image_path: string
  alt_text?: string
  caption?: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface PropertyCategory {
  id: string
  name: string
  slug: string
  description?: string
  hero_image_path?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category_id?: string
  featured_image_path?: string
  author_name?: string
  author_bio?: string
  author_avatar_path?: string
  read_time?: string
  meta_title?: string
  meta_description?: string
  focus_keyword?: string
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
}

export interface Review {
  id: string
  property_id: string
  reviewer_name: string
  reviewer_email?: string
  reviewer_location?: string
  reviewer_avatar_path?: string
  rating: number
  title?: string
  comment: string
  stay_date?: string
  verified_stay: boolean
  status: 'pending' | 'approved' | 'rejected'
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}
