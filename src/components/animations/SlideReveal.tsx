"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * SlideReveal — content rolls in horizontally as it enters the viewport: it
 * starts offset to one side, slightly turned, and settles upright. Scrubbed by
 * ScrollTrigger so the motion tracks the scroll (a "left-to-right roll"), and
 * plays once. Reduced-motion shows everything instantly.
 *
 * `from` sets the side it enters from. Pair two of them ("left" for the text,
 * "right" for the image) to make an editorial row assemble as you reach it.
 */
interface Props {
  children: ReactNode;
  className?: string;
  from?: "left" | "right";
  /** px of horizontal travel. Keep modest on unclipped sections to avoid a
   *  transient horizontal scrollbar. */
  distance?: number;
  /** deg of roll; 0 for a pure slide. */
  rotate?: number;
  delay?: number;
  start?: string;
}

export default function SlideReveal({
  children,
  className,
  from = "left",
  distance = 80,
  rotate = 3,
  delay = 0,
  start = "top 90%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dir = from === "left" ? -1 : 1;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(el, {
          opacity: 0,
          x: dir * distance,
          rotation: dir * rotate,
          transformOrigin: from === "left" ? "left center" : "right center",
          duration: 1,
          ease: "power2.out",
          delay,
          scrollTrigger: {
            trigger: el,
            start,
            end: "top 45%",
            scrub: 1.5, // roll tracks the scroll, smoothed so it eases in slowly
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
