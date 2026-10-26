import Image from "next/image";
import Link from "next/link";
import { FadeIn, RevealImage, RevealLines } from "@/components/motion/reveal";
import type { AmbianceImage } from "@/lib/ambiance";

const USAGES = [
  { title: "Cadeaux d'entreprise", text: "Coffrets à votre logo, cartes imprimées, envois groupés ou individuels.", href: "/professionnels/cadeaux-entreprise" },
  { title: "Mariages", text: "Mini-coffrets pour chaque invité, plateaux pour le café, couleurs accordées.", href: "/professionnels/mariages-evenements" },
  { title: "Événements privés", text: "Anniversaires, réceptions, lancements : une pièce servie au bon moment.", href: "/professionnels/mariages-evenements" },
  { title: "Hôtels", text: "Une attention en chambre ou au salon de thé, présentée comme une mignardise.", href: "/professionnels#revendeurs" },
  { title: "Coffee shops", text: "Une datte d'exception à servir avec l'espresso.", href: "/professionnels#revendeurs" },
  { title: "Épiceries fines", text: "Des coffrets à proposer en boutique ; offre de réassort à l'étude.", href: "/professionnels#revendeurs" },
];

/** Professionnels et événements : usages réels de l'offre, sans références clients ni témoignages inventés. */
export function ProsSection({ image }: { image: AmbianceImage | null }) {
  return (
    <section className="on-dark relative overflow-hidden section-pad" aria-labelledby="pro-title">
      <div className="container-luxe grid gap-14 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-5 lg:sticky lg:top-[calc(var(--header-h)+3rem)]">
          <p className="t-eyebrow text-gold">Professionnels</p>
          <RevealLines id="pro-title" lines={["Professionnels", "et événements"]} className="mt-4 t-display-l" />
          <FadeIn delay={0.1}>
            <p className="mt-6 max-w-[44ch] text-taupe">
              Décrivez votre projet : quantités, format, personnalisation, date. Nous revenons vers vous avec une proposition chiffrée, sans engagement.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/professionnels/devis" className="btn btn-gold">Demander un devis</Link>
              <Link href="/professionnels" className="btn btn-outline-light">L&apos;offre professionnelle</Link>
            </div>
          </FadeIn>
          {image && (
            <RevealImage className="mt-12 aspect-[4/3]" from="bottom" parallax={5}>
              <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 38vw, 100vw" quality={75} className="object-cover" />
              <span className="absolute bottom-2 left-3 t-micro text-ivory/75">{image.credit}</span>
            </RevealImage>
          )}
        </div>
        <ul className="lg:col-span-6 lg:col-start-7">
          {USAGES.map((u, i) => (
            <li key={u.title} className="group relative border-t border-line-light py-8 last:border-b">
              <FadeIn delay={i * 0.05}>
                <span aria-hidden className="absolute left-0 top-[-1px] h-px w-0 bg-gold transition-[width] duration-700 ease-[var(--ease-luxe)] group-hover:w-full" />
                <div className="flex items-baseline gap-6">
                  <span className="t-numeral w-8 text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <div className="flex-1">
                    <h3 className="font-display text-[clamp(1.6rem,2.4vw,2.3rem)] leading-tight transition-transform duration-500 group-hover:translate-x-1">
                      <Link href={u.href} className="after:absolute after:inset-0">{u.title}</Link>
                    </h3>
                    <p className="mt-2 max-w-[46ch] t-small text-taupe">{u.text}</p>
                  </div>
                  <span aria-hidden className="text-gold opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-x-1 group-hover:opacity-100">→</span>
                </div>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
