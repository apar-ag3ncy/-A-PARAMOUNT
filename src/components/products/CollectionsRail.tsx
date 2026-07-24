"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import OrnamentDivider from "@/components/ui/OrnamentDivider";

/**
 * CollectionsRail — the four families as a row of TALL, full-bleed image cards
 * (client reference: the Higgsfield category rail). The photograph IS the card:
 * no cream mat, no contained float, no caption block underneath — the name sits
 * bottom-left directly on the image over a scrim, and the whole tile is the link.
 *
 * WHY INSTALLATION PHOTOGRAPHY, NOT THE CATALOGUE SHOTS: the /products cards used
 * to show a representative product photo `object-contain` on a warm mat, because
 * the client mandate is that a product shot is NEVER cropped. That mandate is
 * about the white-ground studio cut-outs on the catalogue pages — full-bleed here
 * would slice them. So these four heroes come from the GALLERY set instead (real
 * in-situ photography, the same source the /gallery fan rail crops freely), which
 * is what makes a full-bleed card legitimate.
 *
 * INTERACTION. On a fine pointer the row is an ACCORDION: the hovered card grows
 * and its neighbours yield, so the rail stays exactly the container's width and
 * nothing reflows the page. That is the one honest way to show four tall cards on
 * a wide screen — a scrolling rail would have nothing to scroll. On touch it IS a
 * snap-scrolling rail (the reference's behaviour), because there is no hover to
 * drive an accordion and four cards do not fit a phone.
 *
 * COLOUR. The site reads uniformly beige, so the brand's two olives do the work
 * here: a gradient hairline frame (#897E49 -> #7C7144) around every card, and an
 * olive-tinted scrim rising off the bottom. The scrim is doing double duty — it
 * carries the brand colour AND gives the paler studio-on-marble shots (kalash,
 * bajot) the same depth as the naturally rich ones (the gold doors), so four
 * photographs of very different tonality read as one considered set.
 */

export interface CollectionCard {
  slug: string;
  title: string;
  blurb: string;
  count: number;
  hero: string;
}

