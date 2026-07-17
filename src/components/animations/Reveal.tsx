"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * A quiet, professional scroll reveal: the block fades and rises into place the
 * first time it enters the viewport (optionally staggering its direct children).
 * Pure enhancement — under reduced motion or without JS it simply stays put and
 * visible. `useIsomorphicLayoutEffect` sets the hidden start state before paint,
 * so there is no flash of the un-animated content.
 */
export default function Reveal({
  children,
  className,
  y = 26,
  delay = 0,
  stagger,
  start = "top 85%",
}: {
  children: ReactNode;
  className?: string;
  /** Rise distance in px. */
  y?: number;
  delay?: number;
  /** When set, animate the wrapper's DIRECT children with this stagger instead. */
  stagger?: number;
  /** ScrollTrigger start position. */
  start?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const targets = stagger != null ? Array.from(el.children) : el;
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.7,
        ease: "power2.out",
        delay,
        ...(stagger != null ? { stagger } : {}),
        scrollTrigger: { trigger: el, start, once: true },
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
