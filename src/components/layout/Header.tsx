import Link from "next/link";
import { NAV, SITE } from "@/lib/constants";

// Minimal branded header. MegaMenu (hover, 4 families) lands in Prompt C.
export default function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-olive/15 bg-cream/85 px-6 py-4 backdrop-blur-sm">
      <Link
        href="/"
        className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-olive-deep"
      >
        {SITE.shortName}
      </Link>
      <nav className="hidden gap-7 md:flex">
        {NAV.filter((n) => n.href !== "/").map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="font-body text-sm text-espresso/80 transition-colors hover:text-olive"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
