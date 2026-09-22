import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Contact Us', template: '%s | Iroto Realty' },
  description: 'Get in touch with Iroto Realty about vacation rentals, buying property or investing on the Kenyan coast. Email info@irotorealty.com or call +254 741 707033.',
  alternates: { canonical: '/contact' },
  openGraph: { url: '/contact', title: 'Contact Us | Iroto Realty', description: 'Get in touch with Iroto Realty about vacation rentals, buying property or investing on the Kenyan coast. Email info@irotorealty.com or call +254 741 707033.' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
