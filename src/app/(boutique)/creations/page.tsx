import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { catalogLabels, toBrowsable } from "@/lib/present";
import { PageIntro } from "@/components/layout/page-intro";
import { CatalogBrowser } from "@/components/product/catalog-browser";

export const metadata: Metadata = {
  title: "Toutes les créations",
  description: "Les dattes gastronomiques MAISON TAMRĀN : collection Signature et éditions éphémères, filtrées par saveur, chocolat et allergènes.",
  alternates: { canonical: "/creations" },
};

export default async function CreationsPage() {
  const { products, collections } = await getCatalog();
  return (
    <>
      <PageIntro
        title="Toutes les créations"
        crumbs={[{ href: "/creations", label: "Créations" }]}
        intro={
          <p>
            Dix accords, une seule matière : la datte Medjool, fourrée puis enrobée de chocolat. Les recettes présentées ici sont en cours de développement et peuvent encore évoluer.
          </p>
        }
      >
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 t-small">
          {collections.map((c) => (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="link-draw">{c.name}</Link>
          ))}
          <Link href="/composer-mon-coffret" className="link-draw">Composer un coffret</Link>
        </div>
      </PageIntro>
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-96" aria-busy />}>
          <CatalogBrowser products={products.map(toBrowsable)} labels={catalogLabels(collections)} />
        </Suspense>
      </section>
    </>
  );
}
