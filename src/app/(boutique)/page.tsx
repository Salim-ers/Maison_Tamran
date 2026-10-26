import { getBoxes, getCatalog, getContent } from "@/lib/catalog";
import { toCard, toSwatch } from "@/lib/present";
import { ambiance, type AmbianceImage } from "@/lib/ambiance";
import { concept } from "@/components/ui/media";
import { Hero } from "@/components/home/hero";
import { Oasis } from "@/components/home/oasis";
import { Metamorphosis, type MetaCreation, type MetaStep } from "@/components/home/metamorphosis";
import { scene } from "@/lib/scene";
import { DateAnatomy } from "@/components/home/date-anatomy";
import { SignatureStage, type StageCreation } from "@/components/home/signature-stage";
import { CREATION_STAGE } from "@/lib/creation-visuals";
import { GiftShowcase } from "@/components/home/gift-showcase";
import { FlavorBurst, type BurstPiece } from "@/components/home/flavor-burst";
import { EphemeralPanels } from "@/components/home/ephemeral-panels";
import { MaisonStory } from "@/components/home/maison-story";
import { ComposeTeaser } from "@/components/home/compose-teaser";
import { ProsSection } from "@/components/home/pros-section";
import { Newsletter } from "@/components/home/newsletter";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/texts";
import { RECIPES, type Ingredient } from "@/data/recipes";
import { homeHero, homeMaison } from "@/content/registry/home";

// L'explosion des saveurs : ingrédients détourés (npm run scene-assets). x / y : position finale depuis le centre
// (vw / vh) ; w : largeur (vmin) ; z : plan (négatif : derrière la datte) ; r : rotation.
const BURST: Omit<BurstPiece, "url" | "natW" | "natH">[] = [
  { key: "ing-chocolat-1", x: 36, y: 0, w: 15, z: 1.4, r: -18, label: "Chocolat noir" },
  { key: "ing-pistache-4", x: 33, y: -13, w: 9, z: 1.6, r: -20 },
  { key: "ing-framboise-1", x: 24, y: -21, w: 10, z: 1, r: -8, label: "Framboise" },
  { key: "ing-pistache-1", x: 15, y: -26, w: 7, z: 0.8, r: 50 },
  { key: "ing-pistache-2", x: 3, y: -30, w: 8, z: 1.2, r: 30, label: "Pistache" },
  { key: "ing-cafe-2", x: -30, y: -15, w: 5, z: 2.2, r: 40 },
  { key: "ing-noisette-tas", x: -36, y: -1, w: 17, z: -1, r: -10, label: "Noisette" },
  { key: "ing-framboise-2", x: -42, y: 20, w: 8, z: -0.4, r: 12 },
  { key: "ing-amande-tas", x: -22, y: 22, w: 16, z: -0.6, r: 8, label: "Amande" },
  { key: "ing-chocolat-2", x: -9, y: 27, w: 12, z: 2.4, r: 24 },
  { key: "ing-noisette-5", x: 6, y: 28, w: 6, z: 1.8, r: 0 },
  { key: "ing-amande-1", x: 17, y: 24, w: 6, z: 1.6, r: -30 },
  { key: "ing-cafe-tas", x: 29, y: 15, w: 16, z: -1, r: 20, label: "Café" },
  { key: "ing-cafe-3", x: 44, y: 6, w: 5, z: 2.6, r: -60 },
];

