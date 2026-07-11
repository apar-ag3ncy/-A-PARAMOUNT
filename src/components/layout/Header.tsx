import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import MegaMenu from "@/components/layout/MegaMenu";
import MobileNav from "@/components/layout/MobileNav";
import Wordmark from "@/components/ui/Wordmark";
import Button from "@/components/ui/Button";

/**
 * Site header — a wide glass bar that floats over the page (inspiration: premium
 * jewelry-store headers). Three zones on one line: navigation LEFT, the brand
 * lockup CENTRED, a circular gallery icon + the Enquire pill RIGHT. The
 * `grid-cols-[1fr_auto_1fr]` keeps the logo optically centred whatever the side
 * zones weigh.
 *
 * The bar is frosted cream (`backdrop-blur`) with an olive hairline, so it reads
 * as a light, elegant sheet rather than the old solid slab. On the olive/photo
 * sections it scrolls over, the blur does the work; on cream, the ring + shadow
 * define it. Olive type throughout (dark-on-light).
 *
 * `--pm-bar-bottom` is the single source of truth for where the bar ends — the
 * MegaMenu panel and MobileNav sheet offset from it. The header stays OUTSIDE
 * `#smooth-content` (ScrollSmoother transforms that subtree, which breaks
 * `sticky`), and `html.pm-intro .pm-header` still lifts it away while the temple
 * doors own the screen.
 */
export default function Header() {
  return (
    <header
      className="pm-header sticky top-0 z-50 px-3 pt-3 sm:px-6"
      style={{ "--pm-bar-bottom": "4.25rem" } as CSSProperties}
    >
      <div className="relative mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full bg-cream/75 px-2.5 shadow-[0_16px_40px_-18px_rgba(46,35,19,0.32)] ring-1 ring-olive/20 backdrop-blur-xl sm:px-3">
        {/* LEFT — navigation (desktop links / mobile hamburger) */}
        <div className="flex items-center">
          <MegaMenu />
          <MobileNav />
        </div>

        {/* CENTRE — the brand lockup, absolutely centred so nav/actions weight
            can't shift it off the middle */}
        <Link
          href="/"
          className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label="A Paramount — home"
        >
          <Image
            src="/brand/a-mark-olive.png"
            alt=""
            width={269}
            height={234}
            priority
            className="h-7 w-auto"
          />
          <Wordmark
            tagline={false}
            className="hidden text-[15px] text-olive-deep sm:inline-flex"
          />
        </Link>

        {/* RIGHT — a circular gallery icon + the one solid action */}
        <div className="flex items-center gap-2">
          <Link
            href="/gallery"
            aria-label="Gallery"
            className="hidden size-10 place-items-center rounded-full text-olive-deep ring-1 ring-olive/25 transition-colors hover:bg-olive-deep hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:grid"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </Link>
          <Button variant="solid" size="md" href="/contact" className="shrink-0">
            Enquire
          </Button>
        </div>
      </div>
    </header>
  );
}
