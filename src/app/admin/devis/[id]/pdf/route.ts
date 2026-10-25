import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { renderQuotePdf } from "@/lib/quote-pdf";

/** Export PDF d'une demande de devis ou de sa proposition commerciale (administrateurs uniquement). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return NextResponse.json({ error: "Identifiant invalide." }, { status: 400 });
  const kind = req.nextUrl.searchParams.get("type") === "proposition" ? "proposition" : "demande";
  const [quote] = await db.select().from(schema.quoteRequests).where(eq(schema.quoteRequests.id, id)).limit(1);
  if (!quote) return NextResponse.json({ error: "Demande introuvable." }, { status: 404 });
  const pdf = await renderQuotePdf(quote, kind);
  const filename = `${quote.reference.replace(/[^A-Za-z0-9-]/g, "")}-${kind}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
