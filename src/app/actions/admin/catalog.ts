"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { and, eq, ne, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ImageRef } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import type { ActionState } from "@/components/admin/types";
import {
  assertConfirmed, done, fail, formList, formObject, run, splitList, UserError, zCheckbox, zEuros, zId, zImageUrl, zInt, zLongText, zOptDate, zOptInt,
  zOptText, zSlug, zText, zodFail,
} from "./helpers";

const hex = z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Couleur attendue au format #RRGGBB.");
const STATUSES = ["draft", "prototype", "available", "archived"] as const;
const CHOCOLATES = ["noir", "lait", "blanc", "blond"] as const;
const SURFACES = ["ivoire", "pierre", "ardoise", "chocolat", "lin", "marbre"] as const;
const ROLES = ["main", "cut", "scene", "macro", "extra"] as const;

// ---------------------------------------------------------------------------
// Produits (recettes)
// ---------------------------------------------------------------------------
const productInput = z
  .object({
    name: zText(120, "Le nom"),
    slug: zSlug,
    number: zInt("Le numéro", 0, 999),
    collectionId: z.string().transform((s) => s || null).pipe(z.uuid({ message: "Collection invalide." }).nullable()),
    pairing: zText(160, "L'accord"),
    tagline: zLongText(240),
    story: zLongText(6000),
    tastingAttaque: zLongText(200),
    tastingCoeur: zLongText(200),
    tastingFinale: zLongText(200),
    chocolate: z.enum(CHOCOLATES, { message: "Choisissez un chocolat." }),
    ingredients: zLongText(3000),
    netWeightG: zOptInt("Le poids net", 1, 5000),
    storage: zOptText(600),
    bestBefore: zOptText(300),
    origin: zOptText(1000),
    regulatoryValidated: zCheckbox,
    status: z.enum(STATUSES, { message: "Statut invalide." }),
    boxSupplementCents: zEuros("Le supplément"),
    stockPieces: zInt("Le stock de pièces", -100000, 1000000),
    limited: zCheckbox,
    availableFrom: zOptDate(false),
    availableUntil: zOptDate(true),
    coat: hex,
    coatLight: hex,
    filling: hex,
    insert: hex,
    accent: hex,
    surface: z.enum(SURFACES, { message: "Fond invalide." }),
    seoTitle: zOptText(90),
    seoDescription: zOptText(200),
    sortOrder: zInt("L'ordre d'affichage", -1000, 100000),
  })
  .superRefine((v, ctx) => {
    if (v.availableFrom && v.availableUntil && v.availableUntil < v.availableFrom) {
      ctx.addIssue({ code: "custom", path: ["availableUntil"], message: "La date de fin doit suivre la date de début." });
    }
    if (v.status === "available" && !v.regulatoryValidated) {
      ctx.addIssue({ code: "custom", path: ["status"], message: "Pour rendre la recette disponible à la vente, cochez d'abord « Informations réglementaires validées »." });
    }
  });

function readPairs(form: FormData, labelKey: string, valueKey: string) {
  const labels = formList(form, labelKey);
  const values = formList(form, valueKey);
  const out: Record<string, string> = {};
  labels.forEach((l, i) => {
    const k = l.trim().slice(0, 80);
    const v = (values[i] ?? "").trim().slice(0, 80);
    if (k && v) out[k] = v;
  });
  return out;
}

function readMulti(form: FormData, name: string) {
  return [...new Set([...formList(form, name), ...splitList(String(form.get(`${name}Other`) ?? ""), /[,;]/)])]
    .map((s) => s.trim().toLowerCase().slice(0, 40))
    .filter(Boolean)
    .slice(0, 20);
}

