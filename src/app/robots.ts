import type { MetadataRoute } from "next";
import { siteUrl, storeMode } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  // Une boutique de démonstration ne doit pas être indexée (prix et disponibilités fictifs).
  if (storeMode() === "demo" && process.env.ALLOW_INDEXING !== "true") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/compte", "/panier", "/paiement", "/api", "/suivi-commande/"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
