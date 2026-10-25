// Données initiales TAMBRÉ (catalogue de démonstration).
// Usage : npm run db:seed        (idempotent : met à jour sans dupliquer)
// Variables : DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD (optionnelle : générée sinon)
import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";
import { RECIPES, BOXES } from "../src/data/recipes";

config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL manquant");
const sql = postgres(url, { max: 1, prepare: process.env.DATABASE_PREPARE !== "false" });
const db = drizzle(sql, { schema });

const root = path.resolve(import.meta.dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "src/data/concepts-manifest.json"), "utf8")) as Record<string, { w: number; h: number; alt: string; blur: string }>;
const img = (id: string, role: schema.ImageRef["role"]): schema.ImageRef => {
  const m = manifest[id];
  if (!m) throw new Error(`Visuel concept manquant : ${id} (lancez npm run concepts)`);
  return { url: `/images/concepts/${id}.webp`, alt: m.alt, role, concept: true, w: m.w, h: m.h, blur: m.blur };
};

async function main() {
  // --- Collections
  const cols = [
    { slug: "signature", name: "Collection Signature", ephemeral: false, sortOrder: 1, intro: "Les six créations qui définissent la maison. Des accords francs, pensés pour durer." },
    { slug: "ephemere", name: "Collection Éphémère", ephemeral: true, sortOrder: 2, intro: "Des recettes de saison, produites en petites séries. Quand elles disparaissent, elles ne reviennent pas toujours." },
  ];
  for (const c of cols) {
    await db.insert(schema.collections).values(c).onConflictDoUpdate({ target: schema.collections.slug, set: { name: c.name, intro: c.intro, ephemeral: c.ephemeral, sortOrder: c.sortOrder } });
  }
  const colRows = await db.select().from(schema.collections);
  const colId = (slug: string) => colRows.find((c) => c.slug === slug)!.id;

  // --- Recettes
  for (const r of RECIPES) {
    const values = {
      slug: r.slug,
      number: r.number,
      name: r.name,
      collectionId: colId(r.collection),
      pairing: r.pairing,
      tagline: r.tagline,
      story: r.story,
      tasting: r.tasting,
      chocolate: r.chocolate,
      flavorFamilies: r.flavorFamilies,
      allergens: r.allergens,
      ingredients: r.ingredientsDraft,
      netWeightG: null,
      storage: null,
      bestBefore: null,
      origin: null,
      nutrition: null,
      regulatoryValidated: false,
      status: "prototype" as const,
      boxSupplementCents: 0,
      stockPieces: r.collection === "signature" ? 144 : 72,
      limited: r.collection === "ephemere",
      palette: { ...r.palette },
      images: [img(`produit-${r.slug}`, "main"), img(`coupe-${r.slug}`, "cut"), img(`scene-${r.slug}`, "scene")],
      sortOrder: r.number,
    };
    const [p] = await db
      .insert(schema.products)
      .values(values)
      .onConflictDoUpdate({ target: schema.products.slug, set: { ...values, stockPieces: undefined, status: undefined, updatedAt: new Date() } })
      .returning();
    const vs = [
      { sku: `${r.slug}-3`, name: "Étui de 3 pièces", pieces: 3, priceCents: 790, stock: 24, sortOrder: 1 },
      { sku: `${r.slug}-6`, name: "Étui de 6 pièces", pieces: 6, priceCents: 1490, stock: 18, sortOrder: 2 },
    ];
    for (const v of vs) {
      await db.insert(schema.variants).values({ ...v, productId: p.id }).onConflictDoUpdate({ target: schema.variants.sku, set: { name: v.name, pieces: v.pieces, sortOrder: v.sortOrder } });
    }
  }

  // --- Coffrets
  const boxImages: Record<string, schema.ImageRef[]> = {
    decouverte: [img("coffret-3", "main"), img("packaging-1", "extra")],
    signature: [img("coffret-1", "main"), img("packaging-3", "extra")],
    prestige: [img("coffret-2", "main"), img("packaging-2", "extra")],
    "edition-limitee": [img("coffret-4", "main")],
    entreprise: [img("pro-1", "main"), img("pro-2", "extra")],
  };
  const ephemeral = RECIPES.filter((r) => r.collection === "ephemere");
  for (const [i, b] of BOXES.entries()) {
    const values = {
      slug: b.slug,
      name: b.name,
      kind: b.kind,
      pieces: b.pieces,
      priceCents: b.priceCents,
      configurable: b.configurable,
      quoteOnly: b.kind === "entreprise",
      description: b.description,
      details: b.details,
      fixedComposition: b.kind === "edition-limitee" ? Object.fromEntries(ephemeral.map((r) => [r.slug, 3])) : null,
      stock: b.kind === "entreprise" ? 0 : b.kind === "edition-limitee" ? 30 : 60,
      status: "prototype" as const,
      images: boxImages[b.kind],
      sortOrder: i + 1,
    };
    await db.insert(schema.boxes).values(values).onConflictDoUpdate({ target: schema.boxes.slug, set: { ...values, stock: undefined, status: undefined } });
  }

  // --- Livraison (tarifs provisoires, à aligner sur le contrat transporteur)
  const existingRates = await db.select().from(schema.shippingRates);
  if (!existingRates.length) {
    await db.insert(schema.shippingRates).values([
      { name: "Point relais", description: "Retrait dans un point relais proche de chez vous.", countries: ["FR"], priceCents: 490, freeAboveCents: 4500, sortOrder: 1, provisional: true },
      { name: "Livraison à domicile", description: "Remise en main propre ou en boîte aux lettres selon le format.", countries: ["FR"], priceCents: 690, freeAboveCents: 6000, sortOrder: 2, provisional: true },
      { name: "Livraison Europe", description: "Belgique, Luxembourg, Allemagne, Pays-Bas, Italie, Espagne.", countries: ["BE", "LU", "DE", "NL", "IT", "ES"], priceCents: 1490, freeAboveCents: null, sortOrder: 3, provisional: true },
    ]);
  }

  // --- Codes promotionnels de démonstration
  for (const p of [
    { code: "BIENVENUE10", kind: "percent" as const, value: 10, minSubtotalCents: 2500, note: "Code de démonstration" },
    { code: "LIVRAISON", kind: "free_shipping" as const, value: 0, minSubtotalCents: 3000, note: "Code de démonstration" },
  ]) {
    await db.insert(schema.promoCodes).values(p).onConflictDoNothing();
  }

  // --- Tarifs dégressifs B2B (inactifs tant qu'ils ne sont pas validés)
  if (!(await db.select().from(schema.priceTiers)).length) {
    await db.insert(schema.priceTiers).values([
      { minQuantity: 50, discountPercent: 5, label: "À partir de 50 coffrets (à valider)", active: false },
      { minQuantity: 150, discountPercent: 10, label: "À partir de 150 coffrets (à valider)", active: false },
      { minQuantity: 400, discountPercent: 15, label: "À partir de 400 coffrets (à valider)", active: false },
    ]);
  }

  // --- Réglages
  const settings: Record<string, unknown> = {
    giftWrapCents: 350,
    giftWrapLabel: "Papier de soie, ruban bronze et carte manuscrite",
    contactEmail: process.env.CONTACT_EMAIL ?? "bonjour@tambre.example",
    legal: {
      companyName: "[Raison sociale à compléter]",
      legalForm: "[Forme juridique et capital à compléter]",
      address: "[Adresse du siège à compléter]",
      siret: "[SIRET à compléter]",
      rcs: "[RCS à compléter]",
      vat: "[N° TVA intracommunautaire à compléter]",
      director: "[Directeur de la publication à compléter]",
      host: "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis",
      dbHost: "[Hébergeur de la base de données à compléter]",
      mediator: "[Médiateur de la consommation à compléter]",
    },
    social: { instagram: "", pinterest: "", linkedin: "" },
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.insert(schema.settings).values({ key, value }).onConflictDoNothing();
  }

  // --- Administrateur
  const email = (process.env.ADMIN_EMAIL ?? "admin@tambre.local").toLowerCase();
  const [existing] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (!existing) {
    const password = process.env.ADMIN_PASSWORD ?? randomBytes(9).toString("base64url");
    await db.insert(schema.users).values({ email, passwordHash: await bcrypt.hash(password, 12), role: "admin", firstName: "Administrateur" });
    console.log(`\nCompte administrateur créé : ${email}`);
    if (!process.env.ADMIN_PASSWORD) console.log(`Mot de passe généré : ${password}  (changez-le après la première connexion)\n`);
  } else if (existing.role !== "admin") {
    await db.update(schema.users).set({ role: "admin" }).where(eq(schema.users.id, existing.id));
  }

  console.log("Seed terminé.");
  await sql.end();
}

main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
