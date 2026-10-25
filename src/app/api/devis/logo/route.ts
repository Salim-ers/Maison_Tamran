import { NextResponse } from "next/server";
import { saveUpload, storageConfigured, UploadError } from "@/lib/storage";
import { clientIp, isRateLimited, recordAttempt } from "@/lib/auth";
import { logoSignature } from "@/lib/quote-token";
import { LOGO_MAX_MB, LOGO_TYPES } from "@/lib/segments";

/**
 * Téléversement du logo d'une demande de devis (hors Server Action, dont le corps est limité à 1 Mo).
 * Renvoie l'URL du fichier et une signature HMAC : seule une URL signée est acceptée par l'action de devis.
 */
export async function POST(req: Request) {
  if (!storageConfigured()) {
    return NextResponse.json({ error: "Le téléversement de fichiers n'est pas disponible pour le moment. Envoyez votre demande sans logo : vous pourrez nous le transmettre par email." }, { status: 503 });
  }
  const ip = await clientIp();
  const key = `logo-upload:${ip}`;
  if (await isRateLimited([key])) {
    return NextResponse.json({ error: "Trop de fichiers envoyés en peu de temps. Réessayez dans quelques minutes." }, { status: 429 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
  }
  await recordAttempt([key], false);
  if (!LOGO_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Format non accepté. Formats acceptés : PNG, JPEG, WebP ou PDF." }, { status: 400 });
  }
  try {
    const url = await saveUpload(file, "logos", { allowPdf: true, maxMb: LOGO_MAX_MB });
    return NextResponse.json({ url, sig: logoSignature(url), name: file.name.slice(0, 120) });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("Téléversement du logo", e);
    return NextResponse.json({ error: "Le fichier n'a pas pu être enregistré. Envoyez votre demande sans logo : vous pourrez nous le transmettre par email." }, { status: 500 });
  }
}
