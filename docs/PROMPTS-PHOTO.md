# Prompts photo MAISON TAMRĀN

Ce document liste 61 prises de vue, une par emplacement d'image du site, dans l'ordre de priorité de génération. Il est produit par `npm run prompts` à partir de `scripts/images/shots.ts` (source unique, également utilisée par le pipeline de génération).

## Pipeline (Cloudflare Workers AI)

1. `npm run images:generate -- <emplacement>` (ou `group:hero`, `recipe:<slug>`, `--missing`) : génère un candidat dans `.images-staging/` (hors dépôt). Le script s'arrête avant de dépasser l'allocation gratuite quotidienne.
2. `npm run images:review` : planche d'aperçu locale pour comparer les candidats.
3. `npm run images:approve -- <emplacement> [fichier]` : optimise l'image (WebP), la publie dans `public/images/<dossier>/` et l'enregistre dans `src/data/photo-manifest.json`. Le site l'affiche aussitôt à la place du visuel concept.
4. `npm run images:approve -- --revoke <emplacement>` : retire une photo. `npm run images:status` : état et quota du jour.

**Nature des images** : ce sont des images conceptuelles générées par IA, signalées « Image conceptuelle · IA » à l'écran et dans `src/data/photo-provenance.json`. Elles ne représentent pas des produits réellement fabriqués : à remplacer par un shooting avant la commercialisation. Ne jamais utiliser la photo d'un concurrent.

## hero

### `hero` — Hero d'accueil

- Usage : Ouverture plein écran de l'accueil (texte sur le tiers gauche : zone sombre et calme)
- Format : 1920×1088 · dossier `public/images/hero/` · priorité 1

```text
A spectacular premium Medjool date enrobed in milk chocolate, cut in half to reveal a generous bright green pistachio and orange-blossom heart with golden kadaif threads, the two halves resting on a deep cocoa-brown surface, a few pistachio crumbs, dramatic contrast of warm light and deep shadows, the subject placed in the right half of the frame, the left third of the frame in deep calm cocoa shadow. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `hero-portrait` — Hero d'accueil (mobile)

- Usage : Hero plein écran sur mobile (texte en bas : zone sombre)
- Format : 1088×1920 · dossier `public/images/hero/` · priorité 1

```text
Vertical composition: a premium Medjool date enrobed in milk chocolate, cut in half revealing a generous bright green pistachio heart with golden kadaif threads, placed in the upper half of the frame on a deep cocoa-brown surface, the lower third in deep calm cocoa shadow, warm dramatic light. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `collection-hero` — Hero de la page Créations

- Usage : Panoramique de plusieurs créations (page /creations)
- Format : 1920×1088 · dossier `public/images/collections/` · priorité 1

```text
Panoramic view of a row of ten different gourmet stuffed Medjool dates enrobed in dark, milk, white and blond chocolate, each with a different delicate topping (pistachio, black sesame, matcha, coffee bean, raspberry, rose petals, coconut, pecan, saffron, buckwheat), two of them cut in half showing colourful fillings, arranged on a long cream travertine slab against a deep cocoa background, warm side light. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## produit

### `produit-eclipse-noire` — Éclipse Noire — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 2

```text
Three-quarter view of a single gourmet Medjool date fully enrobed in glossy dark chocolate, a delicate line of toasted black sesame seeds and a few fine threads of bright yellow yuzu zest on top, placed on a deep cocoa-black slate surface against a near-black background, low-key cinematic side light from the right drawing a thin highlight along the chocolate, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `produit-velours-persan` — Velours Persan — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 2

```text
Three-quarter view of a single gourmet Medjool date enrobed in satin milk chocolate, decorated with a few deep red saffron threads and slivered white almonds, placed on a warm ivory silk cloth with soft folds, soft golden morning light from the left, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `produit-minuit-a-kyoto` — Minuit à Kyoto — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 2

```text
Three-quarter view of a single gourmet Medjool date enrobed in ivory white chocolate, lightly dusted with vivid green matcha powder, a curl of yuzu zest, placed on a pale grey honed stone surface with a dark charcoal background, cool soft diffused daylight, quiet Japanese minimalism, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `produit-or-de-marrakech` — Or de Marrakech — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 2

