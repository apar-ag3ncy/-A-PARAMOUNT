import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import BrandDamask from "@/components/ui/BrandDamask";
import { FAMILIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** A photogenic, centre-framed hero photo per family — the arch cover tiles. */
const FAMILY_COVER: Record<string, string> = {
  architecture: "/products/kalash.webp",
  symbols: "/products/angi-mugat.webp",
  ceremonial: "/products/samovasaran-trigadu.webp",
  devotional: "/products/108-diva-aarti.webp",
};

/**
 * Four product families as temple-arch frames (inspo: arch-framed galleries).
 * Alternating data-speed gives the row a layered depth drift under
 * ScrollSmoother (ONE scroll-linked effect per card — no data-lag on top);
 * hover lifts the arch and draws the caption underline.
 */
export default function FeaturedFamilies() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-16 sm:py-28">
      {/* faint brand damask texture on the cream ground (deck p118) */}
      <BrandDamask className="text-olive" opacity={0.045} />

      <ScrollReveal className="relative mb-16 flex justify-center">
        <SectionHeading eyebrow="Explore" title="Four families, one sanctum" />
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
        {FAMILIES.map((f, i) => (
          <Link
            key={f.slug}
            href={`/products/${f.slug}`}
            className={cn("group block", i % 2 === 1 && "lg:mt-14")}
            data-speed={i % 2 ? 1.03 : 0.97}
          >
            <div className="relative transition-transform duration-500 ease-out group-hover:-translate-y-2">
              <AssetFrame
                src={FAMILY_COVER[f.slug]}
                image={null}
                ratio="3/4"
                crop
                fit="cover"
                sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                showLabel={false}
                frameClassName="rounded-t-full transition-[border-color] duration-500 group-hover:border-olive"
              />
              {/* soft gradient scrim so the family name stays legible over the
                  photo and the arch reads as a framed cover, not a raw crop */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-image rounded-t-full"
                style={{
                  background:
                    "linear-gradient(to top, rgba(46,35,19,0.34) 0%, rgba(46,35,19,0.05) 34%, transparent 60%)",
                }}
              />
              {/* Shadow lives on a separate layer so hover only animates opacity (compositor-friendly, no box-shadow repaints). */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-image rounded-t-full opacity-0 shadow-[0_24px_50px_-28px_rgba(79,26,22,0.45)] transition-opacity duration-500 group-hover:opacity-100"
              />
            </div>
            <div className="mt-5 text-center">
              <p className="pm-h3 font-body text-olive italic">{f.title}</p>
              <p className="pm-small mx-auto mt-1 max-w-[26ch] font-body text-espresso/60">
                {f.blurb}
              </p>
              <span className="pm-label mt-3 inline-block bg-gradient-to-r from-olive-deep to-olive-deep bg-[length:0_1px] bg-[position:left_bottom] bg-no-repeat pb-1 font-display text-olive-deep transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
