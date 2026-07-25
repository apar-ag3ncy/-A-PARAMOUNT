import Image from "next/image";
import SlideReveal from "@/components/animations/SlideReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import Button from "@/components/ui/Button";

/**
 * Editorial split, text beside the handcrafted Saraswati murti framed
 * in an architectural arch-curve container matching the Image 1 shape.
 */
export default function CraftStory() {
  return (
    <section className="mx-auto grid max-w-7xl gap-12 overflow-x-clip px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-20">
      {/* Image container on LHS */}
      <SlideReveal from="left" className="relative flex justify-center lg:justify-start">
        {/* Arch container matching shape: smooth rounded-r-[999px] arc on the right */}
        <div className="relative aspect-square w-full max-w-lg overflow-hidden rounded-r-[999px] rounded-l-3xl border border-olive-muted/30 shadow-[0_20px_50px_-20px_rgba(46,35,19,0.3)] group">
          {/* Saraswati murti & silk background filling the entire arch shape with zero square borders */}
          <Image
            src="/products/wooden-carved-murti.webp"
            alt="Handcrafted carved wooden Saraswati murti"
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(min-width:1024px) 42vw, 100vw"
            priority
          />

          {/* Inner subtle gold hairline border contour along the arch */}
          <div className="pointer-events-none absolute inset-0 rounded-r-[999px] rounded-l-3xl border border-gold/40 opacity-70" />
        </div>
      </SlideReveal>

      {/* Text block on RHS */}
      <SlideReveal from="right">
        <p className="pm-eyebrow font-body mb-4 text-maroon/80">The Craft</p>
        <h2 className="pm-h2 font-display text-heading-brown">
          ENGINEERING EXPERTISE, MET WITH ARTISTIC SKILL
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
    </section>
  );
}
