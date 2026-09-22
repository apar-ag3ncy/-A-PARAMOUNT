"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  start?: string;
  end?: string;
}

/**
 * ScrubWords — a reading light: the words sit faint and brighten one after
 * another as the block is scrolled through, tracking the hand (scrubbed, both
 * directions). For a short line of display copy; not for body paragraphs.
 */
export default function ScrubWords({
  children,
  as = "div",
  className,
  start = "top 82%",
  end = "top 38%",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    let split: SplitText | undefined;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        split = new SplitText(el, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            stagger: 0.12,
            ease: "none",
            scrollTrigger: { trigger: el, start, end, scrub: 0.6 },
          },
        );
        return () => split?.revert();
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const Tag = as;
  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
