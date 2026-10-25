import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { clsx } from "clsx";
import { getCatalog } from "@/lib/catalog";
import { catalogLabels, toBrowsable } from "@/lib/present";
import { PageIntro } from "@/components/layout/page-intro";
import { CatalogBrowser } from "@/components/product/catalog-browser";
import { concept, Media } from "@/components/ui/media";

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
      <PageIntro
        tone={dark ? "dark" : "light"}
        title={c.name}
        crumbs={[{ href: "/creations", label: "Créations" }, { href: `/collections/${slug}`, label: c.name }]}
        intro={<p>{c.intro}</p>}
        className={clsx(dark && "relative overflow-hidden")}
      >
        {dark && (
          <div className="mt-12 grid gap-6 md:grid-cols-[2fr_1fr]">
            <div className="relative aspect-[3/2] overflow-hidden">
              <Media image={concept("coffret-4")} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" badge="dark" />
            </div>
            <div className="flex flex-col justify-end gap-4 t-small text-taupe">
              <p>Chaque édition éphémère est produite en série limitée. Sa disponibilité est annoncée au lancement, par la lettre de la Maison.</p>
              <Link href="/coffrets#coffret-edition-limitee" className="btn btn-outline-light self-start">Le coffret Édition Limitée</Link>
            </div>
          </div>
        )}
      </PageIntro>
      <section className={clsx("pb-[var(--section)]", dark && "pt-16")}>
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
