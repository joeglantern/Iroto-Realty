import type { Property } from './supabase'

export const CONTACT_FOR_PRICE = 'Contact for Price'

type PriceFields = Pick<Property, 'listing_type' | 'rental_price' | 'sale_price'> & {
  currency?: string
  price_on_request?: boolean
}

// Single source of truth for showing a property's price anywhere on the site.
// prefer forces sale/rental context (e.g. the Sales Collection page shows sale
// prices even for listing_type 'both'); otherwise it follows the listing type.
export function formatPropertyPrice(property: PriceFields, prefer?: 'sale' | 'rental'): string {
  if (property.price_on_request) return CONTACT_FOR_PRICE

  const currency = property.currency || 'KES'
  const mode = prefer ?? (property.listing_type === 'sale' ? 'sale' : 'rental')

  if (mode === 'sale') {
    return property.sale_price
      ? `${currency} ${property.sale_price.toLocaleString()}`
      : CONTACT_FOR_PRICE
  }

  return property.rental_price
    ? `From ${currency} ${property.rental_price.toLocaleString()}/night`
    : CONTACT_FOR_PRICE
}
