"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { span } from "@/components/motion/scroll";

type Photo = { url: string; w?: number; h?: number; alt?: string; credit?: string; blur?: string };

const TITLE = ["Tout", "commence", "par", "un", "fruit."];

function Word({ word, i, progress }: { word: string; i: number; progress: MotionValue<number> }) {
  const a = 0.05 + i * 0.035;
  const y = useTransform(progress, span(a, a + 0.09), ["110%", "0%"]);
  return (
    <>
      <span className="-mt-[0.16em] inline-block overflow-hidden pb-[0.08em] pt-[0.16em] align-bottom">
        <motion.span style={{ y }} className={i === 4 ? "inline-block italic text-[#fff4dc]" : "inline-block"}>
          {word}
        </motion.span>
      </span>
      {i < TITLE.length - 1 && " "}
    </>
  );
}

/**
 * L'oasis vivante : travelling dans une palmeraie (deux plans : ciel et paysage détouré), la lumière
 * se réchauffe vers l'heure dorée, puis un arc s'ouvre sur les régimes de dattes du palmier.
 * Section épinglée sur ~3 écrans, défilement natif (pas de détournement du scroll).
 */
export function Oasis({ landscape, dattier, foreground }: { landscape: Photo; dattier: Photo; foreground?: Photo | null }) {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [size, setSize] = useState({ w: 1440, h: 900, mobile: false });
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight, mobile: window.innerWidth < 768 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // travelling : le paysage avance plus vite que le ciel (zoom borné sur mobile : la source reste nette)
  const landScale = useTransform(p, span(0, 0.6), [1.02, size.mobile ? 1.07 : 1.17]);
  const skyScale = useTransform(p, span(0, 0.6), [1, 1.03]);
  const landY = useTransform(p, span(0, 0.6), ["0%", "-1.5%"]);
  // premier plan : une couronne de dattier passe devant la caméra (plus vite que tout le reste)
  const fgX = useTransform(p, span(0, 0.55), ["0%", "24%"]);
  const fgY = useTransform(p, span(0, 0.55), ["0%", "18%"]);
  const fgScale = useTransform(p, span(0, 0.55), [1, 1.4]);
  const fgOpacity = useTransform(p, span(0.48, 0.56), [1, 0]);
  // lumière : du plein jour vers l'heure dorée
  const warm = useTransform(p, span(0.12, 0.55), [0, 0.75]);
  // soleil derrière la couronne du grand palmier (contre-jour), qui descend vers l'horizon
  const sunX = useTransform(p, span(0, 0.6), size.mobile ? ["52%", "50%"] : ["24%", "30%"]);
  const sunY = useTransform(p, span(0, 0.6), ["20%", "36%"]);
  const haze = useTransform(p, span(0.2, 0.6), [0.15, 0.45]);
  // textes
  const titleOut = useTransform(p, span(0.46, 0.58), [1, 0]);
  const titleY = useTransform(p, span(0.46, 0.58), ["0%", "-30%"]);
  const lead = useTransform(p, span(0.22, 0.3, 0.46, 0.56), [0, 1, 1, 0]);
  // l'arc s'ouvre sur le dattier
  const open = useTransform(p, span(0.55, 0.86), [0, 1]);
  const clipPath = useTransform(open, (e) => {
    const { w: W, h: H, mobile } = size;
    const k = 1 - Math.pow(1 - e, 3);
    const w0 = (mobile ? 0.62 : 0.26) * W;
    const h0 = (mobile ? 0.52 : 0.64) * H;
    const w = w0 + (W - w0) * k;
    const h = h0 + (H - h0) * k;
    const top = (H - h0) * 0.62 * (1 - k);
    const side = (W - w) / 2;
    const r = (w / 2) * (1 - k);
    return `inset(${top.toFixed(1)}px ${side.toFixed(1)}px ${(H - top - h).toFixed(1)}px ${side.toFixed(1)}px round ${r.toFixed(1)}px ${r.toFixed(1)}px 0px 0px)`;
  });
  const dattierScale = useTransform(open, [0, 1], [1.18, 1]);
  const archShow = useTransform(p, span(0.53, 0.56), [0, 1]);
  const caption = useTransform(p, span(0.8, 0.9), [0, 1]);
  const captionY = useTransform(p, span(0.8, 0.9), ["24px", "0px"]);

  const landscapeImg = (
    <Image
      src={landscape.url}
      alt={landscape.alt ?? "Palmeraie de dattiers au milieu des dunes de sable doré"}
      fill
      sizes="(max-aspect-ratio: 1968/1000) 197vh, 100vw"
      quality={75}
      className="object-cover"
    />
  );
  const dattierImg = (
    <Image
      src={dattier.url}
      alt={dattier.alt ?? "Régimes de dattes suspendus sous les palmes d'un dattier"}
      fill
      sizes="(max-aspect-ratio: 2/3) 67vh, 100vw"
      quality={75}
      placeholder={dattier.blur ? "blur" : "empty"}
      blurDataURL={dattier.blur}
      className="object-cover object-[45%_60%]"
    />
  );

  if (reduce) {
    return (
      <section id="oasis" className="bg-creme" aria-labelledby="oasis-title">
        <div className="relative h-[80svh] overflow-hidden bg-[linear-gradient(180deg,#5a7aa8,#839cbe_40%,#a9b3c2_62%)]">
          {landscapeImg}
          <div className="container-luxe absolute inset-x-0 top-[calc(var(--header-h)+var(--banner-h,0px)+5vh)]">
            <p className="t-eyebrow text-ivory">L&apos;oasis</p>
            <h2 id="oasis-title" className="mt-4 oasis-title text-ivory">Tout commence par un fruit.</h2>
          </div>
        </div>
        <div className="relative h-[90svh] overflow-hidden">{dattierImg}</div>
      </section>
    );
  }

  return (
    <section ref={ref} id="oasis" className="relative h-[330vh] bg-[#a9b3c2]" aria-labelledby="oasis-title">
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        {/* plan lointain : le ciel (reprend les couleurs du ciel de la photo) */}
        <motion.div style={{ scale: skyScale }} className="oasis-frame absolute left-1/2 top-1/2 origin-[50%_62%] bg-[linear-gradient(180deg,#5a7aa8_0%,#6989b2_20%,#839cbe_40%,#9daec3_55%,#a9b3c2_62%,#c8b79a_70%)]" />
        {/* soleil */}
        <motion.div
          aria-hidden
          style={{ left: sunX, top: sunY }}
          className="pointer-events-none absolute size-[46vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,236,196,.85),rgba(255,206,140,.35)_40%,transparent)] mix-blend-screen"
        />
        {/* plan rapproché : palmiers et dunes */}
        <motion.div style={{ scale: landScale, y: landY }} className="oasis-frame absolute left-1/2 top-1/2 origin-[50%_66%]">
          {landscapeImg}
        </motion.div>
        {foreground && (
          <motion.div aria-hidden style={{ x: fgX, y: fgY, scale: fgScale, opacity: fgOpacity }} className="pointer-events-none absolute -right-[16vw] top-[46vh] w-[min(64vw,1100px)] origin-[80%_20%] max-md:-right-[50vw] max-md:top-[30vh] max-md:w-[120vw]">
            <Image src={foreground.url} alt="" width={foreground.w ?? 2600} height={foreground.h ?? 1819} sizes="(max-width: 767px) 130vw, 78vw" quality={75} className="block h-auto w-full brightness-[.62] saturate-[.9]" />
          </motion.div>
        )}
        {/* brume de chaleur sur l'horizon, puis lumière dorée */}
        <motion.div aria-hidden style={{ opacity: haze }} className="pointer-events-none absolute inset-x-0 top-[38%] h-[30%] bg-[linear-gradient(180deg,transparent,rgba(255,236,206,.7)_50%,transparent)]" />
        <motion.div aria-hidden style={{ opacity: warm }} className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(214,120,48,.55),rgba(240,170,80,.35)_45%,rgba(120,60,20,.45))] mix-blend-soft-light" />
        <motion.div aria-hidden style={{ opacity: warm }} className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(236,150,70,.42),rgba(245,190,120,.3)_50%,rgba(170,90,40,.4))] mix-blend-multiply" />
        <motion.div aria-hidden style={{ opacity: warm }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(180deg,transparent,rgba(36,23,19,.55))]" />

        {/* titre */}
        {/* mobile : voile sombre en bas pour le titre posé sur les dunes */}
        <motion.div aria-hidden style={{ opacity: titleOut }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[linear-gradient(180deg,transparent,rgba(20,12,9,.72))] md:hidden" />
        <motion.div style={{ opacity: titleOut, y: titleY }} className="absolute inset-x-0 bottom-[9vh] px-[var(--gutter)] text-ivory md:bottom-auto md:left-auto md:right-0 md:top-[calc(var(--header-h)+var(--banner-h,0px)+7vh)] md:w-[52%] md:pl-0">
          <p className="t-eyebrow [text-shadow:0_1px_12px_rgba(20,12,9,.35)]">L&apos;oasis</p>
          <h2 id="oasis-title" className="oasis-title mt-4 max-w-[13ch] [text-shadow:0_2px_30px_rgba(20,12,9,.28)]">
            {TITLE.map((w, i) => (
              <Word key={w} word={w} i={i} progress={p} />
            ))}
          </h2>
          <motion.p style={{ opacity: lead }} className="mt-6 max-w-[30rem] text-lg leading-relaxed text-ivory [text-shadow:0_1px_3px_rgba(20,12,9,.55),0_2px_24px_rgba(20,12,9,.45)] md:text-xl">
            Dans les palmeraies, le dattier porte ses fruits par régimes entiers, mûris lentement au soleil.
          </motion.p>
        </motion.div>
        {landscape.credit && (
          <p className="absolute bottom-3 right-4 t-micro text-ivory/75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">
            {landscape.credit}
            {foreground?.credit && ` · palme : ${foreground.credit.replace("Photo ", "")}`}
          </p>
        )}

        {/* l'arc s'ouvre : les dattes sur leur palmier */}
        <motion.div style={{ clipPath, opacity: archShow }} className="absolute inset-0 overflow-hidden bg-chocolate">
          <motion.div style={{ scale: dattierScale }} className="absolute inset-0 origin-[50%_60%]">
            {dattierImg}
          </motion.div>
          <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,12,9,.5),rgba(20,12,9,.06)_50%,transparent),linear-gradient(0deg,rgba(20,12,9,.45),transparent_35%)]" />
          <motion.div style={{ opacity: caption, y: captionY }} className="container-luxe absolute inset-x-0 bottom-[12vh] text-ivory">
            <p className="t-eyebrow text-gold">Le fruit</p>
            <p className="mt-4 max-w-[16ch] font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.02]">Sur le dattier, les régimes mûrissent au soleil.</p>
          </motion.div>
          {dattier.credit && <p className="absolute bottom-3 right-4 t-micro text-ivory/75">{dattier.credit}</p>}
        </motion.div>
      </div>
    </section>
  );
}
