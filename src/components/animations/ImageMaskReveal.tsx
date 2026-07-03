"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  className?: string;
}

/**
 * Clip-path wipe reveal (PARAMOUNT_SCROLL_UI_PROMPT.md §4.3). The frame wipes up
 * from inset(100%) to inset(0) while the inner content scales 1.3 -> 1, for depth.
 * Mark the scaling element with data-mask-inner (defaults to the first child).
 */
export default function ImageMaskReveal({ children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const inner =
      el.querySelector<HTMLElement>("[data-mask-inner]") ??
      (el.firstElementChild as HTMLElement | null);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const st = { trigger: el, start: "top 75%", once: true };
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "power4.inOut", scrollTrigger: st },
        );
        if (inner) {
          gsap.fromTo(
            inner,
            { scale: 1.3 },
            { scale: 1, duration: 1.4, ease: "power4.inOut", scrollTrigger: st },
          );
        }
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={cn("overflow-hidden", className)}>
      {children}
    </div>
  );
}
