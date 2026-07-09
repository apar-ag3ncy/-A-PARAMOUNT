import Link from "next/link";
import Image from "next/image";
import MegaMenu from "@/components/layout/MegaMenu";
import MobileNav from "@/components/layout/MobileNav";
import Wordmark from "@/components/ui/Wordmark";

/**
 * Site header. The arch-"A" monogram is the original logo GLYPH (public/brand/*);
 * the PARAMOUNT wordmark beside it is live text set in the real Storica face
 * (see Wordmark). Olive on the cream ground, per the deck's own usage.
 */
export default function Header() {
  return (
    <header className="pm-header sticky top-0 z-50 border-b border-olive/15 bg-cream/95">
      {/* fine gold top rule */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-olive/60 to-transparent" />
      <div className="flex items-center justify-between px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-3.5" aria-label="A Paramount — home">
          <Image
            src="/brand/a-mark-olive.png"
            alt=""
            width={269}
            height={234}
            priority
            className="h-11 w-auto"
          />
          <Wordmark className="translate-y-[1px] text-[19px] text-olive" />
        </Link>
        {/* Bump the top-level nav link size a step (12px -> 13px) from here so the
            MegaMenu file stays untouched; scoped to the nav's direct links only —
            the mega panel's inner links and MobileNav keep their own sizes. */}
        <div className="contents [&>nav>a]:text-[13px] [&>nav>div>a]:text-[13px]">
          <MegaMenu />
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
