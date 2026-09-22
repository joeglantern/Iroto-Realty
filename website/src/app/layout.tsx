import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import JsonLd from "@/components/seo/JsonLd";
import { LAUNCH_CELEBRATION_ENABLED } from "@/lib/launch";
import { IS_PRODUCTION_SITE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Lamu vacation rentals", "Watamu villas", "Kilifi property", "Malindi holiday homes",
    "Kenya coast real estate", "luxury villas Kenya", "property for sale Lamu", "Shela houses",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_KE",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/logo/iroto-logo.png", alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: IS_PRODUCTION_SITE
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } }
    : { index: false, follow: false },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: '64x64', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Hide the intro before first paint for visitors who have already seen it this session.
            Skipped during the launch celebration, which plays on every visit. */}
        {!LAUNCH_CELEBRATION_ENABLED && (
          <script
            dangerouslySetInnerHTML={{
              __html:
                "try{if(sessionStorage.getItem('iroto-visited')&&!/[?&]intro(=|&|$)/.test(location.search))document.documentElement.classList.add('intro-seen')}catch(e){}",
            }}
          />
        )}
        <link 
          href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased font-sans">
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