```text
Three-quarter view of a single gourmet Medjool date enrobed in milk chocolate, topped with crisp golden kadaif threads and bright green crushed pistachio, placed on a cream travertine stone surface with natural pores, warm natural light coming from the left, golden highlights, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `produit-cafe-imperial` — Café Impérial — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 2

```text
Three-quarter view of a single gourmet Medjool date enrobed in dark chocolate, a single roasted coffee bean and crushed green cardamom on top, placed on a rich espresso-brown background and dark walnut wood surface, warm low light, glowing highlights on the chocolate, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `produit-rouge-desir` — Rouge Désir — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 2

```text
Three-quarter view of a single gourmet Medjool date enrobed in dark chocolate, a fine glossy raspberry drizzle, freeze-dried raspberry pieces and dried hibiscus petals, placed on a warm ivory plaster background and ivory stone surface, bright soft light with a vibrant yet natural colour palette, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## coupe

### `coupe-eclipse-noire` — Éclipse Noire — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 3

```text
Macro close-up of a gourmet Medjool date fully enrobed in glossy dark chocolate, a delicate line of toasted black sesame seeds and a few fine threads of bright yellow yuzu zest on top, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp dark chocolate shell, a layer of glossy amber-brown date flesh, and a creamy charcoal-black toasted black sesame praline heart, lightly marbled with a glossy golden yuzu gel. A whole piece beside it. On a deep cocoa-black slate surface against a near-black background, low-key cinematic side light from the right drawing a thin highlight along the chocolate, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coupe-velours-persan` — Velours Persan — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 3

```text
Macro close-up of a gourmet Medjool date enrobed in satin milk chocolate, decorated with a few deep red saffron threads and slivered white almonds, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp milk chocolate shell, a layer of glossy amber-brown date flesh, and a smooth ivory white-almond cream infused with saffron, golden-tinted, around a soft glossy apricot centre. A whole piece beside it. On a warm ivory silk cloth with soft folds, soft golden morning light from the left, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coupe-minuit-a-kyoto` — Minuit à Kyoto — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 3

```text
Macro close-up of a gourmet Medjool date enrobed in ivory white chocolate, lightly dusted with vivid green matcha powder, a curl of yuzu zest, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp ivory white chocolate shell, a layer of glossy amber-brown date flesh, and a vivid jade-green matcha ganache with a bright translucent yellow yuzu heart. A whole piece beside it. On a pale grey honed stone surface with a dark charcoal background, cool soft diffused daylight, quiet Japanese minimalism, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coupe-or-de-marrakech` — Or de Marrakech — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 3

```text
Macro close-up of a gourmet Medjool date enrobed in milk chocolate, topped with crisp golden kadaif threads and bright green crushed pistachio, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp milk chocolate shell, a layer of glossy amber-brown date flesh, and a generous bright green pistachio and orange-blossom cream studded with fine crisp golden kadaif threads. A whole piece beside it. On a cream travertine stone surface with natural pores, warm natural light coming from the left, golden highlights, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coupe-cafe-imperial` — Café Impérial — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 3

```text
Macro close-up of a gourmet Medjool date enrobed in dark chocolate, a single roasted coffee bean and crushed green cardamom on top, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp dark chocolate shell, a layer of glossy amber-brown date flesh, and an intense smooth hazelnut praline infused with espresso, flecked with ground coffee and green cardamom. A whole piece beside it. On a rich espresso-brown background and dark walnut wood surface, warm low light, glowing highlights on the chocolate, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coupe-rouge-desir` — Rouge Désir — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 3

```text
Macro close-up of a gourmet Medjool date enrobed in dark chocolate, a fine glossy raspberry drizzle, freeze-dried raspberry pieces and dried hibiscus petals, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp dark chocolate shell, a layer of glossy amber-brown date flesh, and a glossy ruby-red tart raspberry and hibiscus confit. A whole piece beside it. On a warm ivory plaster background and ivory stone surface, bright soft light with a vibrant yet natural colour palette, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## coffret

### `coffret-1` — Coffret Signature ouvert (12)

- Usage : Coffrets (page Coffrets, accueil)
- Format : 1536×1024 · dossier `public/images/boxes/` · priorité 4

```text
Top view of an open rigid deep chocolate-brown gift box holding twelve assorted gourmet chocolate-enrobed stuffed Medjool dates, each in its own cavity with different toppings (pistachio, black sesame, matcha, coffee bean, raspberry, saffron), the lid placed beside it, ivory tissue paper, cream travertine surface. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coffret-ferme` — Coffret fermé

