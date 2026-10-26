import Image from "next/image";
import Link from "next/link";
import { FadeIn, RevealImage, RevealLines } from "@/components/motion/reveal";
import type { AmbianceImage } from "@/lib/ambiance";

function Photo({ image, sizes, className }: { image: AmbianceImage; sizes: string; className?: string }) {
  return (
    <>
      <Image src={image.url} alt={image.alt} fill sizes={sizes} quality={75} placeholder={image.blur ? "blur" : "empty"} blurDataURL={image.blur} className={className ?? "object-cover"} style={{ objectPosition: image.focus }} />
      <span className="absolute bottom-2 left-3 t-micro text-ivory/75 [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">{image.credit}</span>
    </>
  );
}

/**
 * « Une maison née d'un fruit » : photographies d'ambiance (palmeraie, lumière, café) qui évoquent une culture
 * gastronomique. Aucune ne représente un lieu, un atelier ou une plantation de la maison.
 */
export function MaisonStory({ title, body, signature, main, detail, cafe }: { title: string; body: string; signature: string; main: AmbianceImage | null; detail: AmbianceImage | null; cafe: AmbianceImage | null }) {
  const words = title.split(" ");
  const half = Math.ceil(words.length / 2);
  const lines = words.length > 3 ? [words.slice(0, half).join(" "), words.slice(half).join(" ")] : [title];
  return (
    <section className="relative overflow-hidden bg-ivory section-pad" aria-labelledby="maison-title">
      <div className="container-luxe grid gap-14 lg:grid-cols-12 lg:items-center">
        <div className="relative lg:col-span-7">
          {main && (
            <RevealImage className="aspect-[4/5] sm:aspect-[5/4]" from="left" parallax={7}>
              <Photo image={main} sizes="(min-width: 1024px) 56vw, 100vw" />
            </RevealImage>
          )}
          {detail && (
            <RevealImage className="absolute -bottom-14 right-[-4%] hidden aspect-[3/4] w-[36%] border-[10px] border-ivory md:block" from="bottom" parallax={4}>
              <Photo image={detail} sizes="22vw" />
            </RevealImage>
          )}
        </div>
        <div className="lg:col-span-5 lg:pl-6">
          <p className="t-eyebrow text-bronze">La Maison</p>
          <RevealLines id="maison-title" lines={lines} className="mt-4 t-display-l" />
          <FadeIn delay={0.15}>
            <p className="mt-8 max-w-[46ch] t-lead text-ink-soft">{body}</p>
            <p className="mt-8 font-display text-2xl italic text-bronze">{signature}</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/maison" className="btn btn-outline">Découvrir la Maison</Link>
              <Link href="/savoir-faire" className="t-small link-draw">Le savoir-faire</Link>
            </div>
          </FadeIn>
          {cafe && (
            <FadeIn delay={0.25} className="mt-14 hidden lg:block">
              <div className="relative aspect-[16/10] w-[78%] overflow-hidden">
                <Photo image={cafe} sizes="26vw" />
              </div>
            </FadeIn>
          )}
        </div>
      </div>
    </section>
  );
}
