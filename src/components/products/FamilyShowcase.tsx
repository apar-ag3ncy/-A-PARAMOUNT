"use client";

import Link from "next/link";
import { useRef } from "react";
import AssetFrame from "@/components/ui/AssetFrame";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
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
        <p className="font-serif text-sm text-olive-muted italic">{family.title}</p>
        <h2 className="mt-1 font-display text-3xl font-light text-olive-deep sm:text-4xl">
          {family.blurb}
        </h2>
      </div>
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 lg:w-max lg:snap-none lg:overflow-visible lg:px-[8vw] lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p, i) => (
          <Link
            key={p.slug}
            href={`/products/${family.slug}/${p.slug}`}
            className="group w-64 shrink-0 snap-start sm:w-72"
          >
            <AssetFrame
              image={p.heroImage}
              ratio="3/4"
              caption={p.title}
              frameClassName={
                i % 2
                  ? "rounded-t-full transition-colors duration-[400ms] group-hover:border-olive"
                  : "transition-colors duration-[400ms] group-hover:border-olive"
              }
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
