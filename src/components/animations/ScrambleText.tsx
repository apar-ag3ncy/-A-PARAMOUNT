"use client";

import { useRef, type ElementType } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  start?: string;
  delay?: number;
}

/**
 * ScrambleText — a tracked-caps label decodes into place the first time it
 * scrolls into view: glyphs cycle and resolve left to right (ScrambleTextPlugin).
 * Renders the final text on the server, so without JS or under reduced motion
 * the label is simply there.
 */
export default function ScrambleText({
  text,
  as = "span",
  className,
  duration = 1.1,
  start = "top 90%",
  delay = 0,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(el, {
          duration,
          delay,
          ease: "none",
          scrambleText: {
            text,
            chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ◇✦",
            speed: 0.55,
            revealDelay: 0.12,
            tweenLength: false,
          },
          scrollTrigger: { trigger: el, start, once: true },
        });
        return () => {
          el.textContent = text;
        };
      });
    }, el);
    return () => ctx.revert();
  }, [text]);

  const Tag = as;
  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
