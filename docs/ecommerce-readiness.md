# MAISON TAMRĀN — État de la boutique

État au 2026-10-31. « Opérationnel » signifie testé dans un vrai navigateur sur le build de production local (`npm run build && npm start`), en mode démonstration.

## Opérationnel

| Fonction | Vérification |
| --- | --- |
| Catalogue, collections, recherche, filtres, tri, fiches produit | `npm run test:smoke` (toutes les pages publiques, 404 sur les adresses inconnues) |
| Configurateur 6 / 12 / 24 pièces : poser, remplacer, retirer, revenir, compléter, détail d'une création, brouillon conservé sur l'appareil, lien de composition, ajout au panier | `node tests/visual/configurator.mjs` (ordinateur et mobile) |
| Prix, suppléments, stock, codes promo, livraison recalculés côté serveur | `npm test` (17 tests du moteur de prix) |
| Panier persistant, paiement **simulé**, confirmation, historique de commandes, suivi signé | README › Tests (`npm run test:e2e`, nécessite Puppeteer) |
| Webhook Stripe : signature vérifiée, événements idempotents, seul le webhook (ou une vérification directe de la session) marque une commande payée | `scripts/test-webhook.mjs` |
| Devis professionnel : validation Zod côté serveur, champ piège anti-robots, accusé de réception, notification à `ADMIN_NOTIFY_EMAIL`, export PDF | Back-office › Devis |
| Back-office protégé (garde réseau + `requireAdmin()` sur chaque page et action) : produits, coffrets, stock, commandes, clients, devis, promotions, livraison, contenus, témoignages, emails, newsletter, réglages | `npm run test:smoke` (redirection 307 sans session) |
| Comptes clients, adresses, mots de passe (bcrypt), sessions hachées, limitation des tentatives | README › Sécurité |

## Dépend d'une clé ou d'une validation externe

| Élément | À fournir | Effet tant que c'est absent |
| --- | --- | --- |
| Paiement réel | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, webhook configuré | Mode démonstration : mention au paiement et en pied de page (le bandeau permanent en haut de page a été retiré à la demande de la maison), commandes marquées « démo », **aucun encaissement** |
| Emails | `RESEND_API_KEY`, `EMAIL_FROM` (domaine vérifié), `ADMIN_NOTIFY_EMAIL` | Emails journalisés dans Admin › Emails, non envoyés |
| Images téléversées en production | `BLOB_READ_WRITE_TOKEN` (Vercel Blob) | Téléversement désactivé en production |
| URL canonique | `NEXT_PUBLIC_SITE_URL` | Liens absolus et données structurées sur l'URL par défaut |
| Mentions légales, CGV, confidentialité | Relecture juridique, informations de la société (Admin › Réglages) | Champs signalés « à confirmer » |
| Recettes | Composition définitive, allergènes et traces, poids, DDM, conservation, origine, valeurs nutritionnelles, puis statut **available** | Recettes au statut **prototype** : visibles, non achetables en mode réel |
| Livraison | Tarifs contractualisés avec le transporteur | Tarifs marqués « provisoires » |
| Photographies | Prises de vue réelles des créations et des coffrets | Visuels conceptuels IA, signalés à l'écran (`docs/asset-manifest.md`) |
| Promesses commerciales | Personnalisation des coffrets, délais, quantités professionnelles | Le site ne promet rien : tout passe par une demande de devis |

## Avant d'activer les encaissements

Suivre la liste de contrôle du README (« Avant l'ouverture réelle »). Ne passer `STRIPE_SECRET_KEY` en clé `sk_live_` qu'après validation juridique, des fiches recettes et des tarifs de livraison. Supprimer ou désactiver les codes de démonstration (`BIENVENUE10`, `LIVRAISON`). Redéployer après tout changement de clé : les pages du catalogue sont prérendues avec le mode en vigueur.
