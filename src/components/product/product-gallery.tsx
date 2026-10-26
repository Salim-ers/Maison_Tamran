"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { ConceptBadge } from "@/components/ui/media";

const ROLE_LABEL: Record<string, string> = { main: "La création", cut: "En coupe", scene: "Les ingrédients", macro: "Détail", extra: "Vue" };

/** Galerie produit : vue principale, coupe, ingrédients. Transition en fondu enchaîné avec léger zoom. */
export function ProductGallery({ images, name }: { images: ImageRef[]; name: string }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const cur = images[i];
  if (!cur) return null;
  return (
    <div className="lg:sticky lg:top-[calc(var(--header-h)+var(--banner-h)+1.5rem)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-taupe/30">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={cur.url}
            className="absolute inset-0"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 0.8, 0.12, 1] }}
          >
            <Image
              src={cur.url}
              alt={cur.alt}
              fill
              preload={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              quality={85}
              placeholder={cur.blur ? "blur" : "empty"}
              blurDataURL={cur.blur}
              className={clsx("object-cover", cur.role === "scene" && "object-center")}
            />
          </motion.div>
        </AnimatePresence>
        {cur.concept && <ConceptBadge className="left-3 top-3" label={cur.badge} />}
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3" role="tablist" aria-label={`Vues de ${name}`}>
          {images.map((im, k) => (
            <button
              key={im.url}
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={clsx("group relative aspect-square overflow-hidden text-left outline-offset-2 transition-opacity", k === i ? "opacity-100" : "opacity-60 hover:opacity-100")}
            >
              <Image src={im.url} alt="" fill sizes="12vw" quality={75} className="object-cover" />
              <span className={clsx("absolute inset-x-0 bottom-0 h-[2px] transition-colors", k === i ? "bg-chocolate" : "bg-transparent")} />
              <span className="sr-only">{ROLE_LABEL[im.role] ?? "Vue"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