export async function saveProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const idRaw = String(form.get("id") ?? "");
  const id = idRaw ? zId.safeParse(idRaw) : null;
  if (id && !id.success) return fail("Identifiant de produit invalide.");
  const parsed = productInput.safeParse(formObject(form));
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;
  const nutrition = readPairs(form, "nutritionLabel", "nutritionValue");
  const tasting = v.tastingAttaque || v.tastingCoeur || v.tastingFinale ? { attaque: v.tastingAttaque, coeur: v.tastingCoeur, finale: v.tastingFinale } : null;
  const values = {
    name: v.name,
    slug: v.slug,
    number: v.number,
    collectionId: v.collectionId,
    pairing: v.pairing,
    tagline: v.tagline,
    story: v.story,
    tasting,
    chocolate: v.chocolate,
    flavorFamilies: readMulti(form, "flavorFamilies"),
    allergens: readMulti(form, "allergens"),
    ingredients: v.ingredients,
    netWeightG: v.netWeightG,
    storage: v.storage,
    bestBefore: v.bestBefore,
    origin: v.origin,
    nutrition: Object.keys(nutrition).length ? nutrition : null,
    regulatoryValidated: v.regulatoryValidated,
    status: v.status,
    boxSupplementCents: v.boxSupplementCents,
    stockPieces: v.stockPieces,
    limited: v.limited,
    availableFrom: v.availableFrom,
    availableUntil: v.availableUntil,
    palette: { coat: v.coat, coatLight: v.coatLight, filling: v.filling, insert: v.insert, accent: v.accent, surface: v.surface },
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
    sortOrder: v.sortOrder,
    updatedAt: new Date(),
  };

  let createdId: string | null = null;
  const res = await run(
    async () => {
      const [dup] = await db
        .select({ id: schema.products.id })
        .from(schema.products)
        .where(id?.success ? and(eq(schema.products.slug, v.slug), ne(schema.products.id, id.data)) : eq(schema.products.slug, v.slug))
        .limit(1);
      if (dup) return fail("Ce slug est déjà utilisé par une autre recette.", { slug: "Slug déjà utilisé : choisissez-en un autre." });

      if (id?.success) {
        await db.transaction(async (tx) => {
          const [before] = await tx.select({ slug: schema.products.slug }).from(schema.products).where(eq(schema.products.id, id.data)).for("update").limit(1);
          if (!before) throw new UserError("Ce produit n'existe plus.");
          await tx.update(schema.products).set(values).where(eq(schema.products.id, id.data));
          if (before.slug !== v.slug) {
            // Les compositions de coffrets référencent les recettes par slug : on les renomme.
            const rename = (col: typeof schema.boxes.fixedComposition | typeof schema.cartItems.composition) =>
              sql`(${col} - ${before.slug}::text) || jsonb_build_object(${v.slug}::text, ${col} -> ${before.slug}::text)`;
            await tx.update(schema.boxes).set({ fixedComposition: rename(schema.boxes.fixedComposition) }).where(sql`${schema.boxes.fixedComposition} ? ${before.slug}::text`);
            await tx.update(schema.cartItems).set({ composition: rename(schema.cartItems.composition) }).where(sql`${schema.cartItems.composition} ? ${before.slug}::text`);
            await tx.update(schema.testimonials).set({ productSlug: v.slug }).where(eq(schema.testimonials.productSlug, before.slug));
          }
        });
        return done("Recette enregistrée.");
      }
      const [row] = await db.insert(schema.products).values({ ...values, images: [] }).returning({ id: schema.products.id });
      createdId = row.id;
      return done("Recette créée.");
    },
    { unique: "Ce slug est déjà utilisé par une autre recette." }
  );
  if (res.ok) updateTag("catalog");
  if (createdId) redirect(`/admin/produits/${createdId}?cree=1`);
  return res;
}

