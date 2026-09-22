import { cache } from 'react'
import type { Metadata } from 'next'
import { getCategoryBySlug, getProperties } from './data'
import { getStorageUrl } from './media'
import { plainText } from './site'
import { breadcrumbJsonLd, categoryJsonLd } from './structured-data'

const MODES = {
  rental: {
    basePath: '/rental-portfolio',
    sectionName: 'Rental Portfolio',
    heading: (name: string) => `Luxury Vacation Rentals in ${name}`,
    blurb: (name: string) => `Browse luxury villas and holiday homes for rent in ${name}, Kenya, hand-picked by Iroto Realty.`,
  },
  sale: {
    basePath: '/sales-collection',
    sectionName: 'Sales Collection',
    heading: (name: string) => `Properties for Sale in ${name}`,
    blurb: (name: string) => `Explore premium homes and land for sale in ${name}, Kenya, with Iroto Realty.`,
  },
} as const

export type CategoryMode = keyof typeof MODES

export const loadCategoryPage = cache(async (mode: CategoryMode, slug: string) => {
  const category = await getCategoryBySlug(slug)
  if (!category) return null
  const properties = await getProperties({ listing_type: mode, category_slug: slug })
  return { category, properties }
})

export async function categoryMetadata(mode: CategoryMode, slug: string): Promise<Metadata> {
  const data = await loadCategoryPage(mode, slug)
  if (!data) return { title: 'Location not found', robots: { index: false } }

  const { category, properties } = data
  const config = MODES[mode]
  const title = config.heading(category.name)
  const count = properties.length ? `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}. ` : ''
  const description = plainText(`${count}${category.description ? `${category.description}. ` : ''}${config.blurb(category.name)}`, 160)
  const path = `${config.basePath}/${category.slug}`
  const image = category.hero_image_path ? getStorageUrl('property-images', category.hero_image_path) : undefined

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, title, description, ...(image ? { images: [{ url: image, alt: category.name }] } : {}) },
    twitter: { card: 'summary_large_image', title, description, ...(image ? { images: [image] } : {}) },
  }
}

export function categoryStructuredData(mode: CategoryMode, data: NonNullable<Awaited<ReturnType<typeof loadCategoryPage>>>) {
  const config = MODES[mode]
  const path = `${config.basePath}/${data.category.slug}`
  return [
    categoryJsonLd(data.category, data.properties, path, config.heading(data.category.name)),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: config.sectionName, path: config.basePath },
      { name: data.category.name, path },
    ]),
  ]
}
