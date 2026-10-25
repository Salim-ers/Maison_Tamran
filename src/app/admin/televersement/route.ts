import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { saveUpload, UploadError } from "@/lib/storage";

/**
 * Téléversement d'image pour le back-office.
 * Passe par un Route Handler (et non une Server Action) pour dépasser la limite de 1 Mo des actions.
 * Renvoie l'URL du fichier ; l'ajout à la fiche se fait ensuite par la Server Action habituelle.
 */
export async function POST(req: NextRequest) {
  // Protection CSRF : la requête doit venir du site lui-même (Origin, ou à défaut Sec-Fetch-Site).
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const fetchSite = req.headers.get("sec-fetch-site");
  const sameOrigin = origin ? !!host && new URL(origin).host === host : fetchSite === "same-origin";
  if (!sameOrigin) return NextResponse.json({ error: "Origine de la requête refusée." }, { status: 403 });
  await requireAdmin();
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const folder = String(form?.get("folder") ?? "");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choisissez un fichier image." }, { status: 400 });
  if (folder !== "products" && folder !== "boxes" && folder !== "content") return NextResponse.json({ error: "Dossier de destination invalide." }, { status: 400 });
  try {
    const url = await saveUpload(file, folder);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("[admin] téléversement en échec", e);
    return NextResponse.json({ error: "Le téléversement a échoué. Réessayez." }, { status: 500 });
  }
}
