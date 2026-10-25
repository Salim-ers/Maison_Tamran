import "server-only";
import { db, schema } from "@/db";
import { emailProvider, siteUrl, storeMode } from "./env";
import { euros } from "./money";

interface SendArgs {
  to: string;
  subject: string;
  template: string;
  html: string;
  replyTo?: string;
}

/**
 * Envoie un email transactionnel via Resend si RESEND_API_KEY est configurée.
 * Sinon, l'email est uniquement journalisé (visible dans Admin › Emails) : rien n'est envoyé.
 */
export async function sendEmail({ to, subject, template, html, replyTo }: SendArgs) {
  const demo = storeMode() === "demo";
  const finalSubject = demo ? `[DÉMO] ${subject}` : subject;
  let status = "logged";
  let providerId: string | null = null;
  let error: string | null = null;
  if (emailProvider() === "resend") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM ?? "TAMBRÉ <onboarding@resend.dev>",
          to: [to],
          subject: finalSubject,
          html,
          reply_to: replyTo,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok) {
        status = "sent";
        providerId = data.id ?? null;
      } else {
        status = "failed";
        error = data.message ?? `HTTP ${res.status}`;
      }
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : String(e);
    }
  }
  await db.insert(schema.emailLog).values({ to, subject: finalSubject, template, html, status, providerId, error });
  return { status };
}

// ---------------------------------------------------------------------------
// Gabarits (HTML simple, compatible clients mail)
// ---------------------------------------------------------------------------
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function layout(title: string, body: string) {
  const demo = storeMode() === "demo";
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#F7F3EC;font-family:Helvetica,Arial,sans-serif;color:#251C1A">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFCF7">
<tr><td style="padding:36px 40px 8px;text-align:center;font-family:Georgia,serif;font-size:26px;letter-spacing:.32em">TAMBRÉ</td></tr>
${demo ? `<tr><td style="padding:8px 40px"><p style="margin:0;padding:10px 12px;background:#F1E4D8;font-size:13px;line-height:1.5">Boutique de démonstration : aucun paiement n'a été encaissé et aucune commande ne sera expédiée.</p></td></tr>` : ""}
<tr><td style="padding:24px 40px 8px"><h1 style="margin:0;font-family:Georgia,serif;font-weight:normal;font-size:24px;line-height:1.3">${esc(title)}</h1></td></tr>
<tr><td style="padding:8px 40px 36px;font-size:15px;line-height:1.65">${body}</td></tr>
<tr><td style="padding:20px 40px;border-top:1px solid #E6DED2;font-size:12px;color:#7A6A5E">TAMBRÉ, maison de dattes gastronomiques · <a href="${siteUrl()}" style="color:#A87455">${siteUrl().replace(/^https?:\/\//, "")}</a></td></tr>
</table></td></tr></table></body></html>`;
}

export interface OrderEmailData {
  number: string;
  email: string;
  firstName: string;
  items: { name: string; description: string | null; quantity: number; totalCents: number }[];
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  shippingMethod: string | null;
  trackUrl: string;
}

export function orderConfirmationEmail(o: OrderEmailData) {
  const rows = o.items
    .map((i) => `<tr><td style="padding:8px 0;border-bottom:1px solid #EFE7DC">${i.quantity} × ${esc(i.name)}<br><span style="color:#7A6A5E;font-size:13px">${esc(i.description ?? "")}</span></td><td style="padding:8px 0;border-bottom:1px solid #EFE7DC;text-align:right;white-space:nowrap">${euros(i.totalCents)}</td></tr>`)
    .join("");
  const body = `<p>Bonjour ${esc(o.firstName)},</p><p>Votre paiement est confirmé. Voici le récapitulatif de la commande <strong>${esc(o.number)}</strong>.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
<tr><td style="padding:8px 0">Sous-total</td><td style="text-align:right">${euros(o.subtotalCents)}</td></tr>
${o.discountCents ? `<tr><td style="padding:4px 0">Remise</td><td style="text-align:right">−${euros(o.discountCents)}</td></tr>` : ""}
<tr><td style="padding:4px 0">Livraison${o.shippingMethod ? ` (${esc(o.shippingMethod)})` : ""}</td><td style="text-align:right">${o.shippingCents ? euros(o.shippingCents) : "Offerte"}</td></tr>
<tr><td style="padding:8px 0;font-weight:bold">Total</td><td style="text-align:right;font-weight:bold">${euros(o.totalCents)}</td></tr></table>
<p>Nous vous écrirons dès l'expédition, avec le numéro de suivi.</p>
<p><a href="${o.trackUrl}" style="display:inline-block;padding:12px 20px;background:#251C1A;color:#F7F3EC;text-decoration:none">Suivre ma commande</a></p>`;
  return layout(`Merci pour votre commande`, body);
}

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payée",
  payment_failed: "Paiement refusé",
  cancelled: "Annulée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  refunded: "Remboursée",
};

export function orderStatusEmail(number: string, status: string, trackUrl: string, tracking?: { number?: string | null; url?: string | null }) {
  const body = `<p>Le statut de votre commande <strong>${esc(number)}</strong> a changé : <strong>${esc(STATUS_LABELS[status] ?? status)}</strong>.</p>
${tracking?.number ? `<p>Numéro de suivi : ${esc(tracking.number)}${tracking.url ? ` · <a href="${esc(tracking.url)}" style="color:#A87455">suivre le colis</a>` : ""}</p>` : ""}
<p><a href="${trackUrl}" style="color:#A87455">Voir le détail de la commande</a></p>`;
  return layout(`Commande ${number}`, body);
}

export function simpleEmail(title: string, paragraphs: string[], cta?: { label: string; url: string }) {
  return layout(
    title,
    paragraphs.map((p) => `<p>${esc(p)}</p>`).join("") +
      (cta ? `<p><a href="${cta.url}" style="display:inline-block;padding:12px 20px;background:#251C1A;color:#F7F3EC;text-decoration:none">${esc(cta.label)}</a></p>` : "")
  );
}
