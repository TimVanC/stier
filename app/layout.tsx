import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import "./globals.css";

// Body font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Display/heading font (.cursorrules spec)
const satoshi = localFont({
  src: "../public/fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  display: "swap",
  weight: "300 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stierapp.com"),
  title: {
    default: "Stier — Community-ranked products",
    template: "%s | Stier",
  },
  description:
    "Honest, community-voted tier lists for the stuff worth owning. No SEO traps, no affiliate slop — just real people ranking the products they actually use.",
  openGraph: {
    title: "Stier — Community-ranked products",
    description:
      "Honest, community-voted tier lists for the stuff worth owning.",
    url: "https://stierapp.com",
    siteName: "Stier",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${satoshi.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
