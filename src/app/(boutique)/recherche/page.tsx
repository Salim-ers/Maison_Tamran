import type { Metadata } from "next";
import Link from "@/components/motion/transition-link";
import { Suspense } from "react";
import { getCatalog } from "@/lib/catalog";
import { catalogLabels, toBrowsable } from "@/lib/present";
import { PageIntro } from "@/components/layout/page-intro";
import { CatalogBrowser } from "@/components/product/catalog-browser";

export const metadata: Metadata = { title: "Rechercher", robots: { index: false } };

export default async function SearchPage() {
  const { products, collections } = await getCatalog();
  return (
    <>
      <PageIntro
        title="Rechercher"
        crumbs={[{ href: "/recherche", label: "Recherche" }]}
        intro={<p>Une saveur, un ingrédient, un chocolat : la recherche porte sur toutes les créations. Pour un cadeau, voyez aussi <Link href="/coffrets" className="link-draw text-ink">les coffrets</Link> ou <Link href="/faq" className="link-draw text-ink">les questions fréquentes</Link>.</p>}
      />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-96" aria-busy />}>
          <CatalogBrowser products={products.map(toBrowsable)} labels={catalogLabels(collections)} />
        </Suspense>
      </section>
    </>
  );
}
