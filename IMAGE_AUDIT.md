# Audit des images — MAISON TAMRĀN

Audit réalisé le 2026-10-27, avant et après la refonte V2 (branche `refonte-v2`).

## Méthode

- **Relevé automatisé** (Chrome sans interface, Puppeteer) de chaque image réellement affichée sur 20 pages, en défilant chaque page jusqu'en bas, sur trois écrans :
  - 1920 × 1080, densité 1 ;
  - 1440 × 900, densité 2 (Retina) ;
  - 390 × 844, densité 3 (mobile).
- **Pour chaque image** : chemin, définition du fichier, taille rendue (pixels CSS), densité d'écran, ajustement (`object-fit`), filtres CSS sur l'image et ses parents.
- **Facteur d'agrandissement** = pixels physiques affichés ÷ pixels de **détail réel** de la source. Le détail réel n'est pas la taille du fichier : il est établi d'après la provenance (le README du pack déclare des vignettes agrandies), puis vérifié sur des extraits à 100 %.
- **Seuil retenu** : ×1,5 au plus. Au-delà, le flou devient visible.
- **Pages mesurées.**
  - Avant : 20 pages sur les trois écrans.
  - Après : 18 pages sur les deux écrans denses (1440 × 900 en densité 2, 390 × 844 en densité 3). Ce sont les plus exigeants : en densité 1, les plafonds d'affichage laissent toujours la source plus grande que l'affichage.
  - Pages de l'audit après : accueil, Créations, trois fiches produit, deux collections, Coffrets, Composer mon coffret, Notre Maison, Savoir-faire, trois pages professionnelles, Contact, Panier, Connexion, page 404.

## 1. Sources disponibles et définition réelle

| Source | Fichier(s) | Définition du fichier | Détail réel | Provenance | Décision |
|---|---|---|---|---|---|
| Vues « signature / macro / entier » des 10 recettes | `brand/source/pack-photos/{signatures,ephemeres}/*/*-3840x2160.webp` (30 fichiers) | 3840 × 2160 | ≈ 300 à 600 px | Vignettes d'une planche, agrandies ×4 à ×8 et posées sur un fond flou étendu (README du pack : « NON 4K native ») | **Retirées du site** |
| Planche des 10 créations | `brand/source/pack-photos/APERCU_10_RECETTES.jpg` | 2460 × 1390 | Cases de ≈ 414 × 496 px | Planche contact | **Source des 10 créations**, publiées à leur définition réelle, sans agrandissement |
| Photographie de référence du coffret Signature | `brand/source/pack-photos/references/photo-modele-coffret.png` | 1448 × 1086 | 1448 px | Photo de référence fournie | **Conservée**, et détourée pour le hero (1018 × 1021) |
| Photographie de référence Café Impérial | `brand/source/pack-photos/references/photo-modele-produit.png` | 1122 × 1402 | 1122 px | Photo de référence fournie | **Conservée** (anatomie, explosion des saveurs, fiche) |
| Coffret Signature « 3840 » du pack | `brand/source/pack-photos/coffrets/coffret-signature-12-ouvert-3840x2160.webp` | 3840 × 2160 | ≈ 1448 px | Agrandissement de la photo de référence | Non utilisé (la référence est utilisée directement) |
| Logo officiel | `brand/source/maison-tamran-logo-original.png` | 1254 × 1254 | 1254 px | Logo fourni | Conservé, jamais régénéré |
| Photographies d'ambiance | `public/images/ambiance/` (20) | 3840 px sur le grand côté | Réel (photos de 4000 à 11 648 px) | Unsplash, licence gratuite (`ASSET_LICENSES.md`) | Conservées ou ajoutées : grandes scènes |
| Éléments détourés | `public/images/scene/` (28) | 146 à 3840 px | Réel | Coffret de référence, ingrédients Unsplash sur fond blanc, palmeraie, palme | Ajoutés : décor des scènes, affichés sous leur définition |
| Illustrations de repli | `public/images/concepts/` | variable | — | Générées par script (`npm run concepts`) | Visibles seulement dans l'administration |

