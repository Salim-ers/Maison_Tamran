import {
  pgTable, text, integer, boolean, timestamp, jsonb, uuid, pgEnum, index, uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Énumérations
// ---------------------------------------------------------------------------
export const roleEnum = pgEnum("role", ["customer", "pro", "admin"]);
export const productStatusEnum = pgEnum("product_status", ["draft", "prototype", "available", "archived"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment", // en attente du paiement (session Stripe créée)
  "paid", // paiement confirmé par webhook
  "payment_failed",
  "cancelled",
  "preparing",
  "shipped",
  "delivered",
  "refunded",
]);
export const quoteStatusEnum = pgEnum("quote_status", ["new", "in_review", "quoted", "accepted", "declined", "archived"]);
export const promoKindEnum = pgEnum("promo_kind", ["percent", "fixed", "free_shipping"]);
export const testimonialStatusEnum = pgEnum("testimonial_status", ["pending", "approved", "rejected"]);

// ---------------------------------------------------------------------------
// Comptes
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  role: roleEnum("role").notNull().default("customer"),
  company: text("company"),
  vatNumber: text("vat_number"),
  marketingConsent: boolean("marketing_consent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
}, (t) => [uniqueIndex("users_email_idx").on(t.email)]);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // hash SHA-256 du jeton (le jeton brut n'est jamais stocké)
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  userAgent: text("user_agent"),
}, (t) => [index("sessions_user_idx").on(t.userId)]);

