import type { Metadata } from "next";
import "./globals.css";
import { SimpleAuthProvider } from "@/contexts/SimpleAuthContext";

export const metadata: Metadata = {
  title: "Iroto Realty Admin",
  description: "Admin Dashboard for Iroto Realty",
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
