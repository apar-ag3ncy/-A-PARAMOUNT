"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

// Register once, client-side. ScrollSmoother/SplitText ship free in gsap 3.13+.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
