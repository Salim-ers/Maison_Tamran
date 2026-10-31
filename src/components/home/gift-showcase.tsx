"use client";

import Image from "next/image";
import Link from "next/link";
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { span } from "@/components/motion/scroll";
import { BrandLogo } from "@/components/brand";
import type { ImageRef } from "@/db/schema";
import { euros } from "@/lib/money";
import { ConceptBadge } from "@/components/ui/media";

export type GiftFormat = { slug: string; name: string; pieces: number | null; priceCents: number | null; description: string; kind: string };
/** Photographie d'un format (vue de trois quarts, 4:3) : visuel conceptuel généré à partir des références du coffret. */
export type FormatPhoto = { url: string; w: number; h: number; blur?: string; alt: string };

/** Le format en photographie, révélé par un rideau qui monte (`fill` 0 → 1), avec un léger recul de l'objectif. */
function FormatPhotoCard({ photo, fill, sizes }: { photo: FormatPhoto; fill?: MotionValue<number>; sizes: string }) {
  const still = useMotionValue(1);
  const v = fill ?? still;
  const clipPath = useTransform(v, (k) => `inset(${((1 - k) * 100).toFixed(1)}% 0% 0% 0%)`);
  const scale = useTransform(v, [0, 1], [1.12, 1]);
  return (
    <motion.div style={{ clipPath }} className="relative aspect-[4/3] overflow-hidden shadow-[0_24px_50px_-28px_rgba(0,0,0,.8)]">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image src={photo.url} alt={photo.alt} fill sizes={sizes} quality={80} placeholder={photo.blur ? "blur" : "empty"} blurDataURL={photo.blur} className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

/**
 * Schéma vu de dessus d'un format de coffret (alvéoles). C'est une illustration du format, distincte de
 * toute photographie de produit. `fill` (0 → 1) remplit les alvéoles une à une.
 */
export function FormatDiagram({ pieces, thumbs, className, fill }: { pieces: number; thumbs: string[]; className?: string; fill?: MotionValue<number> }) {
  const cols = pieces <= 6 ? 3 : pieces <= 12 ? 4 : 6;
  // sans pilotage par le défilement : les alvéoles se remplissent une fois, à l'apparition du schéma
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();
  const own = useMotionValue(fill || reduce ? 1 : 0);
  useEffect(() => {
    if (fill || reduce || !inView) return;
    const c = animate(own, 1, { duration: 1.4, ease: [0.22, 0.8, 0.12, 1] });
    return () => c.stop();
  }, [fill, reduce, inView, own]);
  return (
    <div ref={ref} className={clsx("relative bg-chocolate p-[5%] shadow-[0_24px_50px_-28px_rgba(0,0,0,.8)]", className)}>
      <div className="pointer-events-none absolute inset-[2.5%] border border-gold/40" aria-hidden />
      <div className="grid gap-[3%]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: pieces }, (_, i) => (
          <Slot key={i} i={i} pieces={pieces} thumb={thumbs.length ? thumbs[i % thumbs.length] : null} fill={fill ?? own} />
        ))}
      </div>
      <BrandLogo variant="mark" tone="light" height={40} alt="" className="pointer-events-none absolute bottom-0 left-1/2 h-[10%] -translate-x-1/2 translate-y-1/2" />
    </div>
  );
}

function Slot({ i, pieces, thumb, fill }: { i: number; pieces: number; thumb: string | null; fill: MotionValue<number> }) {
  const a = i / pieces;
  const v = useTransform(fill, [a * 0.9, a * 0.9 + 0.12], [0, 1]);
  const scale = useTransform(v, [0, 1], [0.55, 1]);
  const y = useTransform(v, [0, 1], [-8, 0]);
  return (
    <span className="relative block aspect-[1.6/1] overflow-hidden rounded-[45%] bg-[#140d0b] shadow-[inset_0_2px_5px_rgba(0,0,0,.6)]">
      {thumb && (
        <motion.span style={{ opacity: v, scale, y }} className="absolute inset-[5%] block overflow-hidden rounded-[45%]">
          <Image src={thumb} alt="" fill sizes="(min-width: 768px) 128px, 96px" quality={75} className="scale-[1.35] object-cover" />
        </motion.span>
      )}
    </span>
  );
}

