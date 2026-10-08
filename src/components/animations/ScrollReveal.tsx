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

/** Soft arrival; reverse only after scrolling back above the section. */
export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  start = "top 88%",
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
          duration: 0.95,
          ease: "power3.out",
          delay,
          scrollTrigger: { trigger: el, start: `clamp(${start})`, toggleActions: "play none none reverse" },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [delay, y, start]);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
