"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useRef } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * "Selected Works" — a dark, editorial showcase modelled on the reference: a
 * warm near-black panel carrying a horizontal rail of tall rounded cards, each a
 * real product photograph with its name, swept left/right by circular arrows.
 * Only well-proportioned hero shots are curated in, so the rail reads as one
 * aligned, considered gallery.
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

export default function FeaturedGallery() {
  const railRef = useRef<HTMLDivElement>(null);
  const items = ITEMS;

  const scrollBy = useCallback((dir: number) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + 20 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  if (!items.length) return null;

  return (
    <section className="bg-cream px-4 py-16 sm:px-6 sm:py-24">
      <div
        className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-14 text-cream sm:px-10 sm:py-16"
        style={{
          background:
            "radial-gradient(120% 100% at 15% 0%, #4A4428 0%, #332815 55%, #221A0E 100%)",
        }}
      >
        {/* faint gold bloom, top-left, like the reference's lit corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 60% at 12% 0%, rgba(226,202,130,0.16), transparent 60%)",
          }}
        />

        {/* header — title left, note right */}
        <div className="relative z-10 mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 font-display text-[11px] tracking-[0.34em] text-[#E2CA82] uppercase">
              Selected Works
            </p>
            <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95] font-light text-cream">
              Our Works
            </h2>
          </div>
          <p className="max-w-xs font-body text-sm leading-relaxed text-cream/60 sm:text-right">
            A few pieces from the workshop floor — handcrafted for Jain derasars
            and Hindu temples across three generations.
          </p>
        </div>

        {/* the rail */}
        <div
          ref={railRef}
          className="relative z-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((c) => (
            <Link
              key={c.slug}
              href={`/products/${c.family}/${c.slug}`}
              data-card
              className="group relative aspect-[3/4] w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl sm:w-[38%] lg:w-[23%]"
            >
              <Image
                src={c.image!}
                alt={c.title}
                fill
                sizes="(max-width: 640px) 70vw, (max-width: 1024px) 38vw, 23vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* scrim + label */}
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#1c1509]/90 to-transparent"
              />
              <div className="absolute inset-x-0 bottom-0 p-5">
                {c.variants?.[0] && (
                  <span className="mb-2 inline-block rounded-full bg-cream/15 px-2.5 py-1 font-body text-[10px] tracking-wide text-cream/90 backdrop-blur-sm">
                    {c.variants[0]}
                  </span>
                )}
                <p className="font-display text-sm tracking-[0.12em] text-cream uppercase">
                  {c.title}
                </p>
              </div>
              <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-cream/10 transition-colors duration-500 group-hover:ring-[#E2CA82]/50" />
            </Link>
          ))}
        </div>

        {/* controls — view-all + circular arrows */}
        <div className="relative z-10 mt-10 flex items-center justify-between">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 font-display text-[11px] tracking-[0.24em] text-cream/70 uppercase transition-colors hover:text-[#E2CA82]"
          >
            View all collections
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

          <div className="flex items-center gap-3">
            {[-1, 1].map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => scrollBy(dir)}
                aria-label={dir < 0 ? "Previous works" : "Next works"}
                className={cn(
                  "grid size-11 place-items-center rounded-full border border-cream/25 text-cream/80 transition-all duration-300 hover:border-[#E2CA82] hover:text-[#E2CA82]",
                )}
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  {dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
