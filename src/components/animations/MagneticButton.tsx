"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  strength?: number;
}

/**
 * Cursor-attracted button (PARAMOUNT_SCROLL_UI_PROMPT.md §4.7). The wrapper span
 * translates toward the cursor within a radius, with a soft elastic settle.
 * Touch devices skip the effect entirely.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  className,
  strength = 0.4,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.5)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.5)" });

    // Rect is measured ONCE on pointerenter and reused for every pointermove —
    // no per-event getBoundingClientRect (layout thrash during smooth-scroll).
    // Any drift from ScrollSmoother movement while hovering is negligible.
    let rect: DOMRect | null = null;

    const enter = () => {
      rect = el.getBoundingClientRect();
    };
    const move = (e: PointerEvent) => {
      const r = rect ?? (rect = el.getBoundingClientRect());
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      xTo((e.clientX - cx) * strength);
      yTo((e.clientY - cy) * strength);
    };
    const leave = () => {
      rect = null;
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  const inner = cn(
    "inline-flex items-center justify-center rounded-button border border-olive px-8 py-4 font-display text-sm uppercase tracking-[0.2em] text-olive-deep transition-colors duration-300 hover:bg-olive hover:text-cream",
    className,
  );

  return (
    <span ref={ref} className="inline-block">
      {href ? (
        <Link href={href} className={inner}>
          {children}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={inner}>
          {children}
        </button>
      )}
    </span>
  );
}
