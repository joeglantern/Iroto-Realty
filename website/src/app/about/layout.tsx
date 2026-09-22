import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'About Us', template: '%s | Iroto Realty' },
  description: 'Meet Iroto Realty, a boutique real estate agency with over seven years of experience in luxury vacation rentals and property sales on the Kenyan coast.',
  alternates: { canonical: '/about' },
  openGraph: { url: '/about', title: 'About Us | Iroto Realty', description: 'Meet Iroto Realty, a boutique real estate agency with over seven years of experience in luxury vacation rentals and property sales on the Kenyan coast.' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
