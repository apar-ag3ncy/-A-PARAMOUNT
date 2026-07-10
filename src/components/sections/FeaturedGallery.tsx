"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * "Selected Works" — a faithful take on the reference layout: a warm near-black
 * panel, a huge "OUR WORKS" title with a small note beside it, and five product
 * cards arranged as a SYMMETRIC FAN.
 *
 * The fan geometry, measured off the reference:
 *  • card tops are ~level, and cards grow taller + wider toward the centre, so
 *    their bottoms sweep down in an arc;
 *  • the outer cards tilt away from centre (left cards rotate CCW, right cards
 *    CW — confirmed from the slope of each card's label);
 *  • the centre card is upright, largest, "featured": it carries a tag pill and
 *    a bigger, sentence-case name (Inter — Storica is caps-only), while the
 *    outer cards use small tracked caps.
 * The circular arrows advance a 5-card window through the curated set.
 *
 * Below `lg` the fan collapses to a plain snap-scroll rail (a rotated fan is
 * unreadable on a phone); the same arrows then scroll that rail.
 */
const SELECTED = [
  "dhwajadand",
  "doors",
  "samovasaran-trigadu",
  "divistand",
  "mandir",
  "kalash",
  "chattar",
  "rath",
] as const;

// Derived from module constants — resolve once, outside render.
const ITEMS = SELECTED.map((slug) =>
  CATEGORIES.find((c) => c.slug === slug),
).filter((c): c is NonNullable<typeof c> => Boolean(c?.image));

const VISIBLE = 5;

/** Per-slot fan geometry, centre = slot 2. Tops sit near-level (as in the
 *  reference); the growing heights are what sweep the bottoms into an arc. */
const FAN = [
  { w: "16%", h: "68%", rot: -9, lift: -8 },
  { w: "18%", h: "82%", rot: -5, lift: -3 },
  { w: "21%", h: "100%", rot: 0, lift: 0 }, // featured
  { w: "18%", h: "82%", rot: 5, lift: -3 },
  { w: "16%", h: "68%", rot: 9, lift: -8 },
];

export default function FeaturedGallery() {
  const railRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(0);
  const items = ITEMS;

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

  if (items.length < VISIBLE) return null;

  const fanned = Array.from(
    { length: VISIBLE },
    (_, i) => items[(start + i) % items.length],
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
            The gap must clear the rotated cards' expanded bounding boxes, or
            adjacent corners collide. */}
        <div className="relative z-10 hidden h-[30rem] items-start justify-center gap-7 lg:flex xl:h-[34rem]">
          {fanned.map((c, slot) => {
            const g = FAN[slot];
            const featured = slot === 2;
            return (
              <Link
                key={`${c.slug}-${slot}`}
                href={`/products/${c.family}/${c.slug}`}
                className="group relative shrink-0 overflow-hidden rounded-[22px] shadow-[0_24px_50px_-24px_rgba(0,0,0,0.85)] transition-[transform,box-shadow] duration-500 ease-out hover:z-10"
                style={{
                  width: g.w,
                  height: g.h,
                  transform: `translateY(${g.lift}px) rotate(${g.rot}deg)`,
                }}
              >
                <Image
                  src={c.image!}
                  alt={c.title}
                  fill
                  sizes="22vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
                {/* scrim for label legibility */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/25 to-transparent"
                />

                {featured && c.variants?.[0] && (
                  <span className="absolute top-4 left-4 rounded-full bg-cream/20 px-3 py-1.5 font-body text-[11px] text-cream backdrop-blur-md">
                    {c.variants[0]}
                  </span>
                )}

                <span
                  className={cn(
                    "absolute inset-x-0 bottom-0 block px-4 pb-4 text-cream",
                    featured
                      ? "font-body text-lg pb-6 px-6"
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
        <div
          ref={railRef}
          className="relative z-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((c) => (
            <Link
              key={c.slug}
              href={`/products/${c.family}/${c.slug}`}
              data-card
              className="group relative aspect-[3/4] w-[72%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[42%]"
            >
              <Image
                src={c.image!}
                alt={c.title}
                fill
                sizes="(max-width: 640px) 72vw, 42vw"
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
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
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
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
