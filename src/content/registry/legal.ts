import type { ContentEntry } from "../types";

export const livraisonContenu = {
  key: "legal.livraison",
  label: "Livraison et retours",
  page: "/livraison-retours",
  fields: [
    { name: "intro", label: "Introduction", type: "textarea" },
    { name: "preparation", label: "Préparation et expédition", type: "textarea" },
    { name: "chaleur", label: "Envois par temps chaud", type: "textarea" },
    { name: "dommage", label: "Colis abîmé : procédure", type: "textarea" },
  ],
  defaults: {
    intro: "Nos créations voyagent dans leur coffret, protégé par un emballage d'expédition. Voici les tarifs en vigueur, la manière dont nous expédions et ce qu'il faut faire si un colis arrive abîmé.",
    preparation: "Le délai de préparation et le délai d'acheminement dépendent de la période et du transporteur : ils vous sont communiqués à l'expédition, avec le numéro de suivi. Aucun délai de livraison n'est garanti à ce stade.",
    chaleur: "Le chocolat craint la chaleur. Lors des épisodes de forte chaleur, nous pouvons être amenés à décaler une expédition ; nous vous en informons alors par email.",
    dommage: "Vérifiez l'état du colis à la réception. S'il est endommagé, émettez des réserves précises auprès du transporteur lorsque c'est possible, photographiez l'emballage et son contenu, puis écrivez-nous dans les meilleurs délais en indiquant votre numéro de commande. Nous étudions chaque situation et vous proposons une solution adaptée.",
  },
} satisfies ContentEntry;

export const LEGAL_ENTRIES: ContentEntry[] = [livraisonContenu];
