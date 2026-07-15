"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AssetFrame from "@/components/ui/AssetFrame";
import ArchMark from "@/components/ui/ArchMark";
import { FAMILIES } from "@/lib/constants";
import { categoriesByFamily } from "@/lib/catalog";
import { galleryFor } from "@/lib/galleries";
import { cn } from "@/lib/utils";

/** Dark-on-light now: the header is a frosted cream bar, so links are
 *  olive-deep and hover deepens + draws the underline. */
const linkCls =
  "group/nav relative font-display text-[12px] uppercase tracking-[0.12em] text-maroon/85 whitespace-nowrap rounded-sm transition-colors hover:text-maroon focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

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

/** The photo shown in the mega-panel's left frame while a category is hovered:
 *  the first image of that category's gallery, else its catalogue photo, else
 *  null (the frame stays empty). */
function categoryPreview(slug: string, image?: string): string | null {
  return galleryFor(slug)?.groups[0]?.images[0]?.src ?? image ?? null;
}

/**
 * Desktop navigation + the Collections mega-panel — an ornamental, deck-faithful
 * dropdown: damask-washed cream, hairline gold rules, corner flourishes, serif-
 * italic family headings, staggered link entrance, and an arch-framed feature
 * that previews whichever category is hovered.
 */
export default function MegaMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // The left frame previews the hovered category's photo. A tiny clear-delay
  // bridges the gap between leaving one link and entering the next, so moving
  // across categories swaps cleanly instead of flashing empty between them.
  const [preview, setPreview] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const enter = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => {
      setOpen(false);
      setPreview(null);
    }, 160);
  };
  const showPreview = (src: string | null) => {
    clearTimeout(previewTimer.current);
    setPreview(src);
  };
  const clearPreview = () => {
    previewTimer.current = setTimeout(() => setPreview(null), 90);
  };

  return (
    <nav className="hidden items-center gap-7 lg:flex">
      <NavLink href="/craftsmanship">Craftsmanship</NavLink>

      {/* `flex items-center` matters: the sibling NavLinks are direct children of
          the flex nav, so the browser blockifies them and centres their full
          line-box. This wrapper would otherwise leave its own link `inline`,
          measured to the glyph box — so "Collections" and its hover underline
          sat ~1.5px below the rest of the bar. */}
      <div
        className="relative flex items-center"
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
            "fixed inset-x-0 top-[calc(var(--pm-bar-bottom)+0.5rem)] z-40 transition-[opacity,transform] duration-300 ease-out",
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-2 opacity-0",
          )}
        >
          <div className="mx-auto max-h-[calc(100svh-var(--pm-bar-bottom)-1.5rem)] max-w-6xl overflow-y-auto px-6 pt-3">
            <div
              className="relative overflow-hidden rounded-card border border-olive/25 shadow-[0_24px_60px_-24px_rgba(79,26,22,0.35)]"
              style={{
                background:
                  "radial-gradient(circle at 12% 0%, rgb(var(--gold-rgb) / 0.16), transparent 42%), radial-gradient(circle at 88% 100%, rgb(var(--gold-rgb) / 0.13), transparent 42%), linear-gradient(180deg, #FBF0D9, #F3E4C8)",
              }}
            >
              <Corner className="top-2 left-2" />
              <Corner className="top-2 right-2 -scale-x-100" />
              <Corner className="bottom-2 left-2 -scale-y-100" />
              <Corner className="right-2 bottom-2 -scale-100" />

              <div className="grid items-start gap-8 p-9 pt-8 lg:grid-cols-[1.1fr_repeat(4,1fr)]">
                {/* arch-framed feature */}
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group hidden transition-[opacity,transform] duration-500 lg:block",
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                >
                  <AssetFrame
                    image={null}
                    src={preview ?? undefined}
                    ratio="4/5"
                    fit="cover"
                    crop
                    showLabel={false}
                    sizes="(min-width:1024px) 240px, 0px"
                    frameClassName="rounded-t-full transition-colors duration-[400ms] group-hover:border-olive"
                  />
                  <p className="mt-3 text-center font-body text-sm text-maroon italic">
                    The Catalogue
                  </p>
                  <p className="mt-0.5 text-center font-display text-[10px] tracking-[0.22em] text-maroon/60 uppercase">
                    50 sacred works →
                  </p>
                </Link>

                {FAMILIES.map((f, col) => (
                  <div
                    key={f.slug}
                    className={cn(
                      "transition-[opacity,transform] duration-500",
                      open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                    )}
                    style={{ transitionDelay: open ? `${70 + col * 60}ms` : "0ms" }}
                  >
                    {/* Reserve two lines for the title so 1-line ("Sacred
                        Symbols") and 2-line ("Temple Architecture") headings end
                        at the same baseline — the dividers and every item row
                        below then align across all four columns. */}
                    <Link
                      href={`/products/${f.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex min-h-[2.4rem] items-end font-display text-[13px] leading-[1.2] tracking-[0.14em] text-heading-brown uppercase transition-colors hover:text-maroon"
                    >
                      {f.title}
                    </Link>
                    <div className="mt-2.5 mb-4 flex items-center gap-2 text-olive/45" aria-hidden>
                      <span className="h-px w-8 bg-current" />
                      <ArchMark className="h-4 w-3 shrink-0" />
                      <span className="h-px flex-1 bg-current opacity-40" />
                    </div>
                    <ul className="space-y-2.5">
                      {categoriesByFamily(f.slug)
                        .slice(0, 6)
                        .map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/products/${f.slug}/${p.slug}`}
                              onClick={() => setOpen(false)}
                              onMouseEnter={() =>
                                showPreview(categoryPreview(p.slug, p.image))
                              }
                              onMouseLeave={clearPreview}
                              className="font-body text-[12.5px] text-maroon/70 transition-colors hover:text-maroon"
                            >
                              {p.title}
                            </Link>
                          </li>
                        ))}
                    </ul>
                    <Link
                      href={`/products/${f.slug}`}
                      onClick={() => setOpen(false)}
                      className="mt-5 inline-block font-display text-[10px] tracking-[0.18em] text-maroon uppercase hover:text-maroon"
                    >
                      View all →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <NavLink href="/about">About</NavLink>
      <NavLink href="/gallery">Gallery</NavLink>
    </nav>
  );
}
