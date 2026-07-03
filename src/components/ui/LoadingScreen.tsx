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
    let failsafe: ReturnType<typeof setTimeout>;
    const finish = () => {
      clearTimeout(failsafe);
      sessionStorage.setItem("pm-loaded", "1");
      setDone(true);
    };
    // Guarantee the overlay is never a dead end, whatever GSAP does.
    failsafe = setTimeout(finish, 4200);
    const tl = gsap.timeline({ onComplete: finish });
    if (reduce) {
      tl.to(el, { opacity: 0, duration: 0.3, delay: 0.6 });
    } else {
      tl.from(".ls-mantra", { opacity: 0, y: 14, duration: 0.8, ease: "power2.out" })
        .to(".ls-mantra", { opacity: 0, duration: 0.6, delay: 0.8 })
        .to(el, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, "-=0.15");
    }
    return () => {
      clearTimeout(failsafe);
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-8 bg-olive"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- pre-hydration overlay */}
      <img
        src="/brand/a-mark-white.png"
        alt=""
        className="ls-mantra h-20 w-auto opacity-90"
      />
      <span className="ls-mantra text-3xl text-cream sm:text-5xl [font-family:var(--font-devanagari),serif]">
        णमो अरिहंताणं
      </span>
    </div>
  );
}
