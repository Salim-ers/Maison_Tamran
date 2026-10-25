import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PDFDocument, rgb, setCharacterSpacing, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { schema } from "@/db";
import { readSettings } from "./settings";
import { segmentShort } from "./segments";

type Quote = typeof schema.quoteRequests.$inferSelect;

// ---------------------------------------------------------------------------
// Constantes de mise en page (A4 portrait, en points)
// ---------------------------------------------------------------------------
const W = 595.28;
const H = 841.89;
const M = 56; // marge latérale
const TOP = 60;
const FOOTER_H = 74;

const hex = (h: string): RGB => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const C = {
  ink: hex("#251c1a"),
  soft: hex("#5c4b44"),
  muted: hex("#8a7a6e"),
  bronze: hex("#a87455"),
  line: hex("#e3dacd"),
  panel: hex("#f7f3ec"),
  white: rgb(1, 1, 1),
};

const fontFile = (name: string) => fs.readFileSync(path.join(process.cwd(), "src/assets/fonts", name));
// Logo officiel détouré (npm run logo) : version complète pour la première page, lockup pour les suivantes.
const logoFile = (name: string) => fs.readFileSync(path.join(process.cwd(), "src/assets/brand", name));

const isPlaceholder = (v: string | undefined | null) => !v || /^\s*\[.*\]\s*$/.test(v);
/** Valeur légale lisible : les valeurs entre crochets deviennent « à compléter ». */
const legalValue = (v: string | undefined | null, label: string) => (isPlaceholder(v) ? `${label} à compléter` : v!.trim());
const lv = (v: string | undefined | null) => (isPlaceholder(v) ? "à compléter" : v!.trim());

const dateFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });
const money = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
const eur = (cents: number) => money.format(cents / 100);

function formatDesiredDate(v: string | null) {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return v;
  return dateFmt.format(new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], 12)));
}

// ---------------------------------------------------------------------------
// Dessin
// ---------------------------------------------------------------------------
interface Fonts {
  display: PDFFont;
  italic: PDFFont;
  regular: PDFFont;
  semibold: PDFFont;
}

class Writer {
  page!: PDFPage;
  y = 0;
  pages: PDFPage[] = [];
  constructor(private doc: PDFDocument, public f: Fonts, private onNewPage: (w: Writer) => void) {
    this.addPage();
  }
  addPage() {
    this.page = this.doc.addPage([W, H]);
    this.pages.push(this.page);
    this.y = H - TOP;
    this.onNewPage(this);
  }
  ensure(h: number) {
    if (this.y - h < FOOTER_H + 16) this.addPage();
  }
  /** Retire les caractères absents des polices embarquées (espaces fines, émojis…). */
  clean(font: PDFFont, s: string) {
    const set = charsets.get(font);
    const norm = s.replace(/[   ]/g, " ").replace(/\r\n?/g, "\n").replace(/\t/g, " ");
    if (!set) return norm;
    return [...norm].map((ch) => (ch === "\n" || set.has(ch.codePointAt(0)!) ? ch : ch === " " ? " " : "")).join("");
  }
  width(font: PDFFont, s: string, size: number) {
    return font.widthOfTextAtSize(this.clean(font, s), size);
  }
  wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
    const out: string[] = [];
    for (const para of this.clean(font, text).split("\n")) {
      const words = para.split(/ +/);
      let line = "";
      for (const w of words) {
        const cand = line ? `${line} ${w}` : w;
        if (font.widthOfTextAtSize(cand, size) <= maxW) {
          line = cand;
          continue;
        }
        if (line) out.push(line);
        // mot plus long que la ligne : on le coupe
        let rest = w;
        while (font.widthOfTextAtSize(rest, size) > maxW && rest.length > 1) {
          let i = rest.length - 1;
          while (i > 1 && font.widthOfTextAtSize(rest.slice(0, i), size) > maxW) i--;
          out.push(rest.slice(0, i));
          rest = rest.slice(i);
        }
        line = rest;
      }
      out.push(line);
    }
    return out;
  }
  text(s: string, x: number, y: number, font: PDFFont, size: number, color: RGB = C.ink, opts: { align?: "left" | "right"; spacing?: number } = {}) {
    const t = this.clean(font, s);
    if (opts.spacing) {
      // approche (lettres espacées) via l'opérateur Tc : le texte reste extractible d'un seul tenant
      const width = this.spacedWidth(font, t, size, opts.spacing);
      this.page.pushOperators(setCharacterSpacing(opts.spacing));
      this.page.drawText(t, { x: opts.align === "right" ? x - width : x, y, font, size, color });
      this.page.pushOperators(setCharacterSpacing(0));
      return;
    }
    const w = font.widthOfTextAtSize(t, size);
    this.page.drawText(t, { x: opts.align === "right" ? x - w : x, y, font, size, color });
  }
  spacedWidth(font: PDFFont, t: string, size: number, spacing: number) {
    return font.widthOfTextAtSize(t, size) + spacing * Math.max(0, [...t].length - 1);
  }
  /** Paragraphe : écrit à partir de this.y (ligne de base), avance le curseur. */
  para(s: string, x: number, maxW: number, font: PDFFont, size: number, color: RGB = C.ink, leading = 1.45) {
    for (const line of this.wrap(font, s, size, maxW)) {
      this.ensure(size * leading);
      this.text(line, x, this.y, font, size, color);
      this.y -= size * leading;
    }
  }
  rule(y: number, x1 = M, x2 = W - M, color: RGB = C.line, thickness = 0.6) {
    this.page.drawLine({ start: { x: x1, y }, end: { x: x2, y }, thickness, color });
  }
}