- Usage : Coffrets (page Coffrets, accueil)
- Format : 1536×1024 · dossier `public/images/boxes/` · priorité 4

```text
A closed rigid deep chocolate-brown gift box tied with a thin satin bronze ribbon, three-quarter view on cream travertine, soft warm side light. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coffret-2` — Coffret Prestige ouvert (24)

- Usage : Coffrets (page Coffrets, accueil)
- Format : 1536×1024 · dossier `public/images/boxes/` · priorité 4

```text
A large open rigid deep chocolate-brown gift box with two rows of twenty-four assorted gourmet chocolate-enrobed stuffed dates with varied toppings, the lid leaning at an angle, on a dark cocoa surface, low warm light. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coffret-3` — Coffret Découverte ouvert (6)

- Usage : Coffrets (page Coffrets, accueil)
- Format : 1536×1024 · dossier `public/images/boxes/` · priorité 4

```text
An open small ivory rigid gift box holding six assorted gourmet chocolate-enrobed stuffed Medjool dates, the lid beside it, a few pistachio crumbs, pale limestone surface, bright soft daylight. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `coffret-4` — Coffret Édition limitée

- Usage : Coffrets (page Coffrets, accueil)
- Format : 1536×1024 · dossier `public/images/boxes/` · priorité 4

```text
An open rigid gift box in a deep desaturated olive green with a bronze ribbon, holding twelve seasonal chocolate-enrobed stuffed dates with coconut, pecan, buckwheat and rose toppings, on dark slate. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `packaging-1` — Couvercle de coffret

- Usage : Packaging (coffrets, connexion)
- Format : 1024×1280 · dossier `public/images/boxes/` · priorité 4

```text
Top view of a closed rigid deep chocolate-brown gift box lid on oatmeal linen, soft side light revealing the fine paper texture. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `packaging-2` — Trois coffrets empilés

- Usage : Packaging (coffrets, connexion)
- Format : 1024×1280 · dossier `public/images/boxes/` · priorité 4

```text
Three stacked rigid gift boxes in deep chocolate brown, ivory and olive green, three-quarter view, soft side light, cream background. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `packaging-3` — Carte de dégustation

- Usage : Packaging (coffrets, connexion)
- Format : 1024×1280 · dossier `public/images/boxes/` · priorité 4

```text
A blank cream letterpress tasting card next to a satin bronze ribbon and two chocolate-enrobed stuffed dates on white marble. The card is completely blank. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `pro-1` — Coffrets entreprise

- Usage : Cadeaux d'entreprise
- Format : 1536×1024 · dossier `public/images/boxes/` · priorité 4

```text
Corporate gifting: neat stacks of rigid gift boxes in deep chocolate brown and ivory with bronze ribbons, one open box showing twelve chocolate-enrobed stuffed dates, pale limestone surface, clean bright studio light. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## scene