export async function deleteProduct(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = zId.safeParse(form.get("id"));
  if (!id.success) return fail("Identifiant invalide.");
  const res = await run(async () => {
    assertConfirmed(form);
    const [p] = await db.select({ slug: schema.products.slug, name: schema.products.name }).from(schema.products).where(eq(schema.products.id, id.data)).limit(1);
    if (!p) return fail("Ce produit n'existe plus.");
    const used = await db.select({ name: schema.boxes.name }).from(schema.boxes).where(sql`${schema.boxes.fixedComposition} ? ${p.slug}::text`);
    if (used.length) return fail(`Impossible de supprimer : la recette fait partie de la composition imposée de « ${used.map((b) => b.name).join(", ")} ». Retirez-la d'abord, ou archivez la recette.`);
    await db.delete(schema.products).where(eq(schema.products.id, id.data));
    return done(`Recette « ${p.name} » supprimée.`);
  });
  if (!res.ok) return res;
  updateTag("catalog");
  redirect("/admin/produits?supprime=1");
}

// ---------------------------------------------------------------------------
// Variantes (étuis)
// ---------------------------------------------------------------------------
const variantInput = z.object({
  productId: zId,
  sku: z
    .string()
    .transform((s) => s.trim().toLowerCase())
    .pipe(z.string().min(2, "Le SKU est obligatoire.").max(60).regex(/^[a-z0-9][a-z0-9-_.]*$/, "SKU : lettres minuscules, chiffres, tirets, points ou soulignés.")),
  name: zText(80, "Le nom de l'étui"),
  pieces: zInt("Le nombre de pièces", 1, 500),
  priceCents: zEuros("Le prix"),
  stock: zInt("Le stock", -100000, 1000000),
  active: zCheckbox,
  sortOrder: zInt("L'ordre", -1000, 10000),
});

export async function saveVariant(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  const parsed = variantInput.safeParse(obj);
  if (!parsed.success) return zodFail(parsed.error);
  const v = parsed.data;
  const vid = obj.id ? zId.safeParse(obj.id) : null;
  if (vid && !vid.success) return fail("Identifiant de variante invalide.");
  const res = await run(
    async () => {
      if (form.get("intent") === "delete") {
        if (!vid?.success) return fail("Variante introuvable.");
        assertConfirmed(form);
        await db.delete(schema.variants).where(and(eq(schema.variants.id, vid.data), eq(schema.variants.productId, v.productId)));
        return done(`Étui ${v.sku} supprimé.`);
      }
      if (vid?.success) {
        const r = await db.update(schema.variants).set(v).where(and(eq(schema.variants.id, vid.data), eq(schema.variants.productId, v.productId))).returning({ id: schema.variants.id });
        if (!r.length) return fail("Cette variante n'existe plus.");
        return done("Étui enregistré.");
      }
      await db.insert(schema.variants).values(v);
      return done(`Étui ${v.sku} ajouté.`);
    },
    { unique: "Ce SKU est déjà utilisé : chaque étui doit avoir un SKU unique." }
  );
  if (res.ok) updateTag("catalog");
  return res;
}

export async function deleteVariant(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = zId.safeParse(form.get("id"));
  if (!id.success) return fail("Identifiant invalide.");
  const res = await run(async () => {
    assertConfirmed(form);
    const r = await db.delete(schema.variants).where(eq(schema.variants.id, id.data)).returning({ sku: schema.variants.sku });
    if (!r.length) return fail("Cette variante n'existe plus.");
    return done(`Étui ${r[0].sku} supprimé.`);
  });
  if (res.ok) updateTag("catalog");
  return res;
}

// ---------------------------------------------------------------------------
// Images (produits et coffrets)
// ---------------------------------------------------------------------------
const imageBase = z.object({
  owner: z.enum(["product", "box"]),
  ownerId: zId,
  intent: z.enum(["add", "update", "up", "down", "delete"]),
  index: z.string().optional(),
});
const imageFields = z.object({
  url: zImageUrl,
  alt: zText(240, "Le texte alternatif"),
  role: z.enum(ROLES, { message: "Rôle invalide." }),
  concept: zCheckbox,
});

