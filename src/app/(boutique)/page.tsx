import { getBoxes, getCatalog, getContent } from "@/lib/catalog";
import { boxPhotos, toCard, toSwatch } from "@/lib/present";
import { ambiance } from "@/lib/ambiance";
import { photo } from "@/lib/photos";
import { Hero } from "@/components/home/hero";
import { IntroCurtain } from "@/components/home/intro-curtain";
import { SignatureStage, type StageCreation } from "@/components/home/signature-stage";
import { CREATION_STAGE } from "@/lib/creation-visuals";
import { CraftStrip, type CraftStep } from "@/components/home/craft-strip";
import { ComposeTeaser, type TeaserFormat } from "@/components/home/compose-teaser";
import { EphemeralPanels } from "@/components/home/ephemeral-panels";
import { HouseDuo } from "@/components/home/house-duo";
import { Newsletter } from "@/components/home/newsletter";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/texts";
import { homeHero, homeMaison } from "@/content/registry/home";

const picture = (p: { url: string; alt: string; blur?: string } | null) => (p ? { url: p.url, alt: p.alt, blur: p.blur } : null);

/**
 * Accueil, en sept temps et sans détour : le coffret s'ouvre, les Signatures, le savoir-faire en un écran,
 * les coffrets à composer, les éditions éphémères, la Maison et les professionnels, la lettre d'information.
 */
export default async function HomePage() {
  const [{ products, collections }, boxes, hero, maison] = await Promise.all([
    getCatalog(),
    getBoxes(),
    getContent(homeHero.key, homeHero.defaults),
    getContent(homeMaison.key, homeMaison.defaults),
  ]);
  const signature = products.filter((p) => p.collectionSlug === "signature");
  const ephemeral = products.filter((p) => p.collectionSlug === "ephemere");

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

  const craft: CraftStep[] = [
    { key: "palmier", title: "Le palmier", text: "Tout part du dattier et de ses régimes, mûris lentement au soleil des palmeraies.", image: picture(ambiance("dattier-regimes")) },
    { key: "datte", title: "La datte", text: "La Medjool : une chair épaisse et fondante, aux notes de miel et de caramel.", image: picture(ambiance("medjool-macro")) },
    { key: "coeur", title: "Le cœur", text: "On l'ouvre pour y loger l'idée de la recette : pistache, praliné, fruits, épices.", image: picture(photo("meta-coeur")) },
    { key: "enrobage", title: "L'enrobage", text: "Une coque fine qui craque, puis fond : noir, lait, blanc ou blond selon la création.", image: picture(photo("meta-enrobage")) },
  ];

  const formats: TeaserFormat[] = boxes
    .filter((b) => b.pieces && [6, 12, 24].includes(b.pieces) && b.kind !== "entreprise" && b.kind !== "edition-limitee")
    .map((b) => ({ pieces: b.pieces!, name: b.name, priceCents: b.priceCents }));

  return (
    <>
      {/* 00. Ouverture de la Maison (une fois par session) */}
      <IntroCurtain />

      {/* 01. Le coffret Maison Tamrān, fermé puis ouvert au défilement */}
      <Hero {...hero} />

      {/* 02. Les Signatures : chaque création à deux échelles */}
      <SignatureStage creations={stageCreations} intro={collections.find((c) => c.slug === "signature")?.intro ?? ""} />

      {/* 03. De la palmeraie à la création */}
      <CraftStrip steps={craft} />

      {/* 04. Les coffrets : formats, prix, composition en direct */}
      <ComposeTeaser flavors={products.filter((p) => p.purchasable).map(toSwatch)} boxPhotos={boxPhotos()} formats={formats} />

      {/* 05. Les éditions éphémères */}
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

      {/* 06. La Maison et les professionnels */}
      <HouseDuo {...maison} maisonImage={picture(photo("rituel-cafe"))} prosImage={picture(photo("pro-hotel"))} />

      {/* 07. Lettre d'information (le pied de page signature suit) */}
      <Newsletter consentText={NEWSLETTER_CONSENT_TEXT} />
    </>
  );
}
