"use client";

import { useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/** A reversible fade with a generous reading interval and short, soft edges. */
interface Props {
  children: ReactNode;
  className?: string;
  /** px of vertical travel, in and then out again. */
  rise?: number;
  /** Where the element's top is when it starts arriving. */
  start?: string;
  /** Where the element's bottom is when it has finished leaving. */
  end?: string;
  /** Scale while faded out (1 = no scaling). */
  scale?: number;
  /** px of blur while faded out (0 = none; filters cost, use on a few blocks). */
  blur?: number;
}

export default function FadeThrough({
  children,
  className,
  rise = 32,
  start = "top 92%",
  end = "bottom 0%",
  scale = 1,
  blur = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Above-the-fold copy must be readable before the first scroll.
        const bounds = el.getBoundingClientRect();
        const startsVisible = bounds.top < window.innerHeight * 0.75 && bounds.bottom > 0;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: `clamp(${start})`, end, scrub: 0.25 },
        });
        // filter is only written when a blur is asked for — a `filter` on the
        // element, even blur(0), makes it a stacking context and costs paint.
        const out = blur > 0 ? { filter: `blur(${blur}px)` } : {};
        const inn = blur > 0 ? { filter: "blur(0px)" } : {};
        tl.fromTo(
          el,
          startsVisible
            ? { opacity: 1, y: 0, scale: 1, ...inn }
            : { opacity: 0, y: rise, scale, ...out },
          { opacity: 1, y: 0, scale: 1, ...inn, ease: "power2.out", duration: 1 },
        )
          // Hold at full opacity through most of the viewport for comfortable reading.
          .to(el, { opacity: 1, y: 0, scale: 1, ...inn, duration: 3.5 })
          .to(el, { opacity: 0, y: -rise, scale, ...out, ease: "power2.in", duration: 1 });
        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(el, { clearProps: "opacity,transform,filter" });
        };
      });
    }, el);
    return () => ctx.revert();
  }, [rise, start, end, scale, blur]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
