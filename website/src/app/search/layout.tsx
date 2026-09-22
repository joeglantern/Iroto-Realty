import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Search Properties', template: '%s | Iroto Realty' },
  description: 'Search Iroto Realty vacation rentals and properties for sale by location, price, bedrooms and amenities.',
  alternates: { canonical: '/search' },
  openGraph: { url: '/search', title: 'Search Properties | Iroto Realty', description: 'Search Iroto Realty vacation rentals and properties for sale by location, price, bedrooms and amenities.' },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
