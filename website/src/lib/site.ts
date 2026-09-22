export const PRODUCTION_URL = 'https://irotorealty.com'

// Set at build time; the temporary test domain gets its own URL and is kept out of search engines.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || PRODUCTION_URL).replace(/\/$/, '')
export const IS_PRODUCTION_SITE = SITE_URL === PRODUCTION_URL

export const SITE_NAME = 'Iroto Realty'
export const SITE_TAGLINE = 'Luxury Vacation Rentals & Property Sales on the Kenyan Coast'
export const SITE_DESCRIPTION =
  'Iroto Realty offers luxury vacation rentals and properties for sale on the Kenyan coast, in Lamu, Watamu, Kilifi and Malindi, with over seven years of coastal living experience.'

export const CONTACT = {
  email: 'info@irotorealty.com',
  phone: '+254741707033',
}

export const SERVICE_AREAS = ['Lamu', 'Watamu', 'Kilifi', 'Malindi']

export const absoluteUrl = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

// Rich text from the admin editor, flattened for meta descriptions and structured data.
export function plainText(html: string | null | undefined, maxLength?: number): string {
  if (!html) return ''
  const text = html
    .replace(/<(br|\/p|\/li|\/h\d)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
  if (!maxLength || text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).replace(/\s+\S*$/, '')}…`
}
