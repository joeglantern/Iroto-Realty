import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iroto Realty - Premium Real Estate in Kenya",
  description: "Discover luxury properties in Lamu and Watamu with Iroto Realty. Vacation rentals, sales collection, and premium real estate services.",
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
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
