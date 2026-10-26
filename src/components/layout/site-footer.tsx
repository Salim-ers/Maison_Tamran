import Link from "next/link";
import { BrandLogo } from "@/components/brand";
import { getSettings } from "@/lib/catalog";
import { storeMode } from "@/lib/env";
import { IconInstagram, IconLinkedin, IconPinterest } from "./icons";
import { CookieSettingsLink } from "@/components/consent/cookie-settings-link";

const COLS = [
  {
    title: "Créations",
    links: [
      ["/creations", "Toutes les créations"],
      ["/collections/signature", "Collection Signature"],
      ["/collections/ephemere", "Collection Éphémère"],
      ["/coffrets", "Les coffrets"],
      ["/composer-mon-coffret", "Composer mon coffret"],
    ],
  },
  {
    title: "La Maison",
    links: [
      ["/maison", "Notre Maison"],
      ["/savoir-faire", "Le savoir-faire"],
      ["/professionnels", "Professionnels"],
      ["/professionnels/cadeaux-entreprise", "Cadeaux d'entreprise"],
      ["/professionnels/mariages-evenements", "Mariages et événements"],
    ],
  },
  {
    title: "Service client",
    links: [
      ["/faq", "Questions fréquentes"],
      ["/livraison-retours", "Livraison et retours"],
      ["/suivi-commande", "Suivre une commande"],
      ["/compte", "Mon compte"],
      ["/contact", "Nous écrire"],
    ],
  },
];

const SOCIAL = [
  { key: "instagram", label: "Instagram", Icon: IconInstagram },
  { key: "pinterest", label: "Pinterest", Icon: IconPinterest },
  { key: "linkedin", label: "LinkedIn", Icon: IconLinkedin },
] as const;

/** Adresse non configurée (domaine d'exemple ou valeur entre crochets) : on ne l'affiche pas, on renvoie vers le formulaire. */
const isPlaceholderEmail = (v: string | null | undefined) => !v || /\.example$|\[/i.test(v);

export async function SiteFooter() {
  const settings = await getSettings();
  const demo = storeMode() === "demo";
  const social = SOCIAL.filter((s) => settings.social[s.key]);
  const email = isPlaceholderEmail(settings.contactEmail) ? null : settings.contactEmail;
  return (
    <footer className="on-dark relative overflow-hidden">
      {/* filet bronze et dattier : transition depuis la section précédente */}
      <div className="container-luxe relative flex items-center gap-6 pt-16" aria-hidden>
        <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(199,160,106,.6))]" />
        <BrandLogo variant="mark" tone="light" height={44} alt="" className="h-11 opacity-80" />
        <span className="h-px flex-1 bg-[linear-gradient(90deg,rgba(199,160,106,.6),transparent)]" />
      </div>

      <div className="container-luxe grid gap-14 pb-12 pt-14 lg:grid-cols-[1.1fr_2fr]">
        <div className="max-w-sm">
          <BrandLogo variant="logo" tone="light" height={176} className="h-36 lg:h-44" />
          <p className="mt-6 font-display text-xl italic text-gold">L&apos;art de sublimer la datte.</p>
          <p className="mt-6 t-small text-taupe">
            Une question sur une commande, un cadeau, une allergie&nbsp;?{" "}
            {email ? (
              <a className="link-draw text-ivory" href={`mailto:${email}`}>{email}</a>
            ) : (
              <Link className="link-draw text-ivory" href="/contact">Écrivez-nous</Link>
            )}
          </p>
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {COLS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <h2 className="t-eyebrow text-gold">{c.title}</h2>
              <ul className="mt-5 space-y-3 t-small">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="inline-block transition-[color,transform] duration-500 hover:translate-x-1 hover:text-gold">{label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="container-luxe grid gap-6 border-t border-line-light py-8 t-small text-taupe md:grid-cols-3">
        <p>{demo ? "Paiement : boutique en mode démonstration, aucun encaissement." : "Paiement sécurisé par Stripe : carte bancaire, Apple Pay, Google Pay."}</p>
        <p>Livraison en France et dans six pays européens. Tarifs et conditions dans <Link href="/livraison-retours" className="link-draw text-ivory">Livraison et retours</Link>.</p>
        {social.length > 0 && (
          <div className="flex items-center gap-4 md:justify-end">
            {social.map(({ key, label, Icon }) => (
              <a key={key} href={settings.social[key]} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-ivory transition-colors hover:text-gold">
                <Icon className="size-5" />
              </a>
            ))}
          </div>
        )}
      </div>

      <div className="container-luxe flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line-light py-6 t-micro text-taupe">
        <span>© {settings.legal.companyName && !settings.legal.companyName.startsWith("[") ? settings.legal.companyName : "MAISON TAMRĀN"}</span>
        <Link href="/mentions-legales" className="hover:text-ivory">Mentions légales</Link>
        <Link href="/cgv" className="hover:text-ivory">Conditions générales de vente</Link>
        <Link href="/confidentialite" className="hover:text-ivory">Confidentialité</Link>
        <Link href="/cookies" className="hover:text-ivory">Cookies</Link>
        <CookieSettingsLink className="hover:text-ivory" />
      </div>

      {/* grand nom, coupé par le bas de page comme une signature gravée */}
      <p aria-hidden className="pointer-events-none -mb-[0.22em] select-none whitespace-nowrap text-center font-display text-[11.2vw] leading-[0.8] tracking-[-0.02em] bg-[linear-gradient(180deg,rgba(199,160,106,.6),rgba(199,160,106,.06))] bg-clip-text text-transparent">
        MAISON TAMRĀN
      </p>
    </footer>
  );
}
