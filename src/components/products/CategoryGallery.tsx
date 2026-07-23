"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/products/Lightbox";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import {
  MATERIAL_ICONS,
  VARIANT_ICONS,
  type GalleryImage,
  type ProductGallery,
} from "@/lib/galleries";
import { cn } from "@/lib/utils";

/**
 * The photo gallery for one product/category.
 *
 * The client's `icon-buttons` PNGs are the MATERIAL selector — big circular coin
 * buttons shown on EVERY product that comes in more than one finish, and CENTRED
 * on the page. Tapping one filters the grid; tapping a photo opens the Lightbox.
 * The pieces sit THREE to a row (a partial last row centres), and both the coins
 * and the tiles fade+rise into view on scroll (GSAP), re-staggering when the
 * finish is switched — a quiet, professional reveal.
 */

interface Finish {
  key: string;
  label: string;
  iconKey: string | null;
  images: GalleryImage[];
}

export default function CategoryGallery({
  title,
  gallery,
  variants = [],
  dark = false,
}: {
  title: string;
  gallery: ProductGallery;
  /** Catalogue finishes, used to build coins when photos aren't split by finish. */
  variants?: string[];
  /** Render for the dark editorial product page (light coin labels, gold hairlines). */
  dark?: boolean;
}) {
  const groups = gallery.groups;

  // Build the finish coins. Real photo groups win (they filter); otherwise fall
  // back to the catalogue finishes over the product's single photo set.
  const finishes: Finish[] = useMemo(() => {
    if (groups.length > 1) {
      return groups.map((g) => ({
        key: g.material,
        label: g.label,
        iconKey: g.icon,
        images: g.images,
      }));
    }
    const base = groups[0]?.images ?? [];
    if (variants.length > 1) {
      return variants.map((v) => ({
        key: v,
        label: v,
        iconKey: VARIANT_ICONS[v] ?? null,
        images: base,
      }));
    }
    return [];
  }, [groups, variants]);

  const hasSelector = finishes.length > 1;
  // Only real photo groups can actually narrow the grid. When `finishes` came
  // from the catalogue variants instead, every coin points at the SAME images —
  // so the coins are informational there, and must not pretend to filter.
  const canFilter = groups.length > 1;
  // null = SHOW EVERYTHING, and it is the default: opening a piece should show
  // the whole range, not silently pre-filter it to whichever finish happens to
  // be first. Picking a coin narrows to that finish; picking the SAME coin again
  // clears back to null, so the control that filtered is the control that undoes
  // it and there is no separate "all" button to hunt for.
  const [active, setActive] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);

  const activeFinish =
    hasSelector && active !== null
      ? finishes[Math.min(active, finishes.length - 1)]
      : undefined;

  // Showing everything means every finish's images at once. They MUST be deduped
  // by src: when a piece has no per-material folders, `finishes` is built by
  // mapping each variant name onto the SAME base image set, so a naive flatten
  // would repeat the identical photographs once per variant.
  const allImages = useMemo(() => {
    const seen = new Set<string>();
    const out: (typeof groups)[number]["images"] = [];
    for (const f of finishes.length ? finishes : groups.map((g) => ({ images: g.images })))
      for (const im of f.images)
        if (!seen.has(im.src)) { seen.add(im.src); out.push(im); }
    return out;
  }, [finishes, groups]);

  const images = activeFinish?.images ?? allImages;
  const caption = useMemo(
    () => (activeFinish ? `${title} · ${activeFinish.label}` : title),
    [activeFinish, title],
  );

  // ---- reveals (GSAP) ----
  const coinsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstTiles = useRef(true);

  // Coins rise in on mount — they sit near the top of the page (usually in view
  // on load), so they must NOT be gated behind a scroll trigger that might not
  // fire and leave the finish selector invisible.
  useIsomorphicLayoutEffect(() => {
    const el = coinsRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from(el.children, {
        opacity: 0,
        y: 18,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.06,
        delay: 0.15,
      });
    }, el);
    return () => ctx.revert();
  }, [hasSelector]);

  // Tiles stagger-rise: waiting for scroll on first view, then immediately each
  // time the finish is switched (the images remount, so they fade in cleanly).
  useIsomorphicLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tiles = grid.querySelectorAll<HTMLElement>(".pm-gtile");
    if (!tiles.length) return;
    const scrollFirst = firstTiles.current;
    firstTiles.current = false;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.62,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: scrollFirst
            ? { trigger: grid, start: "top 84%", once: true }
            : undefined,
        },
      );
    }, grid);
    return () => ctx.revert();
  }, [active, images.length]);

  return (
    <div>
      {/* material selector — big circular coin buttons, always CENTRED */}
      {hasSelector && (
        <div
          ref={coinsRef}
          role={canFilter ? "tablist" : undefined}
          aria-label={canFilter ? "Choose a finish" : "Available finishes"}
          className="mb-3 flex flex-wrap justify-center gap-x-6 gap-y-5 sm:gap-x-8"
        >
          {finishes.map((f, i) => {
            const on = canFilter && i === active;
            const anyActive = canFilter && active !== null;
            const iconSrc = f.iconKey ? MATERIAL_ICONS[f.iconKey] : undefined;
            const Tag = (canFilter ? "button" : "div") as React.ElementType;
            return (
              <Tag
                key={f.key}
                {...(canFilter
                  ? {
                      role: "tab",
                      "aria-selected": on,
                      onClick: () => {
                        // toggle: the same coin twice returns to showing everything
                        setActive((prev: number | null) => (prev === i ? null : i));
                        setOpen(null);
                      },
                    }
                  : {})}
                title={f.label}
                className="group flex w-[76px] shrink-0 flex-col items-center gap-2 outline-none sm:w-[92px]"
              >
                {/* the coin IS the button — a big circular, clickable disc */}
                <span
                  className={cn(
                    "relative grid size-[68px] place-items-center rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-olive group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-cream sm:size-[84px]",
                    on
                      ? "scale-105 shadow-[0_6px_20px_-8px_rgba(79,71,40,0.55)] ring-2 ring-olive"
                      : anyActive
                        ? // another finish is filtering — recede, but stay legible
                          "opacity-45 ring-1 ring-olive/20 group-hover:scale-[1.03] group-hover:opacity-90 group-hover:ring-olive/50"
                        : // showing everything: every finish is included, so none
                          // of them is "off" and none should look it
                          "opacity-95 ring-1 ring-olive/30 group-hover:scale-[1.03] group-hover:ring-olive/60",
                  )}
                >
                  {iconSrc ? (
                    <Image
                      src={iconSrc}
                      alt=""
                      fill
                      sizes="84px"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    // no coin art for this finish — a tonal disc with the initial.
                    <span className="grid size-full place-items-center rounded-full bg-gradient-to-b from-cream-deep to-[#E4D6B6] font-display text-xl text-olive-deep">
                      {f.label.charAt(0)}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "pm-micro text-center font-display transition-colors",
                    dark
                      ? on
                        ? "text-cream"
                        : "text-pista/55 group-hover:text-cream"
                      : on
                        ? "text-maroon"
                        : anyActive
                          ? "text-maroon/45 group-hover:text-maroon"
                          : "text-maroon/75 group-hover:text-maroon",
                  )}
                >
                  {f.label}
                </span>
              </Tag>
            );
          })}
        </div>
      )}

      {hasSelector && (
        <p
          aria-live="polite"
          className={cn(
            "mb-6 flex h-5 items-center justify-center gap-1.5 text-center",
            dark ? "text-pista/70" : "text-maroon/65",
          )}
        >
          <span className="pm-micro font-body tracking-[0.18em] uppercase">
            {!canFilter
              ? `Available in ${finishes.length} finishes`
              : activeFinish
                ? `Showing ${activeFinish.label}`
                : `Showing all ${finishes.length} finishes`}
          </span>
          {canFilter && activeFinish && (
            <span className="pm-micro font-body tracking-[0.18em] opacity-70">
              · tap again for all
            </span>
          )}
        </p>
      )}

      {/* Aligned grid — THREE to a row (from the small-tablet breakpoint up),
          centred so a partial last row sits in the middle. Each frame ADOPTS its
          photo's own aspect ratio, so the shot FILLS the frame edge-to-edge with
          NO crop and NO letterbox (a product's photos usually share one ratio,
          so the row stays even). Two to a row on phones. */}
      <div ref={gridRef} className="flex flex-wrap justify-center gap-4 sm:gap-6">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setOpen(i)}
            aria-label={`View ${caption} photo ${i + 1}`}
            style={{ aspectRatio: `${img.w} / ${img.h}` }}
            className={cn(
              "pm-gtile group relative overflow-hidden rounded-[1rem] bg-cream-deep transition-colors duration-300",
              // A LONE photo runs the full width as the piece's hero, rather than
              // sitting as an orphan third of an empty row. Five pieces have
              // exactly one shot (wooden-ceiling, palkhi, silver-pankho,
              // brass-tijori, wooden-carved-murti) and on each of them that third
              // read as a thumbnail of a missing set.
              images.length === 1
                ? "w-full"
                : "w-[calc((100%-1rem)/2)] sm:w-[calc((100%-3rem)/3)]",
              dark
                ? "border border-cream/10 hover:border-gold/40"
                : "border border-olive/15 hover:border-olive/50",
            )}
          >
            <Image
              src={img.src}
              fill
              alt={`${caption} photo ${i + 1}`}
              priority={images.length === 1}
              sizes={
                images.length === 1
                  ? "(max-width: 1024px) 100vw, 64rem"
                  : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        images={images.map((img) => img.src)}
        index={open}
        caption={caption}
        onClose={() => setOpen(null)}
        onIndex={setOpen}
      />
    </div>
  );
}
