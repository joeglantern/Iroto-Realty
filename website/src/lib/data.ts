'use server'

import { sql } from './db'
import type { Property, PropertyImage, PropertyCategory, BlogPost, BlogCategory, Review } from './types'

const likePattern = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`

const allImages = sql`
  coalesce((select json_agg(pi order by pi.sort_order) from property_images pi where pi.property_id = p.id and pi.is_active = true), '[]'::json) as property_images`

const imagePathsOnly = sql`
  coalesce((select json_agg(json_build_object('image_path', pi.image_path, 'is_active', pi.is_active) order by pi.sort_order)
    from property_images pi where pi.property_id = p.id and pi.is_active = true), '[]'::json) as property_images`

const categoryNameSlug = sql`
  (select json_build_object('name', c.name, 'slug', c.slug) from property_categories c where c.id = p.category_id and c.is_active = true) as property_categories`

const publishedProperty = sql`p.status = 'published' and p.is_active = true`

const textMatch = (pattern: string) => sql`coalesce(
  p.title ilike ${pattern} or p.description ilike ${pattern} or p.specific_location ilike ${pattern}
  or p.property_type_text ilike ${pattern} or p.property_info_1 ilike ${pattern} or p.property_info_2 ilike ${pattern}
  or p.focus_keyword ilike ${pattern} or p.meta_title ilike ${pattern} or p.meta_description ilike ${pattern}, false)`

// Site image settings (admin-editable photos for homepage/about page)
export async function getSiteImages(): Promise<Record<string, string>> {
  try {
    const rows = await sql<{ setting_key: string; setting_value: string | null }[]>`
      select setting_key, setting_value from system_settings
      where category = 'site_images' and is_public = true`

    const map: Record<string, string> = {}
    rows.forEach(row => {
      if (row.setting_value) map[row.setting_key] = row.setting_value
    })
    return map
  } catch (error) {
    return {}
  }
}

// Properties data fetching functions
export async function getFeaturedProperties(limit: number = 6): Promise<Property[]> {
  try {
    return await sql<Property[]>`
      select p.*, ${allImages}
      from properties p
      where ${publishedProperty} and p.is_featured = true
      order by p.created_at desc
      limit ${limit}`
  } catch (error) {
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
    let categoryId = options?.category
    if (options?.category_slug) {
      const [category] = await sql<{ id: string }[]>`
        select id from property_categories where slug = ${options.category_slug} and is_active = true`
      if (!category) return []
      categoryId = category.id
    }

    const limit = options?.limit ?? (options?.offset ? 10 : null)

    return await sql<Property[]>`
      select p.*,
        (select json_build_object('name', c.name, 'slug', c.slug, 'hero_image_path', c.hero_image_path)
          from property_categories c where c.id = p.category_id and c.is_active = true) as property_categories,
        ${allImages}
      from properties p
      where ${publishedProperty}
        ${options?.listing_type ? sql`and p.listing_type in (${options.listing_type}, 'both')` : sql``}
        ${categoryId ? sql`and p.category_id = ${categoryId}` : sql``}
        ${options?.location ? sql`and p.specific_location ilike ${likePattern(options.location)}` : sql``}
      order by p.created_at desc
      ${limit ? sql`limit ${limit}` : sql``}
      ${options?.offset ? sql`offset ${options.offset}` : sql``}`
  } catch (error) {
    return []
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  try {
    const [property] = await sql<Property[]>`
      select p.*, ${categoryNameSlug}, ${allImages}
      from properties p
      where p.slug = ${slug} and ${publishedProperty}`
    return property ?? null
  } catch (error) {
    return null
  }
}

export async function getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  try {
    return await sql<PropertyImage[]>`
      select * from property_images
      where property_id = ${propertyId} and is_active = true
        and exists (select 1 from properties p where p.id = property_id and ${publishedProperty})
      order by sort_order asc`
  } catch (error) {
    return []
  }
}

// Reviews data fetching functions
export async function getFeaturedReviews(limit: number = 4): Promise<Review[]> {
  try {
    return await sql<Review[]>`
      select r.*,
        (select json_build_object('title', p.title, 'slug', p.slug) from properties p where p.id = r.property_id and p.status = 'published' and p.is_active = true) as properties
      from reviews r
      where r.status = 'approved' and r.is_active = true and r.is_featured = true
      order by r.created_at desc
      limit ${limit}`
  } catch (error) {
    return []
  }
}

export async function getPropertyReviews(propertyId: string, limit: number = 10): Promise<Review[]> {
  try {
    return await sql<Review[]>`
      select * from reviews
      where property_id = ${propertyId} and status = 'approved' and is_active = true
      order by created_at desc
      limit ${limit}`
  } catch (error) {
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
    const limit = options?.limit ?? (options?.offset ? 10 : null)

    return await sql<BlogPost[]>`
      select b.*,
        (select json_build_object('name', c.name, 'slug', c.slug) from blog_categories c where c.id = b.category_id and c.is_active = true) as blog_categories
      from blog_posts b
      where b.status = 'published'
        ${options?.category ? sql`and b.category_id = ${options.category}` : sql``}
        ${options?.featured ? sql`and b.is_featured = true` : sql``}
      order by b.created_at desc
      ${limit ? sql`limit ${limit}` : sql``}
      ${options?.offset ? sql`offset ${options.offset}` : sql``}`
  } catch (error) {
    return []
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const [post] = await sql<BlogPost[]>`
      select b.*,
        (select json_build_object('name', c.name, 'slug', c.slug) from blog_categories c where c.id = b.category_id and c.is_active = true) as blog_categories
      from blog_posts b
      where b.slug = ${slug} and b.status = 'published'`
    return post ?? null
  } catch (error) {
    return null
  }
}

export async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    return await sql<BlogCategory[]>`
      select * from blog_categories where is_active = true order by name asc`
  } catch (error) {
    return []
  }
}

export async function getPropertyCategories(): Promise<PropertyCategory[]> {
  try {
    return await sql<PropertyCategory[]>`
      select * from property_categories where is_active = true order by sort_order asc`
  } catch (error) {
    return []
  }
}

export async function getCategoryBySlug(slug: string): Promise<PropertyCategory | null> {
  try {
    const [category] = await sql<PropertyCategory[]>`
      select * from property_categories where slug = ${slug} and is_active = true`
    return category ?? null
  } catch (error) {
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
    const listingType = filters?.listing_type && filters.listing_type !== 'all' ? filters.listing_type : null
    const minPrice = filters?.min_price || null
    const maxPrice = filters?.max_price || null

    const priceInRange = (column: 'rental_price' | 'sale_price') => sql`(
      ${minPrice ? sql`p.${sql(column)} >= ${minPrice}` : sql`true`}
      and ${maxPrice ? sql`p.${sql(column)} <= ${maxPrice}` : sql`true`})`

    let priceFilter = sql``
    if (minPrice || maxPrice) {
      if (filters?.listing_type === 'sale') priceFilter = sql`and ${priceInRange('sale_price')}`
      else if (filters?.listing_type === 'rental') priceFilter = sql`and ${priceInRange('rental_price')}`
      else priceFilter = sql`and (${priceInRange('rental_price')} or ${priceInRange('sale_price')})`
    }

    const amenities = filters?.amenities?.filter(Boolean) ?? []

    const data = await sql<Property[]>`
      select p.*, ${categoryNameSlug}, ${imagePathsOnly}
      from properties p
      where ${publishedProperty}
        ${query ? sql`and ${textMatch(likePattern(query))}` : sql``}
        ${listingType ? sql`and p.listing_type in (${listingType}, 'both')` : sql``}
        ${filters?.location ? sql`and p.specific_location ilike ${likePattern(filters.location)}` : sql``}
        ${priceFilter}
        ${filters?.bedrooms ? sql`and p.bedrooms >= ${filters.bedrooms}` : sql``}
        ${filters?.beds ? sql`and p.beds >= ${filters.beds}` : sql``}
        ${filters?.max_guests ? sql`and p.max_guests >= ${filters.max_guests}` : sql``}
        ${amenities.length > 0
          ? sql`and exists (select 1 from jsonb_array_elements_text(
              case when jsonb_typeof(p.amenities) = 'array' then p.amenities else '[]'::jsonb end) a
              where a = any(${sql.array(amenities)}))`
          : sql``}
        ${filters?.has_video === true ? sql`and p.video_url is not null` : sql``}
        ${filters?.has_video === false ? sql`and p.video_url is null` : sql``}
        ${filters?.is_featured !== undefined ? sql`and p.is_featured = ${filters.is_featured}` : sql``}
        ${filters?.created_after ? sql`and p.created_at >= ${filters.created_after}` : sql``}
        ${filters?.created_before ? sql`and p.created_at <= ${filters.created_before}` : sql``}`

    const results = [...data]

    // Apply relevance scoring if we have a search query
    if (query) {
      const scoredResults = results.map(property => ({
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
    results.sort((a, b) => {
      if (a.is_featured !== b.is_featured) {
        return b.is_featured ? 1 : -1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return results
  } catch (error) {
    return []
  }
}

// Search suggestions: direct text matches first, then properties whose category matches
export async function getSearchSuggestions(query: string, limit: number = 5): Promise<Property[]> {
  try {
    if (!query.trim()) return []

    const pattern = likePattern(query)

    return await sql<Property[]>`
      select p.id, p.title, p.slug, p.specific_location, p.listing_type, p.rental_price, p.sale_price,
        p.currency, p.hero_image_path, p.property_type_text, p.focus_keyword,
        (select json_build_object('name', c.name, 'description', c.description)
          from property_categories c where c.id = p.category_id and c.is_active = true) as property_categories,
        ${imagePathsOnly}
      from properties p
      left join property_categories pc on pc.id = p.category_id
      where ${publishedProperty}
        and (${textMatch(pattern)}
          or (pc.is_active = true and (pc.name ilike ${pattern} or coalesce(pc.description ilike ${pattern}, false))))
      order by ${textMatch(pattern)} desc, p.is_featured desc, p.created_at desc
      limit ${limit}`
  } catch (error) {
    return []
  }
}

// Get search suggestions by category
export async function getCategorySuggestions(query: string, limit: number = 3): Promise<PropertyCategory[]> {
  try {
    if (!query.trim()) return []

    const pattern = likePattern(query)

    return await sql<PropertyCategory[]>`
      select * from property_categories
      where is_active = true and (name ilike ${pattern} or description ilike ${pattern})
      order by sort_order asc
      limit ${limit}`
  } catch (error) {
    return []
  }
}

// Get available amenities for filter options
export async function getAvailableAmenities(): Promise<string[]> {
  try {
    const rows = await sql<{ amenity: string }[]>`
      select distinct a as amenity
      from properties p, jsonb_array_elements_text(
        case when jsonb_typeof(p.amenities) = 'array' then p.amenities else '[]'::jsonb end) a
      where ${publishedProperty} and a <> ''
      order by 1`
    return rows.map(row => row.amenity)
  } catch (error) {
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
    const [stats] = await sql<{
      min_price: number | null; max_price: number | null
      min_bedrooms: number | null; max_bedrooms: number | null
      min_beds: number | null; max_beds: number | null
      min_guests: number | null; max_guests: number | null
    }[]>`
      select
        least(min(nullif(p.rental_price, 0)), min(nullif(p.sale_price, 0))) as min_price,
        greatest(max(nullif(p.rental_price, 0)), max(nullif(p.sale_price, 0))) as max_price,
        min(nullif(p.bedrooms, 0)) as min_bedrooms, max(nullif(p.bedrooms, 0)) as max_bedrooms,
        min(nullif(p.beds, 0)) as min_beds, max(nullif(p.beds, 0)) as max_beds,
        min(nullif(p.max_guests, 0)) as min_guests, max(nullif(p.max_guests, 0)) as max_guests
      from properties p
      where ${publishedProperty}`

    return {
      priceRange: { min: stats.min_price ?? 0, max: stats.max_price ?? 100000 },
      bedroomRange: { min: stats.min_bedrooms ?? 1, max: stats.max_bedrooms ?? 10 },
      bedRange: { min: stats.min_beds ?? 1, max: stats.max_beds ?? 10 },
      guestRange: { min: stats.min_guests ?? 1, max: stats.max_guests ?? 20 }
    }
  } catch (error) {
    return {
      priceRange: { min: 0, max: 100000 },
      bedroomRange: { min: 1, max: 10 },
      bedRange: { min: 1, max: 10 },
      guestRange: { min: 1, max: 20 }
    }
  }
}
