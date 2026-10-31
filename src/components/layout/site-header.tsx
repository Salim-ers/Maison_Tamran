"use client";

import Image from "next/image";
import Link from "@/components/motion/transition-link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { useReducedMotion } from "@/components/motion/reduced-motion";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/brand";
import { useCart } from "@/components/cart/cart-context";
import { IconBag, IconSearch, IconUser } from "./icons";

/** Carte illustrée d'un menu déroulant (préparée côté serveur : voir headerMenus()). */
export type MenuFeature = { href: string; title: string; text: string; image: { url: string; alt: string; blur?: string } | null };
export type HeaderMenus = { creations: MenuFeature[]; maison: MenuFeature[] };

type Item = {
  href: string;
  label: string;
  match: string[];
  panel?: keyof HeaderMenus;
  links?: { href: string; label: string; note: string }[];
};

const NAV: Item[] = [
  {
    href: "/creations",
    label: "Créations",
    match: ["/creations", "/collections"],
    panel: "creations",
    links: [
      { href: "/creations", label: "Toutes les créations", note: "Les dix recettes" },
      { href: "/collections/signature", label: "Collection Signature", note: "Six créations" },
      { href: "/collections/ephemere", label: "Collection Éphémère", note: "Quatre créations" },
    ],
  },
  { href: "/coffrets", label: "Coffrets", match: ["/coffrets"] },
  {
    href: "/maison",
    label: "La Maison",
    match: ["/maison", "/savoir-faire"],
    panel: "maison",
    links: [
      { href: "/maison", label: "Notre Maison", note: "Notre histoire" },
      { href: "/savoir-faire", label: "Le savoir-faire", note: "De la datte à la création" },
      { href: "/faq", label: "Questions fréquentes", note: "Livraison, conservation, allergènes" },
      { href: "/contact", label: "Contact", note: "Nous écrire" },
    ],
  },
  { href: "/professionnels", label: "Professionnels", match: ["/professionnels"] },
];

const MOBILE = [
  { href: "/creations", label: "Toutes les créations" },
  { href: "/collections/signature", label: "Collection Signature" },
  { href: "/collections/ephemere", label: "Collection Éphémère" },
  { href: "/coffrets", label: "Les coffrets" },
  { href: "/composer-mon-coffret", label: "Composer mon coffret" },
  { href: "/maison", label: "Notre Maison" },
  { href: "/savoir-faire", label: "Le savoir-faire" },
  { href: "/professionnels", label: "Professionnels" },
];

const isActive = (path: string | null, match: string[]) => path != null && match.some((m) => path === m || path.startsWith(`${m}/`));

/** Lit l'URL courante. Isolé dans sa propre frontière Suspense : l'en-tête lui-même n'est jamais suspendu. */
function PathSync({ onPath }: { onPath: (path: string) => void }) {
  const path = usePathname();
  useEffect(() => onPath(path), [path, onPath]);
  return null;
}

/**
 * En-tête du site : une barre sombre de hauteur constante, identique sur toutes les pages (aucun changement de
 * taille, de couleur ni de position d'une page à l'autre ou au défilement). Menus déroulants illustrés pour
 * les créations et la Maison (survol, ou bouton dédié au clavier) ; filet doré de progression de lecture.
 * L'URL ne sert qu'à marquer la rubrique active : elle arrive par PathSync, sans jamais remplacer l'en-tête
 * par une version de secours pendant une navigation (le logo n'est jamais redessiné).
 */
