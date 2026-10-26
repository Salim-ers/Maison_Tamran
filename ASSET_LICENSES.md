# Licences des visuels — MAISON TAMRĀN

## Remplacements du 2026-10-26 (passage en 4K)

Quatre photos dont l'original faisait moins de 3840 px ont été remplacées (pages consultées le 2026-10-26 : licence Unsplash gratuite, pas Unsplash+). Les anciennes ne sont plus utilisées sur le site.

| Clé | Ancienne photo | Nouvelle photo |
|---|---|---|
| riad-lumiere | 4M0LMAbCnQE, SALAH PICTURES (2000 × 2500) | GtlrYb2cPp4, Benjamin Chambon (4000 × 6000) |
| dattier-regimes | c3GxJkt7tV0, Timur Gibadullin (3220 × 2145) | pBxL6uM3Ezg, loli mass (5003 × 7504) |
| coco | E95Lpkg-bgc, Irene Kredenets (2675 × 3344) | nUApCUJ1M6k, Kateryna Hliznitsova (4016 × 6016) |
| safran | wXl5Id9_6n0, marlik saffron (3794 × 2529) | hTE438DvDgg, Vera De (4016 × 6016) |

## Principe

- **Visuels produits** : tous les visuels représentant les créations de la maison (dattes Medjool fourrées et enrobées, coffrets, gammes) proviennent exclusivement du pack photo Maison Tamrān (`brand/source/pack-photos/`). Ce sont des visuels conceptuels produits pour la marque, pas des photos de stock.
- **Photos externes** : les photos de stock listées ci-dessous servent uniquement à l'**ambiance**, aux **ingrédients** et aux **paysages**. Elles ne doivent jamais être utilisées pour représenter un produit de la marque, ni être présentées comme l'atelier, la palmeraie, la plantation ou les lieux réels de Maison Tamrān.
- Le détail technique de chaque photo (dimensions, description, texte alternatif, remarques) est dans `brand/source/stock/stock.json`.

## Traitement appliqué

