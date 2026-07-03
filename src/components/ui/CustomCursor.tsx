"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Desktop custom cursor (build-plan Prompt H): a 1:1 dot and a lagging ring that
 * scales up over interactive elements. Skipped on touch; native cursor hidden
 * only while active.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });
    const xDot = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.4, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.4, ease: "power3" });

    const move = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element && !!t.closest('a, button, [role="tab"], input, select, textarea');
    const over = (e: MouseEvent) => {
      if (isInteractive(e.target)) gsap.to(ring, { scale: 1.8, duration: 0.3 });
    };
    const out = (e: MouseEvent) => {
      if (isInteractive(e.target)) gsap.to(ring, { scale: 1, duration: 0.3 });
    };

    document.body.classList.add("has-custom-cursor");
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] hidden h-8 w-8 rounded-full border border-olive/60 lg:block"
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[100] hidden h-1.5 w-1.5 rounded-full bg-olive lg:block"
      />
    </>
  );
}