## 2. Mesures avant et après

### Avant (version en ligne au 2026-10-26, commit `d44dfb0`)

| Écran | Images mesurées | Agrandies au-delà de ×1,5 | Pire facteur |
|---|---|---|---|
| 1920×1080 @1x | 237 | 40 | ×3.0 (/images/creations/or-de-marrakech/or-de-marrakech-coeur.webp) |
| 1440×900 @2x | 237 | 78 | ×5.9 (/images/creations/or-de-marrakech/or-de-marrakech-coeur.webp) |
| 390×844 @3x | 233 | 78 | ×4.2 (/images/creations/ebene-sale/ebene-sale-coeur.webp) |

#### Images agrandies au-delà de ×1,5 (affichage > 120 × 120 px)

| Page | Écran | Image | Source | Affichée (px CSS) | Détail réel (px) | Facteur |
|---|---|---|---|---|---|---|
| / | 1440×900 @2x | `/images/creations/or-de-marrakech/or-de-marrakech-coeur.webp` | recadrage agrandi ×6,4 | 834 × 786 | 283 | ×5.9 |
| /savoir-faire | 1440×900 @2x | `/images/creations/or-de-marrakech/or-de-marrakech-coeur.webp` | recadrage agrandi ×6,4 | 751 × 563 | 283 | ×5.3 |
| / | 1440×900 @2x | `/images/creations/eclipse-noire/eclipse-noire-coeur.webp` | recadrage agrandi ×6,4 | 623 × 779 | 281 | ×4.8 |
| / | 1440×900 @2x | `/images/creations/ebene-sale/ebene-sale-vue.webp` | vignette de planche agrandie ×4,4 | 797 × 544 | 355 | ×4.5 |
| /creations | 1440×900 @2x | `/images/creations/eclipse-noire/eclipse-noire-vue.webp` | vignette de planche agrandie ×4,4 | 751 × 469 | 348 | ×4.3 |
| /savoir-faire | 1440×900 @2x | `/images/creations/rose-de-nuit/rose-de-nuit-vue.webp` | vignette de planche agrandie ×4,4 | 751 × 563 | 351 | ×4.3 |
| /creations | 390×844 @3x | `/images/creations/ebene-sale/ebene-sale-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.2 |
| /creations/ile-secrete | 390×844 @3x | `/images/creations/ebene-sale/ebene-sale-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.2 |
| /collections/ephemere | 390×844 @3x | `/images/creations/ebene-sale/ebene-sale-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.2 |
| / | 390×844 @3x | `/images/creations/or-de-marrakech/or-de-marrakech-coeur.webp` | recadrage agrandi ×6,4 | 392 × 441 | 283 | ×4.2 |
| /creations | 390×844 @3x | `/images/creations/velours-persan/velours-persan-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.0 |
| /creations | 390×844 @3x | `/images/creations/or-de-marrakech/or-de-marrakech-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 283 | ×4.0 |
| /creations | 390×844 @3x | `/images/creations/rouge-desir/rouge-desir-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 282 | ×4.0 |
| /creations | 390×844 @3x | `/images/creations/ambre-fume/ambre-fume-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.0 |
| /creations | 390×844 @3x | `/images/creations/eclipse-noire/eclipse-noire-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 281 | ×4.0 |
| /creations/or-de-marrakech | 390×844 @3x | `/images/creations/eclipse-noire/eclipse-noire-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 281 | ×4.0 |
| /creations/or-de-marrakech | 390×844 @3x | `/images/creations/velours-persan/velours-persan-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.0 |
| /creations/cafe-imperial | 390×844 @3x | `/images/creations/eclipse-noire/eclipse-noire-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 281 | ×4.0 |
| /creations/cafe-imperial | 390×844 @3x | `/images/creations/velours-persan/velours-persan-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.0 |
| /creations/ile-secrete | 390×844 @3x | `/images/creations/ambre-fume/ambre-fume-coeur.webp` | recadrage agrandi ×6,4 | 350 × 438 | 285 | ×4.0 |

