"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import ArchMark from "@/components/ui/ArchMark";

/**
 * CategoryCards — the pieces in a family, in the same full-bleed card language as
 * the /products collections rail: a tall tile, the photograph filling it, the
 * name bottom-left on an olive scrim, a gradient hairline frame in the brand's
 * two olives.
 *
 * THE CONSTRAINT THAT SHAPES THIS. The collections rail could go full-bleed
 * because its four heroes are in-situ GALLERY photography, which crops freely.
 * A family page lists individual PIECES, and only 30 of the 50 have gallery
 * photography — the rest have a white-ground studio cut-out, or nothing. A studio
 * cut-out must never be cropped (client mandate), so the card cannot simply
 * `object-cover` everything.
 *
 * So one silhouette, three fills:
 *   PHOTO   an installation shot exists  -> object-cover, edge to edge.
 *   STUDIO  only the catalogue cut-out   -> object-CONTAIN, floated on the olive
 *           ground with padding. Nothing is cropped; the dark ground is what
 *           stops it reading as a pale hole punched in the grid.
 *   MARK    neither                      -> the arch monogram on the same ground.
 * Because the frame, scrim, label and motion are identical in all three, a family
 * with mixed sources still reads as one set rather than as a grid with gaps.
 */

export interface PieceCard {
  slug: string;
  title: string;
  /** Installation photo — safe to crop. Wins when present. */
  photo?: string;
  /** White-ground catalogue shot — shown CONTAINED, never cropped. */
  studio?: string;
  finishes: number;
}

