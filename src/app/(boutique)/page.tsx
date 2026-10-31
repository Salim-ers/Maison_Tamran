import { getBoxes, getCatalog, getContent } from "@/lib/catalog";
import { toCard, toSwatch } from "@/lib/present";
import { ambiance, type AmbianceImage } from "@/lib/ambiance";
import { concept } from "@/components/ui/media";
import { Hero } from "@/components/home/hero";
import { IntroCurtain } from "@/components/home/intro-curtain";
import { Oasis } from "@/components/home/oasis";
import { Metamorphosis, type MetaBox, type MetaCreation, type MetaStep } from "@/components/home/metamorphosis";
import { scene } from "@/lib/scene";
import { DateAnatomy } from "@/components/home/date-anatomy";
import { SignatureStage, type StageCreation } from "@/components/home/signature-stage";
import { CREATION_STAGE } from "@/lib/creation-visuals";
import { GiftShowcase, type FormatPhoto } from "@/components/home/gift-showcase";
import { TextureReel, type TextureItem } from "@/components/home/texture-reel";
import { EphemeralPanels } from "@/components/home/ephemeral-panels";
import { photo } from "@/lib/photos";
import { boxPhotos } from "@/lib/present";
import { MaisonStory } from "@/components/home/maison-story";
import { ComposeTeaser } from "@/components/home/compose-teaser";
import { ProsSection } from "@/components/home/pros-section";
import { Newsletter } from "@/components/home/newsletter";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/texts";
import { RECIPES } from "@/data/recipes";
import { homeHero, homeMaison } from "@/content/registry/home";

