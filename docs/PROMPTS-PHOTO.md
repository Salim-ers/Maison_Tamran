# Prompts photo TAMBRÉ

Ce document liste 54 prompts, un par emplacement visuel du site. Chaque emplacement est actuellement occupé par un **visuel concept illustré** (`public/images/concepts/<id>.webp`), signalé « Visuel concept » à l'écran.

Pour remplacer un concept par une vraie photographie (shooting ou génération d'image validée) :

1. Produisez l'image au ratio indiqué (la taille donnée est la cible).
2. Téléversez-la dans Admin › Produits (ou Coffrets) sur l'image du même rôle, et décochez « visuel concept » ; ou remplacez le fichier dans `public/images/` en conservant le cadrage.
3. Pour les visuels d'accueil et d'ambiance (hero, lifestyle, pro, coffret-ferme, couches), remplacez le fichier correspondant et mettez à jour `src/data/concepts-manifest.json` si les dimensions changent.

**Rappel** : n'utilisez jamais de photo de concurrent, et faites valider tout visuel généré par IA avant publication (fidélité à la recette réelle).

**Négatif commun** : 3D render, CGI, plastic look, cartoon, illustration, oversaturated, harsh flash, clutter, palm trees, crowns, arabesque ornaments, gold glitter, watermark, text, extra objects, deformed dates, melted chocolate puddles.

## Accueil

### `hero`

- Usage : Ouverture plein écran (le texte occupe le tiers gauche : garder cette zone sombre et calme)
- Format : 16:9, 3840×2160

```text
A gourmet Medjool date stuffed with pistachio and orange-blossom cream and kadaif, sliced lengthwise to reveal its green heart, the two halves resting on a deep chocolate-brown surface, a closed rigid chocolate-brown gift box with a subtle embossed monogram and bronze foil wordmark softly out of focus in the background right, warm rim light, left third of the frame left in deep shadow for text. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Éclipse Noire

### `produit-eclipse-noire`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in dark chocolate, the uncoated tip showing the natural wrinkled date skin, topped with a scattering of black sesame seeds and fine yuzu zest, placed diagonally on dark slate stone surface, a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-eclipse-noire`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same dark chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin dark chocolate shell, the amber translucent date flesh and a charcoal-black toasted black sesame praline with a glossy golden yuzu gel core, on dark slate stone surface, crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-eclipse-noire`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole dark chocolate-coated stuffed Medjool date and one halved piece revealing a charcoal-black toasted black sesame praline with a glossy golden yuzu gel core, surrounded with restraint by a small ceramic bowl of black sesame seeds, halved fresh yuzu, a broken piece of dark chocolate, on dark slate stone surface, generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Velours Persan

### `produit-velours-persan`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in milk chocolate, the uncoated tip showing the natural wrinkled date skin, topped with a few saffron threads and slivered white almonds, placed diagonally on warm ivory linen paper background (#F7F3EC), a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-velours-persan`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same milk chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin milk chocolate shell, the amber translucent date flesh and an ivory white-almond cream infused with saffron threads around a soft apricot centre, on warm ivory linen paper background (#F7F3EC), crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-velours-persan`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole milk chocolate-coated stuffed Medjool date and one halved piece revealing an ivory white-almond cream infused with saffron threads around a soft apricot centre, surrounded with restraint by saffron threads in a tiny dish, white almonds, dried apricots, on warm ivory linen paper background (#F7F3EC), generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Minuit à Kyoto

### `produit-minuit-a-kyoto`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in white chocolate, the uncoated tip showing the natural wrinkled date skin, topped with a light dusting of matcha and fine yuzu zest, placed diagonally on pale honed limestone surface, a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-minuit-a-kyoto`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same white chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin white chocolate shell, the amber translucent date flesh and a vivid matcha ganache with a bright yuzu heart, on pale honed limestone surface, crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-minuit-a-kyoto`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole white chocolate-coated stuffed Medjool date and one halved piece revealing a vivid matcha ganache with a bright yuzu heart, surrounded with restraint by a dark ceramic bowl of matcha powder with a bamboo whisk, halved yuzu, on pale honed limestone surface, generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Or de Marrakech

### `produit-or-de-marrakech`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in milk chocolate, the uncoated tip showing the natural wrinkled date skin, topped with golden kadaif threads and chopped pistachio, placed diagonally on white Carrara marble with soft grey veining, a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-or-de-marrakech`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same milk chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin milk chocolate shell, the amber translucent date flesh and a green pistachio and orange-blossom cream studded with crisp golden kadaif threads, on white Carrara marble with soft grey veining, crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-or-de-marrakech`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole milk chocolate-coated stuffed Medjool date and one halved piece revealing a green pistachio and orange-blossom cream studded with crisp golden kadaif threads, surrounded with restraint by orange blossoms, a bowl of shelled pistachios, a nest of golden kadaif, on white Carrara marble with soft grey veining, generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Café Impérial

### `produit-cafe-imperial`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in dark chocolate, the uncoated tip showing the natural wrinkled date skin, topped with a whole coffee bean and crushed green cardamom, placed diagonally on deep chocolate-brown matte surface (#251C1A), a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-cafe-imperial`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same dark chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin dark chocolate shell, the amber translucent date flesh and a hazelnut praline infused with espresso and green cardamom, on deep chocolate-brown matte surface (#251C1A), crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-cafe-imperial`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole dark chocolate-coated stuffed Medjool date and one halved piece revealing a hazelnut praline infused with espresso and green cardamom, surrounded with restraint by roasted coffee beans, green cardamom pods, whole hazelnuts, on deep chocolate-brown matte surface (#251C1A), generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Rouge Désir

### `produit-rouge-desir`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in dark chocolate, the uncoated tip showing the natural wrinkled date skin, topped with a fine raspberry drizzle, freeze-dried raspberry pieces and dried hibiscus petals, placed diagonally on warm ivory linen paper background (#F7F3EC), a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-rouge-desir`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same dark chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin dark chocolate shell, the amber translucent date flesh and a glossy tart raspberry and hibiscus confit, on warm ivory linen paper background (#F7F3EC), crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-rouge-desir`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole dark chocolate-coated stuffed Medjool date and one halved piece revealing a glossy tart raspberry and hibiscus confit, surrounded with restraint by fresh raspberries, dried hibiscus flowers, dark chocolate shards, on warm ivory linen paper background (#F7F3EC), generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Ébène Salé

### `produit-ebene-sale`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in dark chocolate, the uncoated tip showing the natural wrinkled date skin, topped with toasted buckwheat groats and flaky sea salt, placed diagonally on dark slate stone surface, a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-ebene-sale`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same dark chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin dark chocolate shell, the amber translucent date flesh and a toasted buckwheat praline bound with white-miso caramel, on dark slate stone surface, crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-ebene-sale`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole dark chocolate-coated stuffed Medjool date and one halved piece revealing a toasted buckwheat praline bound with white-miso caramel, surrounded with restraint by a bowl of toasted buckwheat, a small pot of caramel, white miso paste, on dark slate stone surface, generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Île Secrète

### `produit-ile-secrete`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in blond caramelised chocolate, the uncoated tip showing the natural wrinkled date skin, topped with toasted coconut flakes, placed diagonally on natural oatmeal linen tablecloth, a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-ile-secrete`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same blond caramelised chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin blond caramelised chocolate shell, the amber translucent date flesh and a pale green pandan cream with toasted coconut, on natural oatmeal linen tablecloth, crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-ile-secrete`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole blond caramelised chocolate-coated stuffed Medjool date and one halved piece revealing a pale green pandan cream with toasted coconut, surrounded with restraint by fresh pandan leaves, toasted coconut flakes in a coconut shell bowl, on natural oatmeal linen tablecloth, generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Ambre Fumé

### `produit-ambre-fume`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in milk chocolate, the uncoated tip showing the natural wrinkled date skin, topped with half a pecan and smoked salt flakes, placed diagonally on deep chocolate-brown matte surface (#251C1A), a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-ambre-fume`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same milk chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin milk chocolate shell, the amber translucent date flesh and a maple caramel with roasted pecan pieces and smoked salt, on deep chocolate-brown matte surface (#251C1A), crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-ambre-fume`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole milk chocolate-coated stuffed Medjool date and one halved piece revealing a maple caramel with roasted pecan pieces and smoked salt, surrounded with restraint by pecans, a small glass jug of amber maple syrup, smoked salt, on deep chocolate-brown matte surface (#251C1A), generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Produit : Rose de Nuit

### `produit-rose-de-nuit`

- Usage : Visuel principal (cartes, fiche produit)
- Format : 4:5, 2400×3000

```text
A single Medjool date three-quarters enrobed in white chocolate, the uncoated tip showing the natural wrinkled date skin, topped with crushed dried rose petals and a raspberry drizzle, placed diagonally on white Carrara marble with soft grey veining, a second identical piece softly blurred in the background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coupe-rose-de-nuit`

- Usage : Vue en coupe (survol des cartes, galerie) — même cadrage que le visuel principal
- Format : 4:5, 2400×3000

```text
The same white chocolate-coated Medjool date cut cleanly in half lengthwise, the two halves showing a thin white chocolate shell, the amber translucent date flesh and a pale pink lychee and rose ganache around a raspberry heart, on white Carrara marble with soft grey veining, crumbs of the topping around. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `scene-rose-de-nuit`

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 3:2, 3600×2400

```text
Overhead flat lay: one whole white chocolate-coated stuffed Medjool date and one halved piece revealing a pale pink lychee and rose ganache around a raspberry heart, surrounded with restraint by fresh lychees, rose petals, fresh raspberries, on white Carrara marble with soft grey veining, generous negative space. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Textures

### `macro-1`

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1:1, 3000×3000

```text
Extreme macro of the boundary between glossy dark chocolate coating and the wrinkled skin of a Medjool date, black sesame seeds catching the light. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `macro-2`

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1:1, 3000×3000

```text
Extreme macro of matcha powder dusted over smooth white chocolate, fine yuzu zest curls. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `macro-3`

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1:1, 3000×3000

```text
Extreme macro cross-section: pistachio cream with golden kadaif threads inside a date, thin milk chocolate shell. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `macro-4`

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1:1, 3000×3000

```text
Extreme macro of a thin glossy raspberry drizzle over dark chocolate with dried hibiscus fragments. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `macro-5`

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1:1, 3000×3000

```text
Extreme macro cross-section of hazelnut praline with espresso specks inside a dark-chocolate-coated date. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `macro-6`

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1:1, 3000×3000

```text
Extreme macro of saffron threads and slivered almonds resting on satin milk chocolate. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Coffrets

### `coffret-1`

- Usage : Mises en scène des coffrets
- Format : 3:2, 3600×2400

```text
Rigid chocolate-brown gift box of 12 stuffed dates, open, viewed from above, each date in its individual cavity, tissue paper, matching lid beside it with embossed monogram and bronze foil wordmark, a small cream tasting card, ivory background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coffret-ferme`

- Usage : Mises en scène des coffrets
- Format : 3:2, 3600×2400

```text
The same 12-piece chocolate-brown box, closed, same framing and position as the open version, thin bronze ribbon, embossed monogram on the lid, bronze foil wordmark, ivory background. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coffret-2`

- Usage : Mises en scène des coffrets
- Format : 3:2, 3600×2400

```text
Large 24-piece box open from above on a dark chocolate surface, dates of ten different finishes in two-tone rows, lid leaning at an angle, low warm light. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coffret-3`

- Usage : Mises en scène des coffrets
- Format : 3:2, 3600×2400

```text
Ivory rigid 6-piece box open on pale limestone, lid beside it with tone-on-tone embossing and bronze foil, a few pistachio crumbs. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `coffret-4`

- Usage : Mises en scène des coffrets
- Format : 3:2, 3600×2400

```text
Limited edition box in desaturated olive green with bronze ribbon and a numbered bronze foil label, open with 12 dates of the seasonal collection, dark slate surface. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Packaging

### `packaging-1`

- Usage : Visuels packaging (coffrets, connexion)
- Format : 4:5, 2400×3000

```text
Top view of a closed chocolate-brown rigid box lid, blind-embossed date-pit monogram and bronze hot-foil wordmark, fine bronze border, on oatmeal linen. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `packaging-2`

- Usage : Visuels packaging (coffrets, connexion)
- Format : 4:5, 2400×3000

```text
Three stacked rigid boxes (chocolate, ivory, olive green), three-quarter view, bronze foil wordmark on each, soft side light. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `packaging-3`

- Usage : Visuels packaging (coffrets, connexion)
- Format : 4:5, 2400×3000

```text
Cream letterpress tasting card with a small bronze monogram next to a satin bronze ribbon and two stuffed dates on white marble. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Art de vivre

### `lifestyle-1`

- Usage : Lifestyle (accueil, Maison)
- Format : 3:2, 3600×2400

```text
Overhead: an espresso in a cream porcelain cup on its saucer beside a small dark plate with three chocolate-coated stuffed dates, coffee beans scattered, limestone table, morning light. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `lifestyle-2`

- Usage : Lifestyle (accueil, Maison)
- Format : 3:2, 3600×2400

```text
A closed gift box tied with a bronze ribbon, a handwritten card, oatmeal linen, soft daylight, nobody in frame. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `lifestyle-3`

- Usage : Lifestyle (accueil, Maison)
- Format : 3:2, 3600×2400

```text
Art of hosting: a large cream ceramic platter with a ring of assorted stuffed dates, two glasses of mint tea, an olive branch, marble table, overhead. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Professionnels

### `pro-1`

- Usage : Offres entreprises et événements
- Format : 3:2, 3600×2400

```text
Corporate gifting: stacks of rigid boxes in chocolate and ivory with bronze foil, a blank card placeholder where a client logo would go, pale limestone, clean studio light. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `pro-2`

- Usage : Offres entreprises et événements
- Format : 3:2, 3600×2400

```text
Wedding reception table from above: cream plates, a mini 2-piece box with bronze ribbon at each setting, linen tablecloth, place cards. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

## Vue éclatée

### `couche-datte`

- Usage : Couche de l'animation « expérience sensorielle » (fond transparent, même cadrage pour les 4 couches)
- Format : 20:11, 4000×2200

```text
Isolated on a transparent or pure white background for cut-out, a single opened and pitted Medjool date, slit along its length, same scale, angle and position as the other layers of the series. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `couche-garniture`

- Usage : Couche de l'animation « expérience sensorielle » (fond transparent, même cadrage pour les 4 couches)
- Format : 20:11, 4000×2200

```text
Isolated on a transparent or pure white background for cut-out, a quenelle of pistachio cream with golden kadaif threads shaped to fit inside a date, same scale, angle and position as the other layers of the series. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `couche-chocolat`

- Usage : Couche de l'animation « expérience sensorielle » (fond transparent, même cadrage pour les 4 couches)
- Format : 20:11, 4000×2200

```text
Isolated on a transparent or pure white background for cut-out, an empty thin milk chocolate shell shaped like a date, same scale, angle and position as the other layers of the series. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```

### `couche-finition`

- Usage : Couche de l'animation « expérience sensorielle » (fond transparent, même cadrage pour les 4 couches)
- Format : 20:11, 4000×2200

```text
Isolated on a transparent or pure white background for cut-out, only the topping: golden kadaif threads and chopped pistachio, floating, same scale, angle and position as the other layers of the series. hyperrealistic editorial food photography, luxury haute chocolaterie aesthetic, real Medjool date with natural wrinkled mahogany skin, soft diffused cinematic studio light from top left, subtle realistic reflections on tempered chocolate, delicate soft shadows, minimalist premium composition, shallow depth of field, 100mm macro lens, f/4, natural colours, no text, no logo except when specified, no hands.
```
