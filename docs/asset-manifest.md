# MAISON TAMRĀN — Inventaire des visuels

Origine, définition, licence et usage de chaque image du site. Les photographies libres de droits d'origine (Unsplash), désormais remplacées à l'écran, et les éléments détourés restent décrits dans `ASSET_LICENSES.md` et `IMAGE_AUDIT.md`.

## Sources

| Source | Fichiers | Nature | Licence / droits |
| --- | --- | --- | --- |
| Logo officiel | `brand/source/maison-tamran-logo-original.png` → `public/brand/` | Fichier de marque fourni | Propriété de la maison |
| Pack photo de la maison | `brand/source/pack-photos/` | Planche des dix créations (≈ 414 × 496 px par case), photos de référence Café Impérial et coffret Signature | Fournis par la maison ; servent de **références** à la génération |
| Photographies d'ambiance | `public/images/generated/ambiance/` (`amb-*`) | Paysages, palmeraies, riads, ingrédients, 3504 × 2336 (ou 2336 × 3504), nouvelles prises de vue générées | Visuels conceptuels générés (voir ci-dessous). Les photos Unsplash d'origine (`public/images/ambiance/`, licence Unsplash, `ASSET_LICENSES.md`) ne servent plus que de secours et de référence de sujet |
| **Visuels générés** | `brand/generated/` (originaux) → `public/images/generated/` | Générés par l'API Images d'OpenAI (`gpt-image-2.5-sunburst`, qualité `high`) à partir des références ci-dessus | Produites pour la maison avec sa clé d'API. Selon les conditions d'utilisation d'OpenAI, le contenu généré appartient à l'utilisateur ; point à faire confirmer par le conseil juridique avant un usage publicitaire |

## Visuels générés

Tous sont des **visuels conceptuels** : ils sont signalés « Visuel conceptuel · IA » à l'écran et ne doivent pas être présentés comme des photographies de produits fabriqués, tant que les créations et les coffrets réels n'ont pas été photographiés.

