# MAISON TAMRĀN — Inventaire des visuels

Origine, définition, licence et usage de chaque image du site. Les photographies d'ambiance Unsplash et les éléments détourés restent décrits dans `ASSET_LICENSES.md` et `IMAGE_AUDIT.md`.

## Sources

| Source | Fichiers | Nature | Licence / droits |
| --- | --- | --- | --- |
| Logo officiel | `brand/source/maison-tamran-logo-original.png` → `public/brand/` | Fichier de marque fourni | Propriété de la maison |
| Pack photo de la maison | `brand/source/pack-photos/` | Planche des dix créations (≈ 414 × 496 px par case), photos de référence Café Impérial et coffret Signature | Fournis par la maison ; servent de **références** à la génération |
| Photographies d'ambiance | `public/images/ambiance/` | Paysages, palmeraies, ingrédients (3840 px) | Licence Unsplash (usage commercial autorisé), voir `ASSET_LICENSES.md` |
| **Visuels générés** | `brand/generated/` (originaux) → `public/images/generated/` | Générés par l'API Images d'OpenAI (`gpt-image-2.5-sunburst`, qualité `high`) à partir des références ci-dessus | Produites pour la maison avec sa clé d'API. Selon les conditions d'utilisation d'OpenAI, le contenu généré appartient à l'utilisateur ; point à faire confirmer par le conseil juridique avant un usage publicitaire |

## Visuels générés

Tous sont des **visuels conceptuels** : ils sont signalés « Visuel conceptuel · IA » à l'écran et ne doivent pas être présentés comme des photographies de produits fabriqués, tant que les créations et les coffrets réels n'ont pas été photographiés.

- **Définition native** : chaque image est générée directement à la taille indiquée, jusqu'à 3840 × 2160 (et 2160 × 3840 pour les verticales des pages éditoriales sur mobile). Aucun agrandissement : la version publiée est identique ou réduite.
- **Logo** : jamais demandé au modèle. Sur `coffret-ferme`, le logo officiel est composé en perspective au moment de la publication (`scripts/images/lid.ts`).
- **Fidélité** : chaque prompt part de la case de la création sur la planche validée et décrit la recette enregistrée. Minuit à Kyoto, Ébène Salé et Rose de Nuit ont été régénérées après une première version qui montrait des fruits à coque absents de leur composition.
- **Assortiments** (`coffret-ouvert`, formats, univers) : créations reconnaissables de la gamme, sans valeur de composition réelle d'un coffret.

| Emplacement | Original (natif) | Publié | Usage |
| --- | --- | --- | --- |
| `produit-eclipse-noire` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-velours-persan` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-minuit-a-kyoto` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-or-de-marrakech` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-cafe-imperial` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-rouge-desir` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-ebene-sale` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-ile-secrete` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-ambre-fume` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `produit-rose-de-nuit` | 1632 × 2048 | 1632 × 2048 | Fiche produit (visuel principal), cartes du catalogue, Signatures et éditions de l'accueil |
| `coffret-vide-12` | 2048 × 1536 | 2048 × 1536 | Configurateur (format 12 pièces) |
| `rituel-cafe` | 3840 × 2160 | 3840 × 2160 | Accueil (la Maison), savoir-faire, rituel |
| `pro-hotel` | 3840 × 2160 | 3840 × 2160 | Professionnels (hôtels, restaurants, épiceries fines) |
| `meta-coeur` | 2560 × 1440 | 2560 × 1440 | Accueil, la métamorphose (03 · le cœur) |
| `meta-enrobage` | 2560 × 1440 | 2560 × 1440 | Accueil, la métamorphose (04 · l'enrobage), savoir-faire |
| `atelier-ingredients` | 3840 × 2160 | 3840 × 2160 | Accueil (les saveurs), savoir-faire |
| `coffret-ferme` | 3840 × 2160 | 3840 × 2160 | Hero de l'accueil (coffret fermé) |
| `coupe-eclipse-noire` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-eclipse-noire` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-velours-persan` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-velours-persan` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-minuit-a-kyoto` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-minuit-a-kyoto` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-or-de-marrakech` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-or-de-marrakech` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-cafe-imperial` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-cafe-imperial` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-rouge-desir` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-rouge-desir` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-ebene-sale` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-ebene-sale` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-ile-secrete` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-ile-secrete` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-ambre-fume` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-ambre-fume` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coupe-rose-de-nuit` | 1920 × 1920 | 1920 × 1920 | Fiche produit (zoom sur la garniture), anatomie, galerie |
| `piece-rose-de-nuit` | 1024 × 1024 | 1024 × 1024 | Configurateur de coffret (alvéoles), animations de remplissage |
| `coffret-vide-6` | 2048 × 1536 | 2048 × 1536 | Configurateur (format 6 pièces) |
| `coffret-vide-24` | 2304 × 1536 | 2048 × 1365 | Configurateur (format 24 pièces) |
| `coffret-ouvert` | 3840 × 2160 | 3840 × 2160 | Hero de l'accueil (ouverture du coffret au défilement), page Coffrets |
| `coffret-decouverte` | 2304 × 1728 | 2304 × 1728 | Page Coffrets, accueil (formats), configurateur |
| `coffret-prestige` | 2304 × 1728 | 2304 × 1728 | Page Coffrets, accueil (formats) |
| `coffret-edition` | 2304 × 1728 | 2304 × 1728 | Page Coffrets, éditions éphémères |
| `coffret-entreprise` | 3840 × 2160 | 3840 × 2160 | Professionnels, cadeaux d'entreprise |
| `cadeau-mariage` | 3840 × 2160 | 3840 × 2160 | Professionnels, mariages et événements, l'art d'offrir |
| `maison-palmeraie-v` | 2160 × 3840 | 2160 × 3840 | Notre Maison (ouverture, mobile) |
| `atelier-ingredients-v` | 2160 × 3840 | 2160 × 3840 | Le savoir-faire (ouverture, mobile) |
| `coffrets-ruban-v` | 2160 × 3840 | 2160 × 3840 | Professionnels (ouverture, mobile) |

63 générations facturées, 6.29 USD au total (brand/generated/ledger.json).

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
