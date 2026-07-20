"use client";

import { useEffect, useRef } from "react";
import { holdHeader, releaseHeader } from "@/lib/cinema";

const KEY = "footer";
/** Fraction of the viewport the footer must own before the bar steps aside. */
const COVERAGE = 0.6;

/**
 * Lifts the site header away while the footer plate owns the screen.
 *
 * The footer is now a full-viewport closing frame; the frosted cream bar sitting
 * over the top of it read as chrome parked on the artwork. This mounts INSIDE the
 * footer and watches its own `<footer>` parent, so the server-rendered Footer
 * stays a Server Component.
 *
 * The observer is only the WAKE-UP; the gate is viewport COVERAGE, measured fresh
 * off the footer's rect. Not `intersectionRatio`: a footer TALLER than the screen
 * (short phone, wrapped contact lines) can never reach ratio 0.6, so a ratio gate
 * would leave the bar parked on the plate exactly where the screen is smallest.
 *
 * The hold goes through `holdHeader`, never a direct class toggle — on the home
 * page `HomeFilm` holds the same bar, and a naive toggle would let whichever
 * released last win. See `src/lib/cinema.ts`.
 */
export default function FooterHeaderHold() {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = anchor.current?.parentElement;
    if (!el) return;

    let held = false;

    const measure = () => {
      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const covered = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      const on = covered / vh >= COVERAGE;
      if (on === held) return;
      held = on;
      holdHeader(KEY, on);
    };

    const io = new IntersectionObserver(measure, {
      threshold: Array.from({ length: 21 }, (_, i) => i / 20),
    });
    io.observe(el);
    window.addEventListener("resize", measure, { passive: true });

    return () => {
      io.disconnect();
      window.removeEventListener("resize", measure);
      releaseHeader(KEY);
    };
  }, []);

  return <span ref={anchor} aria-hidden className="hidden" />;
}
