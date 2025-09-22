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

// Calculate relevance score for search results
function calculateRelevanceScore(property: Property, query: string): number {
  const searchTerm = query.toLowerCase();
  let score = 0;

  // Exact matches get highest scores
  if (property.title?.toLowerCase().includes(searchTerm)) score += 50;
  if (property.focus_keyword?.toLowerCase().includes(searchTerm)) score += 40;
  if (property.property_type_text?.toLowerCase().includes(searchTerm)) score += 35;
  if (property.specific_location?.toLowerCase().includes(searchTerm)) score += 30;
  
  // Partial matches get medium scores
  if (property.description?.toLowerCase().includes(searchTerm)) score += 25;
  if (property.meta_title?.toLowerCase().includes(searchTerm)) score += 20;
  if (property.property_info_1?.toLowerCase().includes(searchTerm)) score += 15;
  if (property.property_info_2?.toLowerCase().includes(searchTerm)) score += 15;
  if (property.meta_description?.toLowerCase().includes(searchTerm)) score += 10;

  // Boost for special properties
  if (property.is_featured) score += 20;
  if (property.video_url) score += 10;

  // Boost for newer properties
  const daysSinceCreated = (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceCreated < 30) score += 15;
  else if (daysSinceCreated < 90) score += 10;
  else if (daysSinceCreated < 180) score += 5;

  return score;
}

