import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { UtilityBar } from "@/components/layout/utility-bar";
import { site } from "@/data/site";
import { SITE_URL } from "@/lib/seo";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--bx-font-serif",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  variable: "--bx-font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} | Pawn, Sell & Shop Pre-Owned Luxury`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/favicon.svg" }],
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} | ${site.tagline}`,
    description: site.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
  },
  ...(site.googleSiteVerification ? { verification: { google: site.googleSiteVerification } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#15161b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} scroll-smooth`}>
      <body className="flex min-h-screen flex-col bg-bx-ivory font-bx-sans text-bx-ink antialiased">
      <a
        href="#bx-main"
        className="sr-only z-[100] bg-bx-ink px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <UtilityBar />
      <SiteHeader />
      <main id="bx-main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      </body>
    </html>
  );
}