### `scene-eclipse-noire` — Éclipse Noire — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 5

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date fully enrobed in glossy dark chocolate, a delicate line of toasted black sesame seeds and a few fine threads of bright yellow yuzu zest on top and one halved piece revealing a creamy charcoal-black toasted black sesame praline heart, lightly marbled with a glossy golden yuzu gel, surrounded with restraint by a small matte black ceramic bowl of toasted black sesame seeds, half a fresh yuzu, a few shards of dark chocolate, on a deep cocoa-black slate surface against a near-black background, low-key cinematic side light from the right drawing a thin highlight along the chocolate, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-velours-persan` — Velours Persan — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 5

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in satin milk chocolate, decorated with a few deep red saffron threads and slivered white almonds and one halved piece revealing a smooth ivory white-almond cream infused with saffron, golden-tinted, around a soft glossy apricot centre, surrounded with restraint by a tiny brass dish of saffron threads, whole blanched almonds, a few plump dried apricots, on a warm ivory silk cloth with soft folds, soft golden morning light from the left, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-minuit-a-kyoto` — Minuit à Kyoto — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 5

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in ivory white chocolate, lightly dusted with vivid green matcha powder, a curl of yuzu zest and one halved piece revealing a vivid jade-green matcha ganache with a bright translucent yellow yuzu heart, surrounded with restraint by a dark ceramic bowl of matcha powder with a bamboo whisk, half a fresh yuzu, on a pale grey honed stone surface with a dark charcoal background, cool soft diffused daylight, quiet Japanese minimalism, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-or-de-marrakech` — Or de Marrakech — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 5

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in milk chocolate, topped with crisp golden kadaif threads and bright green crushed pistachio and one halved piece revealing a generous bright green pistachio and orange-blossom cream studded with fine crisp golden kadaif threads, surrounded with restraint by a small bowl of shelled green pistachios, a nest of golden kadaif, a sprig of white orange blossoms, on a cream travertine stone surface with natural pores, warm natural light coming from the left, golden highlights, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-cafe-imperial` — Café Impérial — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 5

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in dark chocolate, a single roasted coffee bean and crushed green cardamom on top and one halved piece revealing an intense smooth hazelnut praline infused with espresso, flecked with ground coffee and green cardamom, surrounded with restraint by a few roasted coffee beans, whole toasted hazelnuts, green cardamom pods, on a rich espresso-brown background and dark walnut wood surface, warm low light, glowing highlights on the chocolate, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-rouge-desir` — Rouge Désir — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 5

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in dark chocolate, a fine glossy raspberry drizzle, freeze-dried raspberry pieces and dried hibiscus petals and one halved piece revealing a glossy ruby-red tart raspberry and hibiscus confit, surrounded with restraint by fresh raspberries, dried deep-red hibiscus flowers, dark chocolate shards, on a warm ivory plaster background and ivory stone surface, bright soft light with a vibrant yet natural colour palette, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## produit

### `produit-ebene-sale` — Ébène Salé — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 5

```text
Three-quarter view of a single gourmet Medjool date enrobed in dark chocolate, sprinkled with toasted buckwheat groats and a few flakes of sea salt, placed on a dark grey slate surface, moody side light from the left, deep contrast, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## coupe

### `coupe-ebene-sale` — Ébène Salé — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 5

```text
Macro close-up of a gourmet Medjool date enrobed in dark chocolate, sprinkled with toasted buckwheat groats and a few flakes of sea salt, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp dark chocolate shell, a layer of glossy amber-brown date flesh, and a crunchy toasted buckwheat praline bound with a glossy amber white-miso caramel. A whole piece beside it. On a dark grey slate surface, moody side light from the left, deep contrast, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## produit

### `produit-ile-secrete` — Île Secrète — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 5

```text
Three-quarter view of a single gourmet Medjool date enrobed in golden blond caramelised chocolate, topped with toasted coconut flakes, placed on a natural oatmeal linen tablecloth, luminous warm tropical daylight with soft palm-leaf shadows, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## coupe

### `coupe-ile-secrete` — Île Secrète — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 5

```text
Macro close-up of a gourmet Medjool date enrobed in golden blond caramelised chocolate, topped with toasted coconut flakes, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp golden blond caramelised chocolate shell, a layer of glossy amber-brown date flesh, and a pale green pandan cream folded with golden toasted coconut. A whole piece beside it. On a natural oatmeal linen tablecloth, luminous warm tropical daylight with soft palm-leaf shadows, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## produit

### `produit-ambre-fume` — Ambre Fumé — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 5

```text
Three-quarter view of a single gourmet Medjool date enrobed in milk chocolate, half a glossy pecan and a few smoked salt flakes on top, placed on a deep chocolate-brown matte surface, warm amber light with a faint wisp of smoke in the background, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## coupe

### `coupe-ambre-fume` — Ambre Fumé — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 5

```text
Macro close-up of a gourmet Medjool date enrobed in milk chocolate, half a glossy pecan and a few smoked salt flakes on top, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp milk chocolate shell, a layer of glossy amber-brown date flesh, and an amber maple caramel with roasted pecan pieces. A whole piece beside it. On a deep chocolate-brown matte surface, warm amber light with a faint wisp of smoke in the background, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## produit

### `produit-rose-de-nuit` — Rose de Nuit — visuel principal

- Usage : Visuel principal (cartes, fiche produit)
- Format : 1024×1280 · dossier `public/images/products/` · priorité 5

```text
Three-quarter view of a single gourmet Medjool date enrobed in ivory white chocolate with a faint blush-pink marbling, crushed dried rose petals and a raspberry drizzle, placed on a white Carrara marble surface with soft grey veining, soft romantic diffused light, delicate pink tones, a second identical piece softly out of focus behind it. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## coupe

