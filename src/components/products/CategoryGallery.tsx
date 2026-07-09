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
          className="mb-8 flex flex-wrap gap-2.5"
        >
          {groups.map((g, i) => {
            const on = i === active;
            const iconSrc = g.icon ? MATERIAL_ICONS[g.icon] : undefined;
            return (
              <button
                key={g.material}
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setActive(i);
                  setOpen(null);
                }}
                className={cn(
                  "group flex items-center gap-2 rounded-button border px-3 py-2 font-display text-[11px] tracking-[0.14em] uppercase transition-all duration-300",
                  on
                    ? "border-olive bg-olive/10 text-olive-deep"
                    : "border-olive/25 text-olive-deep/70 hover:border-olive/60 hover:text-olive-deep",
                )}
              >
                {iconSrc && (
                  <span className="relative size-6 shrink-0">
                    <Image
                      src={iconSrc}
                      alt=""
                      fill
                      sizes="24px"
                      className={cn(
                        "object-contain transition-opacity",
                        on ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                      )}
                    />
                  </span>
                )}
                {g.label}
                <span className="text-olive/50">{g.images.length}</span>
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
