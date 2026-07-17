import AssetFrame from "@/components/ui/AssetFrame";
import SlideReveal from "@/components/animations/SlideReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import Button from "@/components/ui/Button";

/**
 * Editorial split, text (SplitText word reveal) beside an image that reveals via
 * a clip-path wipe + inner scale (PARAMOUNT_SCROLL_UI_PROMPT.md §4.2, §4.3).
 */
export default function CraftStory() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 overflow-x-clip px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-20">
      <SlideReveal from="left">
        <p className="pm-eyebrow font-body mb-4 text-maroon/80">The Craft</p>
        <h2 className="pm-h2 font-display text-heading-brown">
          Engineering expertise, met with artistic skill
        </h2>
        <OrnamentDivider className="mt-5 text-olive/50" />
        <div className="pm-body mt-7 space-y-4 font-body text-maroon/80">
          <p>
            For three generations and over fifty years, every piece has been
            handcrafted to order, premium wood carved to depth, then clad in
            silver, german silver, brass or copper, polished and lacquered for a
            shine that endures.
          </p>
          <p>
            It is the rare combination of engineering and artistry that lets us
            provide every temple need under one roof, with the knowledge of
            shastra guiding each proportion.
          </p>
        </div>
        <div className="mt-8">
          <Button variant="ghost" size="sm" href="/craftsmanship">
            Discover the process
          </Button>
        </div>
      </SlideReveal>

      <SlideReveal from="right" className="overflow-hidden rounded-card">
        <AssetFrame
          src="/products/wooden-carved-murti.webp"
          image={null}
          ratio="4/5"
          fit="cover"
          crop
          showLabel={false}
          sizes="(min-width:1024px) 42vw, 100vw"
        />
      </SlideReveal>
    </section>
  );
}
