"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { euros } from "@/lib/money";
import { ConceptBadge } from "@/components/ui/media";
import { BrandLogo } from "@/components/brand";

export interface GiftFormat {
  slug: string;
  name: string;
  pieces: number | null;
  priceCents: number | null;
  description: string;
  kind: string;
}

/**
 * Schéma d'un format de coffret (vu de dessus) garni de vignettes photographiques des créations.
 * Ce n'est pas une photographie du coffret : il est légendé « Illustration du format ».
 */
export function FormatDiagram({ pieces, thumbs, className, animate = true }: { pieces: number; thumbs: string[]; className?: string; animate?: boolean }) {
  const reduce = useReducedMotion();
  const cols = pieces <= 6 ? 3 : pieces <= 12 ? 4 : 6;
  return (
    <div className={clsx("relative bg-chocolate p-[5%] shadow-[0_24px_50px_-28px_rgba(0,0,0,.8)]", className)}>
      <div className="pointer-events-none absolute inset-[2.5%] border border-gold/40" aria-hidden />
      <div className="grid gap-[3%]" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: pieces }, (_, i) => (
          <motion.span
            key={i}
            className="relative block aspect-[1.6/1] overflow-hidden rounded-[45%] bg-[#140d0b] shadow-[inset_0_2px_5px_rgba(0,0,0,.6)]"
            initial={reduce || !animate ? false : { opacity: 0, scale: 0.6, y: -6 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.25 + i * (pieces > 12 ? 0.025 : 0.05) }}
          >
            {thumbs.length > 0 && <Image src={thumbs[i % thumbs.length]} alt="" fill sizes="80px" quality={75} className="scale-[1.4] object-cover" />}
          </motion.span>
        ))}
      </div>
      <BrandLogo variant="mark" tone="light" height={40} alt="" className="pointer-events-none absolute bottom-0 left-1/2 h-[10%] -translate-x-1/2 translate-y-1/2" />
    </div>
  );
}

/** « Le plaisir d'offrir, autrement » : le coffret Signature se dévoile comme un couvercle qu'on soulève, puis les formats. */
export function GiftShowcase({ coffret, formats, thumbs, ephemeralThumbs }: { coffret: ImageRef; formats: GiftFormat[]; thumbs: string[]; ephemeralThumbs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "center 55%"] });
  const clip = useTransform(scrollYProgress, [0, 1], reduce ? ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(46% 8% 46% 8%)", "inset(0% 0% 0% 0%)"]);
  const scale = useTransform(scrollYProgress, [0, 1], [reduce ? 1 : 1.18, 1]);
  const glow = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  return (
    <section className="on-dark relative overflow-hidden grain section-pad" aria-labelledby="offrir-title">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[60%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(169,116,68,.28),transparent_65%)]" />
      <div className="container-luxe relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="t-eyebrow text-gold">L&apos;art d&apos;offrir</p>
          <h2 id="offrir-title" className="mt-5 font-display text-[clamp(2.4rem,5.4vw,5.4rem)] leading-[1] tracking-[-0.02em]">
            Le plaisir d&apos;offrir,
            <br />
            <em className="text-gold">autrement.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-taupe">
            Des coffrets rigides, une datte par alvéole, un dattier en relief sur le couvercle : un écrin pensé pour être ouvert lentement.
          </p>
        </div>

        <div ref={ref} className="relative mx-auto mt-16 max-w-6xl">
          <motion.div style={{ clipPath: clip }} className="relative aspect-[4/3] overflow-hidden md:aspect-[16/10]">
            <motion.div style={{ scale }} className="absolute inset-0">
              <Image src={coffret.url} alt={coffret.alt} fill sizes="(min-width: 1200px) 1150px, 100vw" quality={85} placeholder={coffret.blur ? "blur" : "empty"} blurDataURL={coffret.blur} className="object-cover object-[50%_55%]" />
            </motion.div>
            <motion.div style={{ opacity: glow }} aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_55%_40%,rgba(255,226,180,.18),transparent_60%)] mix-blend-screen" />
            {coffret.concept && <ConceptBadge tone="dark" label={coffret.badge} className="right-3 top-3" />}
          </motion.div>
          <p className="mt-4 flex justify-between gap-4 t-small text-taupe">
            <span>Coffret Signature · 12 pièces</span>
            <span className="max-sm:hidden">Couvercle ivoire, dattier en relief</span>
          </p>
        </div>

        <ul className="mt-20 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {formats.map((f, i) => (
            <motion.li
              key={f.slug}
              className="group relative flex flex-col"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8% 0px" }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 0.8, 0.12, 1] }}
            >
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-chocolate-2 p-6 transition-transform duration-700 ease-[var(--ease-luxe)] group-hover:-translate-y-1">
                {f.kind === "signature" ? (
                  <Image src={coffret.url} alt="" fill sizes="(min-width: 1024px) 24vw, 50vw" quality={75} className="object-cover" />
                ) : (
                  <FormatDiagram pieces={f.pieces ?? 12} thumbs={f.kind === "edition-limitee" ? ephemeralThumbs : thumbs} className="w-[86%]" />
                )}
                <span className="absolute left-3 top-3 t-micro tracking-[0.14em] text-taupe">{f.kind === "signature" ? "VISUEL CONCEPTUEL" : "ILLUSTRATION DU FORMAT"}</span>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-2xl">
                  <Link href={`/coffrets#${f.slug}`} className="after:absolute after:inset-0">{f.name}</Link>
                </h3>
                <span className="t-small tabular-nums text-gold">{f.priceCents != null ? euros(f.priceCents) : "Sur devis"}</span>
              </div>
              <p className="mt-1 t-micro uppercase tracking-[0.16em] text-taupe">{f.pieces ? `${f.pieces} pièces` : "Format sur mesure"}</p>
              <p className="mt-3 t-small text-taupe">{f.description}</p>
            </motion.li>
          ))}
        </ul>

        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <Link href="/composer-mon-coffret" className="btn btn-gold min-h-[3.75rem] px-10 text-base">Composer mon coffret</Link>
          <Link href="/coffrets" className="t-small text-taupe link-draw">Tous les coffrets</Link>
        </div>
      </div>
    </section>
  );
}
