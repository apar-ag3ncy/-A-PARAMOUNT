import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import MegaMenu from "@/components/layout/MegaMenu";
import MobileNav from "@/components/layout/MobileNav";
import Wordmark from "@/components/ui/Wordmark";

/**
 * Site header — a floating pill that rides above the page rather than a bar ruled
 * off from it. Olive-deep ground, cream type: the brand's own inversion of the
 * usual light-bar-with-dark-text.
 *
 * Colour is constrained by contrast, not taste: cream on `--color-olive-deep` is
 * 5.27:1 (AA), but cream at 85% falls to 3.84 and gold type falls to 3.58 — so
 * the links stay FULL cream and hover is expressed by the gold underline, never
 * by dimming or tinting the text. The call-to-action inverts to a cream pill with
 * espresso type (14:1), warming to gold on hover (9.5:1).
 *
 * `--pm-bar-bottom` is the single source of truth for where the bar ends. The
 * MegaMenu panel and the MobileNav sheet are `position: fixed` and used to guess
 * it with hard-coded (and disagreeing) `top-[64px]` / `top-[75px]`; both now hang
 * off this variable, which they inherit as DOM descendants of the header.
 *
 * The header still sits OUTSIDE `#smooth-content` (ScrollSmoother transforms that
 * subtree, which would break `sticky`), and `html.pm-intro .pm-header` still lifts
 * the whole thing away while the temple doors own the screen.
 */
export default function Header() {
  return (
    <header
      className="pm-header sticky top-0 z-50 px-4 pt-3 sm:px-6"
      style={{ "--pm-bar-bottom": "4.25rem" } as CSSProperties}
    >
      <div className="mx-auto flex h-14 w-fit max-w-full items-center gap-2 rounded-full bg-olive-deep pr-2 pl-3 shadow-[0_14px_36px_-14px_rgba(46,35,19,0.55)] ring-1 ring-cream/10 sm:gap-4">
        {/* brand lockup — the white monogram, since the ground is now olive */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-full pr-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label="A Paramount — home"
        >
          <Image
            src="/brand/a-mark-white.png"
            alt=""
            width={269}
            height={234}
            priority
            className="h-7 w-auto"
          />
          {/* no tagline here: the pill is slim, and the sub-line only reads as
              noise at this size. It still sits under the mark in the footer. */}
          <Wordmark
            tagline={false}
            className="text-[13px] text-cream sm:text-[15px]"
          />
        </Link>

        <MegaMenu />
        <MobileNav />

        {/* the one solid action, inverted out of the bar — as in the reference */}
        <Link
          href="/contact"
          className="hidden h-10 shrink-0 items-center rounded-full bg-cream px-5 font-display text-[12px] tracking-[0.18em] text-espresso uppercase transition-colors duration-300 hover:bg-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:inline-flex"
        >
          Enquire
        </Link>
      </div>
    </header>
  );
}
