"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { clsx } from "clsx";
import type { ImageRef } from "@/db/schema";
import { ConceptBadge } from "@/components/ui/media";

export interface EphemeralItem {
  slug: string;
  name: string;
  pairing: string;
  tagline: string;
  image: ImageRef | null;
  accent: string;
  edition: number;
}

/**
 * Éditions éphémères : des volets verticaux, comme des étiquettes de cave, qui s'ouvrent au survol
 * ou au focus sur grand écran ; une pile d'étiquettes dépliables sur mobile.
 */
export function EphemeralPanels({ items, intro }: { items: EphemeralItem[]; intro: string }) {
  const [active, setActive] = useState(0);
  return (
    <section className="section-pad relative overflow-hidden bg-[#2F2E24] text-ivory" aria-labelledby="ephemere-title">
      <div className="container-luxe">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="ephemere-title" className="t-display-l max-w-[12ch]">Éditions éphémères</h2>
            <p className="mt-5 max-w-[48ch] text-taupe">{intro}</p>
          </div>
          <Link href="/collections/ephemere" className="link-draw t-small">Toute la collection éphémère</Link>
        </div>

        <ul className="mt-14 flex h-[34rem] gap-3 max-lg:h-auto max-lg:flex-col">
          {items.map((it, i) => {
            const on = active === i;
            return (
              <li
                key={it.slug}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={clsx(
                  "relative overflow-hidden transition-[flex-grow,height] duration-[900ms] ease-[var(--ease-luxe)] max-lg:h-auto",
                  on ? "flex-[5]" : "flex-[1]"
                )}
                style={{ ["--accent" as string]: it.accent }}
              >
                <div className="absolute inset-0 max-lg:relative max-lg:aspect-[3/2]">
                  {it.image && (
                    <Image src={it.image.url} alt={it.image.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" quality={75} className={clsx("object-cover transition-[filter,transform] duration-[1.2s]", on ? "scale-100 grayscale-0" : "scale-110 grayscale-[.6] brightness-[.55]")} />
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(28,27,20,.92)_0%,rgba(28,27,20,.2)_55%,transparent_100%)]" />
                  {on && it.image?.concept && <ConceptBadge tone="dark" className="right-3 top-3" />}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 max-lg:relative max-lg:bg-[#26251d] max-lg:p-5">
                  <p className={clsx("t-micro text-taupe", !on && "lg:hidden")}>Édition éphémère N° {it.edition}</p>
                  <h3 className={clsx("mt-2 font-display leading-none transition-all duration-700", on ? "text-4xl" : "text-2xl lg:[writing-mode:vertical-rl] lg:rotate-180 lg:absolute lg:bottom-6 lg:left-6")}>
                    <Link href={`/creations/${it.slug}`} className="focus-visible:outline-none after:absolute after:inset-0">{it.name}</Link>
                  </h3>
                  <div className={clsx("grid transition-[grid-template-rows,opacity] duration-700", on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 max-lg:grid-rows-[1fr] max-lg:opacity-100")}>
                    <div className="overflow-hidden">
                      <p className="mt-3 max-w-[40ch] text-taupe">{it.pairing}</p>
                      <p className="mt-1 max-w-[40ch] font-display text-lg italic">{it.tagline}</p>
                      <p className="mt-4 t-micro text-taupe">Série limitée, disponibilité annoncée à chaque édition.</p>
                    </div>
                  </div>
                  <span className="absolute left-0 top-0 h-full w-[3px]" style={{ background: "var(--accent)" }} aria-hidden />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
