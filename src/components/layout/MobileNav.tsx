"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV } from "@/lib/constants";

/**
 * Mobile navigation — the hamburger lives inside the header's olive pill (hence
 * cream, not olive), and the sheet it opens is a rounded card that hangs off the
 * header's `--pm-bar-bottom` rather than the old hard-coded `top-[75px]`.
 */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 items-center justify-center rounded-full text-cream transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-x-4 top-[calc(var(--pm-bar-bottom)+0.5rem)] z-40 rounded-3xl bg-olive-deep px-6 py-6 shadow-[0_20px_50px_-20px_rgba(46,35,19,0.6)] ring-1 ring-cream/10">
          <nav className="flex flex-col gap-1">
            {/* "/" is the logo, "/contact" is the Enquire button below. */}
            {NAV.filter((n) => n.href !== "/" && n.href !== "/contact").map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 font-display text-sm tracking-[0.14em] text-cream uppercase transition-colors hover:bg-cream/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex h-11 items-center justify-center rounded-full bg-cream px-5 font-display text-[12px] tracking-[0.18em] text-espresso uppercase transition-colors hover:bg-gold"
            >
              Enquire
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
