"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * FadeThrough — content resolves as it rises INTO the frame and dissolves as it
 * rises OUT of it. One continuous move up across the whole passage, with the
 * opacity carried in at the start and out at the end, so a column of these reads
 * as a slow procession rather than a series of arrivals.
 *
 * WHY THIS AND NOT `SlideReveal`. The craftsmanship steps used SlideReveal, which
 * throws each half in from its own side ("a left-to-right roll") and leaves it
 * there. The client asked for the elegant version: rise and fade in, then fade
 * out on the way past. SlideReveal is still correct where a row should ASSEMBLE
 * from two sides (the /about spread), so it stays.
 *
 * ONE timeline, not two triggers. An in-tween and a separate out-tween both
 * writing opacity/y to the same element race whenever their ranges touch, which
 * they do on any element shorter than the gap between their start points. A
 * single scrubbed timeline makes the three beats strictly sequential and gives
 * them fixed proportions of the passage: a quarter to arrive, half held legible,
 * a quarter to leave.
 */
interface Props {
  children: ReactNode;
  className?: string;
  /** px of vertical travel, in and then out again. */
  rise?: number;
  /** Where the element's top is when it starts arriving. */
  start?: string;
  /** Where the element's bottom is when it has finished leaving. */
  end?: string;
}

export default function FadeThrough({
  children,
  className,
  rise = 56,
  start = "top 92%",
  end = "bottom 12%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start, end, scrub: 1 },
        });
        tl.fromTo(
          el,
          { opacity: 0, y: rise },
          { opacity: 1, y: 0, ease: "power2.out", duration: 1 },
        )
          // held: the middle half of the passage is the part you actually read
          .to(el, { opacity: 1, y: 0, duration: 2 })
          .to(el, { opacity: 0, y: -rise, ease: "power2.in", duration: 1 });
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(el, { clearProps: "opacity,transform" });
        };
      });
    }, el);
    return () => ctx.revert();
  }, [rise, start, end]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
