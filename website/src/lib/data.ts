import { supabase } from './supabase'
import type { Property, PropertyImage, PropertyCategory, BlogPost, BlogCategory, Review } from './supabase'

// Properties data fetching functions
export async function getFeaturedProperties(limit: number = 6): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(*)
      `)
      .eq('status', 'published')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured properties:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching featured properties:', error)
    return []
  }
}

export async function getProperties(options?: {
  listing_type?: 'rental' | 'sale' | 'both'
  category?: string
  category_slug?: string
  location?: string
  limit?: number
  offset?: number
}): Promise<Property[]> {
  try {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_categories(name, slug, hero_image_path),
        property_images(*)
      `)
      .eq('status', 'published')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (options?.listing_type) {
      query = query.in('listing_type', [options.listing_type, 'both'])
    }

    if (options?.category) {
      query = query.eq('category_id', options.category)
    }

    if (options?.category_slug) {
      // First get the category ID by slug
      const { data: categoryData } = await supabase
        .from('property_categories')
        .select('id')
        .eq('slug', options.category_slug)
        .eq('is_active', true)
        .single();
      
      if (categoryData) {
        query = query.eq('category_id', categoryData.id)
      } else {
        // Return empty array if category not found
        return []
      }
    }

    if (options?.location) {
      query = query.ilike('specific_location', `%${options.location}%`)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching properties:', error)
    return []
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_categories(name, slug),
        property_images(*)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching property:', error)
    return null
  }
}

export async function getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  try {
    const { data, error } = await supabase
      .from('property_images')
      .select('*')
      .eq('property_id', propertyId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching property images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching property images:', error)
    return []
  }
}

// Reviews data fetching functions
export async function getFeaturedReviews(limit: number = 4): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        properties(title, slug)
      `)
      .eq('status', 'approved')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching featured reviews:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching featured reviews:', error)
    return []
  }
}

export async function getPropertyReviews(propertyId: string, limit: number = 10): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('property_id', propertyId)
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching property reviews:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching property reviews:', error)
    return []
  }
}

// Blog data fetching functions
export async function getBlogPosts(options?: {
  category?: string
  featured?: boolean
  limit?: number
  offset?: number
}): Promise<BlogPost[]> {
  try {
    let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name, slug)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (options?.category) {
      query = query.eq('category_id', options.category)
    }

    if (options?.featured) {
      query = query.eq('is_featured', true)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 10)) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(name, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching blog categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return []
  }
}

export async function getPropertyCategories(): Promise<PropertyCategory[]> {
  try {
    const { data, error } = await supabase
      .from('property_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Error fetching property categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching property categories:', error)
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<PropertyCategory | null> {
  try {
    const { data, error } = await supabase
      .from('property_categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

// Search function
export async function searchProperties(query: string, filters?: {
  listing_type?: 'rental' | 'sale' | 'both'
  location?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
}): Promise<Property[]> {
  try {
    let supabaseQuery = supabase
      .from('properties')
      .select(`
        *,
        property_categories(name, slug)
      `)
      .eq('status', 'published')
      .eq('is_active', true)

    // Full-text search on title, description, and location
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,specific_location.ilike.%${query}%`)
    }

    if (filters?.listing_type) {
      supabaseQuery = supabaseQuery.in('listing_type', [filters.listing_type, 'both'])
    }

    if (filters?.location) {
      supabaseQuery = supabaseQuery.ilike('specific_location', `%${filters.location}%`)
    }

    if (filters?.min_price) {
      if (filters.listing_type === 'sale') {
        supabaseQuery = supabaseQuery.gte('sale_price', filters.min_price)
      } else {
        supabaseQuery = supabaseQuery.gte('rental_price', filters.min_price)
      }
    }

    if (filters?.max_price) {
      if (filters.listing_type === 'sale') {
        supabaseQuery = supabaseQuery.lte('sale_price', filters.max_price)
      } else {
        supabaseQuery = supabaseQuery.lte('rental_price', filters.max_price)
      }
    }

    if (filters?.bedrooms) {
      supabaseQuery = supabaseQuery.eq('bedrooms', filters.bedrooms)
    }

    if (filters?.bathrooms) {
      supabaseQuery = supabaseQuery.eq('bathrooms', filters.bathrooms)
    }

    supabaseQuery = supabaseQuery.order('created_at', { ascending: false })

    const { data, error } = await supabaseQuery

    if (error) {
      console.error('Error searching properties:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error searching properties:', error)
    return []
  }
}