function FormatCard({ f, i, p, thumbs, photo }: { f: GiftFormat & { pieces: number }; i: number; p: MotionValue<number>; thumbs: string[]; photo?: FormatPhoto }) {
  const a = 0.48 + i * 0.05;
  const opacity = useTransform(p, span(a, a + 0.08), [0, 1]);
  const y = useTransform(p, span(a, a + 0.1), ["60px", "0px"]);
  const fill = useTransform(p, span(a + 0.04, a + 0.26), [0, 1]);
  const real = f.kind === "signature";
  return (
    <motion.li style={{ opacity, y }} className="flex flex-col">
      {photo ? <FormatPhotoCard photo={photo} fill={fill} sizes="(min-width: 768px) 18vw, 30vw" /> : <FormatDiagram pieces={f.pieces} thumbs={thumbs} fill={fill} className="w-full" />}
      <p className="mt-5 t-micro tracking-[0.18em] text-gold/80 max-md:hidden">{photo ? "VISUEL CONCEPTUEL" : real ? "FORMAT DU COFFRET PHOTOGRAPHIÉ" : "ILLUSTRATION DU FORMAT"}</p>
      <p className="mt-1 font-display text-[1.7rem] leading-tight max-md:mt-3 max-md:text-[1.1rem]">{f.name.replace("Coffret ", "")}</p>
      <p className="t-small text-ivory/65">
        {f.pieces} pièces · {euros(f.priceCents)}
      </p>
    </motion.li>
  );
}

/**
 * L'art d'offrir : le coffret Signature prend vie au défilement.
 * 1. il apparaît, comme deux portes qui s'ouvrent ; 2. le cadrage se rapproche des dattes, qu'une lumière
 * parcourt (zoom borné : la photographie de référence n'est jamais agrandie au-delà de sa définition) ;
 * 3. il s'efface sur la gauche et les trois formats arrivent, leurs alvéoles se remplissant une à une ;
 * 4. relais vers le configurateur.
 */
