import { photo, type PhotoRef } from "@/lib/photos";
import { CoffretHeroScene, type HeroPhoto } from "./coffret-hero-scene";

/** L'accroche en trois temps (retours à la ligne du back-office, sinon par groupes de mots) : le 2e en italique doré. */
function toLines(title: string): [string, string, string] {
  const lines = title.includes("\n") ? title.split("\n") : (() => {
    const words = title.split(" ");
    const per = Math.max(1, Math.ceil(words.length / 3));
    return [0, 1, 2].map((i) => words.slice(i * per, (i + 1) * per).join(" "));
  })();
  return [lines[0] ?? "", lines[1] ?? "", lines.slice(2).join(" ")];
}

const toHero = (p: PhotoRef): HeroPhoto => ({ url: p.url, w: p.w, h: p.h, blur: p.blur, alt: p.alt });

/**
 * Ouverture de l'accueil : le coffret Maison Tamrān photographié fermé (logo officiel posé en marquage cuivré),
 * puis ouvert sur ses douze créations, dans la même prise de vue. Voir CoffretHeroScene.
 */
export function Hero({ title, subtitle, ctaPrimary, ctaSecondary }: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string }) {
  const closed = photo("coffret-ferme");
  const open = photo("coffret-ouvert");
  if (!closed || !open) {
    return (
      <section aria-labelledby="hero-title" className="on-dark grid min-h-[80svh] place-items-center px-[var(--gutter)] pt-[var(--header-h)] text-center">
        <h1 id="hero-title" className="hero-title font-display">{title.replaceAll("\n", " ")}</h1>
      </section>
    );
  }
  return <CoffretHeroScene closed={toHero(closed)} open={toHero(open)} title={toLines(title)} subtitle={subtitle} ctaPrimary={ctaPrimary} ctaSecondary={ctaSecondary} />;
}
