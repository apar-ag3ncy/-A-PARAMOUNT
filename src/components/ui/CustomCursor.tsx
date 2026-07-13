"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Desktop custom cursor: the brand arch-"A" monogram IS the pointer, standing
 * perfectly upright (no tilt). Its hotspot is the arch tip (top centre), so the
 * mark sits with its point exactly where you're pointing, and it scales up a
 * touch over interactive elements. It eases toward the pointer for a smooth
 * glide rather than snapping. Skipped on touch; the native cursor is hidden only
 * while this is active.
 */
export default function CustomCursor() {
  const markRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const mark = markRef.current;
    if (!mark) return;

    // Anchor the mark by its top-centre (the arch tip), standing upright.
    gsap.set(mark, {
      xPercent: -50,
      yPercent: 0,
      rotation: 0,
      transformOrigin: "50% 0%",
    });

    // Eases toward the pointer for a smooth glide — a gentle follow, not a snap.
    const xMark = gsap.quickTo(mark, "x", { duration: 0.2, ease: "power3" });
    const yMark = gsap.quickTo(mark, "y", { duration: 0.2, ease: "power3" });

    const move = (e: MouseEvent) => {
      xMark(e.clientX);
      yMark(e.clientY);
    };
    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element &&
      !!t.closest('a, button, [role="tab"], [role="slider"], input, select, textarea');
    // overwrite:"auto" — rapid over/out across nested interactive elements must
    // replace the in-flight tween, not stack competing ones.
    const over = (e: MouseEvent) => {
      if (isInteractive(e.target))
        gsap.to(mark, { scale: 1.18, duration: 0.3, overwrite: "auto" });
    };
    const out = (e: MouseEvent) => {
      if (isInteractive(e.target))
        gsap.to(mark, { scale: 1, duration: 0.3, overwrite: "auto" });
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
    <div
      ref={markRef}
      className="pointer-events-none fixed top-0 left-0 z-[101] hidden h-[26px] w-[30px] will-change-transform lg:block"
    >
      {/* the brand mark as the pointer — a light drop-shadow keeps it legible on
          dark sections (door intro, velvet footer) as well as cream */}
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
  );
}
