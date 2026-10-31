# MAISON TAMRĀN — Direction de marque

Complète `docs/DIRECTION.md` (design system, typographie, navigation). Ce document fixe ce qui guide la refonte V3 : l'identité, la photographie et ce qui est interdit.

## Positionnement

Une maison de confiserie gastronomique qui traite la datte Medjool comme une matière de haute chocolaterie. Le site doit se lire comme le catalogue d'une grande maison : peu de mots, de grandes images, un seul geste fort par séquence.

**Orient contemporain × haute chocolaterie × photographie éditoriale × luxe discret.**

## Le logo

- Fichier de référence : `brand/source/maison-tamran-logo-original.png` (jamais redessiné, jamais régénéré). Déclinaisons détourées par `npm run logo` dans `public/brand/` : logo complet, lockup (sans signature), dattier-T seul, versions ivoire.
- Le **T de TAMRĀN est un dattier** : c'est le seul symbole de la maison. Pas d'autre palmier, pas de pictogramme.
- Le macron du Ā est obligatoire partout (`MAISON TAMRĀN`).
- Sur les packagings photographiés, le logo est **composé** à partir du fichier ivoire, projeté en perspective dans le filet cuivré du couvercle, teinté cuivre champagne avec un léger gaufrage (`scripts/images/lid.ts`). Le modèle d'image ne dessine jamais le logo : tous les couvercles sont générés vierges.

## Couleurs

| Rôle | Valeur | Usage |
| --- | --- | --- |
| Cacao profond | `#241713` | Fonds sombres, texte principal |
| Espresso | `#38241c` | Surfaces sur fond sombre |
| Marron datte | `#58382b` | Survols, accents chauds |
| Ivoire | `#faf6ed` | Fond de lecture |
| Crème / écru | `#f4e9d7`, `#fffbf4` | Sections intermédiaires, champs |
| Or patiné / champagne | `#c7a06a` | Mot clé du titre, filets, chiffres |
| Bronze cuivré | `#a97444` | Finitions (jamais en aplat ni en texte courant) |
| Pistache désaturé | `#777c51` | Éditions éphémères |

Chaque recette garde sa couleur d'accent (`src/data/recipes.ts`) : liseré des cartes, halo de la fiche produit, filet des macros.

**Rythme** : sombre (hero, savoir-faire, éditions) et lumineux (Signatures, coffrets, la Maison et les professionnels) alternent, sous un en-tête sombre constant. Le hero est volontairement solaire : un coffret posé sur du travertin, dans la lumière dorée et les ombres de palmes.

## Typographie

Bodoni Moda (titres, chiffres, citations, italique doré pour le mot clé) et Manrope (texte, interface). Auto-hébergées, aucune requête externe.

## Photographie

- **Fiches produit** : fond sombre, assiette en laiton martelé, lumière chaude latérale, une datte entière et une datte coupée révélant sa garniture. C'est la direction de la planche validée (`brand/source/pack-photos/APERCU_10_RECETTES.jpg`) et de la photographie de référence Café Impérial.
- **Macros** : la face coupée en plein cadre, lumière rasante, profondeur de champ très courte.
- **Pièces détourées** : la datte vue de dessus, fond transparent, pour le configurateur.
- **Coffrets** : boîte rigide cacao à filet cuivré, intérieur ivoire, caissettes plissées brunes. Vue zénithale pour le hero et le configurateur, trois-quarts pour les formats.
- **Univers** : riad contemporain, travertin, laiton, moucharabieh, lumière de fin de journée. Aucune personne, aucune main.

Fidélité des recettes : chaque prompt décrit l'enrobage, la garniture et les ingrédients posés d'après la recette enregistrée. Aucun ingrédient absent de la composition n'apparaît (Minuit à Kyoto, Ébène Salé et Rose de Nuit : aucun fruit à coque).

Tous les visuels générés portent la mention « Visuel conceptuel · IA » tant que les produits réels n'ont pas été photographiés.

## Écriture

Courte, sensorielle, sans superlatif vide. Exemples retenus : « L'art de sublimer la datte. », « Douze créations, une seule boîte. », « Au cœur de chaque datte, une création. », « Le plaisir d'offrir ». Aucune histoire de fondateur, aucun label, aucun avis client, aucune promesse de délai.

## Interdits

Gradients violets ou bleus, emojis, illustrations de dattes à la place de photographies, palmiers génériques, arabesques en surcharge, faux packagings avec texte inventé, faux témoignages, animations d'apparition identiques partout, images agrandies au-delà de ×1,5 de leur définition.
