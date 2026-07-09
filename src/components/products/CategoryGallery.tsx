"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/products/Lightbox";
import { MATERIAL_ICONS, type ProductGallery } from "@/lib/galleries";
import { cn } from "@/lib/utils";

/**
 * The photo gallery for one product/category. The client's `icon-buttons` PNGs
 * are the MATERIAL selectors — tap a finish (Wooden / Silver / Diamond …) and
 * the grid filters in place to that finish's real photographs. Products with a
 * single "All" group render the grid with no selector. Every photo is shown
 * UNCROPPED (object-contain on a fixed-ratio tile) so the whole piece is
 * visible; clicking one opens the fullscreen Lightbox for that group only.
 */
export default function CategoryGallery({
  title,
  gallery,
}: {
  title: string;
  gallery: ProductGallery;
}) {
  const groups = gallery.groups;
  const multi = groups.length > 1;
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  const group = groups[Math.min(active, groups.length - 1)];
  const images = group.images;
  const caption = useMemo(
    () => (multi ? `${title} · ${group.label}` : title),
    [multi, title, group.label],
  );

  return (
    <div>
      {/* material selector — the icon-button chips */}
      {multi && (
        <div
          role="tablist"
          aria-label="Choose a finish"
          className="mb-10 flex flex-wrap gap-x-6 gap-y-5 sm:gap-x-8"
        >
          {groups.map((g, i) => {
            const on = i === active;
            const iconSrc = g.icon ? MATERIAL_ICONS[g.icon] : undefined;
            return (
              <button
                key={g.material}
                role="tab"
                aria-selected={on}
                title={`${g.label} — ${g.images.length} photo${g.images.length === 1 ? "" : "s"}`}
                onClick={() => {
                  setActive(i);
                  setOpen(null);
                }}
                className="group flex w-[76px] shrink-0 flex-col items-center gap-2 outline-none sm:w-[92px]"
              >
                {/* the coin IS the button — a big circular, clickable disc */}
                <span
                  className={cn(
                    "relative grid size-[68px] place-items-center rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-olive group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-cream sm:size-[84px]",
                    on
                      ? "scale-105 shadow-[0_6px_20px_-8px_rgba(79,71,40,0.55)] ring-2 ring-olive"
                      : "opacity-80 ring-1 ring-olive/25 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:ring-olive/50",
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
                    // no coin art for this finish (e.g. Patra) — a tonal disc
                    // with the initial, styled to sit in the same family.
                    <span className="grid size-full place-items-center rounded-full bg-gradient-to-b from-cream-deep to-[#E4D6B6] font-display text-xl text-olive-deep">
                      {g.label.charAt(0)}
                    </span>
                  )}
                  {/* count badge */}
                  <span
                    className={cn(
                      "absolute -right-1 -bottom-1 grid size-5 place-items-center rounded-full border font-body text-[10px] tabular-nums transition-colors sm:size-6 sm:text-[11px]",
                      on
                        ? "border-olive bg-olive text-cream"
                        : "border-olive/30 bg-cream text-olive-deep/70",
                    )}
                  >
                    {g.images.length}
                  </span>
                </span>
                <span
                  className={cn(
                    "text-center font-display text-[10px] leading-tight tracking-[0.12em] uppercase transition-colors sm:text-[11px]",
                    on
                      ? "text-olive-deep"
                      : "text-olive-deep/60 group-hover:text-olive-deep",
                  )}
                >
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* the grid — masonry-ish columns keep organic heights, uncropped tiles */}
      <div className="[column-fill:_balance] gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setOpen(i)}
            aria-label={`View ${caption} photo ${i + 1}`}
            className="group block w-full break-inside-avoid overflow-hidden rounded-card border border-olive/15 bg-cream-deep transition-colors duration-300 hover:border-olive/50"
          >
            <span className="relative block aspect-[4/5] w-full">
              <Image
                src={src}
                alt={`${caption} — ${i + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </span>
          </button>
        ))}
      </div>

      <Lightbox
        images={images}
        index={open}
        caption={caption}
        onClose={() => setOpen(null)}
        onIndex={setOpen}
      />
    </div>
  );
}
