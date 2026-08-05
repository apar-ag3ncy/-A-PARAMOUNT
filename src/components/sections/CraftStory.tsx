import Image from "next/image";
import SlideReveal from "@/components/animations/SlideReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import Button from "@/components/ui/Button";

/**
 * Pure, clean editorial craftsmanship section:
 * Arch-framed Saraswati murti hero (clean, zero floating overlays)
 * with refined typography and primary action CTA.
 */
export default function CraftStory() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 overflow-hidden">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        {/* LHS: Clean Arch Hero Image */}
        <SlideReveal from="left" className="relative lg:col-span-5 flex justify-center">
          <div className="relative aspect-[3/4] w-full max-w-md overflow-hidden rounded-t-[14rem] rounded-b-[2rem] border border-gold/40 bg-cream shadow-[0_20px_60px_-15px_rgba(46,35,19,0.22)] group">
            <Image
              src="/products/wooden-carved-murti.webp"
              alt="Handcrafted carved wooden Saraswati murti"
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority
            />
            {/* Inner Gold Contour Line */}
            <div className="pointer-events-none absolute inset-2 rounded-t-[13.5rem] rounded-b-[1.5rem] border border-gold/35 opacity-80" />
          </div>
        </SlideReveal>

        {/* RHS: Clean Editorial Typography */}
        <SlideReveal from="right" className="lg:col-span-7 flex flex-col justify-center">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-olive/25 bg-olive/10 px-4 py-1.5 backdrop-blur-sm mb-5 w-fit">
            <span className="size-1.5 rounded-full bg-gold" />
            <span className="font-display text-xs font-semibold tracking-[0.2em] text-olive-deep uppercase">
              The Craft &amp; Heritage
            </span>
          </span>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[2.85rem] font-light text-heading-brown leading-[1.15]">
            Engineering Expertise, <br className="hidden sm:inline" />
            <span className="font-normal italic text-olive-deep">Met with Sacred Artistry</span>
          </h2>

          <OrnamentDivider className="mt-4 text-olive/50" />

          <div className="mt-6 space-y-4 font-body text-maroon/85 leading-relaxed">
            <p className="pm-lead">
              For three generations and over fifty years, every piece has been handcrafted to order.
            </p>
            <p className="text-sm sm:text-base text-maroon/75">
              It is the rare combination of engineering precision and sacred artistry that lets us fulfill every temple requirement under one roof, guided by canonical Shastra proportions.
            </p>
          </div>

          <div className="mt-8">
            <Button variant="solid" size="lg" href="/craftsmanship">
              Discover the process
            </Button>
          </div>
        </SlideReveal>
      </div>
    </section>
  );
}
