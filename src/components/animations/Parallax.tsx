"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  /** Size this like the picture's own box (e.g. "absolute inset-0"). */
  className?: string;
  /** Fraction of the box's height the picture travels while it crosses the viewport. */
  speed?: number;
}

/**
 * Parallax — the picture moves a little slower than the page (scrubbed
 * ScrollTrigger, top-of-viewport to bottom), scaled up just enough that its
 * edges never show. Put a `fill` Image inside; the inner layer is positioned so
 * `fill` works. Reduced motion: static.
 */
export default function Parallax({ children, className, speed = 0.18 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    const inner = innerRef.current;
    if (!el || !inner) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(inner, { scale: 1 + speed + 0.02 });
        gsap.fromTo(
          inner,
          { yPercent: -speed * 50 },
          {
            yPercent: speed * 50,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        return () => {
          gsap.set(inner, { clearProps: "transform" });
        };
      });
    }, el);
    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      <div ref={innerRef} className="absolute inset-0 will-change-transform">
        {children}
      </div>
    </div>
  );
}
