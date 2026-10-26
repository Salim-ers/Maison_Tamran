# MAISON TAMRĀN — Dattes gastronomiques

Site e-commerce complet de **MAISON TAMRĀN** : identité de marque, boutique, configurateur de coffrets, paiement Stripe, espace client, espace professionnel (devis B2B) et back-office.

> « L'art de sublimer la datte. »

## État du projet : ce qui est réel, ce qui est provisoire

| Domaine | État |
| --- | --- |
| Catalogue, filtres, recherche, fiches produit | Fonctionnel, données de démonstration (10 recettes **prototypes**) |
| Configurateur de coffrets 6 / 12 / 24 | Fonctionnel, prix et stock vérifiés côté serveur |
| Panier persistant, codes promo, livraison | Fonctionnel ; **tarifs de livraison provisoires** à aligner sur votre transporteur |
| Paiement | **Mode démonstration** tant que `STRIPE_SECRET_KEY` est absente (paiement simulé, commandes marquées « démo », bandeau visible). Avec une clé : Stripe Checkout + webhooks réels |
| Emails transactionnels | Envoyés via Resend si `RESEND_API_KEY` est définie, sinon **journalisés** (Admin › Emails) |
| Compte client, adresses, suivi de commande | Fonctionnel |
| Devis B2B, export PDF | Fonctionnel |
| Back-office | Fonctionnel (produits, coffrets, stock, commandes, clients, devis, promos, livraison, contenu, témoignages, emails, newsletter, réglages) |
| Visuels | **Visuels conceptuels** du pack photo Maison Tamrān pour les dix créations et le coffret Signature (signalés « Visuel conceptuel » à l'écran) ; photographies d'ambiance libres de droits (Unsplash, licences dans `ASSET_LICENSES.md`). Pas encore de photo réelle des coffrets 6 et 24 pièces ni de l'édition limitée : schémas de format légendés à la place |
| Mentions légales, CGV, données réglementaires (poids, DDM, origine, valeurs nutritionnelles) | **À compléter** : champs vides signalés « à confirmer », modifiables dans le back-office |

Rien n'est inventé : aucune histoire de fondateur, aucun label, aucun avis client, aucune promesse de délai.

## Démarrage local

Prérequis : Node.js 20.9+ (22 recommandé), PostgreSQL 14+.

```bash
npm install
cp .env.example .env.local        # renseigner DATABASE_URL et SESSION_SECRET au minimum
npm run db:migrate                 # crée les tables
npm run db:seed                    # catalogue de démonstration + compte administrateur
npm run dev                        # http://localhost:3000
```

Le compte administrateur est créé avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` (un mot de passe est généré et affiché si `ADMIN_PASSWORD` est vide). Connexion sur `/compte/connexion`, puis `/admin`.

### Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Tests unitaires du moteur de prix (Vitest) |
| `npm run db:generate` | Génère une migration après modification de `src/db/schema.ts` |
| `npm run db:migrate` | Applique les migrations |
| `npm run db:seed` | Données initiales (idempotent) |
| `npm run logo` | Déclinaisons du logo officiel (détourage, version ivoire, dattier seul, favicons) depuis `brand/source/maison-tamran-logo-original.png` |
| `npm run pack-photos` | Intègre le pack photo (`brand/source/pack-photos/`) : recadre la zone nette, optimise en WebP, branche les images dans le catalogue (`src/data/photo-manifest.json`) |
| `npm run stock` | Photographies d'ambiance Unsplash (`brand/source/stock/stock.json` → `public/images/ambiance/`), originaux retéléchargés si absents |
| `npm run images:generate` / `images:review` / `images:approve` / `images:status` | Pipeline de visuels IA (Cloudflare Workers AI), voir `docs/PROMPTS-PHOTO.md` |
| `npm run concepts` | Régénère les visuels concept illustrés de repli (`public/images/concepts/`) |
| `npm run prompts` | Régénère le catalogue de prompts photo |

## Déploiement sur Vercel

1. **Base de données** : créez une base PostgreSQL (Neon via le Marketplace Vercel, Supabase…). Récupérez l'URL. Avec un pooler en mode transaction, ajoutez `DATABASE_PREPARE=false`.
2. **Projet Vercel** : importez le dépôt (framework détecté : Next.js). Ajoutez les variables d'environnement de `.env.example` : au minimum `DATABASE_URL`, `SESSION_SECRET` (`openssl rand -base64 48`), `NEXT_PUBLIC_SITE_URL`.
3. **Stockage des images** : créez un store **Vercel Blob** et liez-le au projet (`BLOB_READ_WRITE_TOKEN`). Sans lui, le téléversement d'images est désactivé en production.
4. **Migrations et seed** (depuis votre poste, avec l'URL de production) :
   ```bash
   DATABASE_URL="postgres://…prod…" npm run db:migrate
   DATABASE_URL="postgres://…prod…" ADMIN_EMAIL=vous@exemple.fr ADMIN_PASSWORD='…' npm run db:seed
   ```
   La base doit exister **avant** le build : les pages de catalogue sont prérendues à partir des données.
5. **Déployez.** Le site fonctionne alors en mode démonstration.

### Activer les paiements Stripe

1. Dans le tableau de bord Stripe, copiez la clé secrète (`sk_test_…` pour tester, `sk_live_…` en production) dans `STRIPE_SECRET_KEY`.
2. Créez un point de terminaison webhook vers `https://<votre-domaine>/api/stripe/webhook` avec les événements :
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`.
   Copiez le secret de signature dans `STRIPE_WEBHOOK_SECRET`.
3. Redéployez. Le bandeau de démonstration disparaît ; seules les recettes et coffrets au statut **« available »** sont alors en vente (les prototypes restent visibles mais non achetables).
4. Test local des webhooks : `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

Après tout changement de clé Stripe ou de `STORE_MODE`, **redéployez** : les pages du catalogue sont prérendues au build avec le mode en vigueur.

Fonctionnement : la commande est créée en base (statut « en attente de paiement ») avec des prix recalculés côté serveur, puis Stripe Checkout encaisse. **Seul le webhook (ou une vérification directe de la session auprès de Stripe) marque la commande payée**, décrémente le stock une seule fois et envoie la confirmation. Les webhooks sont vérifiés par signature et idempotents. Une session non payée expire au bout d'une heure et la commande passe en « annulée ».

### Emails

Créez une clé **Resend**, vérifiez votre domaine d'envoi, puis renseignez `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`. Emails envoyés : confirmation de commande, changement de statut (expédition avec suivi), bienvenue, réinitialisation de mot de passe, double opt-in newsletter, accusé de réception de devis et de contact.

## Back-office (`/admin`)

Tableau de bord (chiffre d'affaires hors démonstration, alertes de stock, devis et témoignages à traiter, entonnoir de conversion si la mesure d'audience est consentie), commandes (filtres, détail, changement de statut avec suivi et email au client), stock, recettes (fiche complète, champs réglementaires, étuis, images téléversées), collections, coffrets (dont composition imposée), codes promotionnels, tarifs de livraison, devis B2B (proposition chiffrée, tarifs dégressifs, export PDF), clients et comptes professionnels, messages, témoignages (modération, source obligatoire), lettre d'information (export CSV), journal des emails, textes éditables du site, réglages (emballage cadeau, mentions légales, réseaux sociaux).

## Avant l'ouverture réelle : liste de contrôle

- [ ] Informations légales (Admin › Réglages) et pages Mentions légales, CGV, Confidentialité relues par un professionnel du droit.
- [ ] Pour chaque recette : composition définitive, allergènes et traces, poids net, conservation, DDM, origine, valeurs nutritionnelles, puis case « informations réglementaires validées » et statut **available**.
- [ ] Prix des coffrets, étuis et emballage cadeau confirmés ; stock réel saisi (Admin › Stock).
- [ ] Tarifs de livraison contractualisés (décocher « provisoire »), pays desservis.
- [ ] Photographies réelles des créations et des coffrets 6, 12 et 24 pièces à la place des visuels conceptuels (le pack actuel est fait de vignettes agrandies, pas de photos natives haute définition).
- [ ] Codes promotionnels de démonstration supprimés ou désactivés (`BIENVENUE10`, `LIVRAISON`).
- [ ] Stripe en clé live, webhook actif, Resend configuré, `NEXT_PUBLIC_SITE_URL` sur le domaine final.
- [ ] Liens réseaux sociaux renseignés.

## Tests

| Commande | Ce qui est vérifié |
| --- | --- |
| `npm test` | Moteur de prix : compositions, suppléments, stock agrégé, codes promo, livraison, totaux (17 tests) |
| `npm run test:smoke` | Toutes les pages publiques répondent, URL inconnues en 404, back-office protégé |
| `npm run test:e2e` | Navigateur réel (installez d'abord `npm i -D puppeteer`) : achat complet en mode démonstration (configurateur, étui, code promo, paiement simulé, confirmation, panier vidé), comptes (inscription, mots de passe refusés, adresses, connexion, accès admin refusé), toutes les pages du back-office |
| `STRIPE_WEBHOOK_SECRET=… node scripts/test-webhook.mjs <url> <id-commande>` | Webhook Stripe : signature invalide refusée, paiement confirmé, événement rejoué ignoré |

## Expérience et animations

- **Accueil** : hero du coffret Signature (entrée en CSS, visible sans JavaScript), puis séquences au défilement natif (sans détournement du scroll) : « Tout commence par un fruit », anatomie d'une datte (zoom et repères), collection Signature, art d'offrir, ingrédients, éditions éphémères, la Maison, composer son coffret, professionnels.
- **Bibliothèque** : Motion (déjà présente) pour toutes les animations ; aucune bibliothèque supplémentaire.
- **Accessibilité** : `prefers-reduced-motion` respecté partout (Motion configuré en `reducedMotion="user"`, séquences remplacées par des versions statiques, animations CSS coupées). Aucun contenu ne dépend d'une animation pour être visible.

## Architecture

```
src/
  app/(boutique)/      site public (accueil, catalogue, coffrets, configurateur, panier, paiement, compte, pages éditoriales)
  app/admin/           back-office (protégé : session + rôle admin)
  app/actions/         Server Actions (panier, paiement, compte, newsletter, devis, contact)
  app/api/             webhook Stripe, PDF de devis, mesure d'audience
  components/          interface (home, product, cart, configurator, motion, layout, admin…)
  content/             registre des textes éditables depuis le back-office
  data/recipes.ts      référentiel des recettes (seed et visuels)
  db/                  schéma Drizzle et client PostgreSQL
  lib/                 logique serveur : pricing (pur, testé), cart, orders, stripe, auth, email, storage
scripts/               logo, pack photo, photos d'ambiance, pipeline IA, visuels concept, prompts, seed
brand/                 logotype, monogramme et déclinaisons SVG
docs/                  direction artistique, conventions, prompts photo
```

- **Next.js 16.4** (App Router, Cache Components, prérendu partiel), **React 19**, **TypeScript**, **Tailwind CSS 4**, **Motion**, **Drizzle ORM** + PostgreSQL, **Stripe**, **Zod**, **pdf-lib**.
- Catalogue et contenus mis en cache (`"use cache"`, invalidés à chaque modification dans le back-office) : pages rapides, données toujours à jour.
- Le prix est **toujours recalculé côté serveur** (`src/lib/pricing.ts`, couvert par `tests/pricing.test.ts`).

## Sécurité et conformité

- Sessions aléatoires stockées hachées (SHA-256), cookies `HttpOnly`/`SameSite=Lax`/`Secure`, mots de passe bcrypt, limitation des tentatives de connexion, réponses identiques pour éviter l'énumération des comptes.
- Back-office : garde réseau (`proxy.ts`) + vérification serveur `requireAdmin()` sur chaque page et chaque action.
- Liens de suivi de commande et de devis signés par HMAC, sans donnée personnelle dans l'URL.
- Bandeau de consentement (refus aussi simple que l'acceptation) ; aucune mesure d'audience sans accord ; polices auto-hébergées ; aucun traceur tiers.
- En-têtes de sécurité (HSTS, nosniff, frame-options, referrer-policy, permissions-policy).
- `robots.txt` interdit l'indexation tant que la boutique est en démonstration.

## Documentation

- `docs/DIRECTION.md` : direction artistique, identité, design system, motion, navigation, modèle de données, plan des visuels.
- `docs/CONVENTIONS.md` : règles de développement et de rédaction.
- `docs/PROMPTS-PHOTO.md` (+ `docs/photo-prompts.json`) : un prompt photo par emplacement visuel.
