# Conventions de développement MAISON TAMRĀN

Ce document décrit les règles du projet : architecture, design system, rédaction. À lire avant toute contribution.

## Pile technique

- **Next.js 16.4 (App Router)** avec `cacheComponents: true` : lisez les guides fournis dans `node_modules/next/dist/docs/` avant d'utiliser une API que vous ne connaissez pas.
  - Les lectures de catalogue/contenu passent par des fonctions `"use cache"` (`src/lib/catalog.ts`) taguées `catalog`, `settings`, `content`, `testimonials`. Après une mutation dans une Server Action, appelez `updateTag("catalog")` (ou le tag concerné). Dans un Route Handler, `revalidateTag("catalog", "max")`.
  - Toute donnée liée à la requête (cookies, session, `searchParams`) doit être lue dans un composant enveloppé dans `<Suspense>` ; sinon la page entière bloque. Les pages entièrement dynamiques (admin, compte) peuvent exporter `export const instant = false` sur leur layout.
  - Pas de `new Date()`, `Math.random()`, `Date.now()` pendant le rendu d'un composant serveur prérendu (erreur de build). Utilisez `await connection()` dans un composant sous Suspense, ou faites-le côté client.
  - `params` et `searchParams` sont des **Promise** : `const { slug } = await params`.
  - `revalidateTag(tag, "max")` exige deux arguments. `middleware.ts` s'appelle désormais `proxy.ts`.
  - `next/image` : utilisez `preload` (et non `priority`). Qualités autorisées : 75 et 85.
- **TypeScript strict**, **Tailwind CSS v4** (tokens dans `src/app/globals.css`, pas de `tailwind.config`).
- **Drizzle ORM + PostgreSQL** (`src/db/schema.ts`, client `src/db/index.ts`). Migrations : `npm run db:generate` puis `npm run db:migrate`.
- **Motion** (`motion/react`) pour l'animation. Respectez toujours `useReducedMotion()`.
- **Zod 4** pour valider toute entrée de formulaire ou d'action (`z.email()`, `z.uuid()`…).

## Arborescence

- `src/app/(boutique)/…` : site public (en-tête, pied de page, panier). Les pages y vivent sous leur URL française.
- `src/app/admin/…` : back-office (layout propre, protégé par `requireAdmin()`).
- `src/app/actions/…` : Server Actions (`"use server"` : n'exporter **que** des fonctions async et des types).
- `src/app/api/…` : Route Handlers (webhook Stripe, PDF, événements).
- `src/lib/…` : logique serveur (`import "server-only"`) : `auth`, `cart`, `pricing` (pur, testé), `orders`, `stripe`, `email`, `catalog`, `settings`, `env`.
- `src/components/…` : composants. `ui/` (primitives), `layout/`, `home/`, `product/`, `cart/`, `configurator/`, `motion/`, `seo/`.
- `src/data/recipes.ts` : référentiel des recettes (source du seed et des visuels).
- `scripts/` : identité (`brand.mjs`), visuels concept (`concepts/`), seed.

## Composants à réutiliser

- `PageIntro`, `Breadcrumbs`, `Prose`, `Provisional` : `src/components/layout/page-intro.tsx` (serveur uniquement).
- `Media`, `concept(id)`, `ConceptBadge` : `src/components/ui/media.tsx`. Tout visuel concept doit garder la mention « Visuel concept ».
- `RevealImage`, `RevealLines`, `FadeIn` : `src/components/motion/reveal.tsx`, avec parcimonie.
- `QtyStepper` : `src/components/ui/qty-stepper.tsx`.
- `JsonLd` : `src/components/seo/json-ld.tsx`.
- `Monogram`, `Logotype` : `src/components/brand.tsx`.

## Design system

- Couleurs (classes Tailwind) : `ivory`, `cream`, `chocolate`, `chocolate-2`, `bronze`, `bronze-light` (bronze lisible sur fond sombre), `taupe`, `pistachio`, `ink`, `ink-soft`, `line`, `line-light`, `danger`, `success`.
- Le bronze est une **finition** : filets, numéros, survols. Jamais en aplat décoratif, jamais pour du texte courant sur ivoire (contraste insuffisant).
- Typographie : `font-display` (Bodoni Moda) pour les titres, `font-sans` (Manrope) pour le texte. Utilitaires : `t-display-xl`, `t-display-l`, `t-display-m`, `t-title`, `t-lead`, `t-small`, `t-micro`, `t-numeral`.
- Mise en page : `container-luxe`, `section-pad`, `on-dark` (fond chocolat + texte ivoire).
- Boutons : `btn` + `btn-primary` | `btn-light` | `btn-outline` | `btn-outline-light`. Liens éditoriaux : `link-draw`.
- Formulaires : `field-label`, `field` ; erreurs `text-danger` avec `role="alert"` ; `aria-invalid` et `aria-describedby`.
- Espace sous l'en-tête fixe : `pt-[calc(var(--header-h)+…)]` (géré par `PageIntro`). L'en-tête a une hauteur constante (`--header-h`) sur toutes les pages.
- À éviter (signes de gabarit générique) : étiquettes en capitales espacées au-dessus des titres, mot isolé en italique ou en couleur dans un titre, numérotation 01/02/03 hors vraie séquence, flèche « → » dans les boutons, chaînes « A · B · C », apparitions en fondu sur chaque section.

## Rédaction

- Français, vouvoiement, phrases courtes, voix active. Un bouton dit exactement ce qu'il fait (« Envoyer ma demande », « Ajouter au panier »).
- Erreurs : dire ce qui s'est passé et comment corriger, sans s'excuser.
- **Ne jamais inventer** : histoire de fondateur, atelier historique, récompenses, labels (bio, halal…), provenance garantie, DDM/DLC, valeurs nutritionnelles, avis clients, délais de livraison garantis, chiffres de clientèle. Toute donnée non validée est signalée avec `Provisional` ou un libellé « à confirmer », et reste modifiable dans le back-office.
- Les recettes sont des **prototypes** : statut « Recette en développement » tant qu'elles ne sont pas passées en « available ».

## Sécurité

- Toute action admin appelle `requireAdmin()` en premier. Toute action client vérifie la propriété des données (`userId`).
- Le prix est toujours recalculé côté serveur (`src/lib/pricing.ts`). Le client n'envoie que des identifiants et des quantités.
- Aucune donnée personnelle dans les URL. Les jetons d'accès commande sont des HMAC (`orderToken`).
