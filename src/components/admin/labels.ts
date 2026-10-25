/** Libellés français des statuts et énumérations, partagés par les écrans d'administration. */
export const PRODUCT_STATUS: Record<string, string> = {
  draft: "Brouillon",
  prototype: "Prototype",
  available: "Disponible",
  archived: "Archivé",
};
export const PRODUCT_STATUS_HELP: Record<string, string> = {
  draft: "Invisible sur le site. Pour préparer une fiche.",
  prototype: "Visible avec la mention « Recette en développement ». Vendable uniquement en mode démonstration.",
  available: "Visible et vendable, y compris avec des paiements réels. Validez d'abord les informations réglementaires.",
  archived: "Retiré du site. Les commandes passées restent consultables.",
};
export const QUOTE_STATUS: Record<string, string> = {
  new: "Nouvelle",
  in_review: "En cours d'étude",
  quoted: "Proposition envoyée",
  accepted: "Acceptée",
  declined: "Refusée",
  archived: "Archivée",
};
export const ROLE_LABELS: Record<string, string> = { customer: "Client", pro: "Professionnel", admin: "Administrateur" };
export const PROMO_KIND: Record<string, string> = { percent: "Pourcentage", fixed: "Montant fixe", free_shipping: "Livraison offerte" };
export const TESTIMONIAL_STATUS: Record<string, string> = { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };
export const BOX_KINDS: Record<string, string> = {
  decouverte: "Découverte",
  signature: "Signature",
  prestige: "Prestige",
  "edition-limitee": "Édition limitée",
  entreprise: "Entreprise",
};
export const IMAGE_ROLES: Record<string, string> = { main: "Principale", cut: "Coupe", scene: "Mise en scène", macro: "Macro", extra: "Complémentaire" };
export const SURFACES = ["ivoire", "pierre", "ardoise", "chocolat", "lin", "marbre"] as const;
export const SEGMENTS: Record<string, string> = {};

export type Tone = "neutral" | "success" | "warning" | "danger" | "info" | "muted";

export const ORDER_STATUS_TONE: Record<string, Tone> = {
  pending_payment: "warning",
  paid: "success",
  payment_failed: "danger",
  cancelled: "muted",
  preparing: "info",
  shipped: "info",
  delivered: "success",
  refunded: "muted",
};
export const PRODUCT_STATUS_TONE: Record<string, Tone> = { draft: "muted", prototype: "warning", available: "success", archived: "muted" };
export const QUOTE_STATUS_TONE: Record<string, Tone> = { new: "warning", in_review: "info", quoted: "info", accepted: "success", declined: "muted", archived: "muted" };
