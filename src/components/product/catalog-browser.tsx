"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { clsx } from "clsx";
import { ProductCard, type CardProduct } from "./product-card";

export interface BrowsableProduct extends CardProduct {
  collectionSlug: string;
  chocolate: string;
  flavorFamilies: string[];
  allergens: string[];
  searchText: string;
}

interface Labels {
  flavors: Record<string, string>;
  chocolates: Record<string, string>;
  allergens: Record<string, string>;
  collections: Record<string, string>;
}

type Filters = { q: string; saveur: string[]; chocolat: string[]; collection: string[]; sans: string[] };
type Sort = "maison" | "prix-croissant" | "prix-decroissant" | "nom";
const SORTS: Record<Sort, string> = { maison: "Ordre de la Maison", "prix-croissant": "Prix croissant", "prix-decroissant": "Prix décroissant", nom: "Nom (A → Z)" };

function sortProducts(list: BrowsableProduct[], sort: Sort) {
  const price = (p: BrowsableProduct) => p.fromCents ?? Number.MAX_SAFE_INTEGER;
  if (sort === "prix-croissant") return [...list].sort((a, b) => price(a) - price(b));
  if (sort === "prix-decroissant") return [...list].sort((a, b) => price(b) - price(a));
  if (sort === "nom") return [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return list;
}
const EMPTY: Filters = { q: "", saveur: [], chocolat: [], collection: [], sans: [] };

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function filterProducts(list: BrowsableProduct[], f: Filters) {
  const q = normalize(f.q.trim());
  return list.filter(
    (p) =>
      (!q || normalize(p.searchText).includes(q)) &&
      (!f.saveur.length || f.saveur.some((s) => p.flavorFamilies.includes(s))) &&
      (!f.chocolat.length || f.chocolat.includes(p.chocolate)) &&
      (!f.collection.length || f.collection.includes(p.collectionSlug)) &&
      (!f.sans.length || f.sans.every((a) => !p.allergens.includes(a)))
  );
}

/** Catalogue filtrable (saveur, chocolat, collection, allergènes) avec recherche ; l'état est reflété dans l'URL. */
export function CatalogBrowser({ products, labels, lockCollection, showSearch = true }: { products: BrowsableProduct[]; labels: Labels; lockCollection?: string; showSearch?: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const reduce = useReducedMotion();
  const [f, setF] = useState<Filters>(() => ({
    q: params.get("q") ?? "",
    saveur: params.getAll("saveur"),
    chocolat: params.getAll("chocolat"),
    collection: lockCollection ? [] : params.getAll("collection"),
    sans: params.getAll("sans"),
  }));
  const [panel, setPanel] = useState(false);
  const [sort, setSort] = useState<Sort>(() => (params.get("tri") as Sort) in SORTS ? (params.get("tri") as Sort) : "maison");

  useEffect(() => {
    const sp = new URLSearchParams();
    if (f.q) sp.set("q", f.q);
    f.saveur.forEach((v) => sp.append("saveur", v));
    f.chocolat.forEach((v) => sp.append("chocolat", v));
    f.collection.forEach((v) => sp.append("collection", v));
    f.sans.forEach((v) => sp.append("sans", v));
    if (sort !== "maison") sp.set("tri", sort);
    const qs = sp.toString();
    const t = setTimeout(() => router.replace(`${path}${qs ? `?${qs}` : ""}`, { scroll: false }), 250);
    return () => clearTimeout(t);
  }, [f, sort, path, router]);

  const results = useMemo(() => sortProducts(filterProducts(products, f), sort), [products, f, sort]);
  const toggle = (key: Exclude<keyof Filters, "q">, v: string) =>
    setF((s) => ({ ...s, [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));
  const active = f.saveur.length + f.chocolat.length + f.collection.length + f.sans.length + (f.q ? 1 : 0);

  // ne proposer que les valeurs présentes dans le catalogue
  const present = {
    saveur: Object.keys(labels.flavors).filter((k) => products.some((p) => p.flavorFamilies.includes(k))),
    chocolat: Object.keys(labels.chocolates).filter((k) => products.some((p) => p.chocolate === k)),
    collection: Object.keys(labels.collections).filter((k) => products.some((p) => p.collectionSlug === k)),
    sans: Object.keys(labels.allergens).filter((k) => products.some((p) => p.allergens.includes(k))),
  };

  const group = (title: string, key: Exclude<keyof Filters, "q">, values: string[], dict: Record<string, string>, prefix = "") =>
    values.length > 0 && (
      <fieldset className="min-w-0">
        <legend className="t-small font-semibold">{title}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((v) => {
            const on = f[key].includes(v);
            return (
              <button
                key={v}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(key, v)}
                className={clsx("border px-3 py-1.5 t-small transition-colors", on ? "border-chocolate bg-chocolate text-ivory" : "hairline bg-cream hover:border-chocolate")}
              >
                {prefix}
                {dict[v]}
              </button>
            );
          })}
        </div>
      </fieldset>
    );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b hairline pb-5">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {showSearch && (
            <div className="w-full max-w-sm">
              <label htmlFor="cat-q" className="sr-only">Rechercher une saveur, un ingrédient</label>
              <input id="cat-q" type="search" value={f.q} onChange={(e) => setF((s) => ({ ...s, q: e.target.value }))} placeholder="Pistache, yuzu, safran…" className="field min-h-11" />
            </div>
          )}
          <button type="button" className="btn btn-outline min-h-11 px-5" aria-expanded={panel} aria-controls="filters" onClick={() => setPanel((p) => !p)}>
            Filtrer{active ? ` (${active})` : ""}
          </button>
          {active > 0 && (
            <button type="button" className="t-small link-draw" onClick={() => setF({ ...EMPTY })}>Tout effacer</button>
          )}
        </div>
        <div className="flex items-center gap-5">
          <label className="flex items-center gap-2 t-small">
            <span className="text-ink-soft">Trier</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="cursor-pointer border-b border-line bg-transparent py-1 pr-1 outline-none focus-visible:border-chocolate">
              {Object.entries(SORTS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </label>
          <p className="t-small text-ink-soft" aria-live="polite">
            {results.length} création{results.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* filtres rapides par collection, toujours visibles */}
      {!lockCollection && present.collection.length > 1 && (
        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Collection">
          {[{ k: "", label: "Toutes les créations" }, ...present.collection.map((k) => ({ k, label: labels.collections[k] }))].map(({ k, label }) => {
            const on = k ? f.collection.length === 1 && f.collection[0] === k : f.collection.length === 0;
            return (
              <button
                key={k || "toutes"}
                type="button"
                aria-pressed={on}
                onClick={() => setF((s) => ({ ...s, collection: k ? [k] : [] }))}
                className={clsx("relative isolate px-4 py-2 t-small transition-colors", on ? "text-ivory" : "text-ink hover:text-bronze")}
              >
                {on && <motion.span layoutId="collection-pill" className="absolute inset-0 -z-10 bg-chocolate" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                {label}
              </button>
            );
          })}
        </div>
      )}

      <AnimatePresence initial={false}>
        {panel && (
          <motion.div
            id="filters"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.8, 0.12, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 border-b hairline py-8 md:grid-cols-2 lg:grid-cols-4">
              {group("Famille de saveurs", "saveur", present.saveur, labels.flavors)}
              {group("Chocolat", "chocolat", present.chocolat, labels.chocolates)}
              {!lockCollection && group("Collection", "collection", present.collection, labels.collections)}
              {group("Sans allergène", "sans", present.sans, labels.allergens, "Sans ")}
            </div>
            <p className="pb-6 pt-4 t-micro text-ink-soft">Allergènes indicatifs, établis sur des recettes provisoires : référez-vous toujours à la fiche produit et à l&apos;étiquette.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {results.length === 0 ? (
        <div className="py-24 text-center">
          <p className="t-title">Aucune création ne correspond à ces critères.</p>
          <button type="button" onClick={() => setF({ ...EMPTY })} className="btn btn-outline mt-6">Effacer les filtres</button>
        </div>
      ) : (
        <ul className="relative isolate mt-12 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {results.map((p, i) => (
              <motion.li
                key={p.slug}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.55, ease: [0.22, 0.8, 0.12, 1] }}
                className={clsx(i % 3 === 1 && "lg:mt-20")}
              >
                <ProductCard p={p} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
