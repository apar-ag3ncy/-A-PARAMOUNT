"use client";

import { useRef } from "react";
import { gsap, ScrollSmoother } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  items: string[];
  /** Baseline scroll speed in px/second. */
  pxPerSecond?: number;
  className?: string;
}

/**
 * Velocity-reactive marquee (PARAMOUNT_SCROLL_UI_PROMPT.md §4.6). Scrolls right
 * to left; speeds up and skews with scroll velocity, settles when still.
 */
export default function MarqueeRow({ items, pxPerSecond = 24, className }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const half = track.scrollWidth / 2 || 1;
        const loop = gsap.to(track, {
          xPercent: -50,
          ease: "none",
          duration: half / pxPerSecond,
          repeat: -1,
        });
        const smoother = ScrollSmoother.get();
        const update = () => {
          const v = smoother ? smoother.getVelocity() : 0;
          loop.timeScale(1 + gsap.utils.clamp(0, 5, Math.abs(v) * 0.004));
          gsap.set(track, { skewX: gsap.utils.clamp(-8, 8, v * -0.004) });
        };
        // Only run the per-frame velocity ticker while the marquee is on-screen.
        let active = false;
        const on = () => {
          if (active) return;
          active = true;
          gsap.ticker.add(update);
          loop.play();
        };
        const off = () => {
          if (!active) return;
          active = false;
          gsap.ticker.remove(update);
          loop.pause();
        };
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? on() : off()), {
          threshold: 0,
        });
        io.observe(track);
        return () => {
          off();
          io.disconnect();
        };
      });
    }, track);
    return () => ctx.revert();
  }, [pxPerSecond]);

  const content = [...items, ...items];
  return (
    <div className={cn("overflow-hidden", className)}>
      <div ref={trackRef} className="flex w-max will-change-transform">
        {content.map((it, i) => (
          <span
            key={i}
            className="mx-8 inline-flex items-center gap-8 text-2xl whitespace-nowrap text-olive-deep italic [font-family:var(--font-serif),var(--font-devanagari),serif] sm:text-3xl"
          >
            {it}
            <span aria-hidden className="text-olive/40 not-italic">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
