import type { ContentEntry } from "../types";

export const proOuverture = {
  key: "professionnels.ouverture",
  label: "Professionnels : ouverture",
  page: "/professionnels",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "lead", label: "Chapeau", type: "textarea" },
    { name: "cta", label: "Bouton principal", type: "text" },
  ],
  defaults: {
    title: "Une pièce TAMBRÉ, à vos couleurs",
    lead: "Coffrets personnalisés pour vos clients et vos équipes, mignardises pour une réception, une création d'exception à servir avec le café. Décrivez votre projet : nous revenons vers vous avec une proposition chiffrée.",
    cta: "Demander un devis",
  },
} satisfies ContentEntry;

export const proOffre = {
  key: "professionnels.offre",
  label: "Professionnels : l'offre",
  page: "/professionnels",
  fields: [
    { name: "title", label: "Titre de la section", type: "text" },
    { name: "coffretsTitle", label: "Coffrets : titre", type: "text" },
    { name: "coffretsBody", label: "Coffrets : texte", type: "textarea" },
    { name: "cartesTitle", label: "Cartes : titre", type: "text" },
    { name: "cartesBody", label: "Cartes : texte", type: "textarea" },
    { name: "rubansTitle", label: "Rubans : titre", type: "text" },
    { name: "rubansBody", label: "Rubans : texte", type: "textarea" },
    { name: "formatsTitle", label: "Formats : titre", type: "text" },
    { name: "formatsBody", label: "Formats : texte", type: "textarea" },
  ],
  defaults: {
    title: "Ce que nous pouvons personnaliser",
    coffretsTitle: "Le coffret à votre logo",
    coffretsBody: "Votre logo ou votre monogramme sur le couvercle, en complément ou à la place du nôtre. Nous étudions avec vous la technique la plus juste pour votre identité.",
    cartesTitle: "La carte imprimée",
    cartesBody: "Un message de votre part glissé dans chaque coffret : vœux de fin d'année, remerciements, prénom d'un invité, programme d'une soirée.",
    rubansTitle: "Le ruban",
    rubansBody: "Un ruban accordé à vos couleurs pour fermer le coffret, ou notre ruban bronze pour rester dans l'esprit de la maison.",
    formatsTitle: "Les formats",
    formatsBody: "Du mini-coffret de deux pièces posé à chaque couvert jusqu'au coffret Prestige de vingt-quatre, en passant par le plateau à partager. Les formats sur mesure sont étudiés au cas par cas.",
  },
} satisfies ContentEntry;

export const proRevendeurs = {
  key: "professionnels.revendeurs",
  label: "Professionnels : revendeurs et réassort",
  page: "/professionnels#revendeurs",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "body", label: "Texte", type: "textarea" },
  ],
  defaults: {
    title: "Servir ou vendre TAMBRÉ",
    body: "Coffee shops, salons de thé, hôtels, épiceries fines et boutiques cadeaux : un espace professionnel de réassort, avec commande en ligne et conditions dédiées, est en préparation. Il n'est pas encore ouvert. En attendant, décrivez-nous votre établissement : nous étudions chaque demande de partenariat individuellement.",
  },
} satisfies ContentEntry;

export const proCadeaux = {
  key: "professionnels.cadeaux-entreprise",
  label: "Cadeaux d'entreprise",
  page: "/professionnels/cadeaux-entreprise",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "lead", label: "Chapeau", type: "textarea" },
    { name: "usages", label: "Usages (un par ligne)", type: "textarea", help: "Un usage par ligne : « Titre : description »." },
  ],
  defaults: {
    title: "Cadeaux d'entreprise",
    lead: "Un coffret TAMBRÉ dit merci sans forcer le trait. Personnalisé à votre logo, accompagné de votre message, il se remet en main propre ou part directement chez chacun de vos destinataires.",
    usages:
      "Fin d'année : le coffret de vœux, pour vos clients, partenaires et collaborateurs.\nRemerciements : après un contrat signé, une recommandation, un projet mené ensemble.\nSéminaires et conventions : une attention posée à chaque place, ou remise au départ.\nAccueil : le premier jour d'un nouveau collaborateur, la visite d'un client important.",
  },
} satisfies ContentEntry;

export const proMariages = {
  key: "professionnels.mariages-evenements",
  label: "Mariages et événements",
  page: "/professionnels/mariages-evenements",
  fields: [
    { name: "title", label: "Titre", type: "text" },
    { name: "lead", label: "Chapeau", type: "textarea" },
    { name: "usages", label: "Usages (un par ligne)", type: "textarea", help: "Un usage par ligne : « Titre : description »." },
  ],
  defaults: {
    title: "Mariages et événements",
    lead: "Une datte TAMBRÉ à chaque couvert, un plateau pour accompagner le café, un souvenir que l'on emporte. Nous accordons les créations, les couleurs et les formats à votre réception.",
    usages:
      "Cadeau d'invité : un mini-coffret de deux ou trois pièces, posé à chaque place.\nTable des desserts : un plateau de créations assorties, servies avec le café.\nCérémonies et fêtes familiales : une attention pour une naissance, un anniversaire, une célébration.\nÉvénements professionnels : lancements, inaugurations, cocktails et soirées privées.",
  },
} satisfies ContentEntry;

export const PROFESSIONNELS_ENTRIES: ContentEntry[] = [proOuverture, proOffre, proRevendeurs, proCadeaux, proMariages];