export function GiftShowcase({ coffret, formats, thumbs, formatPhotos = {} }: { coffret: ImageRef; formats: GiftFormat[]; thumbs: string[]; formatPhotos?: Record<number, FormatPhoto> }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const shown = formats
    .flatMap((f) => (f.pieces && [6, 12, 24].includes(f.pieces) && f.kind !== "edition-limitee" ? [{ ...f, pieces: f.pieces }] : []))
    .sort((a, b) => a.pieces - b.pieces);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // 1. les portes
  const doors = useTransform(p, span(0, 0.16), [0, 1]);
  const clip = useTransform(doors, (e) => {
    const k = 1 - Math.pow(1 - e, 3);
    return `inset(${(6 * (1 - k)).toFixed(2)}% ${(50 * (1 - k)).toFixed(2)}% ${(6 * (1 - k)).toFixed(2)}% ${(50 * (1 - k)).toFixed(2)}%)`;
  });
  // 2. rapprochement et lumière sur les dattes
  const zoom = useTransform(p, span(0.16, 0.38, 0.44, 0.58), [1, 1.18, 1.18, 1]);
  const lx = useTransform(p, span(0.2, 0.4), [22, 78]);
  const light = useMotionTemplate`radial-gradient(ellipse 22% 30% at ${lx}% 70%, rgba(255,210,150,.42), transparent 70%)`;
  const lightO = useTransform(p, span(0.18, 0.22, 0.38, 0.44), [0, 1, 1, 0]);
  // 3. le coffret s'efface vers la gauche, les formats arrivent
  const frameX = useTransform(p, span(0.44, 0.58), [mobile ? "0vw" : "13vw", mobile ? "0vw" : "-24vw"]);
  const frameY = useTransform(p, span(0.44, 0.58), ["0vh", mobile ? "-26vh" : "0vh"]);
  const frameS = useTransform(p, span(0.44, 0.58), [1, mobile ? 0.5 : 0.62]);
  const frameO = useTransform(p, span(0.62, 0.7), [1, 0.35]);
  const t1 = useTransform(p, span(0.02, 0.1, 0.38, 0.44), [0, 1, 1, 0]);
  const t2 = useTransform(p, span(0.2, 0.26, 0.4, 0.46), [0, 1, 1, 0]);
  const t3 = useTransform(p, span(0.5, 0.56), [0, 1]);
  const cta = useTransform(p, span(0.8, 0.88), [0, 1]);
  const ctaEvents = useTransform(cta, (v) => (v > 0.5 ? "auto" : "none"));

  const photo = (
    <div className="relative">
      <Image src={coffret.url} alt={coffret.alt} width={coffret.w ?? 1448} height={coffret.h ?? 1086} sizes="(max-width: 767px) 92vw, 64vw" quality={85} className="block h-auto w-full" />
      {coffret.concept && <ConceptBadge tone="dark" label={coffret.badge} className="bottom-3 right-3" />}
    </div>
  );

  if (reduce) {
    return (
      <section className="on-dark section-pad" aria-labelledby="offrir-title">
        <div className="container-luxe">
          <p className="t-eyebrow text-gold">L&apos;art d&apos;offrir</p>
          <h2 id="offrir-title" className="section-title mt-4 max-w-[12ch]">Le plaisir d&apos;offrir</h2>
          <div className="gift-frame mt-12">{photo}</div>
          <ul className="mt-14 grid gap-10 sm:grid-cols-3">
            {shown.map((f) => (
              <li key={f.slug}>
                {formatPhotos[f.pieces] ? <FormatPhotoCard photo={formatPhotos[f.pieces]} sizes="(min-width: 640px) 30vw, 92vw" /> : <FormatDiagram pieces={f.pieces} thumbs={thumbs} />}
                <p className="mt-4 font-display text-2xl">{f.name.replace("Coffret ", "")}</p>
                <p className="t-small text-ivory/65">{f.pieces} pièces · {euros(f.priceCents)}</p>
              </li>
            ))}
          </ul>
          <Link href="/composer-mon-coffret" className="btn btn-gold mt-12">Composer mon coffret</Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[340vh] bg-[#140c09] text-ivory" aria-labelledby="offrir-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(169,116,68,.3),transparent_70%)]" />
        <div aria-hidden className="grain absolute inset-0" />

        {/* le coffret */}
        <div className="absolute inset-0 flex items-center justify-center pt-[calc(var(--header-h)+var(--banner-h,0px))]">
          <motion.div style={{ x: frameX, y: frameY, scale: frameS, opacity: frameO }} className="gift-frame relative">
            <motion.div style={{ clipPath: clip }} className="relative overflow-hidden shadow-[0_50px_100px_-40px_rgba(0,0,0,.9)]">
              <motion.div style={{ scale: zoom }} className="origin-[55%_70%]">
                {photo}
                <motion.div aria-hidden style={{ background: light, opacity: lightO }} className="pointer-events-none absolute inset-0 mix-blend-soft-light" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* textes */}
        <motion.div style={{ opacity: t1 }} className="container-luxe pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+var(--banner-h,0px)+3vh)]">
          <p className="t-eyebrow text-gold">L&apos;art d&apos;offrir</p>
          <h2 id="offrir-title" className="section-title mt-3 max-w-[11ch]">Le plaisir <em className="text-gold">d&apos;offrir</em></h2>
        </motion.div>
        <motion.div style={{ opacity: t2 }} className="container-luxe pointer-events-none absolute inset-x-0 bottom-[7vh]">
          <p className="max-w-[21rem] text-lg text-ivory/85 max-md:max-w-none max-md:rounded-sm max-md:bg-[#140c09]/80 max-md:p-4">
            Le coffret Signature : douze créations rangées une à une dans leurs caissettes, sous un couvercle frappé du dattier de la maison.
          </p>
        </motion.div>

        {/* les formats */}
        <div className="container-luxe absolute inset-x-0 bottom-[5vh] md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:pl-[38vw]">
          <motion.div style={{ opacity: t3 }}>
            <p className="t-eyebrow text-gold">Trois formats</p>
            <p className="mt-3 max-w-[28rem] font-display text-[clamp(1.5rem,3vw,2.8rem)] leading-tight">Six, douze ou vingt-quatre pièces, à composer vous-même.</p>
          </motion.div>
          <ul className="mt-8 grid grid-cols-3 gap-4 md:gap-8">
            {shown.map((f, i) => (
              <FormatCard key={f.slug} f={f} i={i} p={p} thumbs={thumbs} photo={formatPhotos[f.pieces]} />
            ))}
          </ul>
          <motion.p style={{ opacity: t3 }} className="mt-4 t-micro text-ivory/55 md:hidden">Visuels conceptuels des trois formats.</motion.p>
          <motion.div style={{ opacity: cta, pointerEvents: ctaEvents }} className="mt-10 flex flex-wrap gap-3 max-md:mt-6">
            <Link href="/composer-mon-coffret" className="btn btn-gold">Composer mon coffret</Link>
            <Link href="/coffrets" className="btn btn-outline-light">Voir les coffrets</Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
