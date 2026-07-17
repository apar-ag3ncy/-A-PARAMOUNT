"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

// useLayoutEffect on the client, useEffect on the server (avoids the SSR warning).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Lenis smooth-scroll foundation (replaced GSAP ScrollSmoother — the client
 * wanted a smoother, calmer glide and Lenis delivers it WITHOUT transforming
 * the content: scroll position stays REAL native scroll, so `position: sticky`
 * works everywhere and ScrollTrigger reads the page directly).
 *
 * Wiring is the canonical Lenis × GSAP pairing: Lenis runs on the gsap ticker
 * (one rAF for everything), pushes ScrollTrigger.update on scroll, and
 * lagSmoothing is off so the two never disagree about time. Touch keeps the
 * native compositor scroll (syncTouch: false) — phones already glide.
 *
 * The #smooth-wrapper / #smooth-content divs remain as PLAIN divs: nothing
 * transforms them any more, but styles/selectors still reference them.
 */
export default function SmoothScrollProvider({
  children,
}: {
  children: ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // native, instant scroll — no smoothing at all

    const lenis = new Lenis({
      lerp: 0.09, // exponential catch-up per frame — the buttery glide
      wheelMultiplier: 0.85, // each wheel notch travels a touch less — calm, unhurried
      smoothWheel: true,
      syncTouch: false, // phones keep native compositor scrolling
    });
    lenisRef.current = lenis;
    setLenis(lenis);

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Recompute once webfonts have swapped in (line splits + trigger positions).
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, []);

  // Content height changes on navigation — reset to top + recompute triggers.
  useIsomorphicLayoutEffect(() => {
    if (lenisRef.current) lenisRef.current.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