export function SiteHeader({ menus }: { menus: HeaderMenus }) {
  const [path, setPath] = useState<string | null>(null);
  const reduce = useReducedMotion();
  const { cart, setOpen, pulse } = useCart();
  const [panel, setPanel] = useState<keyof HeaderMenus | null>(null);
  const [menu, setMenu] = useState(false);
  const closeTimer = useRef(0);
  // après un changement de page, la souris est encore sur la rubrique cliquée : pas de réouverture du menu
  // tant qu'elle ne l'a pas quittée
  const hoverLock = useRef(false);
  const lastPath = useRef<string | null>(null);
  const { scrollYProgress } = useScroll();
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    if (lastPath.current !== null) hoverLock.current = true;
    lastPath.current = path;
    setPanel(null);
    setMenu(false);
  }, [path]);

  useEffect(() => {
    if (!panel && !menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (panel) document.getElementById(`trigger-${panel}`)?.focus();
      setPanel(null);
      setMenu(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel, menu]);

  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const open = (p: keyof HeaderMenus | null) => {
    if (hoverLock.current) return;
    window.clearTimeout(closeTimer.current);
    setPanel(p);
  };
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setPanel(null), 180);
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-50 text-ivory"
        // immobile pendant les transitions de page (voir globals.css)
        style={{ viewTransitionName: "site-header" }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          hoverLock.current = false;
          closeSoon();
        }}
        onPointerEnter={() => window.clearTimeout(closeTimer.current)}
      >
        <div className="relative z-[2] border-b border-white/[0.07] bg-[#170f0c]">
          <div className="container-luxe grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
            <div className="flex items-center">
              <button
                className="-ml-2 flex items-center gap-2.5 p-2 text-[0.72rem] uppercase tracking-[0.18em] lg:hidden"
                aria-expanded={menu}
                aria-controls="menu-mobile"
                onClick={() => setMenu((m) => !m)}
              >
                <span className="relative block h-2.5 w-5" aria-hidden>
                  <span className={clsx("absolute left-0 h-px w-5 bg-current transition-transform duration-500", menu ? "top-[5px] rotate-45" : "top-0")} />
                  <span className={clsx("absolute left-0 h-px w-5 bg-current transition-transform duration-500", menu ? "top-[5px] -rotate-45" : "top-2.5")} />
                </span>
                <span className="max-xs:sr-only">{menu ? "Fermer" : "Menu"}</span>
              </button>
              <Link href="/" aria-label="MAISON TAMRĀN, accueil" className="hidden lg:block">
                <BrandLogo variant="lockup" tone="light" height={50} alt="" preload steady className="h-[3.1rem]" />
              </Link>
            </div>

            <Link href="/" aria-label="MAISON TAMRĀN, accueil" className="lg:hidden">
              <BrandLogo variant="lockup" tone="light" height={40} alt="" steady className="h-10" />
            </Link>

            <nav aria-label="Navigation principale" className="hidden lg:block">
              <ul className="flex items-center">
                {NAV.map((it) => {
                  const current = isActive(path, it.match);
                  return (
                    <li
                      key={it.href}
                      className="flex items-center"
                      onPointerEnter={(e) => e.pointerType === "mouse" && open(it.panel ?? null)}
                      onPointerLeave={() => (hoverLock.current = false)}
                    >
                      <Link
                        href={it.href}
                        aria-current={current ? "page" : undefined}
                        onClick={() => setPanel(null)}
                        className={clsx(
                          "relative flex h-[var(--header-h)] items-center px-4 text-[0.74rem] uppercase tracking-[0.2em] transition-colors duration-300 xl:px-5",
                          current || panel === it.panel ? "text-ivory" : "text-ivory/70 hover:text-ivory"
                        )}
                      >
                        {it.label}
                        {current && (
                          <motion.span layoutId="nav-current" transition={{ type: "spring", stiffness: 380, damping: 36 }} className="absolute inset-x-4 bottom-[1.45rem] h-px bg-gold xl:inset-x-5" />
                        )}
                      </Link>
                      {it.panel && (
                        <button
                          id={`trigger-${it.panel}`}
                          type="button"
                          aria-expanded={panel === it.panel}
                          aria-controls={`panel-${it.panel}`}
                          aria-label={`${it.label} : afficher le menu`}
                          onClick={() => setPanel((p) => (p === it.panel ? null : it.panel!))}
                          className="-ml-3 mr-1 grid size-6 place-items-center text-ivory/55 transition-colors hover:text-ivory"
                        >
                          <svg viewBox="0 0 10 6" aria-hidden className={clsx("w-2 transition-transform duration-300", panel === it.panel && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.2">
                            <path d="m1 1 4 4 4-4" />
                          </svg>
                        </button>
                      )}
                      {it.panel && (
                        <AnimatePresence>
                          {panel === it.panel && (
                            <motion.div
                              id={`panel-${it.panel}`}
                              initial={reduce ? false : { opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -10 }}
                              transition={{ duration: 0.28, ease: [0.22, 0.8, 0.12, 1] }}
                              className="absolute inset-x-0 top-full z-[1] border-b border-white/[0.07] bg-[#170f0c] shadow-[0_30px_60px_-30px_rgba(0,0,0,.7)]"
                            >
                              <div className="container-luxe grid grid-cols-[minmax(17rem,1fr)_2fr] gap-[clamp(2rem,5vw,5rem)] py-10">
                                <ul className="space-y-0.5 border-r border-white/[0.07] pr-8">
                                  {it.links?.map((l) => (
                                    <li key={l.href}>
                                      <Link href={l.href} onClick={() => setPanel(null)} className="group block py-2.5">
                                        <span className="block whitespace-nowrap font-display text-[1.4rem] leading-tight transition-colors group-hover:text-gold">{l.label}</span>
                                        <span className="mt-1 block t-micro text-ivory/55">{l.note}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                                <ul className="grid grid-cols-2 gap-6">
                                  {menus[it.panel!].map((f) => (
                                    <li key={f.href}>
                                      <Link href={f.href} onClick={() => setPanel(null)} className="group block">
                                        <span className="relative block aspect-[16/9] overflow-hidden bg-chocolate">
                                          {f.image && (
                                            <Image src={f.image.url} alt="" fill sizes="30vw" quality={85} placeholder={f.image.blur ? "blur" : "empty"} blurDataURL={f.image.blur} className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-[1.05]" />
                                          )}
                                        </span>
                                        <span className="mt-4 flex items-center justify-between gap-4">
                                          <span className="font-display text-[1.25rem]">{f.title}</span>
                                          <span aria-hidden className="text-gold transition-transform duration-300 group-hover:translate-x-1">→</span>
                                        </span>
                                        <span className="mt-1 block t-small text-ivory/60">{f.text}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center justify-end gap-1">
              <Link href="/recherche" aria-label="Rechercher" className="hidden p-2 text-ivory/80 transition-colors hover:text-ivory sm:block">
                <IconSearch className="size-[1.15rem]" />
              </Link>
              <Link href="/compte" aria-label="Mon compte" className="hidden p-2 text-ivory/80 transition-colors hover:text-ivory sm:block">
                <IconUser className="size-[1.15rem]" />
              </Link>
              <button onClick={() => setOpen(true)} className="relative -mr-2 p-2 text-ivory/80 transition-colors hover:text-ivory" aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}>
                <IconBag className="size-[1.15rem]" />
                <AnimatePresence mode="popLayout">
                  {count > 0 && (
                    <motion.span
                      key={`${count}-${pulse}`}
                      initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.4, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 480, damping: 24 }}
                      className="absolute right-0 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.62rem] font-medium leading-none text-chocolate tabular-nums"
                      aria-hidden
                    >
                      {count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
              <Link
                href="/composer-mon-coffret"
                aria-current={path === "/composer-mon-coffret" ? "page" : undefined}
                className="ml-4 hidden h-10 items-center border border-gold/55 px-5 text-[0.7rem] uppercase tracking-[0.2em] text-gold transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-chocolate aria-[current=page]:bg-gold aria-[current=page]:text-chocolate xl:inline-flex"
              >
                Composer mon coffret
              </Link>
            </div>
          </div>
        </div>
        <motion.span aria-hidden style={{ scaleX: scrollYProgress }} className="pointer-events-none absolute inset-x-0 top-[calc(var(--header-h)-1px)] z-[3] h-px origin-left bg-gold/60" />
        <Suspense fallback={null}>
          <PathSync onPath={setPath} />
        </Suspense>
      </header>

      {/* voile sous les menus déroulants */}
      <AnimatePresence>
        {panel && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onPointerEnter={() => setPanel(null)}
            onClick={() => setPanel(null)}
            className="fixed inset-0 z-40 hidden bg-[#0d0806]/45 lg:block"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-0 z-40 overflow-y-auto bg-[#170f0c] pt-[calc(var(--header-h)+2rem)] text-ivory lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 0.8, 0.12, 1] }}
          >
            {/* arc marocain en filigrane */}
            <svg aria-hidden className="pointer-events-none absolute -right-[18vw] bottom-0 h-[70%] w-[80vw] text-gold/15" viewBox="0 0 100 140" preserveAspectRatio="xMidYMax meet" fill="none">
              <path d="M8 140 V74 A42 42 0 1 1 92 74 V140" stroke="currentColor" strokeWidth=".4" />
              <path d="M14 140 V72 A36 36 0 1 1 86 72 V140" stroke="currentColor" strokeWidth=".25" />
            </svg>
            <nav aria-label="Menu" className="container-luxe relative pb-16">
              <ul className="space-y-1">
                {MOBILE.map((l, i) => {
                  const current = path === l.href || (l.href !== "/creations" && path?.startsWith(`${l.href}/`));
                  return (
                    <motion.li key={l.href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.12 + i * 0.04, duration: 0.6, ease: [0.22, 0.8, 0.12, 1] }}>
                      <Link href={l.href} aria-current={current ? "page" : undefined} className={clsx("flex items-center gap-3 py-2 font-display text-[2rem] leading-tight transition-colors", current && "text-gold")}>
                        {current && <span aria-hidden className="h-px w-6 bg-gold" />}
                        {l.label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 0.5 }} className="mt-8">
                <Link href="/composer-mon-coffret" className="btn btn-gold w-full">Composer mon coffret</Link>
              </motion.div>
              <div className="mt-10 grid grid-cols-2 gap-3 border-t border-line-light pt-8 t-small">
                <Link href="/recherche" className="flex items-center gap-2"><IconSearch className="size-4" />Rechercher</Link>
                <Link href="/compte" className="flex items-center gap-2"><IconUser className="size-4" />Mon compte</Link>
                <Link href="/suivi-commande">Suivre une commande</Link>
                <Link href="/contact">Contact</Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