/** Visuel généré (npm run images:openai) au format des photographies d'ambiance : la mention remplace le crédit. */
function generated(id: string): AmbianceImage | null {
  const p = photo(id);
  return p ? { url: p.url, alt: p.alt, role: "extra", w: p.w, h: p.h, blur: p.blur, credit: p.badge, page: "" } : null;
}

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
    // en grand : la création elle-même (photographie haute définition) ; en tirage : son cœur en macro
    const big = (card.main.w ?? 0) >= 1200;
    const stage = big ? { url: card.main.url, alt: card.main.alt, credit: card.main.badge, blur: card.main.blur } : ambiance(CREATION_STAGE[p.slug] ?? "dattes-naturelles");
    const print = big && card.cut ? card.cut : card.main;
    return [{
      slug: p.slug,
      number: card.number,
      name: p.name,
      pairing: p.pairing,
      tagline: p.tagline,
      fromCents: card.fromCents,
      accent: p.palette.accent,
      product: { url: print.url, w: print.w ?? 412, h: print.h ?? 495, alt: print.alt },
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
    { key: "coeur", title: "Le cœur", text: "On l'ouvre pour y loger l'idée de la recette : pistache, praliné, fruits, épices.", photo: generated("meta-coeur") ?? ambiance("pistache") },
    { key: "chocolat", title: "L'enrobage", text: "Une coque fine qui craque, puis fond : noir, lait, blanc ou blond selon la création.", photo: generated("meta-enrobage") ?? ambiance("chocolat") },
    { key: "creation", title: "La création", text: "Chaque pièce terminée rejoint sa caissette : dix recettes, pensées comme des pièces de chocolaterie.", photo: null },
  ].map((st) => ({ ...st, photo: st.photo ? { ...st.photo, w: st.photo.w ?? 0, h: st.photo.h ?? 0 } : null }));
  // 05 : les créations détourées se posent dans le coffret vide, vu de dessus
  const emptyBox = photo("coffret-vide-12");
  const metaPieces = products.flatMap((p) => {
    const pc = photo(`piece-${p.slug}`);
    return pc ? [{ slug: p.slug, url: pc.url }] : [];
  });
  const metaBox: MetaBox | null = emptyBox && metaPieces.length ? { url: emptyBox.url, w: emptyBox.w, h: emptyBox.h, pieces: metaPieces } : null;
  const creations: MetaCreation[] = products.flatMap((p) => {
    const im = p.images.find((i) => i.role === "main") ?? p.images[0];
    return im ? [{ slug: p.slug, name: p.name, url: im.url, w: im.w ?? 412, h: im.h ?? 495 }] : [];
  });

  // au cœur de chaque datte : les dix garnitures en macrophotographie
  const textures: TextureItem[] = products.flatMap((p) => {
    const im = p.images.find((i) => i.role === "cut");
    const r = RECIPES.find((x) => x.slug === p.slug);
    return im && (im.w ?? 0) >= 1200 ? [{ slug: p.slug, name: p.name, coeur: p.tasting?.coeur ?? r?.tasting.coeur ?? "", accent: p.palette.accent, collection: p.collectionSlug, image: { url: im.url, alt: im.alt, blur: im.blur } }] : [];
  });

  // les trois formats en photographie (le Signature : photographie de référence du coffret)
  const formatPhotos: Record<number, FormatPhoto> = {};
  for (const [n, id] of [[6, "coffret-decouverte"], [12, "coffret-1"], [24, "coffret-prestige"]] as const) {
    const p = photo(id);
    if (p) formatPhotos[n] = { url: p.url, w: p.w, h: p.h, blur: p.blur, alt: p.alt };
  }

  const formats = boxes
    .filter((b) => b.kind !== "entreprise")
    .map((b) => ({ slug: b.slug, name: b.name, pieces: b.pieces, priceCents: b.priceCents, description: b.description, kind: b.kind }));

  const pick = (k: string): AmbianceImage | null => ambiance(k);

  return (
    <>
      {/* 00. Ouverture de la Maison (une fois par session) */}
      <IntroCurtain />

      {/* 01. Le coffret Maison Tamrān, fermé puis ouvert au défilement */}
      <Hero {...hero} />

      {/* 02. L'oasis vivante : palmeraie, lumière dorée, puis les dattes sur leur palmier */}
      {oasisLand && oasisDattier && <Oasis landscape={oasisLand} dattier={oasisDattier} foreground={oasisPalme} />}

      {/* 03. La métamorphose : palmier → datte → cœur → chocolat → création */}
      <Metamorphosis steps={metaSteps} creations={creations} box={metaBox} />

      {/* 03 bis. Le cœur de la datte : anatomie d'une création */}
      <DateAnatomy image={concept("produit-cafe-imperial")} />

      {/* 04. Les Signatures : chaque création à deux échelles */}
      <SignatureStage creations={stageCreations} intro={collections.find((c) => c.slug === "signature")?.intro ?? ""} />

      {/* 05. Au cœur de chaque datte : les garnitures en macro, au défilement latéral */}
      {textures.length > 0 && <TextureReel items={textures} />}

      {/* 06. L'art d'offrir : le coffret prend vie, puis les formats */}
      <GiftShowcase coffret={concept("coffret-1")} formats={formats} thumbs={signature.map(cutUrl).filter((u): u is string => Boolean(u))} formatPhotos={formatPhotos} />

      {/* 07. Composer son coffret */}
      <ComposeTeaser flavors={products.filter((p) => p.purchasable).map(toSwatch)} boxPhotos={boxPhotos()} />

      {/* 08. Les éditions éphémères */}
      <EphemeralPanels
        intro={collections.find((c) => c.slug === "ephemere")?.intro ?? ""}
        items={ephemeral.map((p, i) => {
          // la création elle-même en grand ; le tirage posé dessus montre son cœur
          const main = p.images.find((x) => x.role === "main");
          const stage = main && (main.w ?? 0) >= 1200 ? { url: main.url, alt: main.alt, credit: main.badge } : ambiance(CREATION_STAGE[p.slug] ?? "medjool-macro");
          return {
            slug: p.slug,
            name: p.name,
            pairing: p.pairing,
            tagline: p.tagline,
            image: p.images.find((x) => x.role === "cut") ?? main ?? p.images[0] ?? null,
            stage: stage ? { url: stage.url, alt: stage.alt, credit: stage.credit } : null,
            accent: p.palette.accent,
            edition: i + 1,
          };
        })}
      />

      {/* 09. L'univers Maison Tamrān */}
      <MaisonStory {...maison} main={generated("rituel-cafe") ?? pick("riad-soleil")} photos={[pick("art-de-recevoir"), pick("cafe-oriental"), pick("palmeraie-maroc")]} />

      {/* 10. Professionnels et événements */}
      <ProsSection image={generated("pro-hotel") ?? pick("art-de-recevoir")} />

      {/* 11. Lettre d'information (le pied de page signature suit) */}
      <Newsletter consentText={NEWSLETTER_CONSENT_TEXT} />
    </>
  );
}