Les originaux ne sont pas versionnés (`brand/source/stock/*.jpg`, lourds) : `npm run stock` les retélécharge au besoin par le lien officiel Unsplash, puis publie dans `public/images/ambiance/` une version WebP en 4K (3840 px sur le grand côté, jamais agrandie au-delà de l'original) avec une légère harmonisation chaude pour la cohérence avec la palette. Les crédits sont affichés sur les photographies éditoriales du site (« Photo Prénom Nom / Unsplash »).

## Licence Unsplash (résumé)

Toutes les photos externes proviennent d'[Unsplash](https://unsplash.com) et relèvent de la **licence Unsplash gratuite** ([texte officiel](https://unsplash.com/license)). Aucune photo « Unsplash+ » (offre payante) n'est utilisée.

- **Usage libre et gratuit**, y compris **commercial** : téléchargement, copie, modification, diffusion.
- **Attribution non obligatoire** : nous créditons tout de même chaque photographe ci-dessous, par courtoisie et pour la traçabilité.
- **Interdits** :
  - vendre une photo telle quelle, sans modification significative (impression, poster, etc.) ;
  - compiler des photos Unsplash pour créer un service similaire ou concurrent.
- La licence porte sur le droit d'auteur de la photo. Elle ne couvre pas les marques, personnes ou biens éventuellement visibles. C'est pourquoi les photos retenues ne montrent ni visage reconnaissable, ni logo, ni emballage de marque, ni texte.

## Inventaire

| Clé | Fichier | Photographe | Page source | Licence | Dimensions | Usage prévu | Vérification |
|---|---|---|---|---|---|---|---|
| palmeraie | `brand/source/stock/palmeraie__v9MYNk3HMeM.jpg` | [Halima Bouchouicha](https://unsplash.com/@halimaart) | [v9MYNk3HMeM](https://unsplash.com/photos/a-desert-with-palm-trees-and-a-blue-sky-v9MYNk3HMeM) | Unsplash License | 4608 × 3456 | Accueil (« Tout commence par un fruit », étape 1 ; section La Maison), page Notre Maison (bandeau). Recadrée sur les palmiers en 3840 × 1951 (déchets du premier plan exclus). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| dattier-regimes | `brand/source/stock/dattier-regimes__pBxL6uM3Ezg.jpg` | [loli mass](https://unsplash.com/@lolimass) | [pBxL6uM3Ezg](https://unsplash.com/photos/ripening-dates-on-palm-tree-pBxL6uM3Ezg) | Unsplash License | 5003 × 7504 | Accueil (« Tout commence par un fruit », étape 2), page Savoir-faire (sélection des Medjool). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| dattes-naturelles | `brand/source/stock/dattes-naturelles__Ae6qKztd0Xw.jpg` | [Masjid Pogung Dalangan](https://unsplash.com/@masjidmpd) | [Ae6qKztd0Xw](https://unsplash.com/photos/a-wooden-bowl-filled-with-dates-sitting-on-top-of-a-table-Ae6qKztd0Xw) | Unsplash License | 5665 × 3777 | Accueil (étape 3, la chair), page Notre Maison (chapitre « La matière »), Savoir-faire (ouverture). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| chocolat | `brand/source/stock/chocolat__BqJAbXk2Fuw.jpg` | [Mae Mu](https://unsplash.com/@picoftasty) | [BqJAbXk2Fuw](https://unsplash.com/photos/BqJAbXk2Fuw) | Unsplash License | 4560 × 3648 | Accueil (étape 4, le chocolat), page Savoir-faire (l'enrobage). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| riad-lumiere | `brand/source/stock/riad-lumiere__GtlrYb2cPp4.jpg` | [Benjamin Chambon](https://unsplash.com/@benjamin_photo_lab) | [GtlrYb2cPp4](https://unsplash.com/photos/courtyard-with-pool-ornate-door-and-chairs-GtlrYb2cPp4) | Unsplash License | 4000 × 6000 | Page Notre Maison (ouverture), page Professionnels, accueil (section La Maison, vignette). Numéro de chambre de la porte retouché. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| cafe-oriental | `brand/source/stock/cafe-oriental__57BCZzL2t8E.jpg` | [Kier in Sight Archives](https://unsplash.com/@kierinsightarchives) | [57BCZzL2t8E](https://unsplash.com/photos/brass-teapot-with-smoke-on-black-background-57BCZzL2t8E) | Unsplash License | 4000 × 2500 | Accueil (section La Maison), page Contact, page Professionnels (vignette). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| art-de-recevoir | `brand/source/stock/art-de-recevoir__pbMf0vDIdO8.jpg` | [Martin Zangerl](https://unsplash.com/@zmart) | [pbMf0vDIdO8](https://unsplash.com/photos/gray-teapot-set-in-tray-place-on-brown-table-outdoors-pbMf0vDIdO8) | Unsplash License | 4592 × 3056 | Accueil (Professionnels et événements), Notre Maison (L'objet), Coffrets (Coffret Entreprise), Professionnels, pages Cadeaux d'entreprise et Mariages, Savoir-faire. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| pistache | `brand/source/stock/pistache__Zo0TZax87Cc.jpg` | [Theo Crazzolara](https://unsplash.com/@theocrazzolara) | [Zo0TZax87Cc](https://unsplash.com/photos/a-pile-of-pistachio-nuts-sitting-on-top-of-a-table-Zo0TZax87Cc) | Unsplash License | 6000 × 4000 | Accueil (L'univers des ingrédients), fiche Or de Marrakech, Savoir-faire (la garniture). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| noisette | `brand/source/stock/noisette__SNQfkUNHWlA.jpg` | [360floralflaves](https://unsplash.com/@360floralflaves) | [SNQfkUNHWlA](https://unsplash.com/photos/a-pile-of-nuts-with-white-and-brown-seeds-SNQfkUNHWlA) | Unsplash License | 4160 × 6240 | Accueil (ingrédients), fiche Café Impérial. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| amande | `brand/source/stock/amande__RZ-AHtxLPUE.jpg` | [Daniela Paola Alchapar](https://unsplash.com/@paoalchapar) | [RZ-AHtxLPUE](https://unsplash.com/photos/a-pile-of-almonds-sitting-on-top-of-each-other-RZ-AHtxLPUE) | Unsplash License | 4592 × 3448 | Accueil (ingrédients), fiche Velours Persan. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| cardamome | `brand/source/stock/cardamome__dZIs-KaRdu8.jpg` | [Neil P-A](https://unsplash.com/@weareqed) | [dZIs-KaRdu8](https://unsplash.com/photos/a-pile-of-dried-cardamom-pods-on-a-dark-surface-dZIs-KaRdu8) | Unsplash License | 3872 × 2592 | Accueil (ingrédients), fiche Café Impérial. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| safran | `brand/source/stock/safran__hTE438DvDgg.jpg` | [Vera De](https://unsplash.com/@veruschkade) | [hTE438DvDgg](https://unsplash.com/photos/red-and-brown-fur-on-gray-concrete-floor-hTE438DvDgg) | Unsplash License | 4016 × 6016 | Accueil (ingrédients), fiche Velours Persan. Bord de bol retiré au recadrage. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| rose | `brand/source/stock/rose__FJM3wo0eCGY.jpg` | [Zulfugar Karimov](https://unsplash.com/@zulfugarkarimov) | [FJM3wo0eCGY](https://unsplash.com/photos/dried-rose-petals-in-a-pile-FJM3wo0eCGY) | Unsplash License | 6000 × 4000 | Accueil (ingrédients), fiche Rose de Nuit, Savoir-faire (la finition), page Mariages et événements. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| framboise | `brand/source/stock/framboise__h-pMChQzbOM.jpg` | [Teo Do Rio](https://unsplash.com/@teofromrio) | [h-pMChQzbOM](https://unsplash.com/photos/red-raspberries-in-close-up-photography-h-pMChQzbOM) | Unsplash License | 6720 × 4480 | Accueil (ingrédients), fiches Rouge Désir et Rose de Nuit. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| cafe-grains | `brand/source/stock/cafe-grains__H80RH1Hhvu8.jpg` | [Indra Projects](https://unsplash.com/@indraprojects) | [H80RH1Hhvu8](https://unsplash.com/photos/roasted-coffee-beans-are-displayed-up-close-H80RH1Hhvu8) | Unsplash License | 5184 × 3456 | Accueil (ingrédients), fiche Café Impérial. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| coco | `brand/source/stock/coco__nUApCUJ1M6k.jpg` | [Kateryna Hliznitsova](https://unsplash.com/@kate_gliz) | [nUApCUJ1M6k](https://unsplash.com/photos/a-couple-of-coconuts-that-are-on-a-table-nUApCUJ1M6k) | Unsplash License | 4016 × 6016 | Accueil (ingrédients), fiche Île Secrète. Bandeau de mur retiré au recadrage. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| matcha | `brand/source/stock/matcha__DgW9B48pRb4.jpg` | [Phuong Nguyen](https://unsplash.com/@np254) | [DgW9B48pRb4](https://unsplash.com/photos/green-powder-DgW9B48pRb4) | Unsplash License | 4214 × 2750 | Accueil (ingrédients), fiche Minuit à Kyoto. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| medjool-macro | `brand/source/stock/medjool-macro__kO5ENCZTxoM.jpg` | [engin akyurt](https://unsplash.com/@enginakyurt) | [kO5ENCZTxoM](https://unsplash.com/photos/pile-of-dark-brown-dates-kO5ENCZTxoM) | Unsplash License | 11648 × 8736 | Accueil (la métamorphose, « La datte »), éditions éphémères (Ambre Fumé), fiches produit sans photo d'ingrédient. | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| palmeraie-maroc | `brand/source/stock/palmeraie-maroc__ttOFPXjGFEA.jpg` | [Falco Negenman](https://unsplash.com/@f9lco) | [ttOFPXjGFEA](https://unsplash.com/photos/palm-trees-in-a-desert-landscape-with-buildings-ttOFPXjGFEA) | Unsplash License | 5977 × 3985 | Accueil (l'univers Maison Tamrān, vignette). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |
| riad-soleil | `brand/source/stock/riad-soleil__ClAUVD_88NY.jpg` | [Riccardo Monteleone](https://unsplash.com/@rx_lion) | [ClAUVD_88NY](https://unsplash.com/photos/courtyard-with-arches-and-a-central-fountain-ClAUVD_88NY) | Unsplash License | 6000 × 4000 | Accueil (l'univers Maison Tamrān, grande image). | 2026-10-26 — page consultée : licence Unsplash gratuite, pas Unsplash+ |

### Sources de détourage (éléments transparents, `npm run scene-assets`)

Ces photos ne sont pas publiées telles quelles : le fond est retiré et chaque pièce devient un élément transparent (`public/images/scene/`). Elles sont déclarées avec `"use": "cutout"` dans `brand/source/stock/stock.json`. Pages consultées le 2026-10-26 : licence Unsplash gratuite, pas Unsplash+.

| Clé | Photographe | Page source | Dimensions | Éléments produits | Usage |
|---|---|---|---|---|---|
| detourage-pistache | [Tamanna Rumee](https://unsplash.com/@tamanna_rumee) | [hHMF-zPm0jo](https://unsplash.com/photos/pistachios-scattered-on-a-white-background-hHMF-zPm0jo) | 5472 × 3648 | `ing-pistache-1` à `-5` | hero, explosion des saveurs |
| detourage-noisette | [Mockup Graphics](https://unsplash.com/@mockupgraphics) | [nuaxGRQ9elM](https://unsplash.com/photos/brown-almond-nuts-on-white-surface-nuaxGRQ9elM) | 4815 × 3611 | `ing-noisette-1` à `-5`, `ing-noisette-tas` | hero, explosion des saveurs |
| detourage-amande | [Mockup Graphics](https://unsplash.com/@mockupgraphics) | [hw8vOPAIZgk](https://unsplash.com/photos/brown-almond-nuts-on-white-background-hw8vOPAIZgk) | 4285 × 3213 | `ing-amande-1`, `-2`, `ing-amande-tas` | hero, explosion des saveurs |
| detourage-chocolat | [Amy Vann](https://unsplash.com/@girl_behindthelens) | [aZkQgBfnFL0](https://unsplash.com/photos/four-pieces-of-chocolate-sitting-on-top-of-each-other-aZkQgBfnFL0) | 4000 × 6000 | `ing-chocolat-1`, `-2` | hero, explosion des saveurs |
| detourage-framboise | [Mockup Graphics](https://unsplash.com/@mockupgraphics) | [TvPoJ6GWNmc](https://unsplash.com/photos/red-round-fruits-on-white-surface-TvPoJ6GWNmc) | 4741 × 4741 | `ing-framboise-1`, `-2`, `ing-framboise-tas` | explosion des saveurs |
| detourage-cafe | [Mockup Graphics](https://unsplash.com/@mockupgraphics) | [m7ijvnNGaV0](https://unsplash.com/photos/brown-coffee-beans-on-white-surface-m7ijvnNGaV0) | 4499 × 4499 | `ing-cafe-1` à `-5`, `ing-cafe-tas` | explosion des saveurs |
| palme-premier-plan | [kz mozaffari](https://unsplash.com/@fariiou) | [gH2lS064NT4](https://unsplash.com/photos/green-palm-tree-under-blue-sky-during-daytime-gH2lS064NT4) | 4288 × 2848 | `oasis-palme` (ciel retiré) | accueil, l'oasis (plan de premier plan) |

La palmeraie (`palmeraie`) fournit aussi un plan sans ciel (`oasis-paysage`) pour l'effet de profondeur de l'oasis. Le coffret détouré (`coffret-ouvert`) vient de la photographie de référence du pack Maison Tamrān, pas d'une banque d'images.

**Cherchées sans résultat satisfaisant** (photo nette sur fond uni, licence gratuite) : cardamome, safran, pétales de rose. Elles n'apparaissent donc pas dans l'explosion des saveurs.

**Clé non pourvue** : `pecan` (noix de pécan). Aucune photo gratuite convenable n'a été trouvée. Les seules photos nettes étaient sous Unsplash+, les photos gratuites montraient des dattes fourrées (exclu) ou des noix dans leur brou abîmé.

## Points d'attention

- **palmeraie** : deux petits déchets (un objet blanc sous un buisson à gauche, une bouteille plastique) sont visibles dans le sable au premier plan. Le recadrage publié (3840 px de large) les exclut. La photo a été prise à Taghit (Algérie) : ne pas la légender comme une palmeraie de la marque.
- **palmeraie-maroc** : lieu indiqué « Maroc » seulement ; le village comporte des maisons modernes et une antenne. Ne pas la présenter comme une plantation de la marque.
- **riad-soleil** : cour du palais de la Bahia (Marrakech), un monument public et non un riad. Ne pas la présenter comme un lieu de la marque.
- **palme-premier-plan** : photographiée en Iran (province de Bushehr) ; utilisée seulement comme silhouette de premier plan, sans légende de lieu.
- **riad-lumiere** : patio d'un riad présenté comme hôtel sur Unsplash, lieu non précisé. Ne pas le présenter comme un lieu de la marque. Un petit numéro de chambre en laiton sur la porte est effacé par `npm run stock` (retouche documentée dans le script).
- **dattier-regimes** : dattes mûres (ambrées à brunes), variété non identifiée. Ne pas la légender comme de la Medjool ni comme une palmeraie de la marque.
- **art-de-recevoir** : la photo a été prise dans un riad de Fès. Ne pas la présenter comme un lieu de la marque.
- **matcha** : le fond rose pâle s'écarte de la palette. Prévoir un recadrage serré ou un étalonnage.
- **safran** : le titre automatique de la page Unsplash (« red and brown fur on gray concrete floor ») est erroné. La légende et les mots-clés de la photo indiquent bien du safran (« Zafferano in stimmi »).
