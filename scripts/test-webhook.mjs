// Teste le point de terminaison webhook Stripe avec des événements signés localement
// (aucun appel à l'API Stripe). Le serveur doit tourner avec STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET.
// Usage : STRIPE_WEBHOOK_SECRET=whsec_… node scripts/test-webhook.mjs <url-du-site> <id-commande-en-attente>
import Stripe from "stripe";

const [base = "http://localhost:3000", orderId] = process.argv.slice(2);
const secret = process.env.STRIPE_WEBHOOK_SECRET;
if (!secret || !orderId) {
  console.error("Usage : STRIPE_WEBHOOK_SECRET=whsec_… node scripts/test-webhook.mjs <url> <orderId>");
  process.exit(1);
}
const stripe = new Stripe("sk_test_unused");
const url = `${base}/api/stripe/webhook`;

const event = (type, object) => ({ id: `evt_test_${type}_${orderId}_${Date.now()}`, object: "event", type, data: { object }, api_version: "2026-01-01", created: Math.floor(Date.now() / 1000) });
const session = { id: "cs_test_local", object: "checkout.session", payment_status: "paid", status: "complete", payment_intent: "pi_test_local", client_reference_id: orderId, metadata: { orderId } };

async function post(payload, sig) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", "stripe-signature": sig }, body: payload });
  return [res.status, await res.text()];
}

const ev = event("checkout.session.completed", session);
const payload = JSON.stringify(ev);
const header = stripe.webhooks.generateTestHeaderString({ payload, secret });

console.log("signature invalide  ->", ...(await post(payload, "t=1,v1=deadbeef")));
console.log("événement payé      ->", ...(await post(payload, header)));
console.log("même événement      ->", ...(await post(payload, header)));