export default async function HomePage() {
  const [{ products, collections }, boxes, hero, maison] = await Promise.all([
    getCatalog(),
    getBoxes(),
    getContent(homeHero.key, homeHero.defaults),
    getContent(homeMaison.key, homeMaison.defaults),
  ]);
  const signature = products.filter((p) => p.collectionSlug === "signature");
  const ephemeral = products.filter((p) => p.collectionSlug === "ephemere");
  const names = new Map(products.map((p) => [p.slug, p.name]));
  const cutUrl = (p: (typeof products)[number]) => (p.images.find((i) => i.role === "cut") ?? p.images[0])?.url;

  const stageCreations: StageCreation[] = signature.flatMap((p) => {
    const card = toCard(p);
    if (!card.main) return [];
    const stage = ambiance(CREATION_STAGE[p.slug] ?? "dattes-naturelles");
    return [{
      slug: p.slug,
      number: card.number,
      name: p.name,
      pairing: p.pairing,
      tagline: p.tagline,
      fromCents: card.fromCents,
      accent: p.palette.accent,
      product: { url: card.main.url, w: card.main.w ?? 412, h: card.main.h ?? 495, alt: card.main.alt },
      stage: stage ? { url: stage.url, alt: stage.alt, credit: stage.credit, blur: stage.blur } : null,
      quick: card.quick,
    }];
  });

  const land = scene("oasis-paysage");
  const oasisLand = land ? { url: land.url, w: land.w, h: land.h, credit: land.credit } : null;
  const oasisDattier = ambiance("dattier-regimes");
  const palme = scene("oasis-palme");
  const oasisPalme = palme ? { url: palme.url, w: palme.w, h: palme.h, credit: palme.credit } : null;
  const metaSteps: MetaStep[] = [
    { key: "palmier", title: "Le palmier", text: "Tout part du dattier et de ses régimes, mûris lentement au soleil des palmeraies.", photo: ambiance("dattier-regimes") },
    { key: "datte", title: "La datte", text: "La Medjool : une chair épaisse et fondante, aux notes de miel et de caramel.", photo: ambiance("medjool-macro") ?? ambiance("dattes-naturelles") },
    { key: "coeur", title: "Le cœur", text: "On l'ouvre pour y loger l'idée de la recette : pistache, praliné, fruits, épices.", photo: ambiance("pistache") },
    { key: "chocolat", title: "Le chocolat", text: "Une coque fine qui craque, puis fond : noir, lait, blanc ou blond selon la création.", photo: ambiance("chocolat") },
    { key: "creation", title: "La création", text: "Dix recettes, dix façons de sublimer la datte : chacune pensée comme une pièce de chocolaterie.", photo: null },
  ].map((st) => ({ ...st, photo: st.photo ? { ...st.photo, w: st.photo.w ?? 0, h: st.photo.h ?? 0 } : null }));
  const creations: MetaCreation[] = products.flatMap((p) => {
    const im = p.images.find((i) => i.role === "main") ?? p.images[0];
    return im ? [{ slug: p.slug, name: p.name, url: im.url, w: im.w ?? 412, h: im.h ?? 495 }] : [];
  });

  const burst: BurstPiece[] = BURST.flatMap((b) => {
    const a = scene(b.key);
    return a ? [{ ...b, url: a.url, natW: a.w, natH: a.h }] : [];
  });
  const burstProduct = concept("produit-cafe-imperial");

  const formats = boxes
    .filter((b) => b.kind !== "entreprise")
    .map((b) => ({ slug: b.slug, name: b.name, pieces: b.pieces, priceCents: b.priceCents, description: b.description, kind: b.kind }));

  const pick = (k: string): AmbianceImage | null => ambiance(k);

  return (
    <>
      {/* 01. Ouverture : le coffret Signature en scène */}
      <Hero {...hero} />

      {/* 02. L'oasis vivante : palmeraie, lumière dorée, puis les dattes sur leur palmier */}
      {oasisLand && oasisDattier && <Oasis landscape={oasisLand} dattier={oasisDattier} foreground={oasisPalme} />}

      {/* 03. La métamorphose : palmier → datte → cœur → chocolat → création */}
      <Metamorphosis steps={metaSteps} creations={creations} />

      {/* 03 bis. Le cœur de la datte : anatomie d'une création */}
      <DateAnatomy image={concept("produit-cafe-imperial")} />

      {/* 04. Les Signatures : chaque création à deux échelles */}
      <SignatureStage creations={stageCreations} intro={collections.find((c) => c.slug === "signature")?.intro ?? ""} />

      {/* 05. L'explosion des saveurs */}
      {burstProduct && <FlavorBurst pieces={burst} product={{ url: burstProduct.url, alt: burstProduct.alt, blur: burstProduct.blur }} />}

      {/* 06. L'art d'offrir : le coffret prend vie, puis les formats */}
      <GiftShowcase coffret={concept("coffret-1")} formats={formats} thumbs={signature.map(cutUrl).filter((u): u is string => Boolean(u))} />

      {/* 07. Composer son coffret */}
      <ComposeTeaser flavors={products.filter((p) => p.purchasable).map(toSwatch)} />

      {/* 08. Les éditions éphémères */}
      <EphemeralPanels
        intro={collections.find((c) => c.slug === "ephemere")?.intro ?? ""}
        items={ephemeral.map((p, i) => {
          const stage = ambiance(CREATION_STAGE[p.slug] ?? "medjool-macro");
          return {
            slug: p.slug,
            name: p.name,
            pairing: p.pairing,
            tagline: p.tagline,
            image: p.images.find((x) => x.role === "main") ?? p.images[0] ?? null,
            stage: stage ? { url: stage.url, alt: stage.alt, credit: stage.credit } : null,
            accent: p.palette.accent,
            edition: i + 1,
          };
        })}
      />

      {/* 09. L'univers Maison Tamrān */}
      <MaisonStory {...maison} main={pick("riad-soleil") ?? pick("riad-lumiere")} photos={[pick("art-de-recevoir"), pick("cafe-oriental"), pick("palmeraie-maroc")]} />

      {/* 10. Professionnels et événements */}
      <ProsSection image={pick("art-de-recevoir")} />

      {/* 11. Lettre d'information (le pied de page signature suit) */}
      <Newsletter consentText={NEWSLETTER_CONSENT_TEXT} />
    </>
  );
}