… et 176 autres mesures au-delà de ×1,5 (relevé complet conservé hors du dépôt, disponible sur demande).

#### Filtres de flou sur les images

Aucun.


### Après (branche `refonte-v2`)

| Écran | Images mesurées | Agrandies au-delà de ×1,5 | Pire facteur |
|---|---|---|---|
| 1440×900 @2x | 221 | 0 | ×1.5 (/images/coffrets/coffret-signature-12-4794a62b.webp) |
| 390×844 @3x | 209 | 0 | ×1.5 (/images/creations/eclipse-noire/eclipse-noire-vue-8a1b683a.webp) |

#### Images agrandies au-delà de ×1,5 (affichage > 120 × 120 px)

Aucune.


#### Filtres de flou sur les images

Aucun.


#### Inventaire des images affichées (61)

| Image | Définition du fichier | Détail réel | Provenance | Pages | Plus grand affichage (px CSS) | Pire facteur | Filtres CSS | Classement |
|---|---|---|---|---|---|---|---|---|
| `/brand/maison-tamran-lockup-ivory.png` | 1221 × 794 | 1221 px | logo | /, /creations, /creations/or-de-marrakech (+15) | 99 × 64 (1440×900 @2x) | ×0.21 (390×844 @3x) | aucun (flou d’arrière-plan de la barre d’en-tête, pas sur l’image) | logo |
| `/brand/maison-tamran-lockup.png` | 1221 × 794 | 1221 px | logo | /, /creations, /creations/or-de-marrakech (+14) | 99 × 64 (1440×900 @2x) | ×0.18 (390×844 @3x) | aucun (flou d’arrière-plan de la barre d’en-tête, pas sur l’image) | logo |
| `/brand/maison-tamran-logo-ivory.png` | 1221 × 887 | 1221 px | logo | /, /creations, /creations/or-de-marrakech (+14) | 242 × 176 (1440×900 @2x) | ×0.49 (390×844 @3x) | aucun | logo |
| `/brand/maison-tamran-mark-ivory.png` | 828 × 733 | 828 px | logo | /, /creations, /creations/or-de-marrakech (+15) | 610 × 540 (1440×900 @2x) | ×1.47 (1440×900 @2x) | aucun | logo |
| `/images/ambiance/art-de-recevoir.webp` | 3840 × 2556 | 3840 px | photo Unsplash | /, /coffrets, /savoir-faire (+3) | 1310 × 737 (1440×900 @2x) | ×0.68 (1440×900 @2x) | aucun | conservée |
| `/images/ambiance/cafe-grains.webp` | 3840 × 2560 | 3840 px | photo Unsplash | /creations/cafe-imperial | 630 × 788 (1440×900 @2x) | ×0.77 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/cafe-oriental.webp` | 3840 × 2400 | 3840 px | photo Unsplash | /, /professionnels, /contact | 394 × 493 (1440×900 @2x) | ×0.55 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/cardamome.webp` | 3840 × 2571 | 3840 px | photo Unsplash | /creations/cafe-imperial | 350 × 438 (390×844 @3x) | ×0.51 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/chocolat.webp` | 3840 × 3072 | 3840 px | photo Unsplash | /, /savoir-faire | 1613 × 1008 (1440×900 @2x) | ×0.92 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/coco.webp` | 2848 × 3840 | 2848 px | photo Unsplash | /, /creations/ile-secrete | 630 × 788 (1440×900 @2x) | ×0.49 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/dattes-naturelles.webp` | 3840 × 2560 | 3840 px | photo Unsplash | /savoir-faire, /maison | 575 × 575 (1440×900 @2x) | ×0.45 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/dattier-regimes.webp` | 2560 × 3840 | 2560 px | photo Unsplash | /, /savoir-faire | 1699 × 1062 (1440×900 @2x) | ×1.33 (1440×900 @2x) | aucun | conservée |
| `/images/ambiance/medjool-macro.webp` | 3840 × 2880 | 3840 px | photo Unsplash | / | 1800 × 1125 (1440×900 @2x) | ×1.10 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/noisette.webp` | 2560 × 3840 | 2560 px | photo Unsplash | /creations/cafe-imperial | 350 × 438 (390×844 @3x) | ×0.41 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/palmeraie.webp` | 3840 × 1951 | 3840 px | photo Unsplash | /maison | 1699 × 658 (1440×900 @2x) | ×0.95 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/palmeraie-maroc.webp` | 3840 × 2560 | 3840 px | photo Unsplash | / | 310 × 200 (1440×900 @2x) | ×0.16 (1440×900 @2x) | aucun | conservée |
| `/images/ambiance/pistache.webp` | 3840 × 2560 | 3840 px | photo Unsplash | /, /creations, /creations/or-de-marrakech (+1) | 1670 × 1044 (1440×900 @2x) | ×1.15 (390×844 @3x) | aucun | conservée |
| `/images/ambiance/riad-lumiere.webp` | 2560 × 3840 | 2560 px | photo Unsplash | /professionnels, /professionnels/mariages-evenements, /maison | 1310 × 737 (1440×900 @2x) | ×1.02 (1440×900 @2x) | brightness(0.987071), brightness(1) | conservée |
| `/images/ambiance/riad-soleil.webp` | 3840 × 2560 | 3840 px | photo Unsplash | / | 635 × 793 (1440×900 @2x) | ×0.62 (1440×900 @2x) | aucun | conservée |
| `/images/ambiance/rose.webp` | 3840 × 2560 | 3840 px | photo Unsplash | /, /creations, /savoir-faire (+1) | 751 × 563 (1440×900 @2x) | ×0.74 (390×844 @3x) | aucun | conservée |
| `/images/coffrets/coffret-signature-12.webp` | 1448 × 1086 | 1448 px | photo de référence du coffret | /, /coffrets, /savoir-faire (+4) | 913 × 685 (1440×900 @2x) | ×1.49 (1440×900 @2x) | aucun | conservée |
| `/images/creations/ambre-fume/ambre-fume-coeur.webp` | 231 × 248 | 231 px | case de planche, définition réelle | /, /creations | 112 × 70 (1440×900 @2x) | ×1.13 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/ambre-fume/ambre-fume-vue.webp` | 412 × 495 | 412 px | case de planche, définition réelle | /, /creations, /creations/ile-secrete (+3) | 297 × 356 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/cafe-imperial/cafe-imperial-coeur.webp` | 600 × 750 | 600 px | photo de référence | /, /creations, /creations/cafe-imperial | 124 × 78 (1440×900 @2x) | ×0.48 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/cafe-imperial/cafe-imperial-vue.webp` | 1122 × 1402 | 1122 px | photo de référence | /, /creations, /creations/cafe-imperial (+3) | 580 × 725 (1440×900 @2x) | ×1.05 (390×844 @3x) | aucun | conservée |
| `/images/creations/ebene-sale/ebene-sale-coeur.webp` | 232 × 248 | 232 px | case de planche, définition réelle | /, /creations | 124 × 78 (1440×900 @2x) | ×1.13 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/ebene-sale/ebene-sale-vue.webp` | 415 × 495 | 415 px | case de planche, définition réelle | /, /creations, /creations/ile-secrete (+3) | 299 × 356 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/eclipse-noire/eclipse-noire-coeur.webp` | 230 × 248 | 230 px | case de planche, définition réelle | /, /creations | 124 × 78 (1440×900 @2x) | ×1.14 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/eclipse-noire/eclipse-noire-vue.webp` | 410 × 495 | 410 px | case de planche, définition réelle | /, /creations, /creations/or-de-marrakech (+5) | 295 × 356 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/ile-secrete/ile-secrete-coeur.webp` | 232 × 248 | 232 px | case de planche, définition réelle | /, /creations | 124 × 78 (1440×900 @2x) | ×1.13 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/ile-secrete/ile-secrete-vue.webp` | 415 × 495 | 415 px | case de planche, définition réelle | /, /creations, /creations/ile-secrete (+3) | 301 × 354 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/minuit-a-kyoto/minuit-a-kyoto-coeur.webp` | 232 × 248 | 232 px | case de planche, définition réelle | /, /creations | 124 × 78 (1440×900 @2x) | ×1.13 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/minuit-a-kyoto/minuit-a-kyoto-vue.webp` | 415 × 495 | 415 px | case de planche, définition réelle | /, /creations, /creations/or-de-marrakech (+5) | 299 × 356 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/or-de-marrakech/or-de-marrakech-coeur.webp` | 231 × 248 | 231 px | case de planche, définition réelle | /, /creations | 124 × 78 (1440×900 @2x) | ×1.13 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/or-de-marrakech/or-de-marrakech-vue.webp` | 412 × 495 | 412 px | case de planche, définition réelle | /, /creations, /creations/or-de-marrakech (+5) | 299 × 354 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/rose-de-nuit/rose-de-nuit-coeur.webp` | 230 × 248 | 230 px | case de planche, définition réelle | /, /creations | 87 × 54 (390×844 @3x) | ×1.14 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/rose-de-nuit/rose-de-nuit-vue.webp` | 410 × 495 | 410 px | case de planche, définition réelle | /, /creations, /creations/ile-secrete (+4) | 295 × 356 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/rouge-desir/rouge-desir-coeur.webp` | 230 × 248 | 230 px | case de planche, définition réelle | /, /creations | 124 × 78 (1440×900 @2x) | ×1.14 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/rouge-desir/rouge-desir-vue.webp` | 410 × 495 | 410 px | case de planche, définition réelle | /, /creations, /collections/signature (+3) | 295 × 356 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/velours-persan/velours-persan-coeur.webp` | 232 × 248 | 232 px | case de planche, définition réelle | /, /creations | 124 × 78 (1440×900 @2x) | ×1.13 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/creations/velours-persan/velours-persan-vue.webp` | 415 × 495 | 415 px | case de planche, définition réelle | /, /creations, /creations/or-de-marrakech (+4) | 299 × 356 (1440×900 @2x) | ×1.50 (390×844 @3x) | aucun | limitée à un petit format |
| `/images/scene/coffret-ouvert.webp` | 1018 × 1021 | 1018 px | élément détouré | / | 663 × 665 (1440×900 @2x) | ×1.30 (1440×900 @2x) | aucun | décor détouré |
| `/images/scene/ing-amande-1.webp` | 332 × 362 | 332 px | élément détouré | / | 88 × 90 (1440×900 @2x) | ×0.53 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-amande-2.webp` | 251 × 378 | 251 px | élément détouré | / | 65 × 69 (1440×900 @2x) | ×0.52 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 14px 14px) | décor détouré |
| `/images/scene/ing-amande-tas.webp` | 900 × 788 | 900 px | élément détouré | / | 151 × 136 (1440×900 @2x) | ×0.33 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.5) 0px 10px 12px) | décor détouré |
| `/images/scene/ing-cafe-2.webp` | 153 × 146 | 153 px | élément détouré | / | 76 × 75 (1440×900 @2x) | ×0.99 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-cafe-3.webp` | 155 × 140 | 155 px | élément détouré | / | 73 × 75 (1440×900 @2x) | ×0.94 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-cafe-tas.webp` | 900 × 847 | 900 px | élément détouré | / | 163 × 159 (1440×900 @2x) | ×0.36 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.5) 0px 10px 12px) | décor détouré |
| `/images/scene/ing-chocolat-1.webp` | 792 × 506 | 792 px | élément détouré | / | 174 × 145 (1440×900 @2x) | ×0.44 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-chocolat-2.webp` | 707 × 431 | 707 px | élément détouré | / | 156 × 129 (1440×900 @2x) | ×0.44 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-framboise-1.webp` | 544 × 506 | 544 px | élément détouré | / | 113 × 108 (1440×900 @2x) | ×0.42 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-framboise-2.webp` | 474 × 471 | 474 px | élément détouré | / | 82 × 81 (1440×900 @2x) | ×0.35 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.5) 0px 10px 12px) | décor détouré |
| `/images/scene/ing-noisette-5.webp` | 285 × 294 | 285 px | élément détouré | / | 66 × 68 (1440×900 @2x) | ×0.46 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-noisette-tas.webp` | 900 × 802 | 900 px | élément détouré | / | 161 × 150 (1440×900 @2x) | ×0.36 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.5) 0px 10px 12px) | décor détouré |
| `/images/scene/ing-pistache-1.webp` | 302 × 437 | 302 px | élément détouré | / | 119 × 115 (1440×900 @2x) | ×0.79 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-pistache-2.webp` | 352 × 373 | 352 px | élément détouré | / | 113 × 114 (1440×900 @2x) | ×0.64 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-pistache-3.webp` | 430 × 259 | 430 px | élément détouré | / | 95 × 70 (1440×900 @2x) | ×0.44 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 14px 14px) | décor détouré |
| `/images/scene/ing-pistache-4.webp` | 422 × 304 | 422 px | élément détouré | / | 111 × 96 (1440×900 @2x) | ×0.53 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 18px 18px) | décor détouré |
| `/images/scene/ing-pistache-5.webp` | 277 × 411 | 277 px | élément détouré | / | 78 × 65 (1440×900 @2x) | ×0.57 (1440×900 @2x) | drop-shadow(rgba(0, 0, 0, 0.55) 0px 14px 14px) | décor détouré |
| `/images/scene/oasis-palme.webp` | 2600 × 1819 | 2600 px | élément détouré | / | 1290 × 903 (1440×900 @2x) | ×0.99 (1440×900 @2x) | brightness(0.62) saturate(0.9) | décor détouré |
| `/images/scene/oasis-paysage.webp` | 3840 × 1951 | 3840 px | élément détouré | / | 2072 × 1053 (1440×900 @2x) | ×1.39 (390×844 @3x) | aucun | décor détouré |


