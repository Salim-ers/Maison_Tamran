import { getBoxes, getCatalog, getContent } from "@/lib/catalog";
import { toCard, toSwatch } from "@/lib/present";
import { ambiance, type AmbianceImage } from "@/lib/ambiance";
import { concept } from "@/components/ui/media";
import { Hero } from "@/components/home/hero";
import { FruitStory, type FruitStep } from "@/components/home/fruit-story";
import { DateAnatomy } from "@/components/home/date-anatomy";
import { SignatureShowcase, type ShowcaseProduct } from "@/components/home/signature-showcase";
import { GiftShowcase } from "@/components/home/gift-showcase";
import { Ingredients, type IngredientTile } from "@/components/home/ingredients";
import { EphemeralPanels } from "@/components/home/ephemeral-panels";
import { MaisonStory } from "@/components/home/maison-story";
import { ComposeTeaser } from "@/components/home/compose-teaser";
import { ProsSection } from "@/components/home/pros-section";
import { Newsletter } from "@/components/home/newsletter";
import { NEWSLETTER_CONSENT_TEXT } from "@/lib/texts";
import { RECIPES, type Ingredient } from "@/data/recipes";
import { homeHero, homeMaison } from "@/content/registry/home";

// Ingrédients photographiés (photos d'ambiance) → ingrédients des recettes du catalogue.
const INGREDIENT_TILES: { key: string; label: string; ingredients: Ingredient[] }[] = [
  { key: "pistache", label: "Pistache", ingredients: ["pistache"] },
  { key: "safran", label: "Safran", ingredients: ["safran"] },
  { key: "framboise", label: "Framboise", ingredients: ["framboise"] },
  { key: "cardamome", label: "Cardamome verte", ingredients: ["cardamome"] },
  { key: "rose", label: "Rose", ingredients: ["rose"] },
  { key: "noisette", label: "Noisette", ingredients: ["noisette"] },
  { key: "cafe-grains", label: "Café", ingredients: ["cafe"] },
  { key: "amande", label: "Amande", ingredients: ["amande"] },
  { key: "matcha", label: "Matcha", ingredients: ["matcha"] },
  { key: "coco", label: "Noix de coco", ingredients: ["coco"] },
  { key: "pecan", label: "Noix de pécan", ingredients: ["pecan"] },
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

  const showcase: ShowcaseProduct[] = signature.map((p) => ({
    ...toCard(p),
    tagline: p.tagline,
    tasting: p.tasting,
  }));

  const steps: FruitStep[] = [
    { key: "dattier", title: "Le dattier", text: "Dans les palmeraies, le dattier porte ses fruits par régimes entiers, mûris lentement au soleil.", image: ambiance("palmeraie") },
    { key: "fruit", title: "Le fruit", text: "La Medjool, grosse datte charnue, se récolte quand sa peau se ride et que sa chair devient ambrée.", image: ambiance("dattier-regimes") },
    { key: "chair", title: "La chair", text: "Épaisse et fondante, aux notes de miel et de caramel : elle remplace le sucre et donne la tenue.", image: ambiance("dattes-naturelles") },
    { key: "chocolat", title: "Le chocolat", text: "Noir, lait, blanc ou blond selon la recette : une coque fine qui craque, puis fond.", image: ambiance("chocolat") },
    { key: "garniture", title: "La garniture", text: "Au cœur, l'idée de la recette : pistache et kadaïf, praliné et espresso, rose et litchi…", image: concept("coupe-or-de-marrakech") },
  ].filter((s) => s.image);

  const tiles: IngredientTile[] = INGREDIENT_TILES.flatMap((t) => {
    const image = ambiance(t.key);
    if (!image) return [];
    const recipes = RECIPES.filter((r) => t.ingredients.some((i) => r.ingredients.includes(i)) && names.has(r.slug)).map((r) => ({ slug: r.slug, name: names.get(r.slug)! }));
    return recipes.length ? [{ key: t.key, label: t.label, image, recipes }] : [];
  });

  const formats = boxes
    .filter((b) => b.kind !== "entreprise")
    .map((b) => ({ slug: b.slug, name: b.name, pieces: b.pieces, priceCents: b.priceCents, description: b.description, kind: b.kind }));

  const pick = (k: string): AmbianceImage | null => ambiance(k);

  return (
    <>
      <Hero image={concept("hero")} portrait={concept("hero-portrait")} {...hero} />

      {/* 1. De la nature à la gourmandise */}
      <FruitStory steps={steps} />

      {/* 2. L'anatomie d'une création */}
      <DateAnatomy image={concept("produit-cafe-imperial")} />

      {/* 3. Les créations Signature */}
      <SignatureShowcase products={showcase} intro={collections.find((c) => c.slug === "signature")?.intro ?? ""} />

      {/* 4. L'art d'offrir */}
      <GiftShowcase
        coffret={concept("coffret-1")}
        formats={formats}
        thumbs={signature.map(cutUrl).filter((u): u is string => Boolean(u))}
        ephemeralThumbs={ephemeral.map(cutUrl).filter((u): u is string => Boolean(u))}
      />

      {/* 5. L'univers des ingrédients */}
      <Ingredients tiles={tiles} />

      {/* 6. Éditions éphémères */}
      <EphemeralPanels
        intro={collections.find((c) => c.slug === "ephemere")?.intro ?? ""}
        items={ephemeral.map((p, i) => ({ slug: p.slug, name: p.name, pairing: p.pairing, tagline: p.tagline, image: p.images.find((x) => x.role === "main") ?? p.images[0] ?? null, accent: p.palette.accent, edition: i + 1 }))}
      />

      {/* 7. La Maison */}
      <MaisonStory {...maison} main={pick("palmeraie") ?? pick("riad-lumiere")} detail={pick("riad-lumiere") && pick("palmeraie") ? pick("riad-lumiere") : null} cafe={pick("cafe-oriental")} />

      {/* 8. Composer son coffret */}
      <ComposeTeaser flavors={products.filter((p) => p.purchasable).map(toSwatch)} />

      {/* 9. Professionnels et événements */}
      <ProsSection image={pick("art-de-recevoir")} />

      {/* 10. Lettre d'information (le pied de page signature suit) */}
      <Newsletter consentText={NEWSLETTER_CONSENT_TEXT} />
    </>
  );
}
