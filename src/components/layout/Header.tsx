import type { CSSProperties } from "react";
import Link from "next/link";
import Image from "next/image";
import MegaMenu from "@/components/layout/MegaMenu";
import MobileNav from "@/components/layout/MobileNav";
import Wordmark from "@/components/ui/Wordmark";
import Button from "@/components/ui/Button";

/**
 * Site header — a full-width cream bar that matches the hero ground, with the
 * brand lockup on the LEFT and the navigation + Enquire on the RIGHT (the site's
 * original arrangement). Frosted cream (`bg-cream` + backdrop-blur) with a fine
 * olive rule under it, so it reads as one calm sheet over cream and stands clear
 * over the darker sections it scrolls across. Olive type throughout.
 *
 * `--pm-bar-bottom` is the single source of truth for where the bar ends — the
 * MegaMenu panel and MobileNav sheet offset from it, and so does the pinned
 * /gallery stage. It is `4rem + 1px`: the h-16 row PLUS the hairline rule, which
 * is part of the bar's border-box (the bar measures 65px, not 64 — a plain 4rem
 * left content sitting 1px under the rule). It is ALSO declared on `:root` in
 * globals.css, because custom properties inherit only to DESCENDANTS and the page
 * content is not one (the header sits outside `#smooth-content`) — keep the two
 * in sync. `html.pm-intro .pm-header` lifts the bar away while the temple doors
 * own the screen.
 */
export default function Header() {
  return (
    <header
      className="pm-header sticky top-0 z-50 border-b border-olive/12 bg-cream/90 backdrop-blur-md"
      style={{ "--pm-bar-bottom": "calc(4rem + 1px)" } as CSSProperties}
    >
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6">
        {/* LEFT — the brand lockup */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          aria-label="A Paramount — home"
        >
          <Image
            src="/brand/a-mark-olive.png"
            alt=""
            width={269}
            height={234}
            priority
            className="h-8 w-auto"
          />
          <Wordmark
            tagline={false}
            className="text-[15px] text-olive-deep sm:text-[16px]"
          />
        </Link>

        {/* RIGHT — navigation + the one solid action */}
        <div className="flex items-center gap-5 lg:gap-8">
          <MegaMenu />
          <Button
            variant="solid"
            size="md"
            href="/contact"
            className="hidden shrink-0 sm:inline-flex"
          >
            Enquire
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
