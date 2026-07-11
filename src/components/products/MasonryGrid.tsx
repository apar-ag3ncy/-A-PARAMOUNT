"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { batchReveal, showInstantly } from "@/lib/reveal";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Pinterest-style masonry (PARAMOUNT_SCROLL_UI_PROMPT.md §2).
 * Pure CSS multi-column for bulletproof responsiveness; a single
 * ScrollTrigger.batch (never one trigger per card) reveals items in staggered
 * waves. `key`-changing children (material filter) re-run the reveal.
 */
export default function MasonryGrid({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIso(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const items = el.querySelectorAll<HTMLElement>(".masonry-item");
      const mm = gsap.matchMedia();

      // reduced motion — show instantly
      mm.add("(prefers-reduced-motion: reduce)", () => showInstantly(items));

      // full — rise, fade and settle in staggered waves
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        batchReveal(items, { start: "top 88%", stagger: 0.08 });
        ScrollTrigger.refresh();
      });
    }, el);
    return () => ctx.revert();
  }, [children]);

  return (
    <div
      ref={ref}
      className="columns-1 [column-gap:1.5rem] sm:columns-2 lg:columns-3 xl:columns-4"
    >
      {children}
    </div>
  );
}
