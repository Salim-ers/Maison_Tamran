import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { getBoxes, getCatalog, getSettings } from "@/lib/catalog";
import { euros } from "@/lib/money";
import { PageIntro } from "@/components/layout/page-intro";
import { Media } from "@/components/ui/media";
import { AddFixedBox } from "@/components/product/add-fixed-box";

export const metadata: Metadata = {
  title: "Les coffrets",
  description: "Coffrets MAISON TAMRĀN de 6, 12 et 24 dattes gastronomiques, édition limitée et coffrets personnalisés pour les entreprises.",
  alternates: { canonical: "/coffrets" },
};

export default async function CoffretsPage() {
  const [boxes, { products }, settings] = await Promise.all([getBoxes(), getCatalog(), getSettings()]);
  const nameOf = (slug: string) => products.find((p) => p.slug === slug)?.name ?? slug;
  return (
    <>
      <PageIntro
        title="Les coffrets"
        crumbs={[{ href: "/coffrets", label: "Coffrets" }]}
        intro={
          <p>
            Boîtes rigides au monogramme en relief, calages individuels, papier de soie et carte de dégustation. Composez-les librement, ou laissez-nous la main avec l&apos;édition limitée.
          </p>
        }
      >
        <nav aria-label="Formats" className="mt-8 flex flex-wrap gap-x-8 gap-y-2 t-small">
          {boxes.map((b) => (
            <a key={b.slug} href={`#${b.slug}`} className="link-draw">{b.name.replace("Coffret ", "")}</a>
          ))}
        </nav>
      </PageIntro>

      <div className="pb-[var(--section)]">
        {boxes.map((b, i) => {
          const main = b.images.find((x) => x.role === "main") ?? b.images[0];
          const extra = b.images.find((x) => x.role === "extra");
          const flip = i % 2 === 1;
          return (
            <section key={b.slug} id={b.slug} className={clsx("scroll-mt-28 py-[clamp(3rem,7vw,6rem)]", b.kind === "edition-limitee" && "on-dark", b.kind === "entreprise" && "bg-cream")} aria-labelledby={`${b.slug}-t`}>
              <div className="container-luxe grid items-center gap-12 lg:grid-cols-12">
                <div className={clsx("relative lg:col-span-7", flip && "lg:order-2 lg:col-start-6")}>
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Media image={main} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" badge={b.kind === "edition-limitee" ? "dark" : true} />
                  </div>
                  {extra && (
                    <div className={clsx("absolute -bottom-10 hidden aspect-[4/5] w-[28%] overflow-hidden border-8 lg:block", flip ? "-left-8" : "-right-8", b.kind === "edition-limitee" ? "border-chocolate" : "border-ivory")}>
                      <Media image={extra} fill sizes="16vw" className="object-cover" wrapperClassName="absolute inset-0" badge={false} />
                    </div>
                  )}
                </div>
                <div className={clsx("lg:col-span-4", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9")}>
                  <p className={clsx("t-small", b.kind === "edition-limitee" ? "text-taupe" : "text-ink-soft")}>
                    {b.pieces ? `${b.pieces} pièces` : "Sur mesure"}
                    {b.status === "prototype" && b.kind !== "entreprise" ? ", format et prix provisoires" : ""}
                  </p>
                  <h2 id={`${b.slug}-t`} className="mt-3 t-display-m">{b.name}</h2>
                  <p className={clsx("mt-5", b.kind === "edition-limitee" ? "text-taupe" : "text-ink-soft")}>{b.description}</p>
                  <ul className="mt-6 space-y-2 t-small">
                    {b.details.map((d) => (
                      <li key={d} className="flex gap-3"><span className="mt-2 h-px w-4 shrink-0 bg-bronze" aria-hidden />{d}</li>
                    ))}
                  </ul>
                  {b.fixedComposition && (
                    <p className="mt-6 t-small text-taupe">
                      Composition : {Object.entries(b.fixedComposition).map(([s, q]) => `${q} ${nameOf(s)}`).join(", ")}.
                    </p>
                  )}
                  <p className="mt-8 font-display text-3xl tabular-nums">{euros(b.priceCents)}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {b.quoteOnly ? (
                      <Link href="/professionnels/devis?segment=entreprise" className="btn btn-primary">Demander un devis</Link>
                    ) : b.configurable ? (
                      <Link href={`/composer-mon-coffret?format=${b.pieces}`} className="btn btn-primary">Composer ce coffret</Link>
                    ) : b.fixedComposition ? (
                      <AddFixedBox boxId={b.id} composition={b.fixedComposition} label="Ajouter au panier" light={b.kind === "edition-limitee"} disabled={!b.purchasable || b.stock < 1} />
                    ) : null}
                    {!b.purchasable && !b.quoteOnly && <p className="w-full t-small text-ink-soft">Ce coffret n&apos;est pas encore en vente.</p>}
                    {b.purchasable && !b.quoteOnly && b.stock < 1 && <p className="w-full t-small">Épuisé pour le moment.</p>}
                  </div>
                  {!b.quoteOnly && <p className={clsx("mt-5 t-micro", b.kind === "edition-limitee" ? "text-taupe" : "text-ink-soft")}>Emballage cadeau en option : {euros(settings.giftWrapCents)}.</p>}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
