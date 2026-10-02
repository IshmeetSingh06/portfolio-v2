import type { Metadata, Viewport } from "next";
import { Averia_Serif_Libre, Caveat, Gochi_Hand, Instrument_Serif, Inter } from "next/font/google";
import localFont from "next/font/local";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { InkFilters } from "@/components/providers/InkFilters";
import { Cursor } from "@/components/ui/Cursor";
import { Nav } from "@/components/nav/Nav";
import { EdgeStrips } from "@/components/edges/EdgeStrips";
import { Preloader } from "@/components/preloader/Preloader";
import { profile, siteUrl } from "@/content/profile";
import "./globals.css";

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const averia = Averia_Serif_Libre({
  variable: "--font-averia-src",
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const gochi = Gochi_Hand({
  variable: "--font-gochi-src",
  weight: "400",
  subsets: ["latin"],
});

// Only the five kana of the hero's こんにちは, subset from Noto Serif JP Bold (2.8 KB). The full
// family is ~250 @font-face rules and ~190 KB of render-blocking CSS.
const notoJp = localFont({
  src: "./fonts/noto-serif-jp-hello-700.woff2",
  variable: "--font-noto-jp",
  weight: "700",
  display: "swap",
  preload: false,
});

const title = "Ishmeet Singh — iOS & design engineer";
const description = "iOS and design engineer in New Delhi, building high-traffic apps and tiny delightful interfaces.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Ishmeet Singh",
  authors: [{ name: profile.name, url: siteUrl }],
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", siteName: profile.name, title, description, locale: "en_IN" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#F4EFE6", colorScheme: "light" };

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  url: siteUrl,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "New Delhi", addressCountry: "IN" },
  sameAs: Object.values(profile.socials),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${inter.variable} ${caveat.variable} ${averia.variable} ${gochi.variable} ${notoJp.variable} antialiased`}
    >
      <body className="min-h-dvh">
        <a
          href="#about"
          className="fixed left-4 top-4 z-[200] -translate-y-24 rounded-full border-2 border-ink bg-sticker px-4 py-2 text-sm font-medium focus:translate-y-0"
        >
          Skip to content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
        <InkFilters />
        <SmoothScroll>
          <Preloader />
          <EdgeStrips />
          <Nav />
          {/* desktop gutters keep content clear of the edge strips */}
          <div className="md:px-24 lg:px-32">{children}</div>
        </SmoothScroll>
        <Cursor />
      </body>
    </html>
  );
}
