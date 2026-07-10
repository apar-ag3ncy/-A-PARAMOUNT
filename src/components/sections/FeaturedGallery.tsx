"use client";

import Link from "next/link";
import Image from "next/image";
import { type CSSProperties, useCallback, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { FAMILIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * "Selected Works" — the reference layout: a warm near-black panel, a huge
 * "OUR WORKS" title with a small note beside it, and five product cards
 * arranged as a SYMMETRIC FAN.
 *
 * Fan geometry, measured off the reference:
 *  • card tops are ~level, and cards grow taller toward the centre, so their
 *    bottoms sweep down in an arc;
 *  • the outer cards tilt away from centre (left CCW, right CW — confirmed
 *    from the slope of each card's label);
 *  • the centre card is upright, largest, "featured": it carries a tag pill and
 *    a bigger, sentence-case name (Inter — Storica is caps-only), while the
 *    outer cards use small tracked caps.
 *
 * NOTHING IS CROPPED. Each slot fixes only the card's HEIGHT (that is what
 * draws the arc); the width is derived by the browser from the photo's own
 * intrinsic `aspect-ratio`, so the frame always matches the image exactly and
 * `object-cover` has no overflow to discard. This is why every WORK below is a
 * portrait photo of the same ~0.56 ratio: mixing a 1.34 landscape into this fan
 * would either crop it or blow the card's width out past its neighbours. Pieces
 * that own only landscape/square photography (kalash, mandir, chattar,
 * divistand, dhwajadand) therefore live on their category pages, not here.
 *
 * Because width follows height, the row height is stepped per breakpoint so the
 * five widths + gaps + the rotation bulge always fit the panel's inner width
 * (min(1280, vw - 48) - 80). A single fixed height would clip at lg.
 *
 * Below `lg` the fan collapses to a plain snap-scroll rail (a rotated fan is
 * unreadable on a phone); the same arrows then scroll that rail. Those cards are
 * ratio-matched too.
 */

/** Curated: the strongest portrait photo of each piece, chosen by eye. Ordered
 *  so tones alternate gold/silver and adjacent silhouettes differ; the piece at
 *  index 2 lands in the upright centre slot on first paint. */
const WORKS = [
  { slug: "brass-gate", src: "/gallery/brass-gate/all/00.webp", w: 900, h: 1600 },
  { slug: "rath", src: "/gallery/rath/all/03.webp", w: 900, h: 1600 },
  { slug: "kalpavruksh-naan", src: "/gallery/kalpavruksh-naan/all/00.webp", w: 893, h: 1600 },
  { slug: "samovasaran-trigadu", src: "/gallery/samovasaran-trigadu/all/04.webp", w: 893, h: 1600 },
  { slug: "doors", src: "/gallery/doors/diamond-door/01.webp", w: 893, h: 1600 },
  { slug: "vyaakhyan-kamal", src: "/gallery/vyaakhyan-kamal/all/03.webp", w: 893, h: 1600 },
  { slug: "brass-grill-jali", src: "/gallery/brass-grill-jali/all/06.webp", w: 900, h: 1600 },
  { slug: "vyaakhyan-paat", src: "/gallery/vyaakhyan-paat/all/04.webp", w: 893, h: 1600 },
] as const;

const FAMILY_TITLE = new Map(FAMILIES.map((f) => [f.slug, f.title]));

// Derived from module constants — resolve once, outside render.
const ITEMS = WORKS.map((work) => {
  const category = CATEGORIES.find((c) => c.slug === work.slug);
  if (!category) return null;
  return {
    ...work,
    title: category.title,
    href: `/products/${category.family}/${category.slug}`,
    // The photo's own group label is "All" for most pieces, so the pill names
    // the family rather than inventing a material the photo may not show.
    tag: FAMILY_TITLE.get(category.family) ?? "",
  };
}).filter((x): x is NonNullable<typeof x> => x !== null);

const VISIBLE = 5;

/** Per-slot fan geometry, centre = slot 2. Only the HEIGHT is set (as a % of the
 *  row); width follows the photo's aspect-ratio. Tops sit near-level, so the
 *  growing heights are what sweep the bottoms into an arc. */
const FAN = [
  { h: "68%", rot: -9, lift: -8 },
  { h: "82%", rot: -5, lift: -3 },
  { h: "100%", rot: 0, lift: 0 }, // featured
  { h: "82%", rot: 5, lift: -3 },
  { h: "68%", rot: 9, lift: -8 },
];

export default function FeaturedGallery() {
  const railRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(0);

  const step = useCallback((dir: number) => {
    // Desktop: advance the fan window. Mobile: scroll the rail.
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setStart((s) => (s + dir + ITEMS.length) % ITEMS.length);
      return;
    }
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-card]");
    const by = card ? card.offsetWidth + 20 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: dir * by, behavior: "smooth" });
  }, []);

  if (ITEMS.length < VISIBLE) return null;

  const fanned = Array.from(
    { length: VISIBLE },
    (_, i) => ITEMS[(start + i) % ITEMS.length],
  );

  return (
    <section className="bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-14 text-cream ring-1 ring-cream/10 sm:px-10 sm:py-16"
        style={{
          background:
            "radial-gradient(120% 100% at 15% 0%, #4A4428 0%, #332815 55%, #1E1709 100%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 12% 0%, rgba(226,202,130,0.16), transparent 60%)",
          }}
        />

        {/* header — small note beside the huge title, as in the reference */}
        <div className="relative z-10 mb-12 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-10">
          <p className="max-w-[15rem] font-body text-[13px] leading-relaxed text-cream/55">
            Three generations of engineering and artistry — each piece
            handcrafted for Jain derasars and Hindu temples.
          </p>
          <div>
            <p className="mb-2 font-display text-[11px] tracking-[0.34em] text-[#E2CA82] uppercase">
              Selected Works
            </p>
            <h2 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.9] font-light text-cream">
              Our Works
            </h2>
          </div>
        </div>

        {/* ---------- desktop: the fan ----------
            The row HEIGHT drives the card widths (width = height x photo ratio),
            so the height must shrink with the viewport or the fan overflows the
            panel and overflow-hidden clips the outer cards. Panel inner width is
            min(1280, vw - 48) - 80; the row needs ~2.24*H + gaps + the rotation
            bulge. These three steps keep >=40px of slack at 1024/1280/1536. */}
        <div className="relative z-10 hidden h-[21rem] items-start justify-center gap-4 lg:flex xl:h-[26rem] xl:gap-6 2xl:h-[28rem]">
          {fanned.map((c, slot) => {
            const g = FAN[slot];
            const featured = slot === 2;
            return (
              <Link
                key={`${c.slug}-${slot}`}
                href={c.href}
                data-fan-card
                className={cn(
                  "group relative w-auto shrink-0 overflow-hidden rounded-[22px] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.85)] transition-transform duration-500 ease-out hover:z-10",
                  "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2CA82]",
                  // Hover grows the CARD, not the image inside it. Zooming an
                  // image within a fixed frame would crop it; scaling the frame
                  // and the image together keeps the photo whole.
                  "[transform:translateY(var(--lift))_rotate(var(--rot))]",
                  "hover:[transform:translateY(calc(var(--lift)_-_10px))_rotate(var(--rot))_scale(1.04)]",
                )}
                style={
                  {
                    height: g.h,
                    aspectRatio: `${c.w} / ${c.h}`,
                    "--lift": `${g.lift}px`,
                    "--rot": `${g.rot}deg`,
                  } as CSSProperties
                }
              >
                <Image
                  src={c.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 22vw, 1px"
                  className="object-cover"
                />
                {/* scrim for label legibility */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
                />

                {featured && c.tag && (
                  <span className="absolute top-4 left-4 rounded-full bg-cream/20 px-3 py-1.5 font-body text-[11px] text-cream backdrop-blur-md">
                    {c.tag}
                  </span>
                )}

                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 block px-4 pb-4 text-cream",
                    featured
                      ? "px-6 pb-6 font-body text-lg"
                      : "font-display text-[11px] tracking-[0.14em] uppercase",
                  )}
                >
                  {c.title}
                </span>
                <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-cream/10 transition-colors duration-500 group-hover:ring-[#E2CA82]/50" />
              </Link>
            );
          })}
        </div>

        {/* ---------- mobile/tablet: plain snap rail ---------- */}
        {/* items-start matters: flex's default `stretch` would equalise the card
            heights, overriding aspect-ratio and cropping the photos whose ratio
            differs slightly (900/1600 vs 893/1600). */}
        <div
          ref={railRef}
          className="relative z-10 flex snap-x snap-mandatory items-start gap-5 overflow-x-auto pb-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ITEMS.map((c) => (
            <Link
              key={c.slug}
              href={c.href}
              data-card
              className="group relative w-[64%] shrink-0 snap-start overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E2CA82] sm:w-[38%]"
              style={{ aspectRatio: `${c.w} / ${c.h}` }}
            >
              <Image
                src={c.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 1px, (min-width: 640px) 38vw, 64vw"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"
              />
              <span className="absolute inset-x-0 bottom-0 block px-4 pb-4 font-display text-[11px] tracking-[0.14em] text-cream uppercase">
                {c.title}
              </span>
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cream/10" />
            </Link>
          ))}
        </div>

        {/* The fan swaps its five cards in place, which a screen reader would
            otherwise never hear. Announce the window after each step. */}
        <p aria-live="polite" className="sr-only">
          {`Showing ${fanned.map((c) => c.title).join(", ")}. ${ITEMS.length} works in total.`}
        </p>

        {/* ---------- controls: circular arrows, centred ---------- */}
        <div className="relative z-10 mt-12 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4">
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => step(dir)}
                aria-label={dir < 0 ? "Previous works" : "Next works"}
                className={cn(
                  "grid size-12 place-items-center rounded-full transition-all duration-300",
                  dir < 0
                    ? "border border-cream/20 text-cream/70 hover:border-cream/50 hover:text-cream"
                    : "border border-cream/70 text-cream hover:border-[#E2CA82] hover:text-[#E2CA82]",
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
                </svg>
              </button>
            ))}
          </div>

          <Link
            href="/products"
            className="group inline-flex items-center gap-2 font-display text-[11px] tracking-[0.24em] text-cream/60 uppercase transition-colors hover:text-[#E2CA82]"
          >
            View all collections
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
