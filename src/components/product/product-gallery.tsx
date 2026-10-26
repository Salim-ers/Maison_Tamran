"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { ConceptBadge } from "@/components/ui/media";

const ROLE_LABEL: Record<string, string> = { main: "La création", cut: "Le cœur", scene: "La datte entière", macro: "Détail", extra: "Vue" };

/**
 * Galerie produit : la création, son cœur, la datte entière.
 * Changement de vue par balayage (sens du déplacement), flèches du clavier, glissement au doigt,
 * et loupe au survol sur ordinateur (cliquer pour l'activer).
 */
export function ProductGallery({ images, name }: { images: ImageRef[]; name: string }) {
  const [[i, dir], setView] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const reduce = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const cur = images[i];
  if (!cur) return null;
  const go = (k: number) => {
    const n = (k + images.length) % images.length;
    if (n !== i) setView([n, n > i ? 1 : -1]);
    setZoom(false);
  };

  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+1.5rem)]">
      <div
        ref={frame}
        className={clsx("relative aspect-[4/5] touch-pan-y overflow-hidden bg-sand/40", zoom ? "cursor-zoom-out" : "lg:cursor-zoom-in")}
        onPointerMove={(e) => {
          if (!zoom || !frame.current) return;
          const r = frame.current.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        onClick={(e) => {
          if (!window.matchMedia("(pointer: fine)").matches || !frame.current) return;
          const r = frame.current.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
          setZoom((z) => !z);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(i + 1);
          if (e.key === "ArrowLeft") go(i - 1);
        }}
        tabIndex={images.length > 1 ? 0 : -1}
        role="group"
        aria-roledescription="galerie"
        aria-label={`${name} : ${ROLE_LABEL[cur.role] ?? "vue"} (${i + 1} sur ${images.length}). Flèches gauche et droite pour changer de vue.`}
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={cur.url}
            custom={dir}
            className="absolute inset-0"
            drag={images.length > 1 && !zoom ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(i + 1);
              else if (info.offset.x > 60) go(i - 1);
            }}
            variants={{
              enter: (d: number) => (reduce ? { opacity: 0 } : { clipPath: d >= 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)", scale: 1.06 }),
              center: reduce ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", scale: 1 },
              exit: { opacity: 1, zIndex: 0 },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0.2 : 0.95, ease: [0.22, 0.8, 0.12, 1] }}
            style={{ zIndex: 1 }}
          >
            <motion.div className="absolute inset-0" animate={{ scale: zoom ? 1.8 : 1 }} transition={{ duration: 0.6, ease: [0.22, 0.8, 0.12, 1] }} style={{ transformOrigin: origin }}>
              <Image
                src={cur.url}
                alt={cur.alt}
                fill
                preload={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                quality={85}
                placeholder={cur.blur ? "blur" : "empty"}
                blurDataURL={cur.blur}
                className="pointer-events-none select-none object-cover"
                draggable={false}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
        {cur.concept && <ConceptBadge className="left-3 top-3" label={cur.badge} />}
        <span className="pointer-events-none absolute bottom-3 left-3 z-[2] bg-cream/85 px-2.5 py-1.5 t-micro tracking-[0.12em] text-ink backdrop-blur-sm">
          {(ROLE_LABEL[cur.role] ?? "Vue").toUpperCase()}
        </span>
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 z-[2] flex gap-1">
            {[
              ["Vue précédente", -1, "←"],
              ["Vue suivante", 1, "→"],
            ].map(([label, d, sym]) => (
              <button
                key={label as string}
                type="button"
                aria-label={label as string}
                onClick={(e) => {
                  e.stopPropagation();
                  go(i + (d as number));
                }}
                className="grid size-9 place-items-center bg-cream/85 text-ink backdrop-blur-sm transition-colors hover:bg-chocolate hover:text-ivory"
              >
                {sym}
              </button>
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-3 gap-3" role="tablist" aria-label={`Vues de ${name}`}>
          {images.map((im, k) => (
            <button
              key={im.url}
              role="tab"
              aria-selected={k === i}
              onClick={() => go(k)}
              className={clsx("group relative text-left outline-offset-2 transition-opacity", k === i ? "opacity-100" : "opacity-60 hover:opacity-100")}
            >
              <span className="relative block aspect-[4/3] overflow-hidden">
                <Image src={im.url} alt="" fill sizes="15vw" quality={75} className="object-cover transition-transform duration-700 group-hover:scale-105" />
              </span>
              <span className="mt-2 block t-micro text-ink-soft">{ROLE_LABEL[im.role] ?? "Vue"}</span>
              <span className={clsx("absolute inset-x-0 top-0 h-[2px] transition-colors", k === i ? "bg-chocolate" : "bg-transparent")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
