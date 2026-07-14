"use client";

import Link from "next/link";
import { useRef } from "react";
import AssetFrame from "@/components/ui/AssetFrame";
import SectionHeading from "@/components/ui/SectionHeading";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { productAspect } from "@/lib/productImageDims";
import { cn } from "@/lib/utils";
import type { CatalogCategory } from "@/lib/catalog";

interface Props {
  family: { slug: string; title: string; blurb: string };
  products: CatalogCategory[];
  /** First showcase on the page — drops the top rule so it doesn't butt against
   *  the page header. */
  first?: boolean;
}

/**
 * Horizontal family showcase (PARAMOUNT_SCROLL_UI_PROMPT.md §4.4). On desktop the
 * section pins and the strip scrolls sideways as you scroll down; on mobile it
 * degrades to a native horizontal swipe carousel (no pin).
 */
export default function FamilyShowcase({ family, products, first }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth + 128),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${track.scrollWidth}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative py-16 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden lg:py-0",
        // The first family owns the header's closing whitespace — no stray rule
        // hanging directly under the page intro.
        !first && "border-t border-olive/10",
      )}
    >
      <div className="mb-10 px-6 lg:px-[8vw]">
        <SectionHeading eyebrow="Collection" title={family.title} align="left" />
        <p className="pm-body mt-4 max-w-xl font-body text-espresso/70">
          {family.blurb}
        </p>
      </div>
      {products.length === 0 ? (
        // A premium catalogue never shows a bare void — an awaiting-art frame.
        <div className="flex justify-center px-6 lg:px-[8vw]">
          <div className="flex flex-col items-center gap-3">
            <AssetFrame
              heightDriven
              ratio="3/4"
              showLabel={false}
              className="h-80 sm:h-96 lg:h-[30rem] xl:h-[34rem]"
            />
            <span className="pm-label font-display text-olive/55">
              Pieces coming soon
            </span>
          </div>
        </div>
      ) : (
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:w-max lg:snap-none lg:overflow-visible lg:px-[8vw] lg:pb-0 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => {
          const aspect = productAspect(p.image);
          const isPortrait = aspect != null ? aspect < 0.82 : true;
          // Arch only reads as a temple arch on a tall frame; alternate it
          // among the portrait cards for rhythm, never on a wide one.
          const arch = isPortrait && i % 2 === 1;
          return (
            <Link
              key={p.slug}
              href={`/products/${family.slug}/${p.slug}`}
              className="group flex shrink-0 snap-start flex-col items-center gap-3"
            >
              <AssetFrame
                image={p.heroImage}
                src={p.image}
                heightDriven
                // Equal-height justified row: every card is the same height,
                // its width follows the photo so nothing is cropped or padded.
                ratio="3/4"
                className="h-80 sm:h-96 lg:h-[30rem] xl:h-[34rem]"
                fit="cover"
                frameClassName={cn(
                  "transition-colors duration-[400ms] group-hover:border-olive",
                  arch && "rounded-t-full",
                )}
              />
              <span className="pm-h3 max-w-[18rem] text-center font-display text-olive-deep transition-colors duration-300 group-hover:text-olive">
                {p.title}
              </span>
            </Link>
          );
        })}
      </div>
      )}
    </section>
  );
}
