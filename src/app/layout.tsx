import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { siteUrl } from "@/lib/env";
import { photo, withPhoto } from "@/lib/photos";
import { INTRO_HEAD_SCRIPT } from "@/components/home/intro-script";
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

// Latin étendu (le Ā de MAISON TAMRĀN) : fichiers séparés, téléchargés seulement si la page contient ces caractères.
// Placés en tête de pile (globals.css) sans police de repli propre, pour ne jamais masquer la police principale.
// (next/font n'accepte que des valeurs littérales : la plage Unicode est répétée.)
const bodoniExt = localFont({
  src: [
    { path: "../fonts/bodoni-moda-latin-ext-opsz-normal.woff2", style: "normal", weight: "400 900" },
    { path: "../fonts/bodoni-moda-latin-ext-opsz-italic.woff2", style: "italic", weight: "400 900" },
  ],
  variable: "--font-bodoni-ext",
  display: "swap",
  fallback: [],
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2C60-2C7F, U+A720-A7FF" }],
});
const manropeExt = localFont({
  src: [{ path: "../fonts/manrope-latin-ext-wght-normal.woff2", style: "normal", weight: "200 800" }],
  variable: "--font-manrope-ext",
  display: "swap",
  fallback: [],
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2C60-2C7F, U+A720-A7FF" }],
});

// visuel de partage : le coffret du hero (logo officiel), sinon la photo d'accueil historique
const heroImage = photo("coffret-ferme") ?? withPhoto({ url: "/images/concepts/hero.webp", alt: "", role: "extra", w: 3200, h: 1800 });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "MAISON TAMRĀN — L'art de sublimer la datte",
    template: "%s · MAISON TAMRĀN",
  },
  description:
    "Maison française de dattes gastronomiques : Medjool fourrées et enrobées de chocolat, coffrets à offrir et créations inspirées de la haute pâtisserie.",
  applicationName: "MAISON TAMRĀN",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "MAISON TAMRĀN",
    images: [{ url: heroImage.url, width: heroImage.w, height: heroImage.h, alt: "Dattes gastronomiques MAISON TAMRĀN" }],
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
    <html lang="fr" className={`${bodoni.variable} ${manrope.variable} ${bodoniExt.variable} ${manropeExt.variable}`} suppressHydrationWarning>
      <head>
        {/* classes intro-play / intro-seen posées avant le premier rendu (voir IntroCurtain) */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_HEAD_SCRIPT }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
