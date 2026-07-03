import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import ParallaxImage from "@/components/animations/ParallaxImage";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { FAMILIES } from "@/lib/constants";

/**
 * Four product families in a 2x2 grid (PARAMOUNT_SCROLL_UI_PROMPT.md §4.5 depth
 * + hover). Frames drift at depth via data-speed; hover scales the frame and
 * fades in an "Explore" overlay.
 */
export default function FeaturedFamilies() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <ScrollReveal className="mb-14 text-center">
        <p className="mb-4 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          Explore
        </p>
        <h2 className="font-display text-4xl leading-tight font-light text-olive-deep sm:text-5xl">
          Four families, one sanctum
        </h2>
      </ScrollReveal>

      <div className="grid gap-6 sm:grid-cols-2">
        {FAMILIES.map((f, i) => (
          <Link key={f.slug} href={`/products/${f.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-card">
              <ParallaxImage speed={i % 2 ? 0.94 : 1.06}>
                <AssetFrame
                  image={null}
                  ratio="4/3"
                  showLabel={false}
                  frameClassName="rounded-card border-transparent transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
                />
              </ParallaxImage>
              <div className="absolute inset-0 flex items-end bg-espresso/0 p-7 transition-colors duration-500 group-hover:bg-espresso/25">
                <span className="translate-y-2 font-display text-xs tracking-[0.2em] text-cream uppercase opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  Explore &rarr;
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-serif text-sm text-olive-muted italic">
                {f.title}
              </p>
              <p className="mt-1 font-body text-sm text-espresso/70">{f.blurb}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
