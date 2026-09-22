import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPropertyBySlug, getPropertyReviews } from '@/lib/data';
import { formatPropertyPrice } from '@/lib/price';
import { plainText, SITE_DESCRIPTION } from '@/lib/site';
import { breadcrumbJsonLd, propertyImages, propertyJsonLd } from '@/lib/structured-data';
import JsonLd from '@/components/seo/JsonLd';
import PropertyDetailClient from './PropertyDetailClient';

export const dynamic = 'force-dynamic';

const loadProperty = cache((slug: string) => getPropertyBySlug(slug));

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const property = await loadProperty(params.slug);
  if (!property) return { title: 'Property not found', robots: { index: false } };

  const location = property.specific_location ? ` in ${property.specific_location}` : '';
  const title = property.meta_title || `${property.title}${location}`;
  const facts = [
    property.bedrooms ? `${property.bedrooms} bedrooms` : '',
    property.max_guests ? `up to ${property.max_guests} guests` : '',
    formatPropertyPrice(property),
  ].filter(Boolean).join(' · ');
  const description =
    property.meta_description ||
    plainText(`${facts}. ${property.description ?? ''}`, 160) ||
    SITE_DESCRIPTION;
  const images = propertyImages(property).slice(0, 4);
  const path = `/property/${property.slug}`;

  return {
    title,
    description,
    ...(property.focus_keyword ? { keywords: property.focus_keyword } : {}),
    alternates: { canonical: path },
    openGraph: { type: 'website', url: path, title, description, images: images.map(url => ({ url, alt: property.title })) },
    twitter: { card: 'summary_large_image', title, description, images: images.slice(0, 1) },
  };
}

export default async function PropertyPage({ params }: Props) {
  const property = await loadProperty(params.slug);
  if (!property) notFound();

  const reviews = await getPropertyReviews(property.id);
  const listingPath = property.listing_type === 'sale' ? '/sales-collection' : '/rental-portfolio';
  const listingName = property.listing_type === 'sale' ? 'Sales Collection' : 'Rental Portfolio';

  return (
    <>
      <JsonLd
        data={[
          propertyJsonLd(property),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: listingName, path: listingPath },
            { name: property.title, path: `/property/${property.slug}` },
          ]),
        ]}
      />
      <PropertyDetailClient params={params} initialProperty={property} initialReviews={reviews} />
    </>
  );
}
