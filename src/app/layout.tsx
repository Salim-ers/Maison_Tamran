import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/env";
import "./globals.css";

const bodoni = localFont({
  src: [
    { path: "../fonts/bodoni-moda-latin-opsz-normal.woff2", style: "normal", weight: "400 900" },
    { path: "../fonts/bodoni-moda-latin-opsz-italic.woff2", style: "italic", weight: "400 900" },
  ],
  variable: "--font-bodoni",
  display: "swap",
  fallback: ["Didot", "Times New Roman", "serif"],
});

const manrope = localFont({
  src: [{ path: "../fonts/manrope-latin-wght-normal.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "TAMBRÉ — La datte, réinventée en haute gourmandise",
    template: "%s · TAMBRÉ",
  },
  description:
    "Maison française de dattes gastronomiques : Medjool fourrées et enrobées de chocolat, coffrets à offrir et créations inspirées de la haute pâtisserie.",
  applicationName: "TAMBRÉ",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "TAMBRÉ",
    images: [{ url: "/images/concepts/hero.webp", width: 3200, height: 1800, alt: "Dattes gastronomiques TAMBRÉ" }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#251C1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${bodoni.variable} ${manrope.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