export default function CollectionsRail({ items }: { items: CollectionCard[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", root);
        if (!cards.length) return;
        // The reveal is a RISE + UNMASK, staggered left to right: each card wipes
        // up from its own bottom edge rather than fading, so the photograph
        // arrives like a curtain going up instead of a browser image loading.
        gsap.set(cards, { yPercent: 8, opacity: 0, clipPath: "inset(100% 0% 0% 0%)" });
        const st = gsap.to(cards, {
          yPercent: 0,
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.05,
          ease: "power3.out",
          stagger: 0.11,
          scrollTrigger: { trigger: root, start: "top 82%", once: true },
        });
        // SCROLL-LINKED PARALLAX inside each card. The frame is fixed but the
        // photograph drifts against it, so the rail keeps moving as the page
        // scrolls rather than snapping into place and going dead — the thing the
        // reference does that makes a static row feel alive. `scale` is what
        // buys the travel: the image is oversized by the same amount it moves,
        // so it can drift without ever exposing an edge. Alternating direction
        // per card stops the four reading as one sliding sheet.
        const imgs = gsap.utils.toArray<HTMLElement>("[data-par]", root);
        const pars = imgs.map((img, idx) =>
          gsap.fromTo(
            img,
            { yPercent: idx % 2 ? 5 : -5 },
            {
              yPercent: idx % 2 ? -5 : 5,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.1, // eased catch-up, so it glides rather than tracks 1:1
              },
            },
          ),
        );

        return () => {
          st.scrollTrigger?.kill();
          st.kill();
          pars.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
          gsap.set(cards, { clearProps: "all" });
          gsap.set(imgs, { clearProps: "all" });
        };
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      // Touch: a real snap rail (the reference). Fine pointer: one flex row that
      // never overflows, so the accordion can redistribute width instead.
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-4 [scrollbar-width:none] sm:gap-4 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((c, i) => (
        <div
          key={c.slug}
          data-card
          // basis-[78%] on touch = a card and a peek of the next, which is what
          // tells a thumb the row scrolls. lg: every card is equal until hovered.
          className="group/card relative shrink-0 basis-[78%] snap-center sm:basis-[46%] lg:shrink lg:basis-0 lg:grow lg:transition-[flex-grow] lg:duration-[650ms] lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:hover:grow-[1.85]"
        >
          {/* gradient hairline frame — the brand's two olives, drawn as a 1.5px
              padded wrapper so the radius stays true on both edges */}
          <div
            className="h-full rounded-[1.5rem] p-[1.5px] shadow-[0_30px_70px_-45px_rgba(46,35,19,0.55)] transition-shadow duration-500 group-hover/card:shadow-[0_44px_90px_-40px_rgba(46,35,19,0.7)]"
            style={{
              background:
                "linear-gradient(150deg, #897E49 0%, rgba(137,126,73,0.35) 38%, rgba(124,113,68,0.55) 72%, #7C7144 100%)",
            }}
          >
            <Link
              href={`/products/${c.slug}`}
              className="relative block h-[clamp(23rem,54vh,34rem)] overflow-hidden rounded-[calc(1.5rem-1.5px)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              style={{ background: "#2A2416" }}
            >
              {/* The parallax moves THIS wrapper, the hover-zoom scales the image
                  inside it — two transforms on two elements, so neither fights
                  the other. -inset-y-[7%] oversizes it past the travel (±5%), so
                  the drift can never expose an edge. */}
              <div data-par className="absolute -inset-y-[7%] inset-x-0 will-change-transform">
                <Image
                  src={c.hero}
                  alt=""
                  fill
                  sizes="(min-width:1024px) 34vw, (min-width:640px) 46vw, 78vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.07]"
                />
              </div>

              {/* olive-tinted scrim: carries the brand colour AND gives the paler
                  studio shots the same depth as the naturally rich ones */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(38,33,18,0.94) 0%, rgba(44,38,20,0.62) 22%, rgba(124,113,68,0.20) 48%, rgba(137,126,73,0.06) 68%, transparent 84%)",
                }}
              />

              {/* A matching scrim at the TOP. Without it the index and the piece
                  count vanish into the pale shots — the crowned murti and the
                  kalash are near-white exactly where this row sits, and metadata
                  that is only legible on half the cards is worse than none. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(38,33,18,0.62) 0%, rgba(44,38,20,0.28) 45%, transparent 100%)",
                }}
              />

              {/* index — top-left, gold, tiny */}
              <span className="pm-micro absolute top-5 left-5 font-body tabular-nums tracking-[0.24em] text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* piece count — top-right */}
              <span className="pm-micro absolute top-5 right-5 font-body tracking-[0.2em] text-cream/85 uppercase">
                {c.count} {c.count === 1 ? "piece" : "pieces"}
              </span>

              {/* the label, bottom-left on the image (reference layout) */}
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <OrnamentDivider width="sm" className="text-gold/70" />
                {/* pm-small (14px). The card name is a caption over a photograph, not a
                    section subheading; at pm-h3's 24px, 13 of the 54 names across the site
                    wrapped to two or three lines. Measured against the label's true 257px
                    content width, 16px already put 53 of them on one line and 14px keeps all
                    53 — the only name still over is "Aluminium Platform, Railing & Ladder",
                    which measures 385px against 274px available and needs 11.2px, below the
                    client's 12px floor. No type size rescues that one; it needs a shorter
                    name. 14px is an existing ramp step inside the locked 12-14 small-text
                    bracket, so this stays in the ramp rather than hand-picking a size (the
                    literal 5% ask, 15.2px, falls in the gap between the 12-14 and 16-18
                    brackets and would sit outside the spec). No extra tracking: at 0.06em it
                    would add ~23px to a 23-character name and undo the fit. */}
                <h2 className="pm-small mt-3 font-display leading-[1.15] text-cream uppercase">
                  {c.title}
                </h2>
                {/* the blurb + cue ride in on hover — the card stays clean at rest */}
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:grid-rows-[1fr] motion-reduce:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <p className="pm-small mt-2 max-w-[26ch] font-body text-cream/75">
                      {c.blurb}
                    </p>
                    <span className="pm-micro mt-3 inline-flex items-center gap-2 font-body tracking-[0.22em] text-gold uppercase">
                      Explore
                      <span aria-hidden className="text-base leading-none">
                        →
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
