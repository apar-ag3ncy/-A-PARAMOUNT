import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { FAMILIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Four product families as temple-arch frames (inspo: arch-framed galleries).
 * Alternating data-speed/data-lag give the row a floaty, layered drift under
 * ScrollSmoother; hover lifts the arch and draws the caption underline.
 */
export default function FeaturedFamilies() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-28">
      <ScrollReveal className="mb-16 text-center">
        <p className="mb-4 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          Explore
        </p>
        <h2 className="font-display text-4xl leading-tight font-light text-olive-deep sm:text-5xl">
          Four families, <span className="font-serif text-olive italic">one sanctum</span>
        </h2>
        <div className="mt-6 flex items-center justify-center gap-3 text-olive/50" aria-hidden>
          <span className="h-px w-12 bg-current" />
          <span className="text-[11px]">✦</span>
          <span className="h-px w-12 bg-current" />
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
        {FAMILIES.map((f, i) => (
          <Link
            key={f.slug}
            href={`/products/${f.slug}`}
            className={cn("group block", i % 2 === 1 && "lg:mt-14")}
            data-speed={i % 2 ? 1.03 : 0.97}
            data-lag={i % 2 ? 0.08 : 0}
          >
            <div className="transition-transform duration-500 ease-out group-hover:-translate-y-2">
              <AssetFrame
                image={null}
                ratio="3/4"
                showLabel={false}
                frameClassName="rounded-t-full transition-all duration-500 group-hover:border-olive group-hover:shadow-[0_24px_50px_-28px_rgba(79,26,22,0.45)]"
              />
            </div>
            <div className="mt-5 text-center">
              <p className="font-serif text-base text-olive italic">{f.title}</p>
              <p className="mx-auto mt-1 max-w-[24ch] font-body text-xs text-espresso/60">
                {f.blurb}
              </p>
              <span className="mt-3 inline-block bg-gradient-to-r from-olive-deep to-olive-deep bg-[length:0_1px] bg-[position:left_bottom] bg-no-repeat pb-1 font-display text-[10px] tracking-[0.22em] text-olive-deep uppercase transition-[background-size] duration-500 group-hover:bg-[length:100%_1px]">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
