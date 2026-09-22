import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'Luxury Vacation Rentals on the Kenyan Coast', template: '%s | Iroto Realty' },
  description: 'Browse luxury villas and holiday homes for rent in Lamu, Watamu, Kilifi and Malindi, hand-picked by Iroto Realty.',
  alternates: { canonical: '/rental-portfolio' },
  openGraph: { url: '/rental-portfolio', title: 'Luxury Vacation Rentals on the Kenyan Coast | Iroto Realty', description: 'Browse luxury villas and holiday homes for rent in Lamu, Watamu, Kilifi and Malindi, hand-picked by Iroto Realty.' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
