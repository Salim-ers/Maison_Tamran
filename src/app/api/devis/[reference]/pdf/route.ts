import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { verifyQuoteToken } from "@/lib/quote-token";

// Récapitulatif PDF public d'une demande de devis, protégé par un jeton HMAC (lien envoyé par email).
export async function GET(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const token = new URL(req.url).searchParams.get("t");
  const notFound = () => new Response("Document introuvable.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  if (!token || !/^DV-\d{4}-[A-Z0-9]{4,8}$/.test(reference)) return notFound();
  const [quote] = await db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.reference, reference)).limit(1);
  if (!quote || !verifyQuoteToken(quote.id, token)) return notFound();
  const pdf = await renderQuotePdf(quote, "demande");
  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="maison-tamran-${quote.reference}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
