/** Options partagées des formulaires publics (devis, contact), utilisables côté client et serveur. */

export const PRO_SEGMENTS = [
  { value: "entreprise", label: "Entreprise (cadeaux clients ou collaborateurs)", short: "Cadeaux d'entreprise" },
  { value: "mariage", label: "Mariage ou réception privée", short: "Mariage" },
  { value: "evenement", label: "Organisation d'événements", short: "Événement" },
  { value: "traiteur", label: "Traiteur", short: "Traiteur" },
  { value: "hotel", label: "Hôtel", short: "Hôtel" },
  { value: "coffee-shop", label: "Coffee shop", short: "Coffee shop" },
  { value: "salon-de-the", label: "Salon de thé", short: "Salon de thé" },
  { value: "boutique-cadeaux", label: "Boutique cadeaux", short: "Boutique cadeaux" },
  { value: "epicerie-fine", label: "Épicerie fine", short: "Épicerie fine" },
  { value: "autre", label: "Autre projet", short: "Autre projet" },
] as const;

export type ProSegment = (typeof PRO_SEGMENTS)[number]["value"];
export const PRO_SEGMENT_VALUES = PRO_SEGMENTS.map((s) => s.value) as [ProSegment, ...ProSegment[]];
export const segmentLabel = (v: string) => PRO_SEGMENTS.find((s) => s.value === v)?.label ?? v;
export const segmentShort = (v: string) => PRO_SEGMENTS.find((s) => s.value === v)?.short ?? v;

export const BUDGETS = [
  "Moins de 500 € HT",
  "De 500 à 1 500 € HT",
  "De 1 500 à 5 000 € HT",
  "Plus de 5 000 € HT",
  "Je ne sais pas encore",
] as const;

export const CONTACT_SUBJECTS = [
  { value: "commande", label: "Une commande" },
  { value: "cadeau", label: "Un cadeau" },
  { value: "professionnel", label: "Un projet professionnel" },
  { value: "presse", label: "Presse" },
  { value: "autre", label: "Autre sujet" },
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number]["value"];
export const CONTACT_SUBJECT_VALUES = CONTACT_SUBJECTS.map((s) => s.value) as [ContactSubject, ...ContactSubject[]];
export const subjectLabel = (v: string) => CONTACT_SUBJECTS.find((s) => s.value === v)?.label ?? v;

/** Formats acceptés pour le logo d'un devis. */
export const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
export const LOGO_MAX_MB = 8;
