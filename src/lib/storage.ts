import "server-only";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const PDF_TYPES: Record<string, string> = { "application/pdf": "pdf" };

export class UploadError extends Error {}

export function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.NODE_ENV !== "production";
}

/**
 * Enregistre un fichier téléversé.
 * - Vercel Blob si BLOB_READ_WRITE_TOKEN est défini (production recommandée) ;
 * - sinon, en développement uniquement, dans public/uploads/ (non persistant sur Vercel).
 * Les SVG sont refusés (risque de script embarqué).
 */
export async function saveUpload(file: File, folder: "products" | "boxes" | "logos" | "content", opts: { allowPdf?: boolean; maxMb?: number } = {}) {
  const types = { ...IMAGE_TYPES, ...(opts.allowPdf ? PDF_TYPES : {}) };
  const ext = types[file.type];
  if (!ext) throw new UploadError(`Format non accepté (${file.type || "inconnu"}). Formats acceptés : ${Object.values(types).join(", ")}.`);
  const max = (opts.maxMb ?? 8) * 1024 * 1024;
  if (file.size > max) throw new UploadError(`Fichier trop lourd : ${opts.maxMb ?? 8} Mo au maximum.`);
  const name = `${folder}/${randomUUID()}.${ext}`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", contentType: file.type });
    return blob.url;
  }
  if (process.env.NODE_ENV === "production") {
    throw new UploadError("Le stockage de fichiers n'est pas configuré (BLOB_READ_WRITE_TOKEN manquant).");
  }
  const dest = path.join(process.cwd(), "public", "uploads", name);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
