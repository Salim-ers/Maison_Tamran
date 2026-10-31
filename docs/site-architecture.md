# MAISON TAMRĀN — Architecture du site

## Stack

Next.js 16.4 (App Router, Cache Components, prérendu partiel), React 19.3, TypeScript strict, Tailwind CSS 4, Motion 14 (animations), Drizzle ORM + PostgreSQL (Neon), Stripe Checkout, Resend, Vercel Blob, Zod, pdf-lib. Outils : sharp (images), Playwright (tests visuels, via le Chrome installé), API Images d'OpenAI (visuels).

Aucune bibliothèque d'animation ajoutée : Motion (`useScroll`, `useTransform`, `useSpring`) couvre les scènes épinglées pilotées par le défilement ; GSAP, Lenis et Three.js n'apporteraient rien de démontrable ici (voir `docs/motion-system.md`).

## Accueil (`src/app/(boutique)/page.tsx`)

| # | Séquence | Composant | Images |
| --- | --- | --- | --- |
| 00 | Ouverture de la Maison (une fois par session) | `home/intro-curtain.tsx` | logo officiel ivoire |
| 01 | Le coffret fermé, puis ouvert, puis la caméra s'approche | `home/coffret-hero-scene.tsx` | `coffret-ferme` (logo composé), `coffret-ouvert` |
| 02 | L'oasis (01 · le palmier) | `home/oasis.tsx` | photos Unsplash 4K |
| 03 | La métamorphose : palmier → Medjool → cœur → enrobage → création | `home/metamorphosis.tsx` | Unsplash, `meta-coeur`, `meta-enrobage`, produits |
| 03 bis | Le cœur de la datte (anatomie) | `home/date-anatomy.tsx` | `produit-cafe-imperial` |
| 04 | Les Signatures | `home/signature-stage.tsx` | `produit-*` en grand, `coupe-*` en tirage |
| 05 | Au cœur de chaque datte (défilement latéral des macros) | `home/texture-reel.tsx` | `coupe-*` |
| 06 | L'art d'offrir et les trois formats | `home/gift-showcase.tsx` | `coffret-1`, `coffret-decouverte`, `coffret-prestige` |
| 07 | Composer son coffret (démonstrateur) | `home/compose-teaser.tsx` | `coffret-vide-*`, `piece-*` |
| 08 | Éditions éphémères | `home/ephemeral-panels.tsx` | `produit-*`, `coupe-*` |
| 09 | La Maison | `home/maison-story.tsx` | `rituel-cafe`, Unsplash |
| 10 | Professionnels | `home/pros-section.tsx` | `pro-hotel` |
| 11 | Lettre d'information, pied de page | `home/newsletter.tsx`, `layout/site-footer.tsx` | — |

## Boutique

`/creations` (catalogue, filtres, tri, recherche), `/collections/[slug]`, `/creations/[slug]` (galerie : création, cœur à la loupe, ingrédients ; achat ; composition ; allergènes ; conservation ; déroulé de dégustation (attaque, cœur, finale) ; accords suggérés ; créations précédente et suivante ; créations voisines), `/coffrets`, `/composer-mon-coffret`, `/recherche`, `/panier`, `/paiement` (+ démonstration, confirmation, échec), `/compte/*`, `/suivi-commande`, pages éditoriales et légales, `/professionnels/*` (dont devis). Back-office : `/admin/*`.

## Images

- `src/data/photo-manifest.json` : photo validée par emplacement (lu par le site). Les emplacements historiques (`/images/concepts/<id>.webp` en base) sont résolus par `withPhoto()` ; `src/lib/photos.ts` porte les alias (formats de coffret, packaging, pros, macros, `scene-*` → `piece-*`).
- `photo(id)` donne directement une photo publiée (hero, coffrets vides, pièces détourées).
- `next/image` sert AVIF / WebP aux largeurs `deviceSizes` (420 → 3840) : un mobile ne télécharge jamais l'original 4K.
- Noms de fichiers avec empreinte de contenu : une image remplacée change d'adresse.

## Pipeline de visuels (OpenAI)

`scripts/generate-tamran-images.mts` (npm run images:openai), `scripts/images/openai.ts` (client), `scripts/images/openai-shots.ts` (prompts et références), `scripts/images/lid.ts` (pose du logo). Détail : `docs/asset-manifest.md`.

## Pages éditoriales

Maison, Savoir-faire, Professionnels, Cadeaux d'entreprise et Mariages s'ouvrent sur `PageHero` (`src/components/layout/page-hero.tsx`) : photographie plein cadre par direction artistique (`<picture>` et `getImageProps` : version paysage sur ordinateur, verticale 2160 × 3840 sur écran portrait ; un téléphone ne télécharge jamais la version paysage).

## Mesures (build de production local, Lighthouse 13.6, 2026-10-31)

| Page | Mobile (4G lente simulée) : perf. / access. / bonnes pratiques | LCP mobile | Ordinateur : perf. | LCP ordinateur | CLS |
| --- | --- | --- | --- | --- | --- |
| Accueil | 75 / 100 / 100 | 6,4 s | 93 | 1,6 s | 0 |
| Fiche produit | 79 / 100 / 100 | 5,7 s | 99 | 0,9 s | 0 |
| Configurateur | 77 / 100 / 100 | 6,5 s | — | — | 0 |

SEO 69 : uniquement l'audit « indexable », volontairement bloqué par `robots.txt` tant que la boutique est en démonstration. Le LCP mobile est porté par de grandes photographies (AVIF) sur une connexion simulée à 1,6 Mbit/s ; à mesurer à nouveau sur Vercel (cache d'images et CDN).

## Données et paiement

Inchangés dans leur principe (voir README) : prix recalculés côté serveur (`src/lib/pricing.ts`, testés), commandes créées avant Stripe Checkout, seul le webhook signé (ou une vérification directe de la session) marque une commande payée, idempotence par `webhook_events`. Mode démonstration explicite tant que `STRIPE_SECRET_KEY` est absente.
