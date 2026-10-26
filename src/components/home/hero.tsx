import Link from "next/link";
import Image from "next/image";
import { scene } from "@/lib/scene";
import { HeroStage, type HeroProp } from "./hero-stage";

/** Découpe l'accroche en lignes (retours à la ligne explicites, sinon par groupes de mots). */
function toLines(title: string) {
  if (title.includes("\n")) return title.split("\n");
  const words = title.split(" ");
  if (words.length <= 3) return [title];
  const per = Math.ceil(words.length / 3);
  return [0, 1, 2].map((i) => words.slice(i * per, (i + 1) * per).join(" ")).filter(Boolean);
}

/**
 * Ingrédients posés autour du coffret (ceux des créations qu'il contient). Positions en % de la boîte du coffret,
 * largeur en % de la largeur du coffret, profondeur = amplitude du parallaxe (négatif : derrière le coffret).
 * Seuls les éléments présents dans le manifeste des scènes sont affichés.
 */
const PROPS: { key: string; x: number; y: number; w: number; depth: number; rotate: number; mobile?: boolean }[] = [
  { key: "ing-pistache-3", x: -11, y: 80, w: 13, depth: 1.6, rotate: -14, mobile: true },
  { key: "ing-amande-1", x: 4, y: 92, w: 8, depth: 2, rotate: 28, mobile: true },
  { key: "ing-pistache-5", x: 66, y: 97, w: 7, depth: 2.2, rotate: 70, mobile: true },
  { key: "ing-amande-2", x: 90, y: 84, w: 6, depth: 1.4, rotate: -36 },
  { key: "ing-chocolat-2", x: -12, y: 22, w: 15, depth: -0.8, rotate: -16 },
  { key: "ing-noisette-5", x: 99, y: 26, w: 6, depth: -0.6, rotate: 0 },
];

/**
 * Ouverture de l'accueil : une scène composée autour du véritable coffret Signature, détouré dans la
 * photographie de référence et affiché à une taille où il reste net (voir IMAGE_AUDIT.md).
 * Entrée en cinq temps (CSS, non bloquante, visible sans JavaScript) :
 *  1. une lumière dorée traverse l'écran, les ombres reculent ;
 *  2. le coffret se révèle par un masque, avec un léger mouvement de profondeur ;
 *  3. le cadrage se resserre sur les dattes, éclairées d'une lueur chaude ;
 *  4. le titre monte ligne à ligne ;
 *  5. l'indicateur de défilement apparaît. HeroStage ajoute la réaction au pointeur et la profondeur au défilement.
 */
