import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  /** ScrollSmoother data-speed: <1 drifts slower (deeper), >1 faster. */
  speed?: number;
  className?: string;
}

/**
 * Depth parallax via ScrollSmoother's data-speed (PARAMOUNT_SCROLL_UI_PROMPT.md
 * §4.5). Inert (no attribute effect) when the smoother is off — mobile/reduced.
 */
export default function ParallaxImage({ children, speed = 0.9, className }: Props) {
  return (
    <div data-speed={speed} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
