import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/reveal";

type Picture = { url: string; alt: string; blur?: string } | null;

const USAGES = [
  { title: "Cadeaux d'entreprise", href: "/professionnels/cadeaux-entreprise" },
  { title: "Mariages et événements", href: "/professionnels/mariages-evenements" },
  { title: "Hôtels et coffee shops", href: "/professionnels#revendeurs" },
  { title: "Épiceries fines", href: "/professionnels#revendeurs" },
];

function Panel({ image, children }: { image: Picture; children: React.ReactNode }) {
  return (
    <article className="flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-chocolate">
        {image && (
          <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 46vw, 100vw" quality={82} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className="object-cover" />
        )}
      </div>
      <FadeIn className="flex flex-1 flex-col pt-8">{children}</FadeIn>
    </article>
  );
}

/**
 * La Maison et l'offre professionnelle, côte à côte en un seul écran. Le texte de la Maison est celui de
 * l'administration (contenu « Accueil : la Maison ») ; les usages professionnels renvoient aux pages dédiées.
 */
export function HouseDuo({ title, body, signature, maisonImage, prosImage }: { title: string; body: string; signature: string; maisonImage: Picture; prosImage: Picture }) {
  return (
    <section className="bg-[#f6eddd] section-pad" aria-label="La Maison et les professionnels">
      <div className="container-luxe grid gap-16 lg:grid-cols-2 lg:gap-[clamp(3rem,5vw,6rem)]">
        <Panel image={maisonImage}>
          <p className="t-eyebrow text-bronze">L&apos;univers Maison Tamrān</p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] tracking-[-0.02em]">{title}</h2>
          <p className="mt-5 max-w-[52ch] text-ink-soft">{body}</p>
          <p className="mt-5 font-display text-[1.45rem] italic text-bronze">{signature}</p>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link href="/maison" className="btn btn-primary">Notre Maison</Link>
            <Link href="/savoir-faire" className="btn btn-outline">Le savoir-faire</Link>
          </div>
        </Panel>
        <Panel image={prosImage}>
          <p className="t-eyebrow text-bronze">Professionnels</p>
          <h2 className="mt-4 font-display text-[clamp(2.2rem,3.6vw,3.4rem)] leading-[1.02] tracking-[-0.02em]">Professionnels et événements</h2>
          <p className="mt-5 max-w-[52ch] text-ink-soft">
            Décrivez votre projet : quantités, format, personnalisation, date. Nous revenons vers vous avec une proposition chiffrée, sans engagement.
          </p>
          <ul className="mt-6 grid grid-cols-2 border-t border-chocolate/15">
            {USAGES.map((u) => (
              <li key={u.title} className="border-b border-chocolate/15 odd:pr-4">
                <Link href={u.href} className="group flex items-center justify-between gap-3 py-3.5 t-small">
                  {u.title}
                  <span aria-hidden className="text-bronze transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex flex-wrap gap-3 pt-8">
            <Link href="/professionnels/devis" className="btn btn-primary">Demander un devis</Link>
            <Link href="/professionnels" className="btn btn-outline">L&apos;offre professionnelle</Link>
          </div>
        </Panel>
      </div>
    </section>
  );
}
