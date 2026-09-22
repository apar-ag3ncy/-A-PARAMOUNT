"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  className?: string;
  /** Max degrees of lean. */
  max?: number;
  /** Degrees per px/frame of Lenis velocity. */
  factor?: number;
}

/**
 * VelocitySkew — the block leans with the scroll: fast scrolling skews it a few
 * degrees in the direction of travel, and it settles upright as the page does
 * (gsap.quickTo, so the lean eases in and out). Reads Lenis velocity, so under
 * reduced motion (no Lenis) it does nothing. The per-frame read runs only while
 * the block is on screen. Do NOT wrap pinned sections — it is a transform.
 */
export default function VelocitySkew({
  children,
  className,
  max = 5,
  factor = 0.06,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const skew = gsap.quickTo(el, "skewY", { duration: 0.5, ease: "power3.out" });
        let active = false;
        const tick = () => {
          const l = getLenis();
          const v = l ? l.velocity : 0;
          skew(gsap.utils.clamp(-max, max, v * factor));
        };
        const io = new IntersectionObserver(([e]) => {
          if (e.isIntersecting && !active) {
            active = true;
            gsap.ticker.add(tick);
          } else if (!e.isIntersecting && active) {
            active = false;
            gsap.ticker.remove(tick);
            skew(0);
          }
        });
        io.observe(el);
        return () => {
          io.disconnect();
          if (active) gsap.ticker.remove(tick);
          gsap.set(el, { clearProps: "transform" });
        };
      });
    }, el);
    return () => ctx.revert();
  }, [max, factor]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
