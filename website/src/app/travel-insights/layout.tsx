import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Travel Insights', template: '%s | Iroto Realty' },
  description: 'Practical travel guides for visiting the Kenyan coast: what to prepare before you arrive and how to get to Lamu, Watamu, Kilifi and Malindi.',
  alternates: { canonical: '/travel-insights' },
  openGraph: { url: '/travel-insights', title: 'Travel Insights | Iroto Realty', description: 'Practical travel guides for visiting the Kenyan coast: what to prepare before you arrive and how to get to Lamu, Watamu, Kilifi and Malindi.' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
