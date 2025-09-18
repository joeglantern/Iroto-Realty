import type { Metadata } from "next";
import "./globals.css";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";

export const metadata: Metadata = {
  title: "Iroto Realty Admin",
  description: "Admin Dashboard for Iroto Realty",
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
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Andika:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="font-sans antialiased bg-white">
        <SimpleAuthProvider>
          {children}
        </SimpleAuthProvider>
      </body>
    </html>
  );
}
