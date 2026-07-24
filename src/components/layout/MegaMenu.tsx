"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import AssetFrame from "@/components/ui/AssetFrame";
import { FAMILIES } from "@/lib/constants";
import { categoriesByFamily } from "@/lib/catalog";
import { galleryFor } from "@/lib/galleries";
import { cn } from "@/lib/utils";
import OrnamentDivider from "@/components/ui/OrnamentDivider";

/** The currently-hovered piece — drives the arch photo AND the caption subtext
 *  (name + one-line blurb). Kept as one object so a piece with no photo still
 *  reveals its subtext, and the derived `src` keeps the AssetFrame wiring simple. */
type Feature = { src: string | null; title: string; blurb?: string };

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
 * family headings, staggered link entrance, and an arch-framed feature
 * that previews whichever category is hovered.
 */
export default function MegaMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // The left frame previews the hovered category — its photo fills the arch and
  // its name + blurb crossfade into the caption. A tiny clear-delay bridges the
  // gap between leaving one link and entering the next, so sweeping across
  // categories swaps cleanly instead of flashing back to idle between them.
  const [feature, setFeature] = useState<Feature | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const preview = feature?.src ?? null; // derived — keeps the AssetFrame + zoom-key wiring unchanged

  const enter = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => {
      setOpen(false);
      setFeature(null);
    }, 160);
  };
  const showFeature = (f: Feature) => {
    clearTimeout(previewTimer.current);
    setFeature(f);
  };
  const clearFeature = () => {
    previewTimer.current = setTimeout(() => setFeature(null), 90);
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
          {/* px-10/pb-20 give the soft shadow room to fall off INSIDE this
              scroll box — because overflow-y:auto forces overflow-x to compute to
              auto, too little padding would slice the shadow into a hard edge. */}
          <div className="mx-auto max-h-[calc(100svh-var(--pm-bar-bottom)-1.5rem)] max-w-6xl overflow-y-auto px-10 pt-3 pb-20">
            <div
              className="relative overflow-hidden rounded-card border border-olive/25 shadow-[0_3px_6px_-1px_rgba(60,46,20,0.05),0_8px_16px_-5px_rgba(64,48,20,0.06),0_15px_28px_-12px_rgba(68,50,22,0.07),0_26px_42px_-20px_rgba(72,52,22,0.07),0_38px_58px_-30px_rgba(74,54,24,0.06),0_50px_74px_-46px_rgba(74,54,24,0.05),0_36px_72px_-48px_rgba(197,155,74,0.06)]"
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
                {/* arch-framed feature — the hovered piece fills the niche and
                    its name + blurb crossfade into the caption below. */}
                <Link
                  href="/products"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group hidden transition-[opacity,transform] duration-500 lg:block",
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  )}
                >
                  {/* `key` remounts the image on each NEW photo so the entrance
                      zoom (pm-arch-frame, globals.css) replays; keying on the src
                      means grazing two pieces with the same photo won't re-trigger
                      it. The after:* layers paint a carved-niche recess INSIDE the
                      frame (clipped to the arch), pointer-events-none so hover fires. */}
                  <AssetFrame
                    key={preview ?? "idle"}
                    image={null}
                    src={preview ?? undefined}
                    ratio="4/5"
                    fit="cover"
                    crop
                    showLabel={false}
                    sizes="(min-width:1024px) 240px, 0px"
                    frameClassName={cn(
                      "pm-arch-frame rounded-t-full transition-colors duration-[400ms] group-hover:border-olive",
                      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
                      // recess: top-lip catch-light, dark upper interior cast, seated
                      // bottom, faint all-round occlusion — the piece sits BACK, deep.
                      "after:[box-shadow:inset_0_2px_5px_rgba(255,248,228,0.45),inset_0_14px_30px_-12px_rgba(46,35,19,0.5),inset_0_-18px_32px_-16px_rgba(46,35,19,0.4),inset_0_0_22px_rgba(46,35,19,0.18)]",
                      // vignette deepening the arch crown so the centre advances
                      "after:[background:radial-gradient(120%_100%_at_50%_8%,transparent_54%,rgba(46,35,19,0.16))]",
                    )}
                  />

                  {/* caption — two stacked layers crossfade on opacity only (no
                      reflow); idle shows the catalogue line, hover shows the piece.
                      Driven by `feature`, so a category with no photo still reveals
                      its subtext. min-height reserves the tallest state (2-line name
                      + 3-line blurb) so the link columns beside it never shift. */}
                  <div className="relative mt-4 min-h-[6rem]">
                    <div
                      aria-hidden={!!feature}
                      className={cn(
                        "absolute inset-x-0 top-0 transition-opacity duration-300 ease-[cubic-bezier(0.33,0,0.2,1)]",
                        feature ? "opacity-0" : "opacity-100",
                      )}
                    >
                      <p className="text-center font-body text-sm text-maroon">
                        The Catalogue
                      </p>
                      <p className="mt-0.5 text-center font-display text-[12px] tracking-[0.22em] text-maroon/60 uppercase">
                        50 sacred works →
                      </p>
                    </div>

                    <div
                      aria-hidden={!feature}
                      className={cn(
                        "absolute inset-x-0 top-0 transition-opacity duration-300 ease-[cubic-bezier(0.33,0,0.2,1)]",
                        feature ? "opacity-100 delay-[30ms]" : "opacity-0",
                      )}
                    >
                      <p className="text-center font-display text-[12px] leading-[1.3] tracking-[0.16em] text-heading-brown uppercase">
                        {feature?.title}
                      </p>
                      {feature?.blurb && (
                        <p className="mx-auto mt-1.5 max-w-[26ch] overflow-hidden text-center font-body text-[12px] leading-[1.5] text-maroon/70 [-webkit-box-orient:vertical] [-webkit-line-clamp:3] [display:-webkit-box]">
                          {feature.blurb}
                        </p>
                      )}
                    </div>
                  </div>
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
                    <OrnamentDivider
                      width="sm"
                      className="mt-2.5 mb-4 text-olive/45"
                    />
                    <ul className="space-y-2.5">
                      {categoriesByFamily(f.slug)
                        .slice(0, 6)
                        .map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/products/${f.slug}/${p.slug}`}
                              onClick={() => setOpen(false)}
                              onMouseEnter={() =>
                                showFeature({
                                  src: categoryPreview(p.slug, p.image),
                                  title: p.title,
                                  blurb: p.blurb,
                                })
                              }
                              onMouseLeave={clearFeature}
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
                      className="mt-5 inline-block font-display text-[12px] tracking-[0.18em] text-maroon uppercase hover:text-maroon"
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
