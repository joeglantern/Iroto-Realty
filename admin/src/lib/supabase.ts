import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types - Updated to match our new schema
export interface Property {
  id: string
  title: string
  slug: string
  description?: string
  property_info_1?: string
  property_info_2?: string
  category_id?: string
  property_type_text?: string // Free text field for property type
  specific_location?: string
  listing_type: 'rental' | 'sale' | 'both'
  rental_price?: number
  sale_price?: number
  currency: string
  bedrooms?: number
  beds?: number
  max_guests?: number
  hero_image_path?: string
  video_url?: string
  amenities: string[] // JSON array of amenities
  meta_title?: string
  meta_description?: string
  focus_keyword?: string
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  is_active: boolean
  published_at?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
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

export interface PropertyType {
  id: string
  name: string
  slug: string
  is_active: boolean
  created_at: string
}

export interface PropertyImage {
  id: string
  property_id: string
  image_path: string
  alt_text?: string
  sort_order: number
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image_path?: string
  category_id?: string
  author_name: string
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
  created_by?: string
  updated_by?: string
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
  admin_notes?: string
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
  created_by?: string
  updated_by?: string
}

export interface TravelSection {
  id: string
  page_type: 'pre_arrival' | 'getting_there'
  title: string
  content: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Helper function to get storage URL
export function getStorageUrl(bucket: string, path: string): string {
  if (!path) return ''
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

// Helper function to upload file to storage with timeout handling
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ data: any; error: any }> {
  const uploadPromise = supabase.storage.from(bucket).upload(path, file);

  // Add timeout to file upload
  try {
    const result = await Promise.race([
      uploadPromise,
      new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error(`File upload timed out after 60 seconds for ${file.name}`)), 60000)
      )
    ]);
    return result;
  } catch (error) {
    return { data: null, error };
  }
}

// Helper function to delete file from storage
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ data: any; error: any }> {
  return await supabase.storage.from(bucket).remove([path])
}