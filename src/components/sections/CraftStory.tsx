import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import ImageMaskReveal from "@/components/animations/ImageMaskReveal";

/**
 * Editorial split — text (SplitText word reveal) beside an image that reveals via
 * a clip-path wipe + inner scale (PARAMOUNT_SCROLL_UI_PROMPT.md §4.2, §4.3).
 */
export default function CraftStory() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:gap-20">
      <div>
        <p className="mb-4 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          The Craft
        </p>
        <SplitTextReveal
          as="h2"
          by="words"
          className="font-display text-4xl leading-tight font-light text-olive-deep sm:text-5xl"
        >
          Engineering expertise, met with artistic skill
        </SplitTextReveal>
        <div className="mt-7 space-y-4 font-body text-espresso/80">
          <p>
            For three generations and over fifty years, every piece has been
            handcrafted to order — premium wood carved to depth, then clad in
            silver, german silver, brass or copper, polished and lacquered for a
            shine that endures.
          </p>
          <p>
            It is the rare combination of engineering and artistry that lets us
            provide every temple need under one roof, with the knowledge of
            shastra guiding each proportion.
          </p>
        </div>
        <Link
          href="/craftsmanship"
          className="mt-8 inline-block border-b border-olive pb-1 font-display text-xs tracking-[0.18em] text-olive-deep uppercase transition-colors hover:text-olive"
        >
          Discover the process &rarr;
        </Link>
      </div>

      <ImageMaskReveal className="rounded-card">
        <AssetFrame image={null} ratio="4/5" showLabel={false} />
      </ImageMaskReveal>
    </section>
  );
}
