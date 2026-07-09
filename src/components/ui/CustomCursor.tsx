"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Desktop custom cursor: the brand arch-"A" monogram IS the pointer, tilted a
 * touch to the left like a real arrow cursor. Its hotspot is the arch tip (top
 * centre), so the mark sits with its point exactly where you're pointing. A
 * faint ring lags behind as a soft halo and expands over interactive elements.
 * Skipped on touch; the native cursor is hidden only while this is active.
 */
const TILT = -15; // degrees — the slight leftward lean of a normal cursor

export default function CustomCursor() {
  const markRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const mark = markRef.current;
    const ring = ringRef.current;
    if (!mark || !ring) return;

    // Anchor the mark by its top-centre (the arch tip) and lean it left; the ring
    // is centred on the pointer.
    gsap.set(mark, {
      xPercent: -50,
      yPercent: 0,
      rotation: TILT,
      transformOrigin: "50% 0%",
    });
    gsap.set(ring, { xPercent: -50, yPercent: -50 });

    // The mark tracks nearly 1:1 (crisp); the ring trails with a soft lag.
    const xMark = gsap.quickTo(mark, "x", { duration: 0.09, ease: "power2" });
    const yMark = gsap.quickTo(mark, "y", { duration: 0.09, ease: "power2" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });

    const move = (e: MouseEvent) => {
      xMark(e.clientX);
      yMark(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element &&
      !!t.closest('a, button, [role="tab"], [role="slider"], input, select, textarea');
    // overwrite:"auto" — rapid over/out across nested interactive elements must
    // replace the in-flight tween, not stack competing ones.
    const over = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        gsap.to(ring, { scale: 1.9, opacity: 0.9, duration: 0.3, overwrite: "auto" });
        gsap.to(mark, { scale: 1.18, duration: 0.3, overwrite: "auto" });
      }
    };
    const out = (e: MouseEvent) => {
      if (isInteractive(e.target)) {
        gsap.to(ring, { scale: 1, opacity: 0.55, duration: 0.3, overwrite: "auto" });
        gsap.to(mark, { scale: 1, duration: 0.3, overwrite: "auto" });
      }
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
        className="pointer-events-none fixed top-0 left-0 z-[100] hidden size-9 rounded-full border border-olive/40 opacity-55 lg:block"
      />
      <div
        ref={markRef}
        className="pointer-events-none fixed top-0 left-0 z-[101] hidden h-[26px] w-[30px] will-change-transform lg:block"
      >
        {/* the brand mark as the pointer — a light drop-shadow keeps it legible
            on dark sections (velvet footer, the door intro) as well as cream */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/a-mark-olive.png"
          alt=""
          aria-hidden
          draggable={false}
          className="h-full w-full object-contain"
          style={{ filter: "drop-shadow(0 1px 2.5px rgba(254,248,235,0.55))" }}
        />
      </div>
    </>
  );
}
