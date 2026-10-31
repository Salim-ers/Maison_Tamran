"use client";

import Image from "next/image";
import { useEffect } from "react";
import dims from "@/data/logo-dimensions.json";

/** Durée totale de l'ouverture (s) : la classe intro-seen la retire du rendu ensuite. */
const INTRO_S = 2.45;

function done() {
  document.documentElement.classList.add("intro-seen");
}

/**
 * Mémorise la session dès la première page : l'ouverture ne se rejoue ni au changement de page, ni au retour.
 * (Le rideau n'existe que sur l'accueil : inutile de suivre l'adresse.)
 */
export function IntroGate() {
  useEffect(() => {
    try {
      sessionStorage.setItem("mt-intro", "1");
    } catch {}
    if (!document.documentElement.classList.contains("intro-play")) return done();
    const t = window.setTimeout(done, INTRO_S * 1000);
    return () => window.clearTimeout(t);
    // une seule fois par chargement : le layout persiste d'une page à l'autre
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

/**
 * Ouverture de la Maison : fond cacao, le logo officiel se révèle par un masque qui monte (le tronc du T,
 * puis les palmes), un reflet doré le traverse, puis le rideau se lève sur le coffret.
 * Entièrement en CSS ; ne capte aucun clic (sauf « Passer ») et ne bloque jamais l'accès à la boutique.
 */
export function IntroCurtain() {
  const logo = dims["maison-tamran-logo-ivory"];
  return (
    <div aria-hidden className="intro-curtain pointer-events-none fixed inset-0 z-[90]">
      <div className="intro-panel absolute inset-0 grid place-items-center bg-[#120a07]">
        <div className="grain absolute inset-0" />
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_40%_45%_at_50%_48%,rgba(184,124,62,.22),transparent_70%)]" />
        <div className="intro-logo relative w-[min(62vw,26rem)]">
          <Image src="/brand/maison-tamran-logo-ivory.png" alt="" width={logo.w} height={logo.h} sizes="(max-width: 640px) 62vw, 26rem" quality={85} priority className="block h-auto w-full" />
          <span className="intro-sheen absolute inset-0" />
        </div>
      </div>
      <button
        type="button"
        tabIndex={-1}
        onClick={done}
        className="intro-skip pointer-events-auto absolute bottom-6 right-6 t-micro tracking-[0.18em] text-ivory/60 transition-colors hover:text-ivory"
      >
        PASSER
      </button>
    </div>
  );
}