const charsets = new WeakMap<PDFFont, Set<number>>();

// ---------------------------------------------------------------------------
// Rendu
// ---------------------------------------------------------------------------
export async function renderQuotePdf(quote: typeof schema.quoteRequests.$inferSelect, kind: "demande" | "proposition"): Promise<Uint8Array> {
  const settings = await readSettings();
  const legal = settings.legal;
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const f: Fonts = {
    display: await doc.embedFont(fontFile("BodoniModa-Medium.ttf"), { subset: true }),
    italic: await doc.embedFont(fontFile("BodoniModa-Italic.ttf"), { subset: true }),
    regular: await doc.embedFont(fontFile("Manrope-Regular.ttf"), { subset: true }),
    semibold: await doc.embedFont(fontFile("Manrope-SemiBold.ttf"), { subset: true }),
  };
  for (const font of Object.values(f)) charsets.set(font, new Set(font.getCharacterSet()));
  const logo = await doc.embedPng(logoFile("logo-pdf.png"));
  const lockup = await doc.embedPng(logoFile("lockup-pdf.png"));

  const title = kind === "demande" ? "Récapitulatif de votre demande de devis" : "Proposition commerciale";
  doc.setTitle(`${kind === "demande" ? "Demande de devis" : "Proposition"} ${quote.reference} · MAISON TAMRĀN`);
  doc.setAuthor("MAISON TAMRĀN");
  doc.setSubject(title);
  doc.setLanguage("fr-FR");
  doc.setCreator("MAISON TAMRĀN");
  doc.setProducer("MAISON TAMRĀN");
  doc.setCreationDate(new Date());

  const w = new Writer(doc, f, (wr) => {
    if (wr.pages.length > 1) {
      // en-tête réduit sur les pages suivantes
      const lh = 24;
      wr.page.drawImage(lockup, { x: M, y: H - 32 - lh, width: (lockup.width / lockup.height) * lh, height: lh });
      wr.text(`${quote.reference}`, W - M, H - 47, f.regular, 8.5, C.muted, { align: "right" });
      wr.rule(H - 58);
      wr.y = H - 84;
    }
  });

  // --- En-tête ---------------------------------------------------------------
  const p = w.page;
  const lh = 66;
  const lw = (logo.width / logo.height) * lh;
  p.drawImage(logo, { x: M - 4, y: H - 38 - lh, width: lw, height: lh });
  w.text("L'art de sublimer la datte.", M + lw + 10, H - 92, f.italic, 9.5, C.soft);

  const dateLabel = kind === "proposition" ? dateFmt.format(quote.updatedAt) : dateFmt.format(quote.createdAt);
  w.text(kind === "demande" ? "Demande de devis" : "Proposition", W - M, H - 58, f.display, 17, C.ink, { align: "right" });
  w.text(quote.reference, W - M, H - 76, f.semibold, 10, C.bronze, { align: "right", spacing: 0.6 });
  w.text(`${kind === "demande" ? "Reçue le" : "Établie le"} ${dateLabel}`, W - M, H - 90, f.regular, 9, C.soft, { align: "right" });

  w.rule(H - 112, M, W - M, C.bronze, 0.8);
  w.y = H - 146;

  // --- Titre -------------------------------------------------------------------
  w.text(title, M, w.y, f.display, 20, C.ink);
  w.y -= 22;
  w.para(
    kind === "demande"
      ? "Ce document reprend les éléments que vous nous avez transmis. Il ne constitue ni une offre ni un engagement : une proposition chiffrée vous sera adressée après étude de votre projet."
      : "Proposition établie sur la base de votre demande. Les prix sont exprimés hors taxes.",
    M, W - 2 * M, f.regular, 9.5, C.soft
  );
  w.y -= 14;

  // --- Émetteur / Client -----------------------------------------------------
  const colW = (W - 2 * M - 24) / 2;
  const blockTop = w.y;
  const col = (x: number, heading: string, lines: { t: string; font?: PDFFont; color?: RGB }[]) => {
    let y = blockTop;
    w.text(heading, x, y, f.semibold, 8, C.bronze, { spacing: 0.8 });
    y -= 16;
    for (const l of lines) {
      for (const sub of w.wrap(l.font ?? f.regular, l.t, 9.5, colW)) {
        w.text(sub, x, y, l.font ?? f.regular, 9.5, l.color ?? C.ink);
        y -= 13.5;
      }
    }
    return y;
  };
  const emitter = [
    { t: isPlaceholder(legal.companyName) ? "MAISON TAMRĀN (raison sociale à compléter)" : `${legal.companyName} (MAISON TAMRĀN)`, font: f.semibold },
    { t: legalValue(legal.address, "Adresse"), color: isPlaceholder(legal.address) ? C.muted : C.ink },
    { t: `SIRET : ${lv(legal.siret)}`, color: isPlaceholder(legal.siret) ? C.muted : C.ink },
    { t: settings.contactEmail },
  ];
  const client = [
    { t: quote.company, font: f.semibold },
    { t: quote.contactName },
    { t: quote.email },
    ...(quote.phone ? [{ t: quote.phone }] : []),
    ...(quote.vatNumber ? [{ t: `TVA : ${quote.vatNumber}` }] : []),
  ];
  const y1 = col(M, "ÉMETTEUR", emitter);
  const y2 = col(M + colW + 24, "CLIENT", client);
  w.y = Math.min(y1, y2) - 14;

  // --- Le projet -------------------------------------------------------------
  const facts: [string, string][] = [
    ["Type de projet", segmentShort(quote.segment)],
    ["Livraison souhaitée", formatDesiredDate(quote.desiredDate) ?? "Non précisée"],
    ["Ville de livraison", quote.deliveryCity || "Non précisée"],
    ["Budget indicatif", quote.budget || "Non précisé"],
  ];
  w.ensure(70);
  const boxTop = w.y;
  const cellW = (W - 2 * M) / 4;
  w.page.drawRectangle({ x: M, y: boxTop - 46, width: W - 2 * M, height: 50, color: C.panel });
  facts.forEach(([k, v], i) => {
    const x = M + 12 + i * cellW;
    w.text(k, x, boxTop - 14, f.regular, 7.8, C.muted);
    const lines = w.wrap(f.semibold, v, 9, cellW - 18).slice(0, 2);
    lines.forEach((l, j) => w.text(l, x, boxTop - 28 - j * 11, f.semibold, 9, C.ink));
  });
  w.y = boxTop - 74;

  const sectionTitle = (t: string) => {
    w.ensure(48);
    w.text(t, M, w.y, f.display, 13.5, C.ink);
    w.y -= 10;
    w.rule(w.y);
    w.y -= 16;
  };

  if (kind === "demande") {
    // --- Sélection ------------------------------------------------------------
    sectionTitle("Sélection souhaitée");
    if (quote.lines.length) {
      w.text("Création ou coffret", M, w.y, f.regular, 8, C.muted);
      w.text("Quantité souhaitée", W - M, w.y, f.regular, 8, C.muted, { align: "right" });
      w.y -= 14;
      for (const l of quote.lines) {
        w.ensure(20);
        w.text(l.label, M, w.y, f.regular, 10, C.ink);
        w.text(String(l.quantity), W - M, w.y, f.semibold, 10, C.ink, { align: "right" });
        w.y -= 8;
        w.rule(w.y, M, W - M, C.line, 0.4);
        w.y -= 13;
      }
    } else {
      w.para("Aucune création sélectionnée : la sélection sera établie avec vous.", M, W - 2 * M, f.regular, 10, C.soft);
    }
    w.y -= 10;

    // --- Personnalisation ----------------------------------------------------
    sectionTitle("Personnalisation");
    const pz = quote.personalization;
    const items = [
      ["Logo sur le coffret", pz?.logo ? (quote.logoUrl ? "Souhaité, fichier transmis" : "Souhaité, fichier à transmettre") : "Non"],
      ["Carte imprimée", pz?.card ? "Souhaitée" : "Non"],
      ["Ruban", pz?.ribbon ? "Souhaité" : "Non"],
    ];
    for (const [k, v] of items) {
      w.ensure(16);
      w.text(k, M, w.y, f.regular, 10, C.ink);
      w.text(v, M + 170, w.y, f.regular, 10, v === "Non" ? C.muted : C.ink);
      w.y -= 16;
    }
    if (pz?.notes) {
      w.y -= 4;
      w.text("Précisions", M, w.y, f.regular, 8, C.muted);
      w.y -= 13;
      w.para(pz.notes, M, W - 2 * M, f.regular, 10, C.ink);
    }
    w.y -= 10;

    if (quote.message) {
      sectionTitle("Votre message");
      w.para(quote.message, M, W - 2 * M, f.regular, 10, C.ink);
      w.y -= 10;
    }

    w.ensure(60);
    w.y -= 6;
    w.para("Prochaine étape : nous étudions votre demande et revenons vers vous par email avec une proposition chiffrée. Pour toute précision, répondez à l'email de confirmation en rappelant la référence ci-dessus.", M, W - 2 * M, f.italic, 10.5, C.soft);
  } else {
    // --- Proposition -----------------------------------------------------------
    const prop = quote.proposal;
    sectionTitle("Détail de la proposition");
    if (!prop || !prop.lines.length) {
      w.para("Aucune proposition n'a encore été établie pour cette demande. Elle vous sera transmise après étude de votre projet.", M, W - 2 * M, f.regular, 10.5, C.soft);
    } else {
      const xQty = W - M - 190, xUnit = W - M - 95, xTot = W - M;
      const descW = xQty - M - 40;
      w.text("Désignation", M, w.y, f.regular, 8, C.muted);
      w.text("Quantité", xQty, w.y, f.regular, 8, C.muted, { align: "right" });
      w.text("Prix unitaire HT", xUnit, w.y, f.regular, 8, C.muted, { align: "right" });
      w.text("Total HT", xTot, w.y, f.regular, 8, C.muted, { align: "right" });
      w.y -= 14;
      let subtotal = 0;
      for (const l of prop.lines) {
        const total = l.quantity * l.unitCents;
        subtotal += total;
        const lines = w.wrap(f.regular, l.label, 10, descW);
        w.ensure(lines.length * 13 + 12);
        lines.forEach((t, i) => w.text(t, M, w.y - i * 13, f.regular, 10, C.ink));
        w.text(String(l.quantity), xQty, w.y, f.regular, 10, C.ink, { align: "right" });
        w.text(eur(l.unitCents), xUnit, w.y, f.regular, 10, C.ink, { align: "right" });
        w.text(eur(total), xTot, w.y, f.semibold, 10, C.ink, { align: "right" });
        w.y -= (lines.length - 1) * 13 + 8;
        w.rule(w.y, M, W - M, C.line, 0.4);
        w.y -= 13;
      }
      const totals: [string, string, boolean][] = [
        ["Sous-total HT", eur(subtotal), false],
        ["Frais de livraison HT", prop.shippingCents ? eur(prop.shippingCents) : "Inclus", false],
        ["Total HT", eur(subtotal + (prop.shippingCents || 0)), true],
      ];
      w.ensure(90);
      w.y -= 4;
      for (const [k, v, strong] of totals) {
        if (strong) {
          w.rule(w.y + 10, W - M - 220, W - M, C.ink, 0.8);
          w.y -= 4;
        }
        w.text(k, W - M - 220, w.y, strong ? f.semibold : f.regular, strong ? 11 : 10, C.ink);
        w.text(v, W - M, w.y, strong ? f.semibold : f.regular, strong ? 12 : 10, C.ink, { align: "right" });
        w.y -= strong ? 20 : 15;
      }
      w.text("TVA à appliquer selon le taux en vigueur.", W - M, w.y, f.regular, 8.5, C.soft, { align: "right" });
      w.y -= 26;

      if (prop.validUntil) {
        w.ensure(20);
        w.text("Validité de la proposition", M, w.y, f.regular, 8, C.muted);
        w.y -= 13;
        w.text(`Jusqu'au ${formatDesiredDate(prop.validUntil) ?? prop.validUntil}`, M, w.y, f.semibold, 10, C.ink);
        w.y -= 20;
      }
      if (prop.notes) {
        w.ensure(30);
        w.text("Notes", M, w.y, f.regular, 8, C.muted);
        w.y -= 13;
        w.para(prop.notes, M, W - 2 * M, f.regular, 10, C.ink);
        w.y -= 8;
      }
    }
  }

  // --- Pied de page sur chaque page ----------------------------------------------
  const legalLine1 = [
    isPlaceholder(legal.companyName) ? "Raison sociale à compléter" : legal.companyName,
    legalValue(legal.legalForm, "Forme juridique et capital"),
    legalValue(legal.address, "Adresse du siège"),
  ].join(" · ");
  const legalLine2 = [
    `SIRET ${lv(legal.siret)}`,
    `RCS ${lv(legal.rcs)}`,
    `TVA intracommunautaire ${lv(legal.vat)}`,
  ].join(" · ");
  w.pages.forEach((pg, i) => {
    w.page = pg;
    w.rule(FOOTER_H - 12);
    const l1 = w.wrap(f.regular, legalLine1, 7.4, W - 2 * M - 60);
    const l2 = w.wrap(f.regular, legalLine2, 7.4, W - 2 * M - 60);
    let y = FOOTER_H - 28;
    for (const l of [...l1, ...l2].slice(0, 4)) {
      w.text(l, M, y, f.regular, 7.4, C.muted);
      y -= 10;
    }
    w.text(`${i + 1} / ${w.pages.length}`, W - M, FOOTER_H - 28, f.regular, 7.4, C.muted, { align: "right" });
  });

  return doc.save();
}
