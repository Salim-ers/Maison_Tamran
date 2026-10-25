"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { ConceptBadge } from "@/components/ui/media";
import { euros } from "@/lib/money";
import type { ImageRef } from "@/db/schema";

interface BoxLite {
  slug: string;
  name: string;
  pieces: number | null;
  priceCents: number | null;
}

/** Le coffret s'ouvre au fil du scroll (ou d'un clic) : le couvercle glisse et révèle les douze dattes. */
export function CoffretsShowcase({ closed, open, boxes }: { closed: ImageRef; open: ImageRef; boxes: BoxLite[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [manual, setManual] = useState<boolean | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "center 45%"] });
  const clip = useTransform(scrollYProgress, [0, 1], ["inset(0% 0% 0% 0%)", "inset(0% 0% 100% 0%)"]);
  const lift = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);
  const isOpen = manual ?? undefined;

  return (
    <section className="on-dark section-pad relative overflow-hidden" aria-labelledby="coffrets-title">
      <div className="container-luxe grid gap-12 lg:grid-cols-[1.45fr_1fr] lg:items-center">
        <div ref={ref} className="relative aspect-[3/2] overflow-hidden">
          <Image src={open.url} alt={open.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" quality={85} placeholder={open.blur ? "blur" : "empty"} blurDataURL={open.blur} className="object-cover" />
          <motion.div
            className="absolute inset-0"
            style={isOpen === undefined && !reduce ? { clipPath: clip, y: lift } : undefined}
            animate={isOpen === undefined ? undefined : { clipPath: isOpen ? "inset(0% 0% 100% 0%)" : "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.1, ease: [0.22, 0.8, 0.12, 1] }}
            aria-hidden={isOpen === true}
          >
            <Image src={closed.url} alt={closed.alt} fill sizes="(min-width: 1024px) 58vw, 100vw" quality={85} className="object-cover" />
          </motion.div>
          <ConceptBadge tone="dark" className="bottom-3 left-3" />
          <button
            onClick={() => setManual((m) => !(m ?? (reduce ? false : scrollYProgress.get() > 0.5)))}
            className="absolute bottom-3 right-3 bg-chocolate/75 px-3 py-2 text-[0.8rem] text-ivory backdrop-blur-md"
            aria-pressed={manual ?? false}
          >
            {manual ? "Refermer le coffret" : "Ouvrir le coffret"}
          </button>
        </div>
        <div>
          <h2 id="coffrets-title" className="t-display-l max-w-[10ch]">L&apos;art d&apos;offrir</h2>
          <p className="mt-6 max-w-[42ch] t-lead text-taupe">
            Boîtes rigides, monogramme en relief, calages individuels et papier de soie : chaque coffret est pensé pour être ouvert lentement, puis photographié.
          </p>
          <ul className="mt-10 divide-y divide-line-light border-y border-line-light">
            {boxes.map((b) => (
              <li key={b.slug}>
                <Link href={`/coffrets#${b.slug}`} className="group flex items-baseline justify-between gap-4 py-4">
                  <span className="font-display text-2xl transition-colors group-hover:text-bronze-light">{b.name.replace("Coffret ", "")}</span>
                  <span className="t-small text-taupe">
                    {b.pieces ? `${b.pieces} pièces, ` : ""}
                    {euros(b.priceCents)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/coffrets" className="btn btn-light mt-10">Offrir un coffret</Link>
        </div>
      </div>
    </section>
  );
}
