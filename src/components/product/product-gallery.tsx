"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";

export type StagePhoto = { key: string; label: string; url: string; alt: string; credit?: string; blur?: string };

type View =
  | { kind: "print"; key: string; label: string; image: ImageRef; stage: StagePhoto | null }
  | { kind: "photo"; key: string; label: string; photo: StagePhoto };

const EASE = [0.22, 0.8, 0.12, 1] as const;

/**
 * Galerie produit en scène. Les photographies des créations n'existent qu'en petite définition : elles sont
 * présentées en tirage, à une taille où elles restent nettes (plafond selon la densité de l'écran), posées sur
 * la grande photographie haute définition d'un ingrédient de la recette. Les autres vues sont ces ingrédients
 * en plein cadre. Aucun zoom ne dépasse la définition réelle d'une image.
 */
export function ProductGallery({ images, name, stages }: { images: ImageRef[]; name: string; stages: StagePhoto[] }) {
  const reduce = useReducedMotion();
  const main = images.find((i) => i.role === "main") ?? images[0];
  const cut = images.find((i) => i.role === "cut");
  const views: View[] = [];
  if (main) views.push({ kind: "print", key: "creation", label: "La création", image: main, stage: stages[0] ?? null });
  // le cœur en tirage seulement si sa définition le permet (photographie de référence)
  if (cut && (cut.w ?? 0) >= 500) views.push({ kind: "print", key: "coeur", label: "Le cœur", image: cut, stage: stages[1] ?? stages[0] ?? null });
  for (const s of stages) views.push({ kind: "photo", key: s.key, label: s.label, photo: s });

  const [[i, dir], setView] = useState<[number, number]>([0, 0]);
  const touch = useRef<number | null>(null);
  const cur = views[i];
  if (!cur) return null;
  const go = (k: number) => {
    const n = (k + views.length) % views.length;
    if (n !== i) setView([n, n > i ? 1 : -1]);
  };

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+1.5rem)]">
      <div
        className="relative aspect-[4/5] touch-pan-y overflow-hidden bg-chocolate"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(i + 1);
          if (e.key === "ArrowLeft") go(i - 1);
        }}
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touch.current === null) return;
          const dx = e.changedTouches[0].clientX - touch.current;
          if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
          touch.current = null;
        }}
        tabIndex={views.length > 1 ? 0 : -1}
        role="group"
        aria-roledescription="galerie"
        aria-label={`${name} : ${cur.label} (${i + 1} sur ${views.length}). Flèches gauche et droite pour changer de vue.`}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={cur.key}
            custom={dir}
            className="absolute inset-0"
            variants={{
              enter: (d: number) => (reduce ? { opacity: 0 } : { clipPath: d >= 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" }),
              center: reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)" },
              exit: { opacity: 1, zIndex: 0 },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.2 : 0.95, ease: EASE }}
            style={{ zIndex: 1 }}
          >
            {cur.kind === "photo" ? (
              <>
                <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
                  <Image src={cur.photo.url} alt={cur.photo.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={75} placeholder={cur.photo.blur ? "blur" : "empty"} blurDataURL={cur.photo.blur} className="object-cover" />
                </motion.div>
                <span className="absolute bottom-4 left-4 bg-ivory/90 px-3 py-1.5 t-micro tracking-[0.14em] text-ink">{cur.label.toUpperCase()}</span>
                {cur.photo.credit && <span className="absolute bottom-4 right-4 t-micro text-ivory/75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{cur.photo.credit}</span>}
              </>
            ) : (
              <>
                {cur.stage && (
                  <>
                    <Image src={cur.stage.url} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" quality={75} className="object-cover" />
                    <span aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(20,12,9,.2),rgba(20,12,9,.62))]" />
                  </>
                )}
                <div className="absolute inset-0 grid place-items-center p-[8%]">
                  <motion.figure
                    className="native-cap bg-cream p-[6px] shadow-[0_40px_70px_-26px_rgba(10,6,4,.9)]"
                    style={{ ["--nat" as string]: cur.image.w ?? 412 }}
                    initial={reduce ? false : { y: 40, rotate: -7, opacity: 0 }}
                    animate={{ y: 0, rotate: -2.5, opacity: 1 }}
                    transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : 0.2 }}
                  >
                    <span className="relative block overflow-hidden" style={{ aspectRatio: `${cur.image.w ?? 412} / ${cur.image.h ?? 495}` }}>
                      <Image src={cur.image.url} alt={cur.image.alt} fill sizes="(min-width: 1024px) 26rem, 70vw" quality={85} preload={i === 0} className="object-cover" />
                    </span>
                    <figcaption className="px-1 pb-0.5 pt-2 text-center text-[0.62rem] tracking-[0.14em] text-ink-soft">VISUEL CONCEPTUEL</figcaption>
                  </motion.figure>
                </div>
                {cur.stage?.credit && <span className="absolute bottom-4 right-4 t-micro text-ivory/70">Fond : {cur.stage.credit}</span>}
              </>
            )}
          </motion.div>
        </AnimatePresence>
        {views.length > 1 && (
          <div className="absolute right-3 top-3 z-[2] flex gap-1">
            {(
              [
                ["Vue précédente", -1, "←"],
                ["Vue suivante", 1, "→"],
              ] as const
            ).map(([label, d, sym]) => (
              <button key={label} type="button" aria-label={label} onClick={() => go(i + d)} className="grid size-9 place-items-center bg-cream/85 text-ink backdrop-blur-sm transition-colors hover:bg-chocolate hover:text-ivory">
                {sym}
              </button>
            ))}
          </div>
        )}
      </div>
      {views.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto" role="tablist" aria-label={`Vues de ${name}`}>
          {views.map((v, k) => (
            <button key={v.key} role="tab" aria-selected={k === i} onClick={() => go(k)} className={clsx("group relative w-24 shrink-0 text-left outline-offset-2 transition-opacity", k === i ? "opacity-100" : "opacity-60 hover:opacity-100")}>
              <span className="relative block aspect-square overflow-hidden bg-chocolate">
                <Image src={v.kind === "photo" ? v.photo.url : v.image.url} alt="" fill sizes="96px" quality={75} className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </span>
              <span className="mt-2 block truncate t-micro text-ink-soft">{v.label}</span>
              <span className={clsx("absolute inset-x-0 top-0 h-[2px] transition-colors", k === i ? "bg-chocolate" : "bg-transparent")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
