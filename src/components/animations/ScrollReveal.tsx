"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  start?: string;
}

/** Fade-up on scroll (opacity 0->1, y->0). Reduced-motion: instant. */
export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 40,
  start = "top 85%",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(el, {
          opacity: 0,
          y,
          duration: 0.8,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: el, start, once: true },
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
