import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoryMetadata, categoryStructuredData, loadCategoryPage } from '@/lib/category-page';
import JsonLd from '@/components/seo/JsonLd';
import RentalCategoryClient from './RentalCategoryClient';

export const dynamic = 'force-dynamic';

type Props = { params: { category: string } };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata('rental', params.category);
}

export default async function RentalCategoryPage({ params }: Props) {
  const data = await loadCategoryPage('rental', params.category);
  if (!data) notFound();

  return (
    <>
      <JsonLd data={categoryStructuredData('rental', data)} />
      <RentalCategoryClient initialCategory={data.category} initialProperties={data.properties} />
    </>
  );
}
