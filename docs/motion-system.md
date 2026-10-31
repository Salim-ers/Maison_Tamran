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
| Hero (250 svh) | Lever de soleil sur la table ; titre ligne à ligne, mot clé en or qui s'illumine ; lumière qui dérive (14 s) ; au défilement, le couvercle (polygone mesuré) se soulève, pivote, quitte le cadre ; la photo fermée s'efface sur la photo ouverte (même cadrage) ; la caméra s'approche ×1,7 ; second titre. |
| Métamorphose | Cinq étapes épinglées ; masques en forme de datte, vague de chocolat, niches des dix créations. |
| Anatomie | Rapprochement borné ×1,2, repères dessinés un à un. |
| Signatures | Volet sur la photo, tirage qui se soulève et se repose, nom qui monte ; clavier, glissement au doigt. |
| Garnitures | Section épinglée de hauteur calculée ; la rangée de macros glisse latéralement (ressort), chaque macro se resserre au centre, filet à la couleur de la recette. |
| Art d'offrir | Portes qui s'ouvrent, lumière sur les dattes, les trois formats révélés par rideau. |
| Configurateur | La pièce détourée quitte la carte et rejoint son alvéole en arc ; anneau doré à l'atterrissage ; pièce sélectionnée auréolée ; reflet doré et badge « Votre coffret est prêt » à la complétion ; prix qui défile. |
| Cartes produit | Zoom lent ; bascule sur la macro du cœur ; filet doré qui apparaît. |
| Fiche produit | Rideau entre les vues ; loupe qui suit le pointeur sur la macro (×1,7, dans la définition de l'image). |

## Performance

- Les scènes épinglées n'animent que des calques déjà rendus (pas de layout pendant le défilement).
- Les photos 3840 px sont servies par `next/image` à la largeur utile ; la photo du coffret fermé est préchargée (LCP), la photo ouverte est chargée en priorité basse.
- `will-change` limité aux calques réellement transformés (couvercle, rangée des garnitures).
