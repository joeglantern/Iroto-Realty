import type { MetadataRoute } from 'next';
import { sql } from '@/lib/db';
import { absoluteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

const STATIC_PAGES: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/rental-portfolio', priority: 0.9, changeFrequency: 'daily' },
  { path: '/sales-collection', priority: 0.9, changeFrequency: 'daily' },
  { path: '/blog', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/travel-insights', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/travel-insights/pre-arrival', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/travel-insights/getting-there', priority: 0.5, changeFrequency: 'monthly' },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map(page => ({
    url: absoluteUrl(page.path),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  try {
    const [properties, posts, categories] = await Promise.all([
      sql<{ slug: string; updated_at: string }[]>`
        select slug, updated_at from properties
        where status = 'published' and is_active = true
        order by updated_at desc`,
      sql<{ slug: string; updated_at: string }[]>`
        select slug, updated_at from blog_posts
        where status = 'published'
        order by updated_at desc`,
      sql<{ slug: string; has_rentals: boolean; has_sales: boolean; updated_at: string }[]>`
        select c.slug, c.updated_at,
          bool_or(p.listing_type in ('rental', 'both')) as has_rentals,
          bool_or(p.listing_type in ('sale', 'both')) as has_sales
        from property_categories c
        join properties p on p.category_id = c.id and p.status = 'published' and p.is_active = true
        where c.is_active = true
        group by c.slug, c.updated_at`,
    ]);

    for (const category of categories) {
      if (category.has_rentals) {
        entries.push({ url: absoluteUrl(`/rental-portfolio/${category.slug}`), lastModified: category.updated_at, changeFrequency: 'weekly', priority: 0.8 });
      }
      if (category.has_sales) {
        entries.push({ url: absoluteUrl(`/sales-collection/${category.slug}`), lastModified: category.updated_at, changeFrequency: 'weekly', priority: 0.8 });
      }
    }
    for (const property of properties) {
      entries.push({ url: absoluteUrl(`/property/${property.slug}`), lastModified: property.updated_at, changeFrequency: 'weekly', priority: 0.8 });
    }
    for (const post of posts) {
      entries.push({ url: absoluteUrl(`/blog/${post.slug}`), lastModified: post.updated_at, changeFrequency: 'monthly', priority: 0.6 });
    }
  } catch (error) {
    console.error('Sitemap: failed to load dynamic entries', error);
  }

  return entries;
}
