import { sql } from '@/lib/db';
import { formatPropertyPrice } from '@/lib/price';
import { absoluteUrl, CONTACT, plainText, SERVICE_AREAS, SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
import { SOCIAL_LINKS } from '@/lib/social';
import type { Property } from '@/lib/types';

export const dynamic = 'force-dynamic';

type ListingRow = Property & { category_name: string | null };

function describeProperty(property: ListingRow, prefer: 'rental' | 'sale') {
  const facts = [
    property.property_type_text,
    property.category_name && !property.specific_location?.toLowerCase().includes(property.category_name.toLowerCase())
      ? [property.specific_location, property.category_name].filter(Boolean).join(', ')
      : property.specific_location,
    property.bedrooms ? `${property.bedrooms} bedrooms` : '',
    property.beds ? `${property.beds} beds` : '',
    property.max_guests ? `sleeps ${property.max_guests}` : '',
    formatPropertyPrice(property, prefer),
  ].filter(Boolean).join(' · ');
  const summary = plainText(property.description, 220);
  return `- [${property.title}](${absoluteUrl(`/property/${property.slug}`)}): ${facts}${summary ? `. ${summary}` : ''}`;
}

// llms.txt: a plain-text guide to the site for AI assistants (https://llmstxt.org).
export async function GET() {
  const lines: string[] = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `${SITE_NAME} is a boutique real estate agency on the Kenyan coast serving ${SERVICE_AREAS.join(', ')}. It lists luxury vacation rentals (priced per night) and properties for sale. Prices are in Kenyan shillings (KES) unless stated; "Contact for Price" means the price is shared on request.`,
    '',
    `Contact: ${CONTACT.email}, ${CONTACT.phone} (also WhatsApp). Enquiries: ${absoluteUrl('/contact')}`,
    `Social: Instagram ${SOCIAL_LINKS.instagram.label} (${SOCIAL_LINKS.instagram.url}), Facebook (${SOCIAL_LINKS.facebook.url})`,
    '',
    '## Main pages',
    '',
    `- [Rental Portfolio](${absoluteUrl('/rental-portfolio')}): all vacation rentals by location`,
    `- [Sales Collection](${absoluteUrl('/sales-collection')}): all properties for sale`,
    `- [Search](${absoluteUrl('/search')}): filter by location, price, bedrooms and amenities`,
    `- [Pre-Arrival Guide](${absoluteUrl('/travel-insights/pre-arrival')}): what to prepare before visiting`,
    `- [Getting There](${absoluteUrl('/travel-insights/getting-there')}): how to reach the Kenyan coast`,
    `- [About](${absoluteUrl('/about')})`,
    `- [Blog](${absoluteUrl('/blog')})`,
  ];

  try {
    const [properties, posts] = await Promise.all([
      sql<ListingRow[]>`
        select p.*, c.name as category_name
        from properties p
        left join property_categories c on c.id = p.category_id
        where p.status = 'published' and p.is_active = true
        order by c.sort_order nulls last, p.is_featured desc, p.created_at desc`,
      sql<{ title: string; slug: string; excerpt: string | null; content: string | null }[]>`
        select title, slug, excerpt, content from blog_posts
        where status = 'published'
        order by coalesce(published_at, created_at) desc
        limit 50`,
    ]);

    const rentals = properties.filter(p => p.listing_type === 'rental' || p.listing_type === 'both');
    const sales = properties.filter(p => p.listing_type === 'sale' || p.listing_type === 'both');

    if (rentals.length) {
      lines.push('', '## Vacation rentals', '', ...rentals.map(p => describeProperty(p, 'rental')));
    }
    if (sales.length) {
      lines.push('', '## Properties for sale', '', ...sales.map(p => describeProperty(p, 'sale')));
    }
    if (posts.length) {
      lines.push('', '## Articles', '', ...posts.map(post => {
        const summary = plainText(post.excerpt || post.content, 160);
        return `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})${summary ? `: ${summary}` : ''}`;
      }));
    }
  } catch (error) {
    console.error('llms.txt: failed to load listings', error);
  }

  return new Response(`${lines.join('\n')}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
