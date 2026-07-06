import Link from "next/link";
import Image from "next/image";
import MegaMenu from "@/components/layout/MegaMenu";
import MobileNav from "@/components/layout/MobileNav";

/**
 * Site header. The brand lockup uses the ORIGINAL logo artwork (public/brand/*,
 * generated untouched from a-paramount.png) — never re-typeset. Olive variant on
 * the cream ground, per the deck's own usage.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-olive/15 bg-cream/95">
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
          <Image
            src="/brand/paramount-word-olive.png"
            alt="A Paramount — Engineering Works"
            width={1117}
            height={219}
            priority
            className="h-6 w-auto translate-y-[1px]"
          />
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
