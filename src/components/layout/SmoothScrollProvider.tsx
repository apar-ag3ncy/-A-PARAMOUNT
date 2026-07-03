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
    const ctx = gsap.context(() => {
      smoother.current = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: reduce ? 0 : 1.2, // seconds of catch-up — the butter
        smoothTouch: reduce ? 0 : 0.1, // light touch smoothing, keeps momentum native
        effects: !reduce, // enables data-speed / data-lag parallax
        normalizeScroll: true, // consistent cross-browser mobile behaviour
      });
    });
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
