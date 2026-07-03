import Link from "next/link";
import { SITE } from "@/lib/constants";
import MegaMenu from "@/components/layout/MegaMenu";
import MobileNav from "@/components/layout/MobileNav";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-olive/15 bg-cream/85 px-6 py-4 backdrop-blur-sm">
      <Link
        href="/"
        className="font-display text-sm font-semibold tracking-[0.2em] text-olive-deep uppercase"
      >
        {SITE.shortName}
      </Link>
      <MegaMenu />
      <MobileNav />
    </header>
  );
}
