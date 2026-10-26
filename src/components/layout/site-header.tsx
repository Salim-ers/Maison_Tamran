"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { BrandLogo } from "@/components/brand";
import { useCart } from "@/components/cart/cart-context";
import { IconBag, IconSearch, IconUser } from "./icons";

const LEFT = [
  { href: "/creations", label: "Créations" },
  { href: "/coffrets", label: "Coffrets" },
  { href: "/composer-mon-coffret", label: "Composer" },
];
const RIGHT = [
  { href: "/maison", label: "La Maison" },
  { href: "/professionnels", label: "Professionnels" },
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

/** Pages dont le haut est sombre : l'en-tête y démarre transparent, texte ivoire. */
const DARK_TOP = ["/", "/creations", "/collections/signature", "/collections/ephemere", "/maison", "/professionnels"];

export function SiteHeader() {
  const path = usePathname();
  const reduce = useReducedMotion();
  const { cart, setOpen, pulse } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menu, setMenu] = useState(false);
  const lastY = useRef(0);
  const darkTop = DARK_TOP.includes(path);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      // se cache en descendant, réapparaît en remontant
      setHidden(y > 400 && y > lastY.current + 4 && !menu);
      if (y < lastY.current - 4) setHidden(false);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menu]);

  useEffect(() => setMenu(false), [path]);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  const transparent = darkTop && !scrolled && !menu;
  // sur l'accueil, le hero présente déjà le logo : celui de l'en-tête apparaît au défilement
  const logoHidden = path === "/" && transparent;
  const count = cart?.itemCount ?? 0;

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-[var(--banner-h,0px)] z-50 transition-[background-color,color,transform,box-shadow] duration-500 ease-[var(--ease-luxe)]",
          transparent ? "bg-transparent text-ivory" : menu ? "bg-chocolate text-ivory" : "bg-ivory/92 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-md",
          hidden && !reduce ? "-translate-y-[calc(100%+var(--banner-h,0px))]" : "translate-y-0"
        )}
      >
        <div className="container-luxe grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-4">
          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex gap-8 text-[0.9rem] tracking-[0.01em]">
              {LEFT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={clsx("py-2 link-draw [background-size:0%_1px] hover:[background-size:100%_1px] hover:[background-position:0_100%]", path.startsWith(l.href) && "[background-size:100%_1px]")} aria-current={path.startsWith(l.href) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <button
            className="flex items-center gap-2 text-[0.9rem] lg:hidden"
            aria-expanded={menu}
            aria-controls="menu-mobile"
            onClick={() => setMenu((m) => !m)}
          >
            <span className="relative block h-3 w-5" aria-hidden>
              <span className={clsx("absolute left-0 h-px w-5 bg-current transition-transform duration-500", menu ? "top-1.5 rotate-45" : "top-0")} />
              <span className={clsx("absolute left-0 h-px w-5 bg-current transition-transform duration-500", menu ? "top-1.5 -rotate-45" : "top-3")} />
            </span>
            {menu ? "Fermer" : "Menu"}
          </button>

          <Link href="/" aria-label="MAISON TAMRĀN, accueil" className={clsx("relative block transition-opacity duration-700", logoHidden && "pointer-events-none opacity-0")} tabIndex={logoHidden ? -1 : undefined}>
            {/* deux tons superposés : fondu entre la version ivoire (en-tête transparent, menu) et la version cacao */}
            <BrandLogo variant="lockup" height={64} alt="" preload className={clsx("h-12 transition-[opacity,height] duration-500 ease-[var(--ease-luxe)] lg:h-16", scrolled && "lg:h-12", (transparent || menu) && "opacity-0")} />
            <BrandLogo variant="lockup" tone="light" height={64} alt="" className={clsx("absolute inset-0 h-full transition-opacity duration-500 ease-[var(--ease-luxe)]", !(transparent || menu) && "opacity-0")} />
          </Link>

          <div className="flex items-center justify-end gap-6">
            <nav aria-label="Maison et professionnels" className="hidden lg:block">
              <ul className="flex gap-8 text-[0.9rem]">
                {RIGHT.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={clsx("py-2 link-draw [background-size:0%_1px] hover:[background-size:100%_1px] hover:[background-position:0_100%]", path.startsWith(l.href) && "[background-size:100%_1px]")}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/recherche" aria-label="Rechercher" className="hidden p-1 sm:block"><IconSearch className="size-5" /></Link>
              <Link href="/compte" aria-label="Mon compte" className="hidden p-1 sm:block"><IconUser className="size-5" /></Link>
              <button onClick={() => setOpen(true)} className="relative flex items-center gap-2 p-1" aria-label={`Ouvrir le panier, ${count} article${count > 1 ? "s" : ""}`}>
                <IconBag className="size-5" />
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={`${count}-${pulse}`}
                    initial={reduce ? false : { y: -10, opacity: 0, scale: 0.6 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="min-w-[1ch] text-[0.85rem] tabular-nums"
                    aria-hidden
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-0 z-40 overflow-y-auto bg-chocolate pt-[calc(var(--header-h)+var(--banner-h,0px)+2rem)] text-ivory lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 0.8, 0.12, 1] }}
          >
            <nav aria-label="Menu" className="container-luxe pb-16">
              <ul className="space-y-1">
                {MOBILE.map((l, i) => (
                  <motion.li key={l.href} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduce ? 0 : 0.15 + i * 0.04, duration: 0.6, ease: [0.22, 0.8, 0.12, 1] }}>
                    <Link href={l.href} className="block py-2 font-display text-[2rem] leading-tight">{l.label}</Link>
                  </motion.li>
                ))}
              </ul>
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
