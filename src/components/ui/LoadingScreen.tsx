"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * First-visit loading screen (build-plan Prompt H): a Devanagari mantra fades in,
 * holds, then the panel lifts away. Shown once per session.
 */
export default function LoadingScreen() {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (sessionStorage.getItem("pm-loaded")) {
      setDone(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      sessionStorage.setItem("pm-loaded", "1");
      setDone(true);
    };
    const tl = gsap.timeline({ onComplete: finish });
    if (reduce) {
      tl.to(el, { opacity: 0, duration: 0.3, delay: 0.6 });
    } else {
      tl.from(".ls-mantra", { opacity: 0, y: 14, duration: 0.8, ease: "power2.out" })
        .to(".ls-mantra", { opacity: 0, duration: 0.6, delay: 0.8 })
        .to(el, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.15");
    }
    return () => {
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-olive"
    >
      <span className="ls-mantra text-4xl text-cream sm:text-6xl [font-family:var(--font-devanagari),serif]">
        णमो अरिहंताणं
      </span>
    </div>
  );
}
