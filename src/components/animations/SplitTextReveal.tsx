"use client";

import {
  createElement,
  useCallback,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  /** Rendered element. Default div. */
  as?: ElementType;
  by?: "words" | "chars";
  className?: string;
  stagger?: number;
  start?: string;
  delay?: number;
}

/**
 * SplitText line/word/char reveal (PARAMOUNT_SCROLL_UI_PROMPT.md §4.2). Lines are
 * wrapped in overflow:hidden (.split-line) so words rise from behind a mask.
 * Reduced-motion: renders plain text, no split.
 */
export default function SplitTextReveal({
  children,
  as = "div",
  by = "words",
  className,
  stagger = 0.03,
  start = "top 82%",
  delay = 0,
}: Props) {
  const elRef = useRef<HTMLElement | null>(null);
  const setRef = useCallback((node: HTMLElement | null) => {
    elRef.current = node;
  }, []);

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
        gsap.from(targets, {
          yPercent: 100,
          opacity: 0,
          duration: 1,
          ease: "power4.out",
          stagger,
          delay,
          scrollTrigger: { trigger: el, start, once: true },
        });
        return () => split?.revert();
      });
    }, el);
    return () => ctx.revert();
  }, []);

  // createElement avoids React 19's polymorphic-ref JSX typing (ref -> never).
  return createElement(as, { ref: setRef, className }, children);
}
