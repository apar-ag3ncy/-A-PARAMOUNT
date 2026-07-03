"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { FAMILIES } from "@/lib/constants";
import { categoriesByFamily } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const linkCls =
  "font-body text-sm text-espresso/80 transition-colors hover:text-olive";

/**
 * Desktop navigation with a hover mega-menu (build-plan Prompt C). Hovering
 * "Collections" drops a full-width panel of the four families and their pieces.
 * A short close delay bridges the trigger→panel gap; keyboard users get it via
 * focus. Framer Motion in the plan is replaced by CSS transitions (no extra dep).
 */
export default function MegaMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const enter = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <nav className="hidden items-center gap-7 md:flex">
      <Link href="/craftsmanship" className={linkCls}>
        Craftsmanship
      </Link>

      <div
        className="relative"
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
      >
        <Link href="/products" className={linkCls} aria-expanded={open}>
          Collections
        </Link>
        <div
          onMouseEnter={enter}
          onMouseLeave={leave}
          className={cn(
            "fixed inset-x-0 top-[57px] z-40 transition-all duration-200 ease-out",
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-1 opacity-0",
          )}
        >
          <div className="mx-auto max-w-6xl px-6 pt-2">
            <div className="grid grid-cols-4 gap-8 rounded-card border border-olive/15 bg-cream/97 p-8 shadow-xl backdrop-blur">
              {FAMILIES.map((f) => (
                <div key={f.slug}>
                  <Link
                    href={`/products/${f.slug}`}
                    onClick={() => setOpen(false)}
                    className="font-display text-sm font-medium text-olive-deep transition-colors hover:text-olive"
                  >
                    {f.title}
                  </Link>
                  <ul className="mt-3 space-y-1.5">
                    {categoriesByFamily(f.slug)
                      .slice(0, 7)
                      .map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/products/${f.slug}/${p.slug}`}
                            onClick={() => setOpen(false)}
                            className="font-body text-xs text-espresso/70 transition-colors hover:text-olive"
                          >
                            {p.title}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Link href="/about" className={linkCls}>
        About
      </Link>
      <Link href="/gallery" className={linkCls}>
        Gallery
      </Link>
      <Link href="/contact" className={linkCls}>
        Contact
      </Link>
    </nav>
  );
}
