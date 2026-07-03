"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

// Register once, client-side. ScrollSmoother/SplitText/Flip ship free in gsap 3.13+.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Flip);
}

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Flip };