async function readImages(owner: "product" | "box", id: string) {
  if (owner === "product") {
    const [r] = await db.select({ images: schema.products.images }).from(schema.products).where(eq(schema.products.id, id)).limit(1);
    return r?.images ?? null;
  }
  const [r] = await db.select({ images: schema.boxes.images }).from(schema.boxes).where(eq(schema.boxes.id, id)).limit(1);
  return r?.images ?? null;
}

async function writeImages(owner: "product" | "box", id: string, images: ImageRef[]) {
  if (owner === "product") await db.update(schema.products).set({ images, updatedAt: new Date() }).where(eq(schema.products.id, id));
  else await db.update(schema.boxes).set({ images }).where(eq(schema.boxes.id, id));
}

export async function imageAction(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  const base = imageBase.safeParse(obj);
  if (!base.success) return zodFail(base.error);
  const { owner, ownerId, intent } = base.data;
  const res = await run(async () => {
    const images = await readImages(owner, ownerId);
    if (!images) return fail("Élément introuvable.");
    const idx = Number(base.data.index ?? -1);
    const inRange = Number.isInteger(idx) && idx >= 0 && idx < images.length;

    if (intent === "add" || intent === "update") {
      const f = imageFields.safeParse(obj);
      if (!f.success) return zodFail(f.error);
      const prev = inRange ? images[idx] : undefined;
      const img: ImageRef = { ...(prev && prev.url === f.data.url ? prev : {}), url: f.data.url, alt: f.data.alt, role: f.data.role, concept: f.data.concept || undefined };
      if (!img.concept) delete img.concept;
      if (intent === "add") {
        if (images.length >= 24) return fail("24 images au maximum par fiche.");
        await writeImages(owner, ownerId, [...images, img]);
        return done("Image ajoutée.");
      }
      if (!inRange) return fail("Cette image n'existe plus. Rechargez la page.");
      const next = [...images];
      next[idx] = img;
      await writeImages(owner, ownerId, next);
      return done("Image enregistrée.");
    }
    if (!inRange) return fail("Cette image n'existe plus. Rechargez la page.");
    const next = [...images];
    if (intent === "delete") {
      assertConfirmed(form);
      next.splice(idx, 1);
      await writeImages(owner, ownerId, next);
      return done("Image retirée de la fiche.");
    }
    const j = intent === "up" ? idx - 1 : idx + 1;
    if (j < 0 || j >= next.length) return done("Ordre inchangé.");
    [next[idx], next[j]] = [next[j], next[idx]];
    await writeImages(owner, ownerId, next);
    return done("Ordre des images modifié.");
  });
  if (res.ok) updateTag("catalog");
  return res;
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------
const collectionInput = z.object({
  name: zText(120, "Le nom"),
  slug: zSlug,
  intro: zLongText(2000),
  ephemeral: zCheckbox,
  sortOrder: zInt("L'ordre", -1000, 10000),
});

export async function saveCollection(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  const cid = obj.id ? zId.safeParse(obj.id) : null;
  if (cid && !cid.success) return fail("Identifiant invalide.");
  if (form.get("intent") === "delete") {
    const res = await run(async () => {
      if (!cid?.success) return fail("Collection introuvable.");
      assertConfirmed(form);
      const [used] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.products).where(eq(schema.products.collectionId, cid.data));
      if (used?.n) return fail(`Impossible de supprimer : ${used.n} recette(s) appartiennent encore à cette collection. Déplacez-les d'abord.`);
      await db.delete(schema.collections).where(eq(schema.collections.id, cid.data));
      return done("Collection supprimée.");
    });
    if (res.ok) updateTag("catalog");
    return res;
  }
  const parsed = collectionInput.safeParse(obj);
  if (!parsed.success) return zodFail(parsed.error);
  const res = await run(
    async () => {
      if (cid?.success) {
        const r = await db.update(schema.collections).set(parsed.data).where(eq(schema.collections.id, cid.data)).returning({ id: schema.collections.id });
        if (!r.length) return fail("Cette collection n'existe plus.");
        return done("Collection enregistrée.");
      }
      await db.insert(schema.collections).values(parsed.data);
      return done("Collection créée.");
    },
    { unique: "Ce slug est déjà utilisé par une autre collection." }
  );
  if (res.ok) updateTag("catalog");
  return res;
}

