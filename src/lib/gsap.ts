"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

// Register once, client-side. ScrollSmoother/SplitText/Flip ship free in gsap 3.13+.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Flip);
  // Dev-only debug handle: lets a profiler seek timelines to measure per-frame
  // main-thread cost. Stripped from production builds.
  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __gsap?: unknown }).__gsap = {
      gsap,
      ScrollTrigger,
      ScrollSmoother,
    };
  }
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Flip };
