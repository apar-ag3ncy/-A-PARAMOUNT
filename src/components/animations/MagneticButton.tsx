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
    // Premium fill-wipe: an olive panel sweeps in from the left, the label turns
    // cream, and a gold hairline + arrow slide in — far less flat than a plain
    // colour swap. Everything is transform/opacity, so it stays 60fps.
    "group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-button border border-olive px-8 py-4 font-display text-sm tracking-[0.2em] text-olive-deep uppercase transition-[color,border-color,box-shadow] duration-500 ease-out hover:border-olive-deep hover:text-cream hover:shadow-[0_14px_34px_-16px_rgba(79,71,40,0.6)]",
    className,
  );

  const content = (
    <>
      {/* olive fill sweeping in from the left */}
      <span
        aria-hidden
        className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-olive-deep to-olive transition-transform duration-500 ease-out group-hover:scale-x-100"
      />
      {/* gold hairline drawing along the bottom */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform delay-150 duration-500 ease-out group-hover:scale-x-100"
      />
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="relative z-10 size-4 -translate-x-1 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </>
  );

  return (
    <span ref={ref} className="inline-block">
      {href ? (
        <Link href={href} className={inner}>
          {content}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={inner}>
          {content}
        </button>
      )}
    </span>
  );
}
