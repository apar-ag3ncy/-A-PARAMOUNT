"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import AssetFrame from "@/components/ui/AssetFrame";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import { SITE } from "@/lib/constants";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Home hero (PARAMOUNT_SCROLL_UI_PROMPT.md §4.1). Desktop: pins ~150vh and
 * scrubs a slow background zoom + darkening overlay while the headline reveals.
 * Mobile: a shorter, non-pinned fade (pinning tall sections on mobile hurts).
 */
export default function HomeHero() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=150%",
              pin: true,
              scrub: 1,
            },
          })
          .to(".hero-bg", { scale: 1.15, ease: "none" }, 0)
          .to(".hero-overlay", { opacity: 0.45, ease: "none" }, 0)
          .to(".hero-cue", { opacity: 0, ease: "none", duration: 0.1 }, 0);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="hero relative flex h-[86vh] items-center justify-center overflow-hidden lg:h-screen"
    >
      <div className="hero-bg absolute inset-0 will-change-transform">
        <AssetFrame image={null} fill showLabel={false} priority />
      </div>
      <div className="hero-overlay pointer-events-none absolute inset-0 bg-espresso opacity-0" />

      <div className="relative z-10 px-6 text-center">
        <p className="mb-6 font-display text-[11px] tracking-[0.3em] text-olive uppercase">
          {SITE.name} · Since {SITE.since}
        </p>
        <SplitTextReveal
          as="h1"
          by="chars"
          stagger={0.03}
          className="font-display text-[15vw] leading-[0.98] font-light text-olive-deep sm:text-8xl"
        >
          Crafting Divine
        </SplitTextReveal>
        <SplitTextReveal
          as="div"
          by="chars"
          stagger={0.03}
          delay={0.3}
          className="font-serif text-[16vw] leading-[1] font-medium text-olive italic sm:text-8xl"
        >
          Elegance
        </SplitTextReveal>
        <p className="mx-auto mt-8 max-w-md font-body text-base text-espresso/80">
          {SITE.subtitle}
        </p>
      </div>

      <div className="hero-cue absolute bottom-8 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.3em] text-olive/60 uppercase">
        Scroll
      </div>
    </section>
  );
}
