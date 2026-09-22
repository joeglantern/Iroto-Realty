import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { categoryMetadata, categoryStructuredData, loadCategoryPage } from '@/lib/category-page';
import JsonLd from '@/components/seo/JsonLd';
import SalesCategoryClient from './SalesCategoryClient';

export const dynamic = 'force-dynamic';

type Props = { params: { category: string } };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return categoryMetadata('sale', params.category);
}

export default async function SalesCategoryPage({ params }: Props) {
  const data = await loadCategoryPage('sale', params.category);
  if (!data) notFound();

  return (
    <>
      <JsonLd data={categoryStructuredData('sale', data)} />
      <SalesCategoryClient initialCategory={data.category} initialProperties={data.properties} />
    </>
  );
}
