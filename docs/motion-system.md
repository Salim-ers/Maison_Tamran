# MAISON TAMRĀN — Système de mouvement

## Principes

1. **Un geste par séquence**, jamais le même fondu partout : rideau, couvercle qui se soulève, caméra qui s'approche, défilement latéral, tirage qui se pose, datte qui vole vers son alvéole.
2. **Le défilement raconte** : les grandes scènes sont des sections épinglées (`position: sticky`) dont la progression (`useScroll` de Motion) pilote des transformations. Le défilement reste natif : aucune bibliothèque ne le détourne.
3. **`transform` et `opacity` uniquement** pour tout ce qui suit le défilement. Les filtres sont réservés aux entrées ponctuelles (lever de soleil du hero).
4. **Rien n'est caché par une animation** : le contenu est rendu par le serveur, visible sans JavaScript ; les entrées sont en CSS.
5. **`prefers-reduced-motion`** : Motion est configuré en `reducedMotion="user"`, chaque scène épinglée a une version fixe (hero sans épinglage, garnitures en rangée défilable au doigt), l'ouverture ne joue pas, les animations CSS sont coupées.

## Bibliothèques

Motion 14 (déjà présent) : `useScroll`, `useTransform`, `useSpring`, `AnimatePresence`, variants. Étudiés et écartés :

- **GSAP / ScrollTrigger** : Motion couvre déjà l'épinglage et le pilotage par le défilement, avec un nettoyage automatique au démontage des composants React ; ajouter GSAP doublerait le moteur d'animation.
- **Lenis** : le défilement lissé dégrade l'accessibilité (molette, clavier, lecteurs d'écran) sans bénéfice pour ces scènes.
- **Three.js / R3F** : une scène 3D du coffret serait visiblement artificielle à côté des photographies. Le choix retenu est une **2,5D photographique** : deux prises de vue au cadrage identique (coffret fermé, coffret ouvert) et le couvercle découpé en polygone qui se soulève.

## Tokens

`--ease-luxe` `cubic-bezier(.22,.8,.12,1)` (entrées), `--ease-silk` `cubic-bezier(.65,0,.35,1)` (balayages), `--ease-out-soft`. Durées : `--dur-fast` .35 s, `--dur-base` .8 s, `--dur-slow` 1.4 s. `--intro` : décalage de l'entrée du hero quand l'ouverture joue (1,85 s), 0 sinon.

## Séquences

| Séquence | Mouvement |
| --- | --- |
| Ouverture | Fond cacao ; le logo officiel se révèle par un masque qui monte (le tronc du T puis les palmes) ; reflet doré masqué à la forme du logo ; le rideau se lève (2,5 s, « Passer » toujours disponible, une fois par session, seulement si la session commence sur l'accueil). |
| Hero (190 svh) | Lever de soleil sur la table ; titre ligne à ligne, mot clé en or qui s'illumine ; lumière qui dérive (14 s) ; au défilement, le couvercle (polygone mesuré) se soulève, pivote, quitte le cadre ; la photo fermée s'efface sur la photo ouverte (même cadrage) ; la caméra s'approche ×1,7 ; second titre. |
| En-tête | Aucun mouvement d'une page à l'autre : barre de hauteur constante, sans changement de taille, de couleur ni de position (pas de masquage au défilement) ; seul le soulignement doré de la rubrique active glisse (ressort) vers la nouvelle rubrique ; menus déroulants en fondu et léger glissement (0,28 s) ; filet doré de progression de lecture. |
| De la palmeraie à la création | Section non épinglée : les quatre étapes montent l'une après l'autre à l'entrée dans l'écran (décalage 0,09 s) ; zoom lent au survol. |
| Signatures | Volet sur la photo, tirage qui se soulève et se repose, nom qui monte ; clavier, glissement au doigt. |
| Configurateur | La pièce détourée quitte la carte et rejoint son alvéole en arc ; anneau doré à l'atterrissage ; pièce sélectionnée auréolée ; reflet doré et badge « Votre coffret est prêt » à la complétion ; prix qui défile. |
| Cartes produit | Zoom lent ; bascule sur la macro du cœur ; filet doré qui apparaît. |
| Fiche produit | Rideau entre les vues ; loupe qui suit le pointeur sur la macro (×1,7, dans la définition de l'image). |
| Transitions de page | Du catalogue à la fiche : la photo de la création cliquée glisse de sa carte au cadre de la fiche (morphose), le reste de la page part vers la gauche, l'en-tête reste immobile. D'une création à la suivante ou à la précédente : glissement dans le sens de la navigation. |
| Ouvertures des pages éditoriales | Maison, Savoir-faire, Professionnels : photographie plein cadre (verticale sur mobile) qui recule et s'éclaire au chargement, puis glisse en parallaxe. |
| Les coffrets (accueil) | Le coffret du format choisi se redessine ; la pièce détourée vole de sa carte à sa caissette ; compteur et nom du format avec son prix. |

## Transitions de page : choix technique

Les transitions utilisent l'API **View Transitions** du navigateur, déclenchée par `TransitionLink` (`src/components/motion/transition-link.tsx`) : au clic, la photo de la carte reçoit le nom `creation-<slug>` (le même que le cadre de la fiche produit), puis la navigation se fait dans `document.startViewTransition`, qui attend que la nouvelle page soit rendue. Le composant `<ViewTransition>` de React 19.3 a été essayé d'abord : avec Cache Components, Next 16.4 révèle les pages préchargées sans monter de nouvel élément dans le rendu de navigation, et React ne démarre alors aucune transition. Sans prise en charge du navigateur, avec « réduire les animations » ou un clic modifié (nouvel onglet), le lien reste un lien ordinaire.

## Performance

- Les scènes épinglées n'animent que des calques déjà rendus (pas de layout pendant le défilement).
- Les photos 3840 px sont servies par `next/image` à la largeur utile ; la photo du coffret fermé est préchargée (LCP), la photo ouverte est chargée en priorité basse.
- `will-change` limité aux calques réellement transformés (couvercle, rangée des garnitures).


## Resserrement de l'accueil (2026-10-31)

L'accueil faisait près de 32 écrans de défilement (cinq scènes épinglées : oasis, métamorphose, anatomie, garnitures, art d'offrir). Il en fait désormais une dizaine : seul le coffret du hero reste épinglé (190 svh au lieu de 250) ; le savoir-faire tient en un écran, les formats et leurs prix ont rejoint le démonstrateur de composition, la Maison et les professionnels partagent un même écran. Les scènes retirées (`oasis`, `metamorphosis`, `date-anatomy`, `texture-reel`, `gift-showcase`, `maison-story`, `pros-section`) restent dans l'historique git.
