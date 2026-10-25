import type { Metadata } from "next";
import Link from "next/link";
import { clsx } from "clsx";
import { getContent } from "@/lib/catalog";
import { PageIntro, Provisional } from "@/components/layout/page-intro";
import { concept, Media } from "@/components/ui/media";
import { savoirFaireEtapes, savoirFaireIntro } from "@/content/registry/savoir-faire";

export const metadata: Metadata = {
  title: "Le savoir-faire",
  description: "Le parcours d'une création TAMBRÉ : sélection des dattes Medjool, ouverture et dénoyautage, garniture, enrobage de chocolat, finition et mise en coffret.",
  alternates: { canonical: "/savoir-faire" },
};

/** Visuels associés à chaque étape (identifiants concept). */
const VISUALS: { main: string; ratio: string; second?: string }[] = [
  { main: "macro-1", ratio: "aspect-square" },
  { main: "couche-datte", ratio: "aspect-[20/11]" },
  { main: "couche-garniture", ratio: "aspect-[20/11]", second: "macro-3" },
  { main: "couche-chocolat", ratio: "aspect-[20/11]", second: "macro-4" },
  { main: "couche-finition", ratio: "aspect-[20/11]", second: "macro-6" },
  { main: "coffret-1", ratio: "aspect-[3/2]", second: "packaging-3" },
];

export default async function SavoirFairePage() {
  const [intro, e] = await Promise.all([
    getContent(savoirFaireIntro.key, savoirFaireIntro.defaults),
    getContent(savoirFaireEtapes.key, savoirFaireEtapes.defaults),
  ]);
  const steps = [
    [e.s1Title, e.s1Body],
    [e.s2Title, e.s2Body],
    [e.s3Title, e.s3Body],
    [e.s4Title, e.s4Body],
    [e.s5Title, e.s5Body],
    [e.s6Title, e.s6Body],
  ].map(([title, body], i) => ({ title, body, ...VISUALS[i] }));

  return (
    <>
      <PageIntro title={intro.title} crumbs={[{ href: "/savoir-faire", label: "Le savoir-faire" }]} intro={<p>{intro.lead}</p>}>
        <nav aria-label="Étapes" className="mt-10">
          <ol className="flex flex-wrap gap-x-7 gap-y-2 t-small">
            {steps.map((s, i) => (
              <li key={s.title}>
                <a href={`#etape-${i + 1}`} className="group inline-flex items-baseline gap-2">
                  <span className="t-numeral text-bronze">{i + 1}</span>
                  <span className="link-draw">{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <Provisional className="mt-10 max-w-[60ch]">{intro.provisional}</Provisional>
      </PageIntro>

      <ol className="pb-[var(--section)]" aria-label="Le parcours d'une création">
        {steps.map((s, i) => {
          const flip = i % 2 === 1;
          const last = i === steps.length - 1;
          return (
            <li key={s.title} id={`etape-${i + 1}`} className={clsx("scroll-mt-28 py-[clamp(3.5rem,8vw,7rem)]", last && "on-dark mt-[clamp(2rem,5vw,4rem)]")}>
              <article className="container-luxe grid items-center gap-10 lg:grid-cols-12 lg:gap-8" aria-labelledby={`etape-${i + 1}-t`}>
                <div className={clsx("relative lg:col-span-7", flip ? "lg:order-2 lg:col-start-6" : "lg:col-start-1")}>
                  <div className={clsx("relative overflow-hidden", s.ratio, i === 0 && "lg:w-[78%]")}>
                    <Media image={concept(s.main)} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" wrapperClassName="absolute inset-0" badge={last ? "dark" : true} badgeClassName={s.second && !flip ? "bottom-3 left-3" : "bottom-3 right-3"} />
                  </div>
                  {s.second && (
                    <div className={clsx("absolute -bottom-12 hidden aspect-square w-[30%] overflow-hidden border-8 md:block", flip ? "-left-6" : "-right-6", last ? "border-chocolate" : "border-ivory")}>
                      <Media image={concept(s.second)} fill sizes="18vw" className="object-cover" wrapperClassName="absolute inset-0" badge={false} />
                    </div>
                  )}
                </div>
                <div className={clsx("lg:col-span-4", flip ? "lg:order-1 lg:col-start-1" : "lg:col-start-9")}>
                  <p className={clsx("t-numeral text-[clamp(3rem,6vw,5.5rem)] leading-none", last ? "text-bronze-light" : "text-bronze")} aria-hidden>{i + 1}</p>
                  <h2 id={`etape-${i + 1}-t`} className="mt-4 t-display-m">
                    <span className="sr-only">Étape {i + 1} : </span>
                    {s.title}
                  </h2>
                  <p className={clsx("mt-6 max-w-[42ch] t-lead", last ? "text-taupe" : "text-ink-soft")}>{s.body}</p>
                  {last && (
                    <div className="mt-10 flex flex-wrap gap-3">
                      <Link href="/coffrets" className="btn btn-light">Voir les coffrets</Link>
                      <Link href="/creations" className="btn btn-outline-light">Les créations</Link>
                    </div>
                  )}
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </>
  );
}
