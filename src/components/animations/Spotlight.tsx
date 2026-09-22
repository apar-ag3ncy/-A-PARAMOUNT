"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  className?: string;
  /** "r,g,b" of the glow. Default is the brand gold. */
  color?: string;
  /** Diameter in px. */
  size?: number;
}

/**
 * Spotlight — a soft glow that follows the pointer across its PARENT (which
 * must be position: relative). Place it as a layer inside a dark panel, under
 * the content. Fine pointers only; it stays dark on touch.
 */
export default function Spotlight({ className, color = "226,202,130", size = 460 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = parent.getBoundingClientRect();
      el.style.setProperty("--sx", `${e.clientX - r.left}px`);
      el.style.setProperty("--sy", `${e.clientY - r.top}px`);
      el.style.opacity = "1";
    };
    const onLeave = () => {
      el.style.opacity = "0";
    };
    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700",
        className,
      )}
      style={{
        background: `radial-gradient(${size}px circle at var(--sx, 50%) var(--sy, 50%), rgba(${color},0.17), rgba(${color},0.05) 45%, transparent 70%)`,
      }}
    />
  );
}
