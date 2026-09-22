import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Travel & Property Blog', template: '%s | Iroto Realty' },
  description: 'Guides, travel tips and property insights for Lamu, Watamu, Kilifi and Malindi on the Kenyan coast.',
  alternates: { canonical: '/blog' },
  openGraph: { url: '/blog', title: 'Travel & Property Blog | Iroto Realty', description: 'Guides, travel tips and property insights for Lamu, Watamu, Kilifi and Malindi on the Kenyan coast.' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