### `coupe-rose-de-nuit` — Rose de Nuit — vue en coupe

- Usage : Vue en coupe (survol des cartes, galerie de la fiche)
- Format : 1024×1280 · dossier `public/images/products/cutaway/` · priorité 5

```text
Macro close-up of a gourmet Medjool date enrobed in ivory white chocolate with a faint blush-pink marbling, crushed dried rose petals and a raspberry drizzle, cut cleanly in half lengthwise, the two halves facing the camera revealing the precise layers: a thin crisp ivory white chocolate shell, a layer of glossy amber-brown date flesh, and a pale pink lychee and rose ganache around a bright raspberry heart. A whole piece beside it. On a white Carrara marble surface with soft grey veining, soft romantic diffused light, delicate pink tones, a few crumbs of the topping. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## scene

### `scene-ebene-sale` — Ébène Salé — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 6

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in dark chocolate, sprinkled with toasted buckwheat groats and a few flakes of sea salt and one halved piece revealing a crunchy toasted buckwheat praline bound with a glossy amber white-miso caramel, surrounded with restraint by a small bowl of toasted buckwheat groats, a little pot of amber caramel, flaky sea salt, on a dark grey slate surface, moody side light from the left, deep contrast, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-ile-secrete` — Île Secrète — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 6

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in golden blond caramelised chocolate, topped with toasted coconut flakes and one halved piece revealing a pale green pandan cream folded with golden toasted coconut, surrounded with restraint by fresh pandan leaves, toasted coconut flakes in a half coconut shell bowl, on a natural oatmeal linen tablecloth, luminous warm tropical daylight with soft palm-leaf shadows, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-ambre-fume` — Ambre Fumé — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 6

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in milk chocolate, half a glossy pecan and a few smoked salt flakes on top and one halved piece revealing an amber maple caramel with roasted pecan pieces, surrounded with restraint by whole pecans, a small glass jug of amber maple syrup, smoked salt flakes, on a deep chocolate-brown matte surface, warm amber light with a faint wisp of smoke in the background, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `scene-rose-de-nuit` — Rose de Nuit — mise en scène

- Usage : Mise en scène avec les ingrédients (galerie, éditions éphémères)
- Format : 1536×1024 · dossier `public/images/products/scenes/` · priorité 6

```text
Elegant still life seen from a high angle: one whole gourmet Medjool date enrobed in ivory white chocolate with a faint blush-pink marbling, crushed dried rose petals and a raspberry drizzle and one halved piece revealing a pale pink lychee and rose ganache around a bright raspberry heart, surrounded with restraint by fresh peeled lychees, pale pink rose petals, fresh raspberries, on a white Carrara marble surface with soft grey veining, soft romantic diffused light, delicate pink tones, generous negative space. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## coffret

### `pro-2` — Mariage — mignardises

- Usage : Mariages et événements
- Format : 1536×1024 · dossier `public/images/lifestyle/` · priorité 6

```text
Elegant wedding reception table seen from above: cream porcelain plates, at each setting a tiny ivory box holding two chocolate-enrobed stuffed dates with a bronze ribbon, white linen tablecloth, white flowers, soft daylight. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

## texture

### `macro-1` — Texture 1

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1024×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Extreme macro of the boundary between glossy dark chocolate and the natural wrinkled skin of a Medjool date, black sesame seeds catching the light. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `macro-2` — Texture 2

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1024×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Extreme macro of vivid green matcha powder dusted over smooth ivory white chocolate with fine yuzu zest curls. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `macro-3` — Texture 3

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1024×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Extreme macro cross-section of bright green pistachio cream with golden kadaif threads inside a date under a thin milk chocolate shell. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `macro-4` — Texture 4

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1024×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Extreme macro of a thin glossy raspberry drizzle over dark chocolate with dried hibiscus fragments. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `macro-5` — Texture 5

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1024×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Extreme macro cross-section of hazelnut praline with espresso specks inside a dark-chocolate-enrobed date. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `macro-6` — Texture 6

- Usage : Gros plan de texture (accueil, savoir-faire)
- Format : 1024×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Extreme macro of red saffron threads and slivered almonds resting on satin milk chocolate. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

## univers

### `datte-naturelle` — La datte naturelle

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1024×1280 · dossier `public/images/lifestyle/` · priorité 6

```text
A single fresh natural Medjool date, plump with glossy wrinkled mahogany skin, resting on a piece of dry palm frond on cream travertine, warm side light, macro still life. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

