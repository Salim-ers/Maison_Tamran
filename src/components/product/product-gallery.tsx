"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { ConceptBadge } from "@/components/ui/media";

export type StagePhoto = { key: string; label: string; url: string; alt: string; credit?: string; blur?: string };

type View =
  | { kind: "creation"; key: string; label: string; image: ImageRef; loupe: boolean }
  | { kind: "photo"; key: string; label: string; photo: StagePhoto };

const EASE = [0.22, 0.8, 0.12, 1] as const;
/** Grossissement de la loupe : la macro (1920 px) reste sous ×1,5 de sa définition, même sur écran Retina. */
const LOUPE = 1.7;

/** Vue plein cadre d'une création ; la macro du cœur se parcourt à la loupe (pointeur fin uniquement). */
function CreationView({ image, loupe, priority }: { image: ImageRef; loupe: boolean; priority: boolean }) {
  const reduce = useReducedMotion();
  const [zoom, setZoom] = useState(false);
  const ox = useMotionValue(50);
  const oy = useMotionValue(50);
  const sx = useSpring(ox, { stiffness: 260, damping: 32 });
  const sy = useSpring(oy, { stiffness: 260, damping: 32 });
  // le point visé par la loupe, en fraction de l'image (origine de l'agrandissement)
  const originX = useTransform(sx, (v) => v / 100);
  const originY = useTransform(sy, (v) => v / 100);
  const on = loupe && zoom && !reduce;
  return (
    <div
      className={clsx("absolute inset-0 overflow-hidden", loupe && "lg:cursor-zoom-in", on && "lg:cursor-zoom-out")}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        ox.set(((e.clientX - r.left) / r.width) * 100);
        oy.set(((e.clientY - r.top) / r.height) * 100);
      }}
      onPointerEnter={(e) => loupe && e.pointerType === "mouse" && setZoom(true)}
      onPointerLeave={() => setZoom(false)}
    >
      <motion.div
        className="absolute inset-0"
        style={{ originX, originY }}
        initial={reduce ? false : { scale: 1.08 }}
        animate={{ scale: on ? LOUPE : 1 }}
        transition={{ duration: on ? 0.6 : 1.3, ease: EASE }}
      >
        <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={85} preload={priority} fetchPriority={priority ? "high" : "auto"} loading={priority ? "eager" : "lazy"} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className="object-cover" />
      </motion.div>
    </div>
  );
}

/**
 * Galerie produit : la création en plein cadre (photographie haute définition), puis son cœur en macro, à
 * parcourir à la loupe, puis les ingrédients de la recette. Transitions par rideau, glissement au doigt,
 * flèches du clavier.
 */
export function ProductGallery({ images, name, stages, slug }: { images: ImageRef[]; name: string; stages: StagePhoto[]; slug?: string }) {
  const reduce = useReducedMotion();
  const main = images.find((i) => i.role === "main") ?? images[0];
  const cut = images.find((i) => i.role === "cut");
  const views: View[] = [];
  if (main) views.push({ kind: "creation", key: "creation", label: "La création", image: main, loupe: false });
  if (cut && (cut.w ?? 0) >= 1200) views.push({ kind: "creation", key: "coeur", label: "Le cœur", image: cut, loupe: true });
  for (const s of stages) views.push({ kind: "photo", key: s.key, label: s.label, photo: s });

  const [[i, dir], setView] = useState<[number, number]>([0, 0]);
  const touch = useRef<number | null>(null);
  const cur = views[i];
  if (!cur) return null;
  const go = (k: number) => {
    const n = (k + views.length) % views.length;
    if (n !== i) setView([n, n > i ? 1 : -1]);
  };
  const concept = cur.kind === "creation" && cur.image.concept;

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+1.5rem)]">
      {/* même nom que la photo de la carte du catalogue : l'image glisse d'une page à l'autre */}
      <div
        className="relative aspect-[4/5] touch-pan-y overflow-hidden bg-chocolate"
        style={slug && i === 0 ? { viewTransitionName: `creation-${slug}`, ["viewTransitionClass" as string]: "morph" } : undefined}
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
            {cur.kind === "creation" ? (
              <CreationView image={cur.image} loupe={cur.loupe} priority={i === 0} />
            ) : (
              <>
                <motion.div className="absolute inset-0" initial={reduce ? false : { scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: EASE }}>
                  <Image src={cur.photo.url} alt={cur.photo.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" quality={75} placeholder={cur.photo.blur ? "blur" : "empty"} blurDataURL={cur.photo.blur} className="object-cover" />
                </motion.div>
                {cur.photo.credit && <span className="absolute bottom-4 right-4 t-micro text-ivory/75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{cur.photo.credit}</span>}
              </>
            )}
            <span className="pointer-events-none absolute bottom-4 left-4 bg-ivory/90 px-3 py-1.5 t-micro tracking-[0.14em] text-ink">{cur.label.toUpperCase()}</span>
            {cur.kind === "creation" && cur.loupe && <span className="pointer-events-none absolute bottom-4 right-4 t-micro text-ivory/80 max-lg:hidden">Survolez pour explorer la garniture</span>}
          </motion.div>
        </AnimatePresence>
        {concept && <ConceptBadge className="left-3 top-3 z-[2]" tone="dark" label={cur.image.badge} />}
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
            <button key={v.key} role="tab" aria-selected={k === i} onClick={() => go(k)} className="group relative w-24 shrink-0 text-left outline-offset-2">
              <span className={clsx("relative block aspect-square overflow-hidden bg-chocolate transition-opacity", k === i ? "opacity-100" : "opacity-60 group-hover:opacity-100")}>
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
