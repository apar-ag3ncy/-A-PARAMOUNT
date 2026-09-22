"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  /** Rendered element. Default div. */
  as?: ElementType;
  by?: "words" | "chars";
  /** "rise": words drift up from behind the line mask. "flip": each glyph
   *  swings up out of the page in 3D (rotationX from -85°) — for headlines. */
  mode?: "rise" | "flip";
  className?: string;
  stagger?: number;
  start?: string;
  delay?: number;
}

/**
 * SplitText line/word/char reveal (PARAMOUNT_SCROLL_UI_PROMPT.md §4.2). Lines are
 * wrapped in overflow:hidden (.split-line) so words rise from behind a mask.
 * House motion system: an unhurried duration 1.5s, ease power2.out, word stagger
 * 0.12 — text drifts up gently as you scroll rather than snapping in (char
 * reveals pass a finer explicit stagger). Reduced-motion: plain text.
 */
export default function SplitTextReveal({
  children,
  as = "div",
  by = "words",
  mode = "rise",
  className,
  stagger = 0.12,
  start = "top 85%",
  delay = 0,
}: Props) {
  const elRef = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        split = new SplitText(el, {
          type: `lines,${by}`,
          linesClass: "split-line",
        });
        const targets = by === "chars" ? split.chars : split.words;
        if (mode === "flip") {
          // perspective on each glyph itself: the CSS `perspective` property
          // only reaches direct children, and the glyphs sit inside the lines.
          gsap.set(targets, { transformPerspective: 800 });
          gsap.from(targets, {
            yPercent: 70,
            rotationX: -85,
            opacity: 0,
            transformOrigin: "50% 100% -14px",
            duration: 1.1,
            ease: "power3.out",
            stagger,
            delay,
            scrollTrigger: { trigger: el, start, once: true },
          });
        } else {
          gsap.from(targets, {
            yPercent: 100,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out",
            stagger,
            delay,
            scrollTrigger: { trigger: el, start, once: true },
          });
        }
        return () => split?.revert();
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const Tag = as;
  return (
    <Tag ref={elRef} className={className}>
      {children}
    </Tag>
  );
}