## 3. Sources du flou identifiées

1. **Vignettes de planche agrandies affichées en grand.**
   - Les fichiers publiés pour les créations (« vue », « cœur », « entier ») faisaient 1 800 à 2 100 px de large, mais ne contenaient que 230 à 412 px de détail.
   - Exemple : la grande image de l'étape « La garniture » de « Tout commence par un fruit » (cœur d'Or de Marrakech) était affichée ×3 sur écran standard et **×5,9 sur écran Retina**.
2. **Galerie produit avec loupe ×1,8** sur ces mêmes vignettes.
3. **Zoom de l'anatomie (×1,35)** appliqué au-delà de la définition de la photo de référence.
4. **Taille d'image demandée trop petite** pour les alvéoles des schémas de coffret (`sizes="64px"` pour un affichage de ≈ 115 px).
5. Aucun filtre CSS `blur()` n'était appliqué aux photographies. Le seul `filter` sur une image est un `drop-shadow` sur les éléments détourés, et un assombrissement de la palme de premier plan.

## 4. Règles appliquées

- **Aucune image n'est agrandie au-delà de ×1,5** de son détail réel. La taille d'affichage est plafonnée selon la densité d'écran (`@media (min-resolution: …)`) :
  - `.native-cap` pour les tirages des créations (largeur ≤ définition × 1 en densité 1, × 0,75 en densité 2, × 0,5 en densité 3) ;
  - `.print-inset`, `.print-inset-sm`, `.meta-niches` ;
  - `.hero-coffret`, `.gift-frame`, `.anatomy-frame`, `.burst-plate`.