// Search function
export async function searchProperties(query: string, filters?: {
  listing_type?: 'rental' | 'sale' | 'both' | 'all'
  location?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  beds?: number
  max_guests?: number
  amenities?: string[]
  has_video?: boolean
  is_featured?: boolean
  created_after?: string
  created_before?: string
}): Promise<Property[]> {
  try {
    let supabaseQuery = supabase
      .from('properties')
      .select(`
        *,
        property_categories(name, slug),
        property_images(image_path, is_active)
      `)
      .eq('status', 'published')
      .eq('is_active', true)

    // Enhanced full-text search across multiple fields including SEO and meta fields
    if (query) {
      supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,specific_location.ilike.%${query}%,property_type_text.ilike.%${query}%,property_info_1.ilike.%${query}%,property_info_2.ilike.%${query}%,focus_keyword.ilike.%${query}%,meta_title.ilike.%${query}%,meta_description.ilike.%${query}%`)
    }

    // Listing type filter (unchanged - this works correctly)
    if (filters?.listing_type && filters.listing_type !== 'all') {
      supabaseQuery = supabaseQuery.in('listing_type', [filters.listing_type, 'both'])
    }

    // Location filter
    if (filters?.location) {
      supabaseQuery = supabaseQuery.ilike('specific_location', `%${filters.location}%`)
    }

    // Fixed price filtering logic - handle different listing types properly
    if (filters?.min_price || filters?.max_price) {
      if (filters?.listing_type === 'sale') {
        // Only filter by sale prices
        if (filters?.min_price) {
          supabaseQuery = supabaseQuery.gte('sale_price', filters.min_price)
        }
        if (filters?.max_price) {
          supabaseQuery = supabaseQuery.lte('sale_price', filters.max_price)
        }
      } else if (filters?.listing_type === 'rental') {
        // Only filter by rental prices
        if (filters?.min_price) {
          supabaseQuery = supabaseQuery.gte('rental_price', filters.min_price)
        }
        if (filters?.max_price) {
          supabaseQuery = supabaseQuery.lte('rental_price', filters.max_price)
        }
      } else {
        // No specific listing type or 'all' - need to check both price fields
        // This will include properties where EITHER rental_price OR sale_price meets criteria
        const priceConditions = [];
        
        if (filters?.min_price && filters?.max_price) {
          // Both min and max specified
          priceConditions.push(`and(rental_price.gte.${filters.min_price},rental_price.lte.${filters.max_price})`);
          priceConditions.push(`and(sale_price.gte.${filters.min_price},sale_price.lte.${filters.max_price})`);
        } else if (filters?.min_price) {
          // Only min specified
          priceConditions.push(`rental_price.gte.${filters.min_price}`);
          priceConditions.push(`sale_price.gte.${filters.min_price}`);
        } else if (filters?.max_price) {
          // Only max specified
          priceConditions.push(`rental_price.lte.${filters.max_price}`);
          priceConditions.push(`sale_price.lte.${filters.max_price}`);
        }
        
        if (priceConditions.length > 0) {
          supabaseQuery = supabaseQuery.or(priceConditions.join(','));
        }
      }
    }

    // Fixed bedroom filter - should be "X or more" not "exactly X"
    if (filters?.bedrooms) {
      supabaseQuery = supabaseQuery.gte('bedrooms', filters.bedrooms)
    }

    // Fixed beds filter - should be "X or more" not "exactly X"
    if (filters?.beds) {
      supabaseQuery = supabaseQuery.gte('beds', filters.beds)
    }

    // Max guests filter
    if (filters?.max_guests) {
      supabaseQuery = supabaseQuery.gte('max_guests', filters.max_guests)
    }

    // Amenities filter - check if property has the specified amenities
    if (filters?.amenities && filters.amenities.length > 0) {
      // For each amenity, check if it's contained in the amenities array
      const amenityConditions = filters.amenities.map(amenity => 
        `amenities.cs.{${amenity}}`
      );
      supabaseQuery = supabaseQuery.or(amenityConditions.join(','));
    }

    // Video filter - properties with or without videos
    if (filters?.has_video !== undefined) {
      if (filters.has_video) {
        supabaseQuery = supabaseQuery.not('video_url', 'is', null)
      } else {
        supabaseQuery = supabaseQuery.is('video_url', null)
      }
    }

    // Featured properties filter
    if (filters?.is_featured !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_featured', filters.is_featured)
    }

    // Date range filters
    if (filters?.created_after) {
      supabaseQuery = supabaseQuery.gte('created_at', filters.created_after)
    }
    
    if (filters?.created_before) {
      supabaseQuery = supabaseQuery.lte('created_at', filters.created_before)
    }

    // Get results first, then apply custom relevance scoring
    const { data, error } = await supabaseQuery

    if (error) {
      console.error('Error searching properties:', error)
      return []
    }

    // Apply relevance scoring if we have a search query
    if (query && data) {
      const scoredResults = data.map(property => ({
        ...property,
        relevanceScore: calculateRelevanceScore(property, query)
      }));

      // Sort by relevance score (highest first), then by featured status, then by date
      scoredResults.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        if (a.is_featured !== b.is_featured) {
          return b.is_featured ? 1 : -1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return scoredResults;
    }

    // If no search query, just sort by featured status and date
    if (data) {
      data.sort((a, b) => {
        if (a.is_featured !== b.is_featured) {
          return b.is_featured ? 1 : -1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return data || []
  } catch (error) {
    console.error('Error searching properties:', error)
    return []
  }
}

// Enhanced search suggestions with better matching and category integration
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<Property[]> {
  try {
    if (!query.trim()) return []

    // Search properties with enhanced field matching and category info
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        slug,
        specific_location,
        listing_type,
        rental_price,
        sale_price,
        currency,
        hero_image_path,
        property_type_text,
        focus_keyword,
        property_categories(name, description),
        property_images(image_path, is_active)
      `)
      .eq('status', 'published')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,specific_location.ilike.%${query}%,property_type_text.ilike.%${query}%,property_info_1.ilike.%${query}%,property_info_2.ilike.%${query}%,focus_keyword.ilike.%${query}%,meta_title.ilike.%${query}%,meta_description.ilike.%${query}%`)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching search suggestions:', error)
      return []
    }

    // Also search for properties by category names/descriptions that match the query
    const { data: categoryData, error: categoryError } = await supabase
      .from('property_categories')
      .select(`
        id,
        name,
        description,
        properties!inner(
          id,
          title,
          slug,
          specific_location,
          listing_type,
          rental_price,
          sale_price,
          currency,
          hero_image_path,
          property_type_text,
          focus_keyword,
          property_categories(name, description),
          property_images(image_path, is_active)
        )
      `)
      .eq('is_active', true)
      .eq('properties.status', 'published')
      .eq('properties.is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(Math.min(limit, 3))

    if (categoryError) {
      console.error('Error fetching category suggestions:', error)
    }

    // Combine and deduplicate results
    const allResults = [...(data || [])];
    const existingIds = new Set(allResults.map(p => p.id));

    // Add category-matched properties if they're not already included
    if (categoryData) {
      categoryData.forEach(cat => {
        if (cat.properties && Array.isArray(cat.properties)) {
          cat.properties.forEach((prop: any) => {
            if (!existingIds.has(prop.id) && allResults.length < limit) {
              allResults.push(prop);
              existingIds.add(prop.id);
            }
          });
        }
      });
    }

    return allResults.slice(0, limit) as unknown as Property[];
  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return []
  }
}

// Get search suggestions by category
export async function getCategorySuggestions(query: string, limit: number = 3): Promise<PropertyCategory[]> {
  try {
    if (!query.trim()) return []

    const { data, error } = await supabase
      .from('property_categories')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('sort_order', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching category suggestions:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching category suggestions:', error)
    return []
  }
}

// Get available amenities for filter options
export async function getAvailableAmenities(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('amenities')
      .eq('status', 'published')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching amenities:', error)
      return []
    }

    // Extract unique amenities from all properties
    const allAmenities = new Set<string>()
    data?.forEach(property => {
      if (property.amenities && Array.isArray(property.amenities)) {
        property.amenities.forEach(amenity => {
          if (amenity && typeof amenity === 'string') {
            allAmenities.add(amenity)
          }
        })
      }
    })

    return Array.from(allAmenities).sort()
  } catch (error) {
    console.error('Error fetching amenities:', error)
    return []
  }
}

// Get property statistics for filter ranges
export async function getPropertyStats(): Promise<{
  priceRange: { min: number; max: number }
  bedroomRange: { min: number; max: number }
  bedRange: { min: number; max: number }
  guestRange: { min: number; max: number }
}> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('rental_price, sale_price, bedrooms, beds, max_guests')
      .eq('status', 'published')
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching property stats:', error)
      return {
        priceRange: { min: 0, max: 100000 },
        bedroomRange: { min: 1, max: 10 },
        bedRange: { min: 1, max: 10 },
        guestRange: { min: 1, max: 20 }
      }
    }

    // Calculate ranges from actual data
    const prices: number[] = []
    const bedrooms: number[] = []
    const beds: number[] = []
    const guests: number[] = []

    data?.forEach(property => {
      if (property.rental_price) prices.push(property.rental_price)
      if (property.sale_price) prices.push(property.sale_price)
      if (property.bedrooms) bedrooms.push(property.bedrooms)
      if (property.beds) beds.push(property.beds)
      if (property.max_guests) guests.push(property.max_guests)
    })

    return {
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 100000
      },
      bedroomRange: {
        min: bedrooms.length > 0 ? Math.min(...bedrooms) : 1,
        max: bedrooms.length > 0 ? Math.max(...bedrooms) : 10
      },
      bedRange: {
        min: beds.length > 0 ? Math.min(...beds) : 1,
        max: beds.length > 0 ? Math.max(...beds) : 10
      },
      guestRange: {
        min: guests.length > 0 ? Math.min(...guests) : 1,
        max: guests.length > 0 ? Math.max(...guests) : 20
      }
    }
  } catch (error) {
    console.error('Error fetching property stats:', error)
    return {
      priceRange: { min: 0, max: 100000 },
      bedroomRange: { min: 1, max: 10 },
      bathroomRange: { min: 1, max: 10 },
      guestRange: { min: 1, max: 20 }
    }
  }
}