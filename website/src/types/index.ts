// Shared types for Iroto Realty website

export interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  hero_image?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location_id?: string;
  location?: Location;
  category_id?: string;
  category?: PropertyCategory;
  property_type: 'rental' | 'sale';
  price?: number;
  currency: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  featured_image?: string;
  video_url?: string;
  amenities?: Record<string, any>;
  contact_info?: Record<string, any>;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images?: PropertyImage[];
  reviews?: Review[];
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  property_id: string;
  reviewer_name: string;
  review_text: string;
  rating: number;
  is_approved: boolean;
  created_at: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}