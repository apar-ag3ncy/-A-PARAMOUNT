"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  /** Give it the SAME border-radius as the card inside, so the glare clips to it. */
  className?: string;
  /** Degrees of tilt at the card's edge. */
  max?: number;
  /** Scale while hovered. */
  lift?: number;
  /** A soft gold sheen that follows the pointer. */
  glare?: boolean;
}

/**
 * TiltCard — the card leans toward the pointer in 3D (perspective rotateX/Y via
 * gsap.quickTo, so it eases rather than snaps) and lifts slightly, with a gold
 * glare tracking the hand. Fine pointers only; touch, and reduced-motion, leave
 * the card flat. Wrap the card, not its contents: the wrapper carries the
 * transform, the glare is an absolute layer above the children.
 */
export default function TiltCard({
  children,
  className,
  max = 7,
  lift = 1.02,
  glare = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const g = glareRef.current;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        gsap.set(el, { transformPerspective: 900 });
        const rx = gsap.quickTo(el, "rotationX", { duration: 0.55, ease: "power3.out" });
        const ry = gsap.quickTo(el, "rotationY", { duration: 0.55, ease: "power3.out" });
        const sc = gsap.quickTo(el, "scale", { duration: 0.55, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          if (e.pointerType === "touch") return;
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          ry((px - 0.5) * 2 * max);
          rx(-(py - 0.5) * 2 * max);
          sc(lift);
          if (g) {
            g.style.setProperty("--gx", String(px * 100));
            g.style.setProperty("--gy", String(py * 100));
            g.style.opacity = "1";
          }
        };
        const onLeave = () => {
          rx(0);
          ry(0);
          sc(1);
          if (g) g.style.opacity = "0";
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        el.addEventListener("pointercancel", onLeave);
        return () => {
          el.removeEventListener("pointermove", onMove);
          el.removeEventListener("pointerleave", onLeave);
          el.removeEventListener("pointercancel", onLeave);
          gsap.set(el, { clearProps: "transform,transformPerspective" });
        };
      });
    }, el);
    return () => ctx.revert();
  }, [max, lift]);

  return (
    <div ref={ref} className={cn("relative will-change-transform", className)}>
      {children}
      {glare && (
        <div
          ref={glareRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500"
          style={
            {
              "--gx": 50,
              "--gy": 50,
              background:
                "radial-gradient(440px circle at calc(var(--gx) * 1%) calc(var(--gy) * 1%), rgba(226,202,130,0.22), rgba(226,202,130,0.06) 40%, transparent 66%)",
            } as CSSProperties
          }
        />
      )}
    </div>
  );
}
