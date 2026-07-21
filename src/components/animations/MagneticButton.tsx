"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** "dark" for use on the velvet/dark editorial pages (gold outline → gold fill). */
  tone?: "light" | "dark";
}

/**
 * The primary call-to-action pill.
 *
 * THE NAME IS HISTORICAL — this is NOT magnetic any more, and it should not be made
 * so again without reading this. It used to translate toward the cursor via
 * `gsap.quickTo` on pointermove (PARAMOUNT_SCROLL_UI_PROMPT.md §4.7). That never
 * worked: probed on the PRODUCTION build, the pointer handler fired on every move
 * and passed its guard every time, and the element never translated once — the
 * quickTo setter was inert, so the effect had silently done nothing since it was
 * written and no visitor ever saw it. It was fragile by construction too: the
 * coarse-pointer test was an early return evaluated ONCE at mount against a
 * `[strength]` dep list, so a query answering "coarse" before the viewport settled
 * disabled the button permanently with no way to re-evaluate.
 *
 * Removed at the client's call in favour of a hover that is entirely CSS: a fill
 * sweeps in from the left, the label recolours, a gold hairline draws along the
 * base, the arrow slides in, and the pill lifts slightly. Every one of those is a
 * transition on transform/opacity/colour — declarative, compositor-friendly, and
 * incapable of silently no-opping the way the magnet did. No JS on the interaction
 * path at all.
 *
 * ALIGNMENT, do not regress. TWO things centre this label, and both are load-bearing:
 *  1. The arrow is ABSOLUTE. Inline it sat in flow at opacity 0 and still reserved
 *     its 16px plus a 12px gap, pushing the label 14px off the pill's centre — 33px
 *     of space to its left against 61px to its right.
 *  2. The right padding is SHORTER than the left by exactly the tracking. Tracked
 *     caps leave a space after the last glyph which sits inside the label's box but
 *     carries no ink, so with a symmetric px-9 the visible text still sat 1.4px left
 *     of centre. In em, so it stays correct if the tracking or size changes.
 */
export default function MagneticButton({
  children,
  href,
  onClick,
  className,
  tone = "light",
}: Props) {
  const dark = tone === "dark";

  const inner = cn(
    // No `gap` here — see the alignment note above.
    // `shrink-0 whitespace-nowrap` is load-bearing: every caller centres this inside
    // a `flex justify-center` row, so with the old magnetic wrapper span gone the
    // link became a direct FLEX ITEM and shrank below its content — the label wrapped
    // to two lines and the pill collapsed from 315x54 to 164x94.
    "group relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border py-4 pl-9 pr-[calc(2.25rem-0.2em)] font-display text-sm tracking-[0.2em] whitespace-nowrap uppercase",
    // `transform` is in the transition list for the lift; everything animated here
    // is transform/opacity/colour, so the hover stays cheap on the heaviest page.
    "transition-[color,border-color,box-shadow,transform] duration-500 ease-out hover:-translate-y-0.5",
    dark
      ? "border-gold/50 text-cream hover:border-gold hover:text-[#17110A] hover:shadow-[0_18px_38px_-16px_rgba(226,202,130,0.55)]"
      : "border-olive text-maroon hover:border-olive-deep hover:text-cream hover:shadow-[0_18px_38px_-16px_rgba(79,71,40,0.62)]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
    className,
  );

  const content = (
    <>
      {/* fill sweeping in from the left */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-out group-hover:scale-x-100",
          dark ? "from-gold to-pista" : "from-olive-deep to-olive",
        )}
      />
      {/* gold hairline drawing along the bottom */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gold transition-transform delay-150 duration-500 ease-out group-hover:scale-x-100"
      />
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="absolute right-5 z-10 size-4 -translate-x-2 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </>
  );

  return href ? (
    <Link href={href} className={inner}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={inner}>
      {content}
    </button>
  );
}
