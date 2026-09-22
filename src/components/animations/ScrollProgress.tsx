"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * ScrollProgress — a gold hairline along the very top of the viewport that
 * draws from left to right as the page is read (scrubbed to the scroll). Sits
 * above the header; withheld with it while the temple doors own the screen
 * (`html.pm-intro .pm-progress` in globals.css).
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } },
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pm-progress pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-olive via-gold to-olive"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
