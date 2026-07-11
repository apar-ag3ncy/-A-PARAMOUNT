import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * The masonry staggered-reveal used by `CategoryBrowser`'s product grid (and any
 * future grid): the ScrollTrigger.batch dance lives here once, out of the
 * component, rather than pasted inline.
 *
 * Cards start hidden (opacity 0 + an offset, set by the caller's CSS/markup) and
 * this reveals them in staggered waves. `ScrollTrigger.batch` uses ONE trigger
 * for the whole set — never one per card — and each wave is promoted to its own
 * compositor layer only while it animates, then released, so no idle layer is
 * left behind.
 *
 * Call `batchReveal` inside a `no-preference` matchMedia branch and
 * `showInstantly` inside the `reduce` branch.
 */

/** Reduced-motion path: drop the cards into their final state with no motion. */
export function showInstantly(items: ArrayLike<Element>): void {
  gsap.set(items, { opacity: 1, y: 0, scale: 1, clearProps: "willChange" });
}

interface RevealOptions {
  /** ScrollTrigger start position. Default "top 88%". */
  start?: string;
  /** Per-card stagger in seconds. Default 0.08. */
  stagger?: number;
}

export function batchReveal(
  items: ArrayLike<Element>,
  { start = "top 88%", stagger = 0.08 }: RevealOptions = {},
): void {
  ScrollTrigger.batch(items, {
    start,
    once: true,
    onEnter: (batch) => {
      gsap.set(batch, { willChange: "transform, opacity" });
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: "power3.out",
        stagger,
        overwrite: true,
        onComplete: () => gsap.set(batch, { willChange: "auto" }),
      });
    },
  });
}
