# TAMBRÉ — Direction artistique, design system et architecture

## 1. Direction artistique

**Idée directrice : la datte traitée comme une matière de haute chocolaterie.** Le site se lit comme le catalogue d'une maison de pâtisserie : de grands aplats chocolat et ivoire, une typographie didone très contrastée, des images posées avec beaucoup d'air, et un seul geste spectaculaire répété avec retenue, **l'ouverture de la datte** (coupe au survol des cartes, vue éclatée de la section sensorielle, coffret qui s'ouvre au scroll).

- **Contraste de matières** : le chocolat (fonds `#251C1A`) pour l'émotion et le produit, l'ivoire (`#F7F3EC`) pour la lecture et le choix. Les sections alternent pour rythmer le récit.
- **Le bronze est une finition** (`#A87455`, `#C4936C` sur fond sombre) : filets, numéros, accents de coffret. Jamais d'aplat, jamais de texte courant.
- **Le pistache désaturé** (`#77745B`) signale ce qui est hors norme : bandeau de démonstration, éditions éphémères (fond `#2F2E24`).
- **Chaque recette a sa couleur d'accent** (palette dans `src/data/recipes.ts`) : filet de dégustation, pastille dans le panier, liseré des éditions éphémères.
- **Interdits** : palmiers, couronnes, arabesques génériques, dorures, faux témoignages, faux labels.

## 2. Identité

- **Monogramme** : un noyau de datte légèrement asymétrique dans lequel le T est gravé en négatif. La traverse est un filet fin (un empattement Bodoni), le fût reprend la rainure naturelle du noyau. Version épaissie pour le favicon.
- **Logotype** : TAMBRÉ en Bodoni Moda (taille optique 28, graisse 500, pour garder les déliés à petite taille), interlettrage ouvert, approches corrigées à l'œil (TA resserré), accent de l'É redessiné en petit noyau incliné.
- **Signature** : « Maison de dattes gastronomiques », Bodoni italique.
- **Fichiers** : `brand/` (SVG vectorisés, polices non requises) et `public/brand/`. Déclinaisons : principal vertical (ivoire, chocolat, noir, blanc), horizontal compact, monogramme (chocolat, ivoire, bronze, noir, blanc), favicon, couvercle de coffret (marquage à chaud bronze). Régénérer : `npm run brand`.
- **Packaging** : boîte rigide chocolat (ou ivoire, ou vert olive pour l'édition limitée), monogramme gaufré ton sur ton, logotype en marquage à chaud bronze, filet bronze intérieur, calages individuels, papier de soie, carte de dégustation.

## 3. Typographie

| Rôle | Police | Réglages |
| --- | --- | --- |
| Titres, chiffres de séquence, citations | Bodoni Moda (variable, axe `opsz` automatique) | 400, interlettrage négatif sur les grands corps |
| Texte, interface | Manrope (variable) | 400 / 500 / 600, 17 px, interligne 1,65 |

Échelle : `t-display-xl` (accroche), `t-display-l` (titres de section), `t-display-m`, `t-title`, `t-lead`, corps, `t-small`, `t-micro`. Les polices sont auto-hébergées (`src/fonts/`), aucune requête vers Google Fonts (RGPD).

## 4. Motion

Un seul moment orchestré au chargement (le hero : apparition par masque, balayage lumineux, révélation ligne à ligne de l'accroche), puis du mouvement **déclenché par l'utilisateur ou par le récit** :

- défilement horizontal piloté par le scroll pour les Créations Signature (section épinglée) ;
- vue éclatée 3D de la datte (quatre couches qui s'élèvent) ;
- couvercle du coffret qui glisse au scroll (ou au clic) ;
- coupe dévoilée par un masque circulaire qui part du pointeur ;
- panier : tiroir latéral, compteur animé, apparition/disparition des lignes ;
- configurateur : chaque datte se pose dans son alvéole.

Tout respecte `prefers-reduced-motion` (états finaux affichés sans animation). Aucune animation ne retarde l'accès au contenu.

## 5. Architecture de navigation

- **En-tête** : Créations, Coffrets, Composer — logo centré — La Maison, Professionnels, recherche, compte, panier. Mobile : menu plein écran.
- **Accueil** : hero, l'art de la dégustation, Créations Signature, expérience sensorielle, les coffrets, composez votre sélection, la Maison, éditions éphémères, professionnels, lettre, pied de page.
- **Boutique** : `/creations`, `/collections/signature`, `/collections/ephemere`, `/creations/[slug]`, `/coffrets`, `/composer-mon-coffret`, `/recherche`, `/panier`, `/paiement`, `/paiement/demo/[n]`, `/paiement/confirmation`, `/paiement/echec`.
- **Client** : `/compte` (+ connexion, inscription, mot de passe), `/compte/adresses`, `/compte/commandes/[n]`, `/suivi-commande`.
- **Maison et services** : `/maison`, `/savoir-faire`, `/faq`, `/contact`, `/livraison-retours`, pages légales.
- **Professionnels** : `/professionnels`, `/professionnels/cadeaux-entreprise`, `/professionnels/mariages-evenements`, `/professionnels/devis`.
- **Back-office** : `/admin/*`.

## 6. Modèle de données (PostgreSQL, Drizzle)

`users`, `sessions`, `password_resets`, `login_attempts`, `addresses` · `collections`, `products` (champs réglementaires nullables + drapeau de validation), `variants` (étuis), `boxes` (coffrets, composition imposée possible) · `carts`, `cart_items` (composition des coffrets en JSON) · `orders` (instantané des prix et de l'adresse, `is_demo`), `order_items`, `order_events`, `webhook_events` (idempotence Stripe) · `promo_codes`, `shipping_rates` (drapeau provisoire), `price_tiers` · `quote_requests` · `content_blocks`, `settings`, `testimonials` (modérés), `newsletter_subscribers` (double opt-in, texte du consentement conservé), `contact_messages`, `email_log`, `analytics_events` (uniquement avec consentement).

## 7. Plan des visuels

54 emplacements (hero, 10 × produit / coupe / mise en scène, 6 macros, 5 coffrets, 3 packagings, 3 lifestyle, 2 professionnels, 4 couches de la vue éclatée). Chacun existe en **visuel concept illustré** généré par `scripts/concepts/` (SVG éclairé en relief → WebP), signalé « Visuel concept » à l'écran, et possède son **prompt photo** dans `docs/PROMPTS-PHOTO.md` pour le shooting ou la génération d'images définitive.
