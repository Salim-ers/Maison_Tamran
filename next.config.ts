import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Polices embarquées dans les PDF (devis) : à inclure dans les fonctions serverless
  outputFileTracingIncludes: {
    "/admin/devis/[id]/pdf": ["./src/assets/fonts/**", "./src/assets/brand/**"],
    "/api/devis/[reference]/pdf": ["./src/assets/fonts/**", "./src/assets/brand/**"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    // jusqu'à 3840 (4K) : écrans 4K et Retina en pleine largeur ; une image plus petite n'est jamais agrandie
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560, 3200, 3840],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
