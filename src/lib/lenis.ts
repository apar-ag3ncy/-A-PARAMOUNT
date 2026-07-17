"use client";

import type Lenis from "lenis";

/**
 * The one Lenis instance, owned by SmoothScrollProvider. A module singleton so
 * consumers (e.g. MarqueeRow's velocity-reactive loop) can read it without
 * threading props through the tree — the same role ScrollSmoother.get() used to
 * play before the smoother was swapped for Lenis.
 */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null): void => {
  instance = l;
};

export const getLenis = (): Lenis | null => instance;
