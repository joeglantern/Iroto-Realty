import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Properties for Sale on the Kenyan Coast', template: '%s | Iroto Realty' },
  description: 'Explore premium homes, villas and land for sale in Lamu, Watamu, Kilifi and Malindi with Iroto Realty.',
  alternates: { canonical: '/sales-collection' },
  openGraph: { url: '/sales-collection', title: 'Properties for Sale on the Kenyan Coast | Iroto Realty', description: 'Explore premium homes, villas and land for sale in Lamu, Watamu, Kilifi and Malindi with Iroto Realty.' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
