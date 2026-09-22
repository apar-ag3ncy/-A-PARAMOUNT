"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import ArchMark from "@/components/ui/ArchMark";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

// The first mount of the app is the initial page load, which the LoadingScreen
// (or the home film) already owns. Every mount after that is a client-side
// navigation — template.tsx remounts on each route change — and gets the wipe.
let mountedOnce = false;

/**
 * PageEnter — the route transition. On navigation a dark olive curtain already
 * covers the new page; the arch mark glows in and out on it, then the curtain
 * wipes upward and the page resolves beneath. The content wrapper animates
 * OPACITY ONLY — a transform there would become the containing block for the
 * pinned sections inside and break their pins. Reduced motion: no curtain.
 */
export default function PageEnter({ children }: { children: ReactNode }) {
  const [animate] = useState(() => mountedOnce);
  const curtain = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    mountedOnce = true;
    if (!animate) return;
    const c = curtain.current;
    const k = content.current;
    const m = mark.current;
    if (!c || !k || !m) return;
    c.style.display = "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      c.style.display = "none";
      return;
    }
    const tl = gsap.timeline({
      onComplete: () => {
        c.style.display = "none";
        gsap.set(k, { clearProps: "opacity" });
      },
    });
    tl.set(k, { opacity: 0 })
      .fromTo(
        m,
        { opacity: 0, scale: 0.82 },
        { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
      )
      .to(m, { opacity: 0, scale: 1.08, duration: 0.3, ease: "power2.in" }, "+=0.2")
      .to(c, { clipPath: "inset(0 0 100% 0)", duration: 0.95, ease: "power4.inOut" }, "-=0.15")
      .to(k, { opacity: 1, duration: 0.8, ease: "power2.out" }, "<0.3");
    return () => {
      tl.kill();
      c.style.display = "none";
      gsap.set(k, { clearProps: "opacity" });
    };
  }, [animate]);

  return (
    <>
      {animate && (
        <div
          ref={curtain}
          aria-hidden
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(145deg, #241D10 0%, #1A140A 50%, #120D05 100%)",
            clipPath: "inset(0 0 0 0)",
          }}
        >
          <div ref={mark} className="opacity-0">
            <ArchMark className="h-14 w-auto text-gold" />
          </div>
        </div>
      )}
      <div ref={content} className={animate ? undefined : "pm-page-enter"}>
        {children}
      </div>
    </>
  );
}