export const passwordResets = pgTable("password_resets", {
  id: text("id").primaryKey(), // hash du jeton
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const loginAttempts = pgTable("login_attempts", {
  key: text("key").primaryKey(), // email ou IP hachés
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  line1: text("line1").notNull(),
  line2: text("line2"),
  postalCode: text("postal_code").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull().default("FR"),
  phone: text("phone"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------
export const collections = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  intro: text("intro").notNull().default(""),
  ephemeral: boolean("ephemeral").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export interface ImageRef {
  url: string;
  alt: string;
  role: "main" | "cut" | "scene" | "macro" | "extra";
  concept?: boolean; // visuel concept (illustration), pas une photographie du produit réel
  badge?: string; // mention affichée sur un visuel conceptuel (résolue à l'affichage, non stockée)
  w?: number;
  h?: number;
  blur?: string;
}

export interface Palette {
  coat: string;
  coatLight: string;
  filling: string;
  insert: string;
  accent: string;
  surface: string;
}

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  number: integer("number").notNull().default(0),
  name: text("name").notNull(),
  collectionId: uuid("collection_id").references(() => collections.id),
  pairing: text("pairing").notNull(),
  tagline: text("tagline").notNull().default(""),
  story: text("story").notNull().default(""),
  tasting: jsonb("tasting").$type<{ attaque: string; coeur: string; finale: string }>(),
  chocolate: text("chocolate").notNull(), // noir | lait | blanc | blond
  flavorFamilies: jsonb("flavor_families").$type<string[]>().notNull().default([]),
  allergens: jsonb("allergens").$type<string[]>().notNull().default([]),
  ingredients: text("ingredients").notNull().default(""),
  // Champs réglementaires — null tant que non validés
  netWeightG: integer("net_weight_g"),
  storage: text("storage"),
  bestBefore: text("best_before"), // DDM / DLC : uniquement si validée
  origin: text("origin"), // traçabilité / provenance : uniquement si validée
  nutrition: jsonb("nutrition").$type<Record<string, string> | null>(),
  regulatoryValidated: boolean("regulatory_validated").notNull().default(false),
  status: productStatusEnum("status").notNull().default("prototype"),
  // Prix unitaire d'une pièce dans un coffret composé (supplément éventuel)
  boxSupplementCents: integer("box_supplement_cents").notNull().default(0),
  stockPieces: integer("stock_pieces").notNull().default(0), // stock de pièces pour les coffrets
  limited: boolean("limited").notNull().default(false),
  availableFrom: timestamp("available_from", { withTimezone: true }),
  availableUntil: timestamp("available_until", { withTimezone: true }),
  palette: jsonb("palette").$type<Palette>().notNull(),
  images: jsonb("images").$type<ImageRef[]>().notNull().default([]),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Variantes vendables d'une recette (étuis monosaveur)
export const variants = pgTable("variants", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  sku: text("sku").notNull().unique(),
  name: text("name").notNull(), // « Étui de 3 »
  pieces: integer("pieces").notNull(),
  priceCents: integer("price_cents").notNull(),
  stock: integer("stock").notNull().default(0),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

// Coffrets (formats de boîte)
export const boxes = pgTable("boxes", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull(), // decouverte | signature | prestige | edition-limitee | entreprise
  pieces: integer("pieces"),
  priceCents: integer("price_cents"), // null = sur devis
  configurable: boolean("configurable").notNull().default(true),
  quoteOnly: boolean("quote_only").notNull().default(false),
  description: text("description").notNull().default(""),
  details: jsonb("details").$type<string[]>().notNull().default([]),
  // Composition imposée (édition limitée) : { productSlug: quantité }
  fixedComposition: jsonb("fixed_composition").$type<Record<string, number> | null>(),
  stock: integer("stock").notNull().default(0), // boîtes vides disponibles
  status: productStatusEnum("status").notNull().default("prototype"),
  images: jsonb("images").$type<ImageRef[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// Panier
// ---------------------------------------------------------------------------
export interface BoxComposition {
  [productSlug: string]: number;
}

export const carts = pgTable("carts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  promoCode: text("promo_code"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartId: uuid("cart_id").notNull().references(() => carts.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // "variant" | "box"
  variantId: uuid("variant_id").references(() => variants.id, { onDelete: "cascade" }),
  boxId: uuid("box_id").references(() => boxes.id, { onDelete: "cascade" }),
  composition: jsonb("composition").$type<BoxComposition | null>(),
  giftWrap: boolean("gift_wrap").notNull().default(false),
  giftMessage: text("gift_message"),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("cart_items_cart_idx").on(t.cartId)]);

// ---------------------------------------------------------------------------
// Commandes
// ---------------------------------------------------------------------------
export interface AddressSnapshot {
  firstName: string;
  lastName: string;
  company?: string | null;
  line1: string;
  line2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone?: string | null;
}

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: text("number").notNull().unique(), // TB-2026-000123
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  email: text("email").notNull(),
  status: orderStatusEnum("status").notNull().default("pending_payment"),
  isDemo: boolean("is_demo").notNull().default(false), // commande simulée, jamais expédiée
  subtotalCents: integer("subtotal_cents").notNull(),
  discountCents: integer("discount_cents").notNull().default(0),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  promoCode: text("promo_code"),
  shippingMethod: text("shipping_method"),
  shippingAddress: jsonb("shipping_address").$type<AddressSnapshot>().notNull(),
  billingAddress: jsonb("billing_address").$type<AddressSnapshot>(),
  customerNote: text("customer_note"),
  stripeSessionId: text("stripe_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  stockCommitted: boolean("stock_committed").notNull().default(false),
  cartId: uuid("cart_id"),
  accessToken: text("access_token").notNull(), // permet le suivi invité (hash)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("orders_user_idx").on(t.userId), index("orders_session_idx").on(t.stripeSessionId)]);

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  variantId: uuid("variant_id"),
  boxId: uuid("box_id"),
  composition: jsonb("composition").$type<BoxComposition | null>(),
  giftWrap: boolean("gift_wrap").notNull().default(false),
  giftMessage: text("gift_message"),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  totalCents: integer("total_cents").notNull(),
});

export const orderEvents = pgTable("order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Idempotence des webhooks Stripe
export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Promotions & livraison
// ---------------------------------------------------------------------------
export const promoCodes = pgTable("promo_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // toujours en majuscules
  kind: promoKindEnum("kind").notNull(),
  value: integer("value").notNull().default(0), // % ou centimes
  minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  maxUses: integer("max_uses"),
  uses: integer("uses").notNull().default(0),
  active: boolean("active").notNull().default(true),
  note: text("note"),
});

export const shippingRates = pgTable("shipping_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  countries: jsonb("countries").$type<string[]>().notNull(), // codes ISO
  priceCents: integer("price_cents").notNull(),
  freeAboveCents: integer("free_above_cents"),
  minSubtotalCents: integer("min_subtotal_cents").notNull().default(0),
  active: boolean("active").notNull().default(true),
  provisional: boolean("provisional").notNull().default(true), // tarif non contractualisé avec un transporteur
  sortOrder: integer("sort_order").notNull().default(0),
});

// ---------------------------------------------------------------------------
// B2B
// ---------------------------------------------------------------------------
export interface QuoteLine {
  ref: string; // slug produit ou coffret
  label: string;
  quantity: number;
}

export const quoteRequests = pgTable("quote_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  reference: text("reference").notNull().unique(), // DV-2026-0042
  segment: text("segment").notNull(),
  company: text("company").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  vatNumber: text("vat_number"),
  lines: jsonb("lines").$type<QuoteLine[]>().notNull().default([]),
  personalization: jsonb("personalization").$type<{ logo: boolean; card: boolean; ribbon: boolean; notes?: string }>(),
  logoUrl: text("logo_url"),
  desiredDate: text("desired_date"),
  deliveryCity: text("delivery_city"),
  budget: text("budget"),
  message: text("message"),
  status: quoteStatusEnum("status").notNull().default("new"),
  internalNotes: text("internal_notes"),
  // Proposition commerciale (renseignée par l'admin)
  proposal: jsonb("proposal").$type<{ lines: { label: string; quantity: number; unitCents: number }[]; shippingCents: number; validUntil?: string; notes?: string } | null>(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Grille de tarifs dégressifs (appliquée aux devis après validation)
export const priceTiers = pgTable("price_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  minQuantity: integer("min_quantity").notNull(),
  discountPercent: integer("discount_percent").notNull(),
  label: text("label"),
  active: boolean("active").notNull().default(true),
});

// ---------------------------------------------------------------------------
// Contenu, newsletter, contact, témoignages, emails
// ---------------------------------------------------------------------------
export const contentBlocks = pgTable("content_blocks", {
  key: text("key").primaryKey(), // ex. "home.hero"
  value: jsonb("value").$type<Record<string, string>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  consentText: text("consent_text").notNull(),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull().defaultNow(),
  confirmToken: text("confirm_token"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  source: text("source"),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  orderNumber: text("order_number"),
  message: text("message").notNull(),
  handled: boolean("handled").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorName: text("author_name").notNull(),
  authorCity: text("author_city"),
  productSlug: text("product_slug"),
  body: text("body").notNull(),
  rating: integer("rating"),
  orderId: uuid("order_id"), // achat vérifié si renseigné
  source: text("source"), // provenance de l'avis (email, carte reçue…), obligatoire pour une saisie manuelle
  createdBy: text("created_by"), // email de l'administrateur qui l'a saisi
  userId: uuid("user_id"),
  status: testimonialStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  moderatedAt: timestamp("moderated_at", { withTimezone: true }),
});

export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  template: text("template").notNull(),
  html: text("html").notNull(),
  status: text("status").notNull(), // sent | logged | failed
  providerId: text("provider_id"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Mesures d'audience internes, uniquement avec consentement (voir lib/analytics)
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // page_view | add_to_cart | begin_checkout | purchase
  path: text("path"),
  sessionHash: text("session_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index("analytics_name_idx").on(t.name, t.createdAt)]);

