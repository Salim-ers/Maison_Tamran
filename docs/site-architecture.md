# MAISON TAMRĀN — Architecture du site

## Stack

Next.js 16.4 (App Router, Cache Components, prérendu partiel), React 19.3, TypeScript strict, Tailwind CSS 4, Motion 14 (animations), Drizzle ORM + PostgreSQL (Neon), Stripe Checkout, Resend, Vercel Blob, Zod, pdf-lib. Outils : sharp (images), Playwright (tests visuels, via le Chrome installé), API Images d'OpenAI (visuels).

Aucune bibliothèque d'animation ajoutée : Motion (`useScroll`, `useTransform`, `useSpring`) couvre les scènes épinglées pilotées par le défilement ; GSAP, Lenis et Three.js n'apporteraient rien de démontrable ici (voir `docs/motion-system.md`).

## Accueil (`src/app/(boutique)/page.tsx`)

| # | Séquence | Composant | Images |
| --- | --- | --- | --- |
| 00 | Ouverture de la Maison (une fois par session) | `home/intro-curtain.tsx` | logo officiel ivoire |
| 01 | Le coffret fermé, puis ouvert (sans zoom) | `home/coffret-hero-scene.tsx` | `coffret-ferme` (logo composé), `coffret-ouvert` |
| 02 | Les Signatures | `home/signature-stage.tsx` | `produit-*` en grand, `coupe-*` en tirage |
| 03 | De la palmeraie à la création (un écran) | `home/craft-strip.tsx` | `amb-dattier-regimes`, `amb-medjool-macro`, `meta-coeur`, `meta-enrobage` |
| 04 | Les coffrets : formats, prix, composition en direct | `home/compose-teaser.tsx` | `coffret-vide-*`, `piece-*` |
| 05 | Éditions éphémères | `home/ephemeral-panels.tsx` | `produit-*`, `coupe-*` |
| 06 | La Maison et les professionnels | `home/house-duo.tsx` | `rituel-cafe`, `pro-hotel` |
| 07 | Lettre d'information, pied de page | `home/newsletter.tsx`, `layout/site-footer.tsx` | — |

Longueur mesurée (`node tests/visual/height.mjs <url>`) : 9,7 écrans en 1440 × 900 (31,7 avant le resserrement), 11,7 écrans en 390 × 844 (32,6). Seul le hero est épinglé (170 svh, sans zoom de caméra).

## En-tête (`layout/site-header.tsx`)

Barre sombre opaque de hauteur constante (`--header-h`), la même sur toutes les pages : aucun changement de taille, de couleur ni de position au défilement ou à la navigation. Logo à gauche, rubriques au centre (Créations et La Maison ouvrent un menu illustré, au survol ou par leur bouton dédié au clavier), recherche, compte, panier et « Composer mon coffret » à droite. L'URL (rubrique active) est lue par un petit composant isolé dans sa propre frontière Suspense : l'en-tête n'est jamais remplacé par une version de secours. Pendant une transition de page, seule la nouvelle image de l'en-tête est montrée (pas de fondu entre deux en-têtes). Contrôle : `node tests/visual/header.mjs` (à chaque image affichée : position, hauteur, visibilité ; puis logo et panier au pixel près).

## Boutique

`/creations` (catalogue, filtres, tri, recherche), `/collections/[slug]`, `/creations/[slug]` (galerie : création, cœur à la loupe, ingrédients ; achat ; composition ; allergènes ; conservation ; déroulé de dégustation (attaque, cœur, finale) ; accords suggérés ; créations précédente et suivante ; créations voisines), `/coffrets`, `/composer-mon-coffret`, `/recherche`, `/panier`, `/paiement` (+ démonstration, confirmation, échec), `/compte/*`, `/suivi-commande`, pages éditoriales et légales, `/professionnels/*` (dont devis). Back-office : `/admin/*`.

## Images

- `src/data/photo-manifest.json` : photo validée par emplacement (lu par le site). Les emplacements historiques (`/images/concepts/<id>.webp` en base) sont résolus par `withPhoto()` ; `src/lib/photos.ts` porte les alias (formats de coffret, packaging, pros, macros, `scene-*` → `piece-*`).
- `photo(id)` donne directement une photo publiée (hero, coffrets vides, pièces détourées).
- `ambiance(clé)` sert la version 4K générée `amb-<clé>` dès qu'elle est publiée, sinon la photographie libre de droits d'origine.
- `next/image` sert AVIF / WebP aux largeurs `deviceSizes` (420 → 3840) : un mobile ne télécharge jamais l'original 4K.
- Noms de fichiers avec empreinte de contenu : une image remplacée change d'adresse.

## Pipeline de visuels (OpenAI)

`scripts/generate-tamran-images.mts` (npm run images:openai), `scripts/images/openai.ts` (client), `scripts/images/openai-shots.ts` (prompts et références), `scripts/images/lid.ts` (pose du logo). Détail : `docs/asset-manifest.md`.

## Pages éditoriales

Maison, Savoir-faire, Professionnels, Cadeaux d'entreprise et Mariages s'ouvrent sur `PageHero` (`src/components/layout/page-hero.tsx`) : photographie plein cadre par direction artistique (`<picture>` et `getImageProps` : version paysage sur ordinateur, verticale 2160 × 3840 sur écran portrait ; un téléphone ne télécharge jamais la version paysage).

## Mesures (build de production local, Lighthouse 13.6, 2026-10-31)

| Page | Mobile (4G lente simulée) : perf. / access. / bonnes pratiques | LCP mobile | Ordinateur : perf. | LCP ordinateur | CLS |
| --- | --- | --- | --- | --- | --- |
| Accueil (resserré, images 4K, transitions) | 77 / 100 / 100 | 6,2 s | 93* | 1,6 s* | 0 |
| Fiche produit (images 4K, transitions) | 84 / 100 / 100 | 4,6 s | 99* | 0,9 s* | 0 |
| Configurateur | 77 / 100 / 100 | 6,5 s | — | — | 0 |
| Notre Maison | 78 / 100 / 100 | 6,2 s | — | — | 0 |

Astérisque : mesure faite avant le passage en 4K, non refaite. Mesures mobiles refaites après l'ajout des transitions de page et du fondu des images : la mention « Visuel conceptuel · IA » posée sur une photo claire (fond trop transparent) et celle du savoir-faire de l'accueil ont été corrigées ; un passage antérieur avait mesuré le bouton du hero pendant son fondu d'entrée (contraste final 7,2:1).

SEO 69 : uniquement l'audit « indexable », volontairement bloqué par `robots.txt` tant que la boutique est en démonstration. Le LCP mobile est porté par de grandes photographies (AVIF) sur une connexion simulée à 1,6 Mbit/s ; à mesurer à nouveau sur Vercel (cache d'images et CDN).

## Données et paiement

Inchangés dans leur principe (voir README) : prix recalculés côté serveur (`src/lib/pricing.ts`, testés), commandes créées avant Stripe Checkout, seul le webhook signé (ou une vérification directe de la session) marque une commande payée, idempotence par `webhook_events`. Mode démonstration explicite tant que `STRIPE_SECRET_KEY` est absente.
