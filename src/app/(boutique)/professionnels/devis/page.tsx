import type { Metadata } from "next";
import { Suspense } from "react";
import { getBoxes, getCatalog, getSettings } from "@/lib/catalog";
import { PRO_SEGMENT_VALUES } from "@/lib/segments";
import { CHOCOLATE_LABELS, type ChocolateKind } from "@/data/recipes";
import { PageIntro } from "@/components/layout/page-intro";
import { QuoteForm, type QuoteOption } from "@/components/pro/quote-form";

export const metadata: Metadata = {
  title: "Demande de devis",
  description: "Décrivez votre projet de coffrets MAISON TAMRĀN personnalisés : entreprise, mariage, événement, hôtel, coffee shop ou épicerie fine. Proposition chiffrée par email.",
  alternates: { canonical: "/professionnels/devis" },
};

async function loadOptions() {
  const [{ products }, boxes, settings] = await Promise.all([getCatalog(), getBoxes(), getSettings()]);
  const recipes: QuoteOption[] = products.map((p) => ({ ref: p.slug, name: p.name, detail: `${CHOCOLATE_LABELS[p.chocolate as ChocolateKind] ?? p.chocolate}, ${p.pairing.charAt(0).toLowerCase()}${p.pairing.slice(1)}` }));
  const boxOpts: QuoteOption[] = boxes.map((b) => ({ ref: b.slug, name: b.name, detail: b.pieces ? `${b.pieces} pièces` : "Format sur mesure" }));
  return { recipes, boxes: boxOpts, contactEmail: settings.contactEmail };
}

/** Lit le segment présélectionné dans l'URL (sous Suspense : donnée liée à la requête). */
async function FormWithSegment({ searchParams, options }: { searchParams: Promise<Record<string, string | string[] | undefined>>; options: Awaited<ReturnType<typeof loadOptions>> }) {
  const sp = await searchParams;
  const raw = typeof sp.segment === "string" ? sp.segment : "";
  const segment = (PRO_SEGMENT_VALUES as readonly string[]).includes(raw) ? raw : "";
  return <QuoteForm {...options} initialSegment={segment} />;
}

export default async function DevisPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const options = await loadOptions();
  return (
    <>
      <PageIntro
        title="Demande de devis"
        crumbs={[{ href: "/professionnels", label: "Professionnels" }, { href: "/professionnels/devis", label: "Demande de devis" }]}
        intro={<p>Décrivez votre projet en quelques minutes. Nous l&apos;étudions et vous adressons une proposition chiffrée par email. Les champs facultatifs sont indiqués comme tels.</p>}
      />
      <section className="container-luxe pb-[var(--section)]" aria-label="Formulaire de demande de devis">
        <Suspense fallback={<QuoteForm {...options} initialSegment="" />}>
          <FormWithSegment searchParams={searchParams} options={options} />
        </Suspense>
      </section>
    </>
  );
}