### `origines-1` — Oasis au coucher du soleil

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1920×1088 · dossier `public/images/lifestyle/` · priorité 6

```text
A peaceful date palm grove in a desert oasis at golden hour, tall date palms with heavy hanging clusters of ripening dates, warm haze, cinematic wide landscape, no buildings, no people. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

### `origines-2` — Régimes de dattes

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1536×1024 · dossier `public/images/lifestyle/` · priorité 6

```text
Close-up of heavy clusters of ripe amber-brown Medjool dates hanging under green date palm fronds, warm backlight through the leaves, cinematic. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

### `lifestyle-1` — Café et dattes

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1536×1024 · dossier `public/images/lifestyle/` · priorité 6

```text
Overhead: an espresso in a cream porcelain cup on its saucer beside a small dark plate with three chocolate-enrobed stuffed dates, coffee beans scattered, limestone table, morning light. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

### `lifestyle-cafe-2` — Café à la cardamome

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1536×1024 · dossier `public/images/lifestyle/` · priorité 6

```text
A brass dallah pot pouring golden cardamom coffee into small handleless cups, a plate of chocolate-enrobed stuffed dates beside them, dark wood table, warm low light. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

### `lifestyle-2` — L'art d'offrir

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1536×1024 · dossier `public/images/lifestyle/` · priorité 6

```text
A closed plain chocolate-brown gift box tied with a bronze ribbon and a blank handwritten-style card with no visible writing, oatmeal linen, soft daylight. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

### `lifestyle-3` — Art de recevoir

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1536×1024 · dossier `public/images/lifestyle/` · priorité 6

```text
Art of hosting: a large cream ceramic platter with a ring of assorted chocolate-enrobed stuffed dates, two glasses of mint tea, an olive branch, marble table, overhead view. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

### `recevoir-2` — Table du soir

- Usage : Univers de marque (accueil, Maison, Professionnels)
- Format : 1536×1024 · dossier `public/images/lifestyle/` · priorité 6

```text
An elegant evening table: an open chocolate-brown box of assorted stuffed dates, candlelight, crystal glasses, dark linen tablecloth, warm intimate light. The rigid gift boxes are plain and unbranded, with no lettering and no logo, matte finish and fine bronze edges. Ultra-realistic editorial photography for a luxury gourmet brand, natural light, true-to-life colours, refined composition, shallow depth of field. No text, no logo, no brand names, no people's faces.
```

## couche

### `couche-datte` — Vue éclatée — datte

- Usage : Animation « Au cœur de la création » (même cadrage pour les 4 couches)
- Format : 1536×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Centered product shot of a single opened and pitted natural Medjool date, slit along its length, isolated on a seamless warm cream background, same scale and angle as a product series, soft even studio light. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `couche-garniture` — Vue éclatée — garniture

- Usage : Animation « Au cœur de la création » (même cadrage pour les 4 couches)
- Format : 1536×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Centered product shot of a quenelle of bright green pistachio cream with golden kadaif threads shaped to fit inside a date, isolated on a seamless warm cream background, same scale and angle as a product series, soft even studio light. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `couche-chocolat` — Vue éclatée — chocolat

- Usage : Animation « Au cœur de la création » (même cadrage pour les 4 couches)
- Format : 1536×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Centered product shot of a Medjool date fully enrobed in glossy milk chocolate, whole, isolated on a seamless warm cream background, same scale and angle as a product series, soft even studio light. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```

### `couche-finition` — Vue éclatée — finition

- Usage : Animation « Au cœur de la création » (même cadrage pour les 4 couches)
- Format : 1536×1024 · dossier `public/images/ingredients/` · priorité 6

```text
Centered product shot of a Medjool date enrobed in milk chocolate topped with golden kadaif threads and crushed pistachio, isolated on a seamless warm cream background, same scale and angle as a product series, soft even studio light. Ultra-realistic luxury food photography for the advertising campaign of a Parisian haute chocolaterie. Shot on a medium format camera with a 100mm macro lens, shallow depth of field, crisp focus on the subject. Real Medjool date with natural fine wrinkles and a soft satin sheen, realistic tempered chocolate, true-to-life appetizing colours, delicate natural shadows, refined minimalist composition. No text, no logo, no packaging, no hands, no people.
```