// ---------------------------------------------------------------------------
// Coffrets
// ---------------------------------------------------------------------------
const KINDS = ["decouverte", "signature", "prestige", "edition-limitee", "entreprise"] as const;
const boxInput = z
  .object({
    name: zText(120, "Le nom"),
    slug: zSlug,
    kind: z.enum(KINDS, { message: "Type de coffret invalide." }),
    pieces: zOptInt("Le nombre de pièces", 1, 500),
    priceCents: z
      .string()
      .optional()
      .transform((s) => (s ?? "").trim()),
    configurable: zCheckbox,
    quoteOnly: zCheckbox,
    description: zLongText(4000),
    stock: zInt("Le stock de boîtes", -100000, 1000000),
    status: z.enum(STATUSES, { message: "Statut invalide." }),
    sortOrder: zInt("L'ordre", -1000, 10000),
    useFixed: zCheckbox,
  })
  .transform((v, ctx) => {
    let price: number | null = null;
    if (v.priceCents) {
      const raw = v.priceCents.replace(/[\s €]/g, "").replace(",", ".");
      if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
        ctx.addIssue({ code: "custom", path: ["priceCents"], message: "Prix invalide : montant en euros, par exemple 27,90. Laissez vide pour « sur devis »." });
        return z.NEVER;
      }
      price = Math.round(parseFloat(raw) * 100);
    }
    if (!v.quoteOnly && price == null) {
      ctx.addIssue({ code: "custom", path: ["priceCents"], message: "Indiquez un prix, ou cochez « Sur devis uniquement »." });
      return z.NEVER;
    }
    return { ...v, priceCents: price };
  });

export async function saveBox(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  const bid = obj.id ? zId.safeParse(obj.id) : null;
  if (bid && !bid.success) return fail("Identifiant invalide.");
  const parsed = boxInput.safeParse(obj);
  if (!parsed.success) return zodFail(parsed.error);
  const { useFixed, ...v } = parsed.data;
  const details = formList(form, "details").map((d) => d.trim().slice(0, 200)).filter(Boolean).slice(0, 20);

  let fixedComposition: Record<string, number> | null = null;
  if (useFixed) {
    const comp: Record<string, number> = {};
    for (const [k, val] of form.entries()) {
      if (typeof val !== "string" || !k.startsWith("comp:")) continue;
      const slug = k.slice(5);
      const q = val.trim() ? Number(val) : 0;
      if (!Number.isInteger(q) || q < 0 || q > 500) return fail(`Quantité invalide pour « ${slug} » : nombre entier positif attendu.`, { composition: "Quantités invalides." });
      if (q > 0) comp[slug] = q;
    }
    const total = Object.values(comp).reduce((a, b) => a + b, 0);
    if (!total) return fail("La composition imposée est vide : indiquez des quantités ou décochez l'option.", { composition: "Composition vide." });
    if (v.pieces != null && total !== v.pieces) {
      return fail(`La composition compte ${total} pièce(s) alors que le coffret en contient ${v.pieces}. Ajustez les quantités.`, { composition: `Total ${total} / ${v.pieces} attendu.` });
    }
    const known = await db.select({ slug: schema.products.slug }).from(schema.products);
    const set = new Set(known.map((p) => p.slug));
    const unknown = Object.keys(comp).filter((s) => !set.has(s));
    if (unknown.length) return fail(`Recette(s) inconnue(s) dans la composition : ${unknown.join(", ")}.`);
    fixedComposition = comp;
  }

  let createdId: string | null = null;
  const res = await run(
    async () => {
      const values = { ...v, details, fixedComposition };
      if (bid?.success) {
        const r = await db.update(schema.boxes).set(values).where(eq(schema.boxes.id, bid.data)).returning({ id: schema.boxes.id });
        if (!r.length) return fail("Ce coffret n'existe plus.");
        return done("Coffret enregistré.");
      }
      const [row] = await db.insert(schema.boxes).values({ ...values, images: [] }).returning({ id: schema.boxes.id });
      createdId = row.id;
      return done("Coffret créé.");
    },
    { unique: "Ce slug est déjà utilisé par un autre coffret." }
  );
  if (res.ok) updateTag("catalog");
  if (createdId) redirect(`/admin/coffrets/${createdId}?cree=1`);
  return res;
}

