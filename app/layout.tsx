import type { Metadata } from "next";
import { Averia_Serif_Libre, Caveat, Gochi_Hand, Instrument_Serif, Inter, Noto_Serif_JP } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { InkFilters } from "@/components/providers/InkFilters";
import { Cursor } from "@/components/ui/Cursor";
import { Nav } from "@/components/nav/Nav";
import { EdgeStrips } from "@/components/edges/EdgeStrips";
import { Preloader } from "@/components/preloader/Preloader";
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

const notoJp = Noto_Serif_JP({
  variable: "--font-noto-jp",
  weight: ["500", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Ishmeet Singh — design engineer",
  description: "Design engineer in New Delhi. Coffee, clacky keyboards, and tiny delightful interfaces.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrument.variable} ${inter.variable} ${caveat.variable} ${averia.variable} ${gochi.variable} ${notoJp.variable} antialiased`}
    >
      <body className="min-h-dvh">
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