- **Définition native 4K** : chaque image est générée directement à sa taille (jusqu'à 8,3 Mpx : 3840 × 2160, 2448 × 3072, 2880 × 2880, 3264 × 2448, 3504 × 2336) et publiée sans réduction ; `next/image` en sert des déclinaisons AVIF / WebP adaptées à chaque écran. Aucun agrandissement numérique.
- **Passage en 4K (2026-10-31)** : les visuels validés en définition inférieure (produits, macros, pièces détourées, coffrets vides, formats, étapes) ont été refaits à partir de leur original retenu, envoyé comme dernière image de référence (mêmes cadrage, objets, couleurs et lumière ; détail plus fin). Ces originaux sont gelés dans `scripts/images/openai-shots.ts` (`MASTERS`) et protégés de `prune`. Les grilles d'alvéoles du configurateur ont été vérifiées sur les nouveaux coffrets vides (aucun décalage). Les vingt photographies d'ambiance libres de droits, floues une fois agrandies, sont remplacées par des prises de vue générées (`amb-*`), la photo d'origine n'indiquant que le sujet ; `coffret-1` (photographie de référence 1448 px) est servi par `coffret-signature`. Coût de ce passage : 9,05 $ (59 images).
- **Logo** : jamais demandé au modèle. Sur `coffret-ferme`, le logo officiel est composé en perspective au moment de la publication (`scripts/images/lid.ts`).
- **Fidélité** : chaque prompt part de la case de la création sur la planche validée et décrit la recette enregistrée. Minuit à Kyoto, Ébène Salé et Rose de Nuit ont été régénérées après une première version qui montrait des fruits à coque absents de leur composition.
- **Assortiments** (`coffret-ouvert`, formats, univers) : créations reconnaissables de la gamme, sans valeur de composition réelle d'un coffret.

| Emplacement | Original (natif) | Publié | Usage |
| --- | --- | --- | --- |
| `produit-eclipse-noire` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-velours-persan` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-minuit-a-kyoto` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-or-de-marrakech` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-cafe-imperial` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-rouge-desir` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-ebene-sale` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-ile-secrete` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-ambre-fume` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-rose-de-nuit` | 2448 × 3072 | 2448 × 3072 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `coffret-vide-12` | 3264 × 2448 | 3264 × 2448 | Configurateur (format 12 pièces) |
| `rituel-cafe` | 3840 × 2160 | 3840 × 2160 | Accueil (la Maison), Notre Maison, menus de l'en-tête |
| `pro-hotel` | 3840 × 2160 | 3840 × 2160 | Accueil (professionnels), Professionnels |
| `meta-coeur` | 3840 × 2160 | 3840 × 2160 | Accueil, de la palmeraie à la création (le cœur) |
| `meta-enrobage` | 3840 × 2160 | 3840 × 2160 | Accueil, de la palmeraie à la création (l'enrobage), savoir-faire |
| `atelier-ingredients` | 3840 × 2160 | 3840 × 2160 | Le savoir-faire, menus de l'en-tête |
| `coffret-ferme` | 3840 × 2160 | 3840 × 2160 | Hero de l'accueil (coffret fermé) |
| `coupe-eclipse-noire` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-eclipse-noire` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-velours-persan` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-velours-persan` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-minuit-a-kyoto` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-minuit-a-kyoto` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-or-de-marrakech` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-or-de-marrakech` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-cafe-imperial` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-cafe-imperial` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-rouge-desir` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-rouge-desir` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-ebene-sale` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-ebene-sale` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-ile-secrete` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-ile-secrete` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-ambre-fume` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-ambre-fume` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coupe-rose-de-nuit` | 2880 × 2880 | 2880 × 2880 | Fiche produit (zoom sur la garniture), cartes (survol), Signatures et éditions de l'accueil |
| `piece-rose-de-nuit` | 2048 × 2048 | 2048 × 2048 | Configurateur et coffrets de l'accueil (pièce posée dans sa caissette) |
| `coffret-vide-6` | 3264 × 2448 | 3264 × 2448 | Configurateur (format 6 pièces) |
| `coffret-vide-24` | 3504 × 2336 | 3504 × 2336 | Configurateur (format 24 pièces) |
| `coffret-ouvert` | 3840 × 2160 | 3840 × 2160 | Hero de l'accueil (ouverture du coffret au défilement), page Coffrets |
| `coffret-decouverte` | 3264 × 2448 | 3264 × 2448 | Page Coffrets, menus de l'en-tête |
| `coffret-prestige` | 3264 × 2448 | 3264 × 2448 | Page Coffrets |
| `coffret-edition` | 3264 × 2448 | 3264 × 2448 | Page Coffrets, éditions éphémères |
| `coffret-entreprise` | 3840 × 2160 | 3840 × 2160 | Professionnels, cadeaux d'entreprise |
| `cadeau-mariage` | 3840 × 2160 | 3840 × 2160 | Professionnels, mariages et événements |
| `coffret-signature` | 3264 × 2448 | 3264 × 2448 | Coffrets, accueil (format 12 pièces), Maison, Professionnels, Savoir-faire, compte |
| `maison-palmeraie-v` | 2160 × 3840 | 2160 × 3840 | Notre Maison (ouverture, mobile) |
| `atelier-ingredients-v` | 2160 × 3840 | 2160 × 3840 | Le savoir-faire (ouverture, mobile) |
| `coffrets-ruban-v` | 2160 × 3840 | 2160 × 3840 | Professionnels (ouverture, mobile) |
| `amb-palmeraie` | 3504 × 2336 | 3504 × 2336 | Notre Maison |
| `amb-dattier-regimes` | 2336 × 3504 | 2336 × 3504 | Accueil, Le savoir-faire |
| `amb-dattes-naturelles` | 3504 × 2336 | 3504 × 2336 | Notre Maison, Le savoir-faire |
| `amb-chocolat` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-riad-lumiere` | 2336 × 3504 | 2336 × 3504 | Notre Maison |
| `amb-cafe-oriental` | 3504 × 2336 | 3504 × 2336 | Contact, Professionnels |
| `amb-art-de-recevoir` | 3504 × 2336 | 3504 × 2336 | Coffrets, Notre Maison, Professionnels |
| `amb-pistache` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-noisette` | 2336 × 3504 | 2336 × 3504 | Fiches produit (ingrédients) |
| `amb-amande` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-cardamome` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-safran` | 2336 × 3504 | 2336 × 3504 | Fiches produit (ingrédients) |
| `amb-rose` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-framboise` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-cafe-grains` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-coco` | 2336 × 3504 | 2336 × 3504 | Fiches produit (ingrédients) |
| `amb-matcha` | 3504 × 2336 | 3504 × 2336 | Fiches produit (ingrédients) |
| `amb-medjool-macro` | 3504 × 2336 | 3504 × 2336 | Accueil, fiches produit |
| `amb-palmeraie-maroc` | 3504 × 2336 | 3504 × 2336 | Notre Maison |
| `amb-riad-soleil` | 3504 × 2336 | 3504 × 2336 | Notre Maison |

122 générations facturées, 15.34 USD au total (brand/generated/ledger.json).

## Commandes

```bash
npm run images:openai -- status                      # état et dépense cumulée
npm run images:openai -- <emplacement>               # estimation seule
npm run images:openai -- <emplacement> --yes         # génère (un original existant n'est jamais repayé)
npm run images:openai -- publish <emplacement>       # publie sur le site (manifeste photo, provenance)
npm run images:openai -- use <emplacement> <clé>     # revient à une version déjà payée
npm run images:openai -- prune                       # supprime les originaux écartés
npx tsx scripts/images/contact-sheet.mts out.jpg <emplacements…>   # planche de revue
```

Clé : `OPENAI_API_KEY` dans `.env.local` (non versionné, jamais journalisée). Plafond cumulé : `IMAGE_BUDGET_USD` (20 $ par défaut) ou `--budget`. Dépense réelle calculée à partir des jetons facturés (`brand/generated/ledger.json`).

## Encore à produire (prises de vue réelles)

Les dix créations réelles (entière et coupée, macro de la coupe), les coffrets 6 / 12 / 24 et l'édition limitée, fermés et ouverts, ainsi que l'atelier si la maison en a un. Les cadrages des visuels conceptuels servent de cahier des charges au shooting.
