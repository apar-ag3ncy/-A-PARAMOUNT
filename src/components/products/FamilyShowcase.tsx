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
}

/**
 * Horizontal family showcase (PARAMOUNT_SCROLL_UI_PROMPT.md §4.4). On desktop the
 * section pins and the strip scrolls sideways as you scroll down; on mobile it
 * degrades to a native horizontal swipe carousel (no pin).
 */
export default function FamilyShowcase({ family, products }: Props) {
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
      className="relative border-t border-olive/10 py-16 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:overflow-hidden lg:py-0"
    >
      <div className="mb-8 px-6 lg:px-[8vw]">
        <SectionHeading
          eyebrow={family.title}
          title={family.blurb}
          align="left"
        />
      </div>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:w-max lg:snap-none lg:overflow-visible lg:px-[8vw] lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                className="h-72 sm:h-80"
                fit="cover"
                frameClassName={cn(
                  "transition-colors duration-[400ms] group-hover:border-olive",
                  arch && "rounded-t-full",
                )}
              />
              <span className="max-w-[16rem] text-center font-display text-xs tracking-[0.18em] text-olive-deep uppercase">
                {p.title}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