export function Hero({ title, subtitle, ctaPrimary, ctaSecondary }: { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string }) {
  const coffret = scene("coffret-ouvert");
  const lines = toLines(title);
  const props: HeroProp[] = PROPS.flatMap((p) => {
    const a = scene(p.key);
    return a ? [{ ...p, url: a.url, natW: a.w, natH: a.h }] : [];
  });

  const backdrop = (
    <div aria-hidden className="absolute inset-0">
      {/* lumière principale, chaude, derrière le coffret ; sombre ailleurs */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_48%_60%_at_70%_44%,rgba(184,124,62,.44),rgba(120,72,38,.16)_45%,transparent_72%)] max-md:bg-[radial-gradient(ellipse_95%_42%_at_50%_30%,rgba(184,124,62,.44),rgba(120,72,38,.14)_50%,transparent_76%)]" />
      {/* plateau de marbre sombre et son reflet */}
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[radial-gradient(ellipse_45%_60%_at_70%_0%,rgba(150,98,56,.22),transparent_70%),linear-gradient(180deg,transparent,rgba(40,26,19,.7)_22%,#1a100c)] max-md:h-[50%] max-md:bg-[linear-gradient(180deg,transparent,#1a100c_40%)]" />
      <div className="grain absolute inset-0" />
    </div>
  );

  // arc marocain outrepassé tracé à l'or, avec un treillis géométrique très discret à l'intérieur
  const arch = (
    <svg aria-hidden className="hero-arch absolute" viewBox="0 0 100 140" preserveAspectRatio="xMidYMax meet" fill="none">
      <defs>
        <pattern id="hero-zellige" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M4 0 L8 4 L4 8 L0 4 Z" stroke="rgba(199,160,106,.16)" strokeWidth=".2" />
        </pattern>
        <clipPath id="hero-arch-clip">
          <path d="M14 140 V72 A36 36 0 1 1 86 72 V140 Z" />
        </clipPath>
        <linearGradient id="hero-arch-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3c38c" />
          <stop offset=".55" stopColor="#b88452" />
          <stop offset="1" stopColor="#a97444" stopOpacity="0" />
        </linearGradient>
        {/* niche : plus sombre en haut, chaude là où se pose le coffret */}
        <linearGradient id="hero-niche" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0806" stopOpacity=".85" />
          <stop offset=".6" stopColor="#2a1810" stopOpacity=".35" />
          <stop offset="1" stopColor="#6b4426" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <path className="anim-scene-fade [animation-delay:.5s]" d="M14 140 V72 A36 36 0 1 1 86 72 V140 Z" fill="url(#hero-niche)" />
      <rect className="anim-scene-fade [animation-delay:.9s]" x="0" y="0" width="100" height="140" fill="url(#hero-zellige)" clipPath="url(#hero-arch-clip)" />
      <path className="anim-arch-draw [animation-delay:.3s]" pathLength={1} d="M8 140 V74 A42 42 0 1 1 92 74 V140" stroke="url(#hero-arch-gold)" strokeWidth=".32" />
      <path className="anim-arch-draw [animation-delay:.6s]" pathLength={1} d="M14 140 V72 A36 36 0 1 1 86 72 V140" stroke="rgba(199,160,106,.42)" strokeWidth=".18" />
    </svg>
  );

  const content = (
    <div className="relative z-[3] max-w-[40rem]">
      <p className="anim-fade-up t-eyebrow text-gold [animation-delay:1s]">
        Maison Tamrān <span className="mx-2 text-gold/50 max-sm:hidden">·</span>
        <span className="max-sm:mt-1.5 max-sm:block">Dattes gastronomiques</span>
      </p>
      <h1 id="hero-title" className="hero-title mt-5 font-display text-ivory md:mt-7">
        <span className="sr-only">MAISON TAMRĀN, dattes gastronomiques et coffrets : </span>
        {lines.map((l, i) => (
          <span key={i} className="-mb-[0.1em] -mt-[0.16em] block overflow-hidden pb-[0.1em] pt-[0.16em]">
            <span className={i === 1 && lines.length === 3 ? "anim-rise block italic text-gold-sheen" : "anim-rise block"} style={{ animationDelay: `${1.05 + i * 0.14}s` }}>
              {l}
            </span>
          </span>
        ))}
      </h1>
      <svg aria-hidden className="mt-6 h-3 w-40 text-gold md:mt-8" viewBox="0 0 160 12" fill="none">
        <path className="anim-arch-draw [animation-delay:1.6s]" pathLength={1} d="M0 6 H70 M90 6 H160" stroke="currentColor" strokeWidth=".8" />
        <path className="anim-scene-fade [animation-delay:1.9s]" d="M80 1 L85 6 L80 11 L75 6 Z" fill="currentColor" />
      </svg>
      <p className="anim-fade-up mt-6 max-w-[31rem] text-[1rem] leading-relaxed text-ivory/80 md:mt-7 md:text-[1.12rem]" style={{ animationDelay: "1.7s" }}>
        {subtitle}
      </p>
      <div className="anim-fade-up mt-8 flex flex-wrap gap-3 md:mt-10" style={{ animationDelay: "1.9s" }}>
        <Link href="/creations" className="btn btn-gold group">
          {ctaPrimary}
          <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
        <Link href="/composer-mon-coffret" className="btn btn-outline-light">{ctaSecondary}</Link>
      </div>
    </div>
  );

  const product = coffret ? (
    <>
      {/* ombre de contact sur le plateau, sous l'arête avant du coffret */}
      <div aria-hidden className="anim-scene-fade absolute bottom-[-4%] left-[-2%] h-[18%] w-[90%] rotate-[17deg] rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,.75),rgba(0,0,0,.35)_55%,transparent)] [animation-delay:.7s]" />
      <div className="anim-scene-focus relative origin-[50%_68%]">
        <div className="anim-scene-reveal">
          <Image
            src={coffret.url}
            alt="Le coffret Signature 12 pièces de MAISON TAMRĀN, ouvert sur douze dattes Medjool garnies"
            width={coffret.w}
            height={coffret.h}
            sizes="(max-width: 767px) 88vw, 46vw"
            quality={85}
            preload
            fetchPriority="high"
            className="block h-auto w-full select-none"
            draggable={false}
          />
        </div>
        {/* les dattes deviennent le point focal : lueur chaude posée sur la garniture */}
        <div aria-hidden className="anim-scene-glow pointer-events-none absolute left-[8%] top-[50%] h-[40%] w-[80%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,196,120,.55),rgba(255,170,90,.18)_55%,transparent)] mix-blend-soft-light" />
      </div>
      <p className="anim-fade-up absolute -bottom-10 right-0 t-micro text-ivory/45 [animation-delay:2.2s] max-md:hidden">Coffret Signature · 12 pièces · visuel conceptuel</p>
    </>
  ) : null;

  return (
    <section className="relative isolate overflow-hidden bg-[#140c09] text-ivory" aria-labelledby="hero-title">
      <HeroStage backdrop={backdrop} arch={arch} product={product} props={props} content={content} />
      {/* temps 1 : la lumière traverse l'écran, les ombres reculent */}
      <div aria-hidden className="anim-scene-beam pointer-events-none absolute inset-y-0 left-0 z-[4] w-full bg-[linear-gradient(105deg,transparent_40%,rgba(255,214,150,.3)_50%,transparent_60%)] mix-blend-screen" />
      <div aria-hidden className="anim-scene-shadows pointer-events-none absolute inset-0 z-[5] bg-[#0b0605]" />
      <a href="#oasis" className="anim-fade-up absolute bottom-6 left-1/2 z-[6] hidden -translate-x-1/2 flex-col items-center gap-3 t-micro text-ivory/70 [animation-delay:2.6s] hover:text-ivory md:flex">
        Défiler
        <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-ivory/15">
          <span className="anim-scroll-cue absolute inset-0 bg-gold" />
        </span>
      </a>
    </section>
  );
}
