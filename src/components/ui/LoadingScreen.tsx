"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * First-visit loading screen (build-plan Prompt H): a Devanagari mantra fades in,
 * holds, then the panel lifts away. Shown once per session.
 */
export default function LoadingScreen() {
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useIsomorphicLayoutEffect(() => {
    // The home page hands the first impression to the DoorScroll section
    // (which sets "pm-loaded" at its doors-open handoff). The render gate
    // below already hides the overlay on "/"; latch `done` so a later client-
    // side navigation away from "/" can't surface a stale overlay.
    if (pathname === "/") {
      setDone(true);
      return;
    }
    if (sessionStorage.getItem("pm-loaded")) {
      setDone(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      clearTimeout(failsafe);
      sessionStorage.setItem("pm-loaded", "1");
      setDone(true);
    };
    // Guarantee the overlay is never a dead end, whatever GSAP does.
    const failsafe = setTimeout(finish, 4200);
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

  // Route-only gate, evaluated identically on server and client (no storage
  // reads): "/" never paints the mantra overlay — not even in the SSR HTML —
  // because the DoorScroll section owns the home page's first impression.
  if (done || pathname === "/") return null;

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
