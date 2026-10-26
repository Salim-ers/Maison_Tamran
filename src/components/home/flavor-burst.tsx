"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { span } from "@/components/motion/scroll";

export type BurstPiece = { key: string; url: string; natW: number; natH: number; x: number; y: number; w: number; z: number; r: number; label?: string };

const OPEN: [number, number] = [0.08, 0.58];
// sur mobile : moins de pièces (les plus lisibles), sans étiquettes, composition décalée sous le titre
const MOBILE_KEEP = new Set(["ing-chocolat-2", "ing-noisette-5", "ing-amande-1"]);

function Piece({ p, prog, px, py, still }: { p: BurstPiece; prog: MotionValue<number>; px: MotionValue<number>; py: MotionValue<number>; still: boolean }) {
  // départ : serré sur la datte ; arrivée : position finale, plus grand au premier plan
  const k = 0.16;
  const x = useTransform(prog, span(...OPEN), [`${p.x * k}vw`, `${p.x}vw`]);
  const y = useTransform(prog, span(...OPEN), [`${p.y * k}vh`, `${p.y}vh`]);
  const scale = useTransform(prog, span(...OPEN), [0.72, 1 + p.z * 0.1]);
  const rotate = useTransform(prog, span(...OPEN), [p.r - 50, p.r]);
  const opacity = useTransform(prog, span(0, 0.06), [0, 1]);
  const hx = useTransform(px, (v) => v * p.z * 14);
  const hy = useTransform(py, (v) => v * p.z * 10);
  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-1/2"
      style={{ x: still ? `${p.x}vw` : x, y: still ? `${p.y}vh` : y, zIndex: p.z < 0 ? 1 : 3, width: `${p.w}vmin` }}
    >
      <motion.div style={{ x: hx, y: hy }} className="-translate-x-1/2 -translate-y-1/2">
        <motion.div style={still ? { rotate: p.r, scale: 1 + p.z * 0.1, opacity: 1 } : { rotate, scale, opacity }}>
          <Image
            src={p.url}
            alt=""
            width={p.natW}
            height={p.natH}
            sizes={`${Math.round(p.w * 1.3)}vmin`}
            quality={85}
            className={p.z > 0 ? "block h-auto w-full drop-shadow-[0_18px_18px_rgba(0,0,0,.55)]" : "block h-auto w-full opacity-90 drop-shadow-[0_10px_12px_rgba(0,0,0,.5)]"}
            draggable={false}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Label({ p, prog }: { p: BurstPiece; prog: MotionValue<number> }) {
  const opacity = useTransform(prog, span(0.6, 0.7), [0, 1]);
  const y = useTransform(prog, span(0.6, 0.7), ["10px", "0px"]);
  return (
    <motion.span
      aria-hidden
      style={{ x: `${p.x}vw`, y, top: `calc(50% + ${p.y}vh + ${p.w * 0.6}vmin)`, opacity }}
      className="absolute left-1/2 z-[4] -translate-x-1/2 whitespace-nowrap t-micro tracking-[0.2em] text-gold"
    >
      {p.label?.toUpperCase()}
    </motion.span>
  );
}

/**
 * L'explosion des saveurs : les ingrédients des créations, détourés, sont d'abord serrés sur une datte,
 * puis s'écartent en profondeur au défilement (chacun sa trajectoire, plus grands au premier plan),
 * révélant la création qui reste le sujet central. Mouvement contrôlé, sans simulation physique.
 */
export function FlavorBurst({ pieces, product }: { pieces: BurstPiece[]; product: { url: string; alt: string; blur?: string } }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const productScale = useTransform(p, span(...OPEN), [0.84, 1]);
  const glow = useTransform(p, span(0.12, 0.6), [0.15, 1]);
  const rays = useTransform(p, [0, 1], [0, 40]);
  const title = useTransform(p, span(0.02, 0.12), [0, 1]);
  const outro = useTransform(p, span(0.66, 0.76), [0, 1]);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  const shown = mobile ? pieces.filter((pc) => pc.label || MOBILE_KEEP.has(pc.key)).map((pc) => ({ ...pc, y: pc.y + 9, x: pc.x * 1.05 })) : pieces;

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 50, damping: 18 });
  const sy = useSpring(py, { stiffness: 50, damping: 18 });
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      px.set(e.clientX / window.innerWidth - 0.5);
      py.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, px, py]);

  const stage = (
    <div className="relative h-[100svh] overflow-hidden">
      {/* rayons dorés et lumière chaude derrière la datte */}
      <motion.div aria-hidden style={{ rotate: reduce ? 0 : rays, opacity: reduce ? 0.8 : glow }} className="burst-rays pointer-events-none absolute left-1/2 top-1/2 size-[150vmax] -translate-x-1/2 -translate-y-1/2" />
      <motion.div aria-hidden style={{ opacity: reduce ? 1 : glow }} className="pointer-events-none absolute left-1/2 top-1/2 size-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(214,150,80,.45),rgba(150,90,45,.18)_55%,transparent)]" />
      {/* la création, au centre (photographie de référence, cadrée sur les deux dattes) */}
      <motion.div style={{ scale: reduce ? 1 : productScale }} className="burst-plate absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 max-md:top-[59%] overflow-hidden rounded-full shadow-[0_40px_90px_-30px_rgba(0,0,0,.9)] ring-1 ring-gold/40">
        <div className="absolute left-[-19%] top-[-30%] h-[167%] w-[133%]">
          <Image src={product.url} alt={product.alt} fill sizes="(max-width: 767px) 80vw, 560px" quality={85} placeholder={product.blur ? "blur" : "empty"} blurDataURL={product.blur} className="object-cover" />
        </div>
      </motion.div>
      {shown.map((pc) => (
        <Piece key={pc.key} p={pc} prog={p} px={sx} py={sy} still={reduce} />
      ))}
      {!reduce && !mobile && shown.filter((pc) => pc.label).map((pc) => <Label key={pc.key} p={pc} prog={p} />)}

      <motion.div style={{ opacity: reduce ? 1 : title }} className="container-luxe pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)+var(--banner-h,0px)+3vh)] z-[5]">
        <p className="t-eyebrow text-gold">L&apos;explosion des saveurs</p>
        <h2 id="burst-title" className="section-title mt-3 max-w-[10ch] text-ivory">
          Mille saveurs, <em className="text-gold">une datte.</em>
        </h2>
      </motion.div>
      <motion.div style={{ opacity: reduce ? 1 : outro }} className="container-luxe absolute inset-x-0 bottom-[6vh] z-[5] flex flex-wrap items-end justify-between gap-6 max-md:bottom-0 max-md:gap-4 max-md:bg-[linear-gradient(0deg,#120b08_72%,rgba(18,11,8,0))] max-md:pb-[5vh] max-md:pt-16">
        <p className="max-w-[30rem] text-ivory/80 md:text-lg">
          Pistache, noisette, framboise, café, amande, chocolat : chaque création naît d&apos;un accord précis, pensé autour du fruit.
        </p>
        <Link href="/creations" className="btn btn-outline-light">Explorer les accords</Link>
      </motion.div>
      <p className="absolute bottom-2 right-4 z-[5] t-micro text-ivory/45">Ingrédients : photos Unsplash · Café Impérial : visuel conceptuel</p>
    </div>
  );

  return (
    <section ref={ref} className="relative bg-[#120b08] text-ivory" style={{ height: reduce ? undefined : "260svh" }} aria-labelledby="burst-title">
      <div className={reduce ? "" : "sticky top-0"}>{stage}</div>
    </section>
  );
}
