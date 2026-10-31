import type { Metadata } from "next";
import { Suspense } from "react";
import { getBoxes, getCatalog, getSettings } from "@/lib/catalog";
import { PageIntro } from "@/components/layout/page-intro";
import { boxPhotos, toSwatch } from "@/lib/present";
import { ALLERGEN_LABELS, CHOCOLATE_LABELS, type ChocolateKind } from "@/data/recipes";
import { Configurator, type ConfBox, type ConfFlavor } from "@/components/configurator/configurator";

export const metadata: Metadata = {
  title: "Composer mon coffret",
  description: "Choisissez un coffret de 6, 12 ou 24 pièces et composez-le saveur par saveur : aperçu en direct, message personnel et emballage cadeau.",
  alternates: { canonical: "/composer-mon-coffret" },
};

function parseSelection(raw: string | undefined) {
  const out: Record<string, number> = {};
  for (const part of (raw ?? "").split(",").slice(0, 24)) {
    const [slug, q] = part.split(":");
    const n = Number(q);
    if (slug && /^[a-z0-9-]{1,60}$/.test(slug) && Number.isInteger(n) && n > 0 && n <= 24) out[slug] = n;
  }
  return out;
}

async function ConfiguratorLoader({ searchParams, boxes, flavors, gift }: { searchParams: Promise<Record<string, string | string[] | undefined>>; boxes: ConfBox[]; flavors: ConfFlavor[]; gift: { cents: number; label: string } }) {
  const sp = await searchParams;
  const format = Number(Array.isArray(sp.format) ? sp.format[0] : sp.format);
  const selection = parseSelection(Array.isArray(sp.selection) ? sp.selection[0] : sp.selection);
  return (
    <Configurator
      boxes={boxes}
      flavors={flavors}
      boxPhotos={boxPhotos()}
      giftWrapCents={gift.cents}
      giftWrapLabel={gift.label}
      initialFormat={[6, 12, 24].includes(format) ? format : null}
      initialSelection={selection}
    />
  );
}

export default async function ComposerPage({ searchParams }: PageProps<"/composer-mon-coffret">) {
  const [boxesRaw, { products }, settings] = await Promise.all([getBoxes(), getCatalog(), getSettings()]);
  const boxes: ConfBox[] = boxesRaw
    .filter((b) => b.configurable && b.pieces && b.priceCents != null)
    .map((b) => ({ id: b.id, slug: b.slug, name: b.name, pieces: b.pieces!, priceCents: b.priceCents!, stock: b.stock, purchasable: b.purchasable }));
  const flavors: ConfFlavor[] = products.map((p) => ({
    ...toSwatch(p),
    pairing: p.pairing,
    tagline: p.tagline,
    collection: p.collectionSlug,
    chocolateLabel: CHOCOLATE_LABELS[p.chocolate as ChocolateKind] ?? p.chocolate,
    allergens: p.allergens.map((a) => ALLERGEN_LABELS[a] ?? a).join(", ").toLowerCase(),
    stockPieces: p.stockPieces,
    supplementCents: p.boxSupplementCents,
    purchasable: p.purchasable && p.stockPieces > 0,
    image: p.images.find((i) => i.role === "main") ?? null,
    macro: p.images.find((i) => i.role === "cut") ?? null,
  }));
  return (
    <>
      <PageIntro
        title="Composer mon coffret"
        crumbs={[{ href: "/coffrets", label: "Coffrets" }, { href: "/composer-mon-coffret", label: "Composer mon coffret" }]}
        intro={<p>Choisissez un format, posez vos créations une à une, ajoutez un mot pour la personne qui l&apos;ouvrira. Touchez une pièce du coffret pour la remplacer ou la retirer.</p>}
      />
      <section className="container-luxe pb-[var(--section)]">
        <Suspense fallback={<div className="h-[60vh]" aria-busy />}>
          <ConfiguratorLoader searchParams={searchParams} boxes={boxes} flavors={flavors} gift={{ cents: settings.giftWrapCents, label: settings.giftWrapLabel }} />
        </Suspense>
      </section>
    </>
  );
}
