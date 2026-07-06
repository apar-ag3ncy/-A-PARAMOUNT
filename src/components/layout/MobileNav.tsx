"use client";

import Link from "next/link";
import { useState } from "react";
import { NAV } from "@/lib/constants";

/** Mobile navigation — hamburger toggles a full-width panel. */
export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center text-olive-deep"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div className="fixed inset-x-0 top-[75px] z-40 border-b border-olive/15 bg-cream px-6 py-6">
          <nav className="flex flex-col gap-4">
            {NAV.filter((n) => n.href !== "/").map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="font-display text-sm tracking-[0.14em] text-olive-deep uppercase"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
