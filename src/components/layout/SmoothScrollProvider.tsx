"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger, ScrollSmoother } from "@/lib/gsap";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * ScrollSmoother foundation (PARAMOUNT_SCROLL_UI_PROMPT.md §0).
 * Renders the required #smooth-wrapper / #smooth-content structure and creates
 * the smoother inside a gsap.context so teardown is clean. Header/CustomCursor
 * live OUTSIDE this wrapper so they stay pinned to the viewport.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const smoother = useRef<ScrollSmoother | null>(null);
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const ctx = gsap.context(() => {
      smoother.current = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: reduce ? 0 : 1.05, // seconds of catch-up — buttery but responsive
        smoothTouch: 0, // keep native compositor touch scrolling on phones
        effects: !reduce, // enables data-speed / data-lag parallax
        normalizeScroll: finePointer, // JS scroll normalization only for mouse/trackpad devices
        ignoreMobileResize: true, // no re-layout jank on mobile address-bar show/hide
      });
    });
    // Recompute once webfonts have swapped in (line splits + trigger positions).
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    return () => ctx.revert();
  }, []);

  // Content height changes on navigation — recompute scroll length + reset to top.
  useIsomorphicLayoutEffect(() => {
    smoother.current?.scrollTo(0, false);
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
