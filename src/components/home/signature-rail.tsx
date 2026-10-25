"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ProductCard, type CardProduct } from "@/components/product/product-card";

/**
 * Créations Signature : défilement horizontal piloté par le scroll vertical sur grand écran
 * (section épinglée), carrousel tactile à défilement natif sur mobile.
 */
export function SignatureRail({ products, intro }: { products: CardProduct[]; intro: string }) {
  const reduce = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const pinned = desktop && !reduce;

  useEffect(() => {
    if (!pinned || !track.current) return;
    const el = track.current;
    const measure = () => setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinned]);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.4 });
  const progress = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const header = (
    <div className="container-luxe flex flex-wrap items-end justify-between gap-6">
      <div>
        <h2 id="signature-title" className="t-display-l max-w-[12ch]">Créations Signature</h2>
        <p className="mt-5 max-w-[46ch] text-ink-soft">{intro}</p>
      </div>
      <Link href="/collections/signature" className="link-draw t-small">Voir la collection</Link>
    </div>
  );

  if (!pinned) {
    return (
      <section ref={section} className="section-pad overflow-hidden" aria-labelledby="signature-title">
        {header}
        <div className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-6 no-scrollbar" tabIndex={0} aria-label="Créations Signature, faites défiler horizontalement">
          {products.map((p) => (
            <ProductCard key={p.slug} p={p} className="w-[78vw] max-w-[22rem] shrink-0 snap-start sm:w-[42vw]" sizes="(min-width: 640px) 42vw, 78vw" />
          ))}
          <div className="w-px shrink-0" aria-hidden />
        </div>
      </section>
    );
  }

  return (
    <section ref={section} style={{ height: `calc(100vh + ${distance}px)` }} className="relative" aria-labelledby="signature-title">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden pt-[calc(var(--header-h)+var(--banner-h))]">
        {header}
        <motion.div ref={track} style={{ x }} className="mt-12 flex w-max gap-8 pl-[var(--gutter)] pr-[30vw]">
          {products.map((p, i) => (
            <div key={p.slug} className={i % 2 ? "mt-16" : ""}>
              <ProductCard p={p} className="w-[clamp(17rem,24vw,24rem)]" sizes="24vw" />
            </div>
          ))}
        </motion.div>
        <div className="container-luxe mt-10">
          <div className="h-px w-full bg-line" aria-hidden>
            <motion.div className="h-px bg-chocolate" style={{ width: progress }} />
          </div>
        </div>
      </div>
    </section>
  );
}
