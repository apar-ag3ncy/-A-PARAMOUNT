"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AssetFrame from "@/components/ui/AssetFrame";
import { FAMILIES } from "@/lib/constants";
import { categoriesByFamily } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const linkCls =
  "group/nav relative font-display text-[12px] uppercase tracking-[0.18em] text-olive-deep/85 transition-colors hover:text-olive-deep";

/** Elegant hover underline that draws in from the left. */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={linkCls}>
      {children}
      <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-olive transition-transform duration-300 ease-out group-hover/nav:scale-x-100" />
    </Link>
  );
}

/** Small gold corner flourish (inspo: ornamental card corners). */
function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("absolute h-7 w-7 text-olive/50", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      aria-hidden
    >
      <path d="M2,26 L2,10 Q2,2 10,2 L26,2" />
      <path d="M7,20 L7,12 Q7,7 12,7 L20,7" opacity={0.6} />
      <path d="M2,33 l2.6,3 -2.6,3 -2.6,-3 z" fill="currentColor" stroke="none" opacity={0.7} />
    </svg>
  );
}

/**
 * Desktop navigation + the Collections mega-panel — an ornamental, deck-faithful
 * dropdown: damask-washed cream, hairline gold rules, corner flourishes, serif-
 * italic family headings, staggered link entrance, and an arch-framed feature.
 */
export default function MegaMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const enter = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 160);
  };

  return (
    <nav className="hidden items-center gap-8 md:flex">
      <NavLink href="/craftsmanship">Craftsmanship</NavLink>

      <div
        className="relative"
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
      >
        <Link href="/products" className={linkCls} aria-expanded={open}>
          Collections
          <span
            className={cn(
              "absolute -bottom-1.5 left-0 h-px w-full origin-left bg-olive transition-transform duration-300 ease-out",
              open ? "scale-x-100" : "scale-x-0",
            )}
          />
        </Link>

        <div
          onMouseEnter={enter}
          onMouseLeave={leave}
          className={cn(
            "fixed inset-x-0 top-[64px] z-40 transition-all duration-300 ease-out",
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <div className="mx-auto max-w-6xl px-6 pt-3">
            <div
              className="relative overflow-hidden rounded-card border border-olive/25 shadow-[0_24px_60px_-24px_rgba(79,26,22,0.35)]"
              style={{
                background:
                  "radial-gradient(circle at 12% 0%, rgba(226,202,130,0.16), transparent 42%), radial-gradient(circle at 88% 100%, rgba(226,202,130,0.13), transparent 42%), linear-gradient(180deg, #FBF0D9, #F3E4C8)",
              }}
            >
              <Corner className="top-2 left-2" />
              <Corner className="top-2 right-2 -scale-x-100" />
              <Corner className="bottom-2 left-2 -scale-y-100" />
              <Corner className="right-2 bottom-2 -scale-100" />

              <div className="grid gap-8 p-9 pt-8 lg:grid-cols-[1.1fr_repeat(4,1fr)]">
                {/* arch-framed feature */}
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group hidden transition-all duration-500 lg:block",
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                >
                  <AssetFrame
                    image={null}
                    ratio="4/5"
                    showLabel={false}
                    frameClassName="rounded-t-full transition-colors duration-[400ms] group-hover:border-olive"
                  />
                  <p className="mt-3 text-center font-serif text-sm text-olive italic">
                    The Catalogue
                  </p>
                  <p className="mt-0.5 text-center font-display text-[10px] tracking-[0.22em] text-olive/60 uppercase">
                    50 sacred works →
                  </p>
                </Link>

                {FAMILIES.map((f, col) => (
                  <div
                    key={f.slug}
                    className={cn(
                      "transition-all duration-500",
                      open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                    )}
                    style={{ transitionDelay: open ? `${70 + col * 60}ms` : "0ms" }}
                  >
                    <Link
                      href={`/products/${f.slug}`}
                      onClick={() => setOpen(false)}
                      className="font-serif text-[15px] text-olive-deep italic transition-colors hover:text-oxblood"
                    >
                      {f.title}
                    </Link>
                    <div className="mt-2 mb-3 flex items-center gap-2 text-olive/45" aria-hidden>
                      <span className="h-px w-8 bg-current" />
                      <span className="text-[8px]">✦</span>
                      <span className="h-px flex-1 bg-current opacity-40" />
                    </div>
                    <ul className="space-y-2">
                      {categoriesByFamily(f.slug)
                        .slice(0, 6)
                        .map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/products/${f.slug}/${p.slug}`}
                              onClick={() => setOpen(false)}
                              className="font-body text-[12.5px] text-espresso/70 transition-colors hover:text-oxblood"
                            >
                              {p.title}
                            </Link>
                          </li>
                        ))}
                      <li>
                        <Link
                          href={`/products/${f.slug}`}
                          onClick={() => setOpen(false)}
                          className="font-display text-[10px] tracking-[0.18em] text-olive uppercase hover:text-oxblood"
                        >
                          View all →
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavLink href="/about">About</NavLink>
      <NavLink href="/gallery">Gallery</NavLink>
      <NavLink href="/contact">Contact</NavLink>
    </nav>
  );
}
