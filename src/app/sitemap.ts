import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/env";

const STATIC = [
  "", "/creations", "/collections/signature", "/collections/ephemere", "/coffrets", "/composer-mon-coffret", "/maison", "/savoir-faire",
  "/professionnels", "/professionnels/cadeaux-entreprise", "/professionnels/mariages-evenements", "/professionnels/devis",
  "/faq", "/contact", "/livraison-retours", "/suivi-commande", "/mentions-legales", "/cgv", "/confidentialite", "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const { products } = await getCatalog();
  return [
    ...STATIC.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${base}/creations/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8, images: p.images.map((i) => `${base}${i.url}`) })),
  ];
}
