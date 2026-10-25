import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { handleStripeEvent, stripe } from "@/lib/stripe";

// Point de réception des webhooks Stripe : la signature est obligatoirement vérifiée.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!process.env.STRIPE_SECRET_KEY || !secret) {
    return NextResponse.json({ error: "Stripe n'est pas configuré sur ce déploiement." }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 });
  }
  try {
    const result = await handleStripeEvent(event);
    return NextResponse.json({ received: true, result });
  } catch (e) {
    console.error("Webhook Stripe", event.type, e);
    // 500 : Stripe renverra l'événement plus tard
    return NextResponse.json({ error: "Traitement impossible" }, { status: 500 });
  }
}
