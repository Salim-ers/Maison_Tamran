"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BrandLogo } from "@/components/brand";
import { ConceptBadge } from "@/components/ui/media";
import type { ImageRef } from "@/db/schema";

const EASE = [0.22, 0.8, 0.12, 1] as const;

export function Hero({ image, title, subtitle, ctaPrimary, ctaSecondary }: { image: ImageRef; title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "12%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.06]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-18%"]);

  // Titre découpé en lignes pour la révélation typographique
  const lines = title.split(/(?<=,)\s+/);
  const d = reduce ? 0 : 1;

  return (
    <section ref={ref} className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden grain" aria-labelledby="hero-title">
      {/* Visuel : apparition par masque + balayage lumineux */}
      <motion.div style={{ y: imgY, scale: imgScale }} className="absolute inset-0 -z-10 origin-center">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { clipPath: "inset(12% 0% 12% 38%)", opacity: 0.2 }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
          transition={{ duration: 1.6 * d, delay: 0.35 * d, ease: EASE }}
        >
          <Image src={image.url} alt={image.alt} fill preload sizes="100vw" quality={85} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className="object-cover object-[78%_50%] md:scale-[1.04] md:translate-x-[16%] max-md:object-[72%_30%]" />
        </motion.div>
        {/* voile pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(37,28,26,.97)_0%,rgba(37,28,26,.88)_34%,rgba(37,28,26,.35)_52%,rgba(37,28,26,0)_70%)] max-md:bg-[linear-gradient(180deg,rgba(37,28,26,.1)_0%,rgba(37,28,26,.35)_40%,rgba(37,28,26,.96)_72%)]" />
        {!reduce && (
          <motion.div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[40%] bg-[linear-gradient(100deg,transparent,rgba(255,233,200,.16),transparent)] mix-blend-screen"
            initial={{ x: "-100%" }}
            animate={{ x: "300%" }}
            transition={{ duration: 2.2, delay: 1.2, ease: [0.45, 0, 0.2, 1] }}
          />
        )}
        {image.concept && <ConceptBadge tone="dark" ai={image.ai} className="bottom-6 right-6 max-md:bottom-auto max-md:top-[calc(var(--header-h)+var(--banner-h)+1rem)]" />}
      </motion.div>

      <motion.div style={{ y: textY }} className="container-luxe relative flex flex-1 flex-col justify-end pb-[clamp(3rem,9vh,7rem)] pt-[calc(var(--header-h)+var(--banner-h)+3rem)] max-md:pt-[52svh]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * d, ease: EASE }}
          className="mb-8 flex items-center gap-4 text-bronze-light"
          aria-hidden
        >
          <BrandLogo variant="logo" tone="light" height={112} alt="" preload className="h-24 md:h-28" />
          <motion.span
            initial={reduce ? false : { letterSpacing: "0.4em", opacity: 0 }}
            animate={{ letterSpacing: "0.02em", opacity: 1 }}
            transition={{ duration: 1.4 * d, delay: 0.2 * d, ease: EASE }}
            className="block font-display text-lg italic"
          >
            L&apos;art de sublimer la datte.
          </motion.span>
        </motion.div>

        <h1 id="hero-title" className="font-display text-[clamp(2.75rem,min(6vw,11vh),7rem)] leading-[0.98] tracking-[-0.025em]">
          {lines.map((l, i) => (
            <span key={i} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 1.2 * d, delay: (0.55 + i * 0.14) * d, ease: EASE }}
              >
                {l}
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * d, delay: 1.05 * d, ease: EASE }}
          className="mt-6 max-w-[38ch] t-lead text-taupe"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 * d, delay: 1.25 * d, ease: EASE }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <Link href="/creations" className="btn btn-light">{ctaPrimary}</Link>
          <Link href="/composer-mon-coffret" className="btn btn-outline-light">{ctaSecondary}</Link>
        </motion.div>
      </motion.div>

      <motion.a
        href="#degustation"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 * d }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 t-micro text-taupe md:flex"
      >
        Faire défiler
        <span className="relative block h-10 w-px overflow-hidden bg-line-light">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-bronze-light" animate={reduce ? {} : { y: ["-100%", "200%"] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }} />
        </span>
      </motion.a>
    </section>
  );
}