- **Deux échelles pour les créations.** En grand, les photographies haute définition d'ingrédients ou d'ambiance. Posée dessus, la création en tirage, à sa taille nette.
- **Zooms bornés.** Anatomie ×1,2 et coffret ×1,18, avec un cadre calculé pour que le zoom maximal reste dans la définition.
- **Pas de netteté artificielle** : aucun filtre de netteté, aucun agrandissement par IA, aucun « 4K » revendiqué pour une image qui ne l'est pas.
- **Noms de fichiers avec empreinte du contenu** : une image remplacée change d'adresse, aucun cache ne sert l'ancienne version.

## 5. Corrections effectuées

| Usage | Avant | Après |
|---|---|---|
| Hero | Photo du coffret en fond sur ≈ 70 % de la largeur (mesuré : ×1,1 en 1920 px, **×1,85 sur écran Retina**), voile sombre sur la moitié gauche | Coffret détouré, affiché au plus à 1000 px (densité 1) ou 760 px (Retina), dans une scène composée |
| « Tout commence par un fruit » | Étape finale : cœur d'Or de Marrakech ×5,9 | Oasis en photos 4K, métamorphose en photos 4K, puis les dix créations en vignettes nettes (≤ 132 px) |
| Anatomie | Zoom ×1,35 | Cadre plafonné, zoom ×1,2 dans la définition |
| Fiche produit | Galerie 50 vw avec loupe ×1,8 | Tirage net posé sur la photo d'un ingrédient ; autres vues = ingrédients en plein cadre ; loupe supprimée |
| Cartes produit | Image plein cadre de carte (×1,6 à ×4) | Création dans une niche, à sa taille nette (`.native-cap`) |
| Page Créations, « Deux univers » | Création en couverture 16:10 (×1,8 à ×3,6) | Photo d'ingrédient en couverture, création en tirage |
| Page Notre Maison | Triptyque des cœurs (recadrages de 230 px à ≈ 300 px) | Vues complètes de 412 px |
| Savoir-faire | Cœur d'Or de Marrakech et Rose de Nuit en grand | Photographies d'ingrédients en grand, créations en médaillon |
| Schémas de coffret | Vignettes demandées en 64 px | Vignettes demandées en 96 ou 128 px |

