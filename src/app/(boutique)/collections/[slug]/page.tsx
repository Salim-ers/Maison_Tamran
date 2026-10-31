import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "@/components/motion/transition-link";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/catalog";
import { catalogLabels, toBrowsable } from "@/lib/present";
import { CreationsHero } from "@/components/catalog/creations-hero";
import { CatalogBrowser } from "@/components/product/catalog-browser";

export async function generateStaticParams() {
  return [{ slug: "signature" }, { slug: "ephemere" }];
}

export async function generateMetadata({ params }: PageProps<"/collections/[slug]">): Promise<Metadata> {
  "use cache";
  const { slug } = await params;
  const { collections } = await getCatalog();
  const c = collections.find((x) => x.slug === slug);
  if (!c) return {};
  return { title: c.name, description: c.intro, alternates: { canonical: `/collections/${slug}` } };
}

export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen" aria-busy />}>
      <CollectionView params={params} />
    </Suspense>
  );
}

async function CollectionView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products, collections } = await getCatalog();
  const c = collections.find((x) => x.slug === slug);
  if (!c) notFound();
  const list = products.filter((p) => p.collectionSlug === slug);
  const dark = c.ephemeral;
  return (
    <>
      <CreationsHero
        title={c.name.replace("Collection ", "")}
        subtitle={c.intro}
        crumbs={[{ href: "/creations", label: "Créations" }, { href: `/collections/${slug}`, label: c.name }]}
        items={list.map((p) => ({ slug: p.slug, name: p.name, pairing: p.pairing, image: p.images.find((i) => i.role === "main") ?? p.images[0] ?? null }))}
      >
        <p className="mt-6 t-small text-taupe">
          {dark
            ? "Chaque édition éphémère est produite en série limitée. Sa disponibilité est annoncée au lancement, par la lettre de la Maison."
            : `${list.length} créations permanentes, le cœur de la Maison.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#catalogue" className="btn btn-gold">Voir les {list.length} créations</a>
          {dark ? (
            <Link href="/coffrets#coffret-edition-limitee" className="btn btn-outline-light">Le coffret Édition Limitée</Link>
          ) : (
            <Link href="/composer-mon-coffret" className="btn btn-outline-light">Composer un coffret</Link>
          )}
        </div>
      </CreationsHero>
      <section id="catalogue" className="scroll-mt-24 pb-[var(--section)] pt-16">
        <div className="container-luxe">
          <Suspense fallback={<div className="h-96" aria-busy />}>
            <CatalogBrowser products={list.map(toBrowsable)} labels={catalogLabels(collections)} lockCollection={slug} showSearch={false} />
          </Suspense>
          <div className="mt-20 flex flex-wrap gap-3 border-t hairline pt-10">
            <Link href="/composer-mon-coffret" className="btn btn-primary">Composer un coffret</Link>
            <Link href={slug === "signature" ? "/collections/ephemere" : "/collections/signature"} className="btn btn-outline">
              {slug === "signature" ? "Voir la collection Éphémère" : "Voir la collection Signature"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