export default function CategoryCards({
  items,
  familySlug,
}: {
  items: PieceCard[];
  familySlug: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-piece]", root);
        if (!cards.length) return;
        // Batched so a long family (18 pieces) reveals row by row as it is
        // reached, instead of the whole grid firing off one trigger at the top.
        gsap.set(cards, { yPercent: 6, opacity: 0 });
        const bt = ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              yPercent: 0,
              opacity: 1,
              duration: 0.85,
              ease: "power3.out",
              stagger: 0.07,
              overwrite: true,
            }),
        });
        return () => {
          bt.forEach((t) => t.kill());
          gsap.set(cards, { clearProps: "all" });
        };
      });
    }, root);
    return () => ctx.revert();
  }, [items.length]);

  return (
    // FLEX-WRAP, not a grid, so a PARTIAL LAST ROW CENTRES. A grid pins every
    // item to a column track, which left-aligns the remainder: architecture and
    // ceremonial end on 3 of 4, devotional on 2, symbols on 1, and each of those
    // hung off the left edge under a full row above. The widths below reproduce
    // the grid's own breakpoints exactly — N per row at gap G is
    // (100% - (N-1)G)/N — so nothing about the card sizes changes, only where
    // the last row sits.
    //
    // This is how the family grid behaved before (the old CategoryGrid used the
    // same flex-wrap + justify-center); it was lost when these cards replaced it.
    <div
      ref={rootRef}
      className="flex flex-wrap justify-center gap-3 sm:gap-4"
    >
      {items.map((p, i) => {
        const hasPhoto = Boolean(p.photo);
        const hasStudio = !hasPhoto && Boolean(p.studio);
        return (
          <div
            key={p.slug}
            data-piece
            // 2 per row, then 3 at lg and 4 at xl — the grid's own breakpoints,
            // restated as widths because flex items have no column track.
            className="group/card w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
          >
            {/* gradient hairline frame — the brand's two olives */}
            <div
              className="h-full rounded-[1.25rem] p-px shadow-[0_24px_54px_-40px_rgba(46,35,19,0.5)] transition-shadow duration-500 group-hover/card:shadow-[0_34px_70px_-36px_rgba(46,35,19,0.66)]"
              style={{
                background:
                  "linear-gradient(150deg, #897E49 0%, rgba(137,126,73,0.32) 40%, rgba(124,113,68,0.5) 74%, #7C7144 100%)",
              }}
            >
              <Link
                href={`/products/${familySlug}/${p.slug}`}
                className="relative block h-[clamp(15rem,34vh,21rem)] overflow-hidden rounded-[calc(1.25rem-1px)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                style={{
                  background: hasPhoto
                    ? "#2A2416"
                    : // The olive ground the contained pieces and the monogram
                      // float on. Rotated deterministically by index: 9 of the 18
                      // devotional pieces have no photography at all, so four of
                      // them can land in one row and an identical fill made that
                      // row read as a dead block rather than as pieces awaiting a
                      // shot. Varying the sweep gives the run some rhythm without
                      // inventing content that is not there.
                      [
                        "linear-gradient(160deg, #3B3520 0%, #2E2818 55%, #241F12 100%)",
                        "linear-gradient(205deg, #35301C 0%, #2A2416 60%, #201B10 100%)",
                        "linear-gradient(120deg, #383219 0%, #2C2617 52%, #221D11 100%)",
                      ][i % 3],
                }}
              >
                {hasPhoto ? (
                  <Image
                    src={p.photo as string}
                    alt=""
                    fill
                    sizes="(min-width:1280px) 22vw, (min-width:1024px) 30vw, 46vw"
                    className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.07]"
                  />
                ) : hasStudio ? (
                  <Image
                    src={p.studio as string}
                    alt=""
                    fill
                    sizes="(min-width:1280px) 22vw, (min-width:1024px) 30vw, 46vw"
                    // CONTAIN + padding: the cut-out is never sliced, and it sits
                    // clear of the label at the bottom.
                    className="object-contain p-6 pb-16 transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.05]"
                  />
                ) : (
                  <div className="grid h-full place-items-center pb-10">
                    <ArchMark className="h-14 w-auto text-gold/25" />
                  </div>
                )}

                {/* scrim — only needed under a full-bleed photo; the olive ground
                    already carries the label on the other two */}
                {hasPhoto && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(38,33,18,0.94) 0%, rgba(44,38,20,0.6) 24%, rgba(124,113,68,0.18) 52%, transparent 78%)",
                      }}
                    />
                    {/* and a top one, or the index and finish count disappear into
                        the pale shots — the marble patla and the silver pat are
                        near-white exactly where that row sits. */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-20"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(38,33,18,0.6) 0%, rgba(44,38,20,0.26) 48%, transparent 100%)",
                      }}
                    />
                  </>
                )}

                {/* finishes count, top-right */}
                {p.finishes > 0 && (
                  <span className="pm-micro absolute top-4 right-4 font-body tracking-[0.18em] text-cream/70 uppercase">
                    {p.finishes} {p.finishes === 1 ? "finish" : "finishes"}
                  </span>
                )}

                {/* index, top-left */}
                <span className="pm-micro absolute top-4 left-4 font-body tabular-nums tracking-[0.22em] text-gold/85">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* the name, bottom-left on the image */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <span className="block h-px w-7 bg-gold/70 transition-[width] duration-500 group-hover/card:w-12" />
                  {/* pm-body, not pm-h3. The card name is a caption over a photograph, not a
                    section subheading, and at pm-h3's 24px 13 of the 54 names across
                    the site wrapped to two or three lines. Measured against the true
                    257px label width, 16px puts 53 of them on one line — and it is the
                    efficient stopping point, because going smaller gains nothing: the
                    only name still over is "Aluminium Platform, Railing & Ladder",
                    which needs 11.2px, below the client's 12px floor for small text.
                    16px is an existing ramp step and sits inside the locked 16-18 body
                    bracket. No extra tracking — at 0.06em it would add ~23px to a
                    23-character name and undo the fit it is meant to flatter. */}
                  <h3 className="pm-body mt-2.5 font-display leading-[1.15] text-cream">
                    {p.title}
                  </h3>
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