export async function deleteBox(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = zId.safeParse(form.get("id"));
  if (!id.success) return fail("Identifiant invalide.");
  const res = await run(async () => {
    assertConfirmed(form);
    const r = await db.delete(schema.boxes).where(eq(schema.boxes.id, id.data)).returning({ name: schema.boxes.name });
    if (!r.length) return fail("Ce coffret n'existe plus.");
    return done("Coffret supprimé.");
  });
  if (!res.ok) return res;
  updateTag("catalog");
  redirect("/admin/coffrets?supprime=1");
}

// ---------------------------------------------------------------------------
// Stock
// ---------------------------------------------------------------------------
const stockInput = z.object({
  kind: z.enum(["product", "box", "variant"]),
  id: zId,
  intent: z.enum(["delta", "set"]),
  delta: z.string().optional(),
  value: z.string().optional(),
});

export async function adjustStock(_: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const obj = formObject(form);
  // Les boutons +/− transmettent intent=delta et la valeur du delta dans leur propre value (« delta:+6 »).
  const submitted = String(form.get("op") ?? "");
  if (submitted.startsWith("delta:")) {
    obj.intent = "delta";
    obj.delta = submitted.slice(6);
  } else if (submitted === "set") obj.intent = "set";
  const parsed = stockInput.safeParse(obj);
  if (!parsed.success) return zodFail(parsed.error);
  const { kind, id, intent } = parsed.data;
  const raw = intent === "delta" ? parsed.data.delta : parsed.data.value;
  const n = Number((raw ?? "").trim());
  if (!(raw ?? "").trim() || !Number.isInteger(n)) return fail("Saisissez un nombre entier.", { value: "Nombre entier attendu." });
  if (intent === "set" && (n < 0 || n > 1_000_000)) return fail("Le stock doit être compris entre 0 et 1 000 000.", { value: "Entre 0 et 1 000 000." });
  if (intent === "delta" && Math.abs(n) > 100_000) return fail("Ajustement trop important.");

  const res = await run(async () => {
    let after: number | undefined;
    if (kind === "product") {
      const col = schema.products.stockPieces;
      const [r] = await db
        .update(schema.products)
        .set({ stockPieces: intent === "set" ? n : sql`greatest(0, ${col} + ${n})`, updatedAt: new Date() })
        .where(eq(schema.products.id, id))
        .returning({ v: col });
      after = r?.v;
    } else if (kind === "box") {
      const col = schema.boxes.stock;
      const [r] = await db.update(schema.boxes).set({ stock: intent === "set" ? n : sql`greatest(0, ${col} + ${n})` }).where(eq(schema.boxes.id, id)).returning({ v: col });
      after = r?.v;
    } else {
      const col = schema.variants.stock;
      const [r] = await db.update(schema.variants).set({ stock: intent === "set" ? n : sql`greatest(0, ${col} + ${n})` }).where(eq(schema.variants.id, id)).returning({ v: col });
      after = r?.v;
    }
    if (after === undefined) return fail("Élément introuvable.");
    return done(`Stock mis à jour : ${after}.`);
  });
  if (res.ok) updateTag("catalog");
  return res;
}
