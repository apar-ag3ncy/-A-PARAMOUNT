"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

// Register once, client-side. SplitText/Flip ship free in gsap 3.13+.
// NOTE: no ScrollSmoother any more — page smoothing is Lenis (SmoothScrollProvider),
// which keeps native scroll (sticky works) and drives ScrollTrigger via the ticker.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
  // Dev-only debug handle: lets a profiler seek timelines to measure per-frame
  // main-thread cost. Stripped from production builds.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __gsap?: unknown }).__gsap = {
      gsap,
      ScrollTrigger,
    };
  }
}

export { gsap, ScrollTrigger, SplitText, Flip };
