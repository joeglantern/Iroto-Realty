import { getStorageUrl } from './media'
import { absoluteUrl, CONTACT, plainText, SERVICE_AREAS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site'
import { SOCIAL_LINKS } from './social'
import type { BlogPost, Property, PropertyCategory } from './types'

type WithRelations = Property & {
  property_images?: { image_path: string; is_active?: boolean }[]
  property_categories?: { name: string; slug: string } | null
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/logo/iroto-logo.png'),
    image: absoluteUrl('/logo/iroto-logo.png'),
    description: SITE_DESCRIPTION,
    email: CONTACT.email,
    telephone: CONTACT.phone,
    address: { '@type': 'PostalAddress', addressCountry: 'KE' },
    areaServed: SERVICE_AREAS.map(name => ({ '@type': 'City', name, containedInPlace: { '@type': 'Country', name: 'Kenya' } })),
    sameAs: [SOCIAL_LINKS.facebook.url, SOCIAL_LINKS.instagram.url],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function propertyImages(property: WithRelations): string[] {
  const paths = [
    property.hero_image_path,
    ...(property.property_images ?? []).filter(image => image.is_active !== false).map(image => image.image_path),
  ].filter((path): path is string => !!path)
  return Array.from(new Set(paths)).map(path => getStorageUrl('property-images', path))
}

export function propertyJsonLd(property: WithRelations) {
  const url = absoluteUrl(`/property/${property.slug}`)
  const currency = property.currency || 'KES'
  const offers = []

  if (!property.price_on_request) {
    if (property.listing_type !== 'sale' && property.rental_price) {
      offers.push({
        '@type': 'Offer',
        businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
        url,
        priceCurrency: currency,
        price: property.rental_price,
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: property.rental_price,
          priceCurrency: currency,
          unitCode: 'DAY',
          unitText: 'per night',
        },
        availability: 'https://schema.org/InStock',
      })
    }
    if (property.listing_type !== 'rental' && property.sale_price) {
      offers.push({
        '@type': 'Offer',
        businessFunction: 'http://purl.org/goodrelations/v1#Sell',
        url,
        priceCurrency: currency,
        price: property.sale_price,
        availability: 'https://schema.org/InStock',
      })
    }
  }

  const amenities = Array.isArray(property.amenities) ? property.amenities : []

  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    url,
    description: plainText(property.description, 500) || undefined,
    image: propertyImages(property),
    datePosted: property.published_at || property.created_at,
    dateModified: property.updated_at,
    provider: { '@id': ORGANIZATION_ID },
    about: {
      '@type': 'Accommodation',
      name: property.title,
      ...(property.property_type_text ? { accommodationCategory: property.property_type_text } : {}),
      ...(property.bedrooms ? { numberOfBedrooms: property.bedrooms } : {}),
      ...(property.beds ? { bed: { '@type': 'BedDetails', numberOfBeds: property.beds } } : {}),
      ...(property.max_guests ? { occupancy: { '@type': 'QuantitativeValue', maxValue: property.max_guests } } : {}),
      amenityFeature: amenities.map(name => ({ '@type': 'LocationFeatureSpecification', name, value: true })),
      address: {
        '@type': 'PostalAddress',
        ...(property.specific_location ? { addressLocality: property.specific_location } : {}),
        ...(property.property_categories?.name ? { addressRegion: property.property_categories.name } : {}),
        addressCountry: 'KE',
      },
    },
    ...(offers.length ? { offers } : {}),
  }
}

export function categoryJsonLd(category: PropertyCategory, properties: Property[], path: string, heading: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: heading,
    url: absoluteUrl(path),
    description: category.description || undefined,
    about: { '@type': 'Place', name: category.name, address: { '@type': 'PostalAddress', addressRegion: category.name, addressCountry: 'KE' } },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: properties.length,
      itemListElement: properties.map((property, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/property/${property.slug}`),
        name: property.title,
      })),
    },
  }
}

export function blogPostJsonLd(post: BlogPost) {
  const url = absoluteUrl(`/blog/${post.slug}`)
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    url,
    mainEntityOfPage: url,
    description: plainText(post.excerpt || post.content, 300) || undefined,
    ...(post.featured_image_path ? { image: [getStorageUrl('blog-images', post.featured_image_path)] } : {}),
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: post.author_name ? { '@type': 'Person', name: post.author_name } : { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    ...(post.focus_keyword ? { keywords: post.focus_keyword } : {}),
  }
}