## 6. Assets à produire (photographie ou création visuelle)

Les créations n'existent aujourd'hui qu'en vignettes de ≈ 414 × 496 px. Pour présenter les produits en grand format, il faut de vraies prises de vue (ou des visuels générés individuellement en haute définition, sans logo inventé) :

| Asset | Cadrage | Définition cible | Usage prévu |
|---|---|---|---|
| Les 10 créations : datte entière + datte coupée, sur l'assiette en laiton (comme la planche) | 4:5, lumière chaude latérale, fond sombre | ≥ 3000 × 3750 px, net sur toute la datte | Fiches produit, cartes, Signatures, hero des collections |
| Les 10 créations : macro de la coupe | 1:1, très serré sur le cœur | ≥ 3000 × 3000 px | Anatomie de chaque recette, vue « Le cœur » |
| Les 10 créations détourées (entière et coupée), fond neutre | Plongée ¾ | ≥ 2500 px sur le grand côté | Explosion des saveurs, composition des coffrets, configurateur |
| Coffret Signature fermé | ¾, même décor que la photo ouverte | ≥ 4000 × 3000 px | Animation d'ouverture fermé → ouvert |
| Couvercle séparé + boîte vue de dessus | Vue zénithale, fond neutre | ≥ 4000 px | Ouverture animée crédible, configurateur photographique |
| Coffrets Découverte (6) et Prestige (24) | Ouverts, ¾ et vue de dessus | ≥ 4000 × 3000 px | Page Coffrets, formats (aujourd'hui des schémas légendés) |
| Édition limitée et coffret Entreprise | Ouverts, ¾ | ≥ 4000 × 3000 px | Page Coffrets, professionnels |
| Ingrédients manquants sur fond blanc uni | Pièces séparées, nettes sur toute la profondeur | ≥ 3000 px | Cardamome, safran, pétales de rose séchés, noix de pécan, sésame noir, zeste de yuzu |
| Atelier réel (si la maison en a un) | Mains, gestes de fabrication | ≥ 4000 px | Savoir-faire (aujourd'hui des photos d'ingrédients, sans atelier montré) |
