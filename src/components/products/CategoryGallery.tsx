"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/products/Lightbox";
import {
  MATERIAL_ICONS,
  type GalleryImage,
  type ProductGallery,
} from "@/lib/galleries";
import { cn } from "@/lib/utils";

/**
 * The photo gallery for one product/category.
 *
 * The client's `icon-buttons` PNGs are the MATERIAL selector — big circular coin
 * buttons shown on EVERY product that comes in more than one finish:
 *  • products whose photos are split by finish (Doors, Bhandar, 14-Swapna) get a
 *    coin per photo group, and tapping one filters the grid to that finish;
 *  • products with a single photo set but multiple catalogue finishes (Kalash →
 *    Brass/Copper, Chattar → Silver/Gold/…) show a coin per finish over the same
 *    photos, so the selector looks and feels identical everywhere.
 * Tapping a photo opens the fullscreen Lightbox.
 */

/** Map a finish label to one of the coin icon keys (mirror of the build script). */
function matchIcon(label: string): string | null {
  const n = label.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (n.includes("brass") && (n.includes("germansilver") || n.includes("gs")))
    return "brass-germansilver";
  if (n.includes("copper") && n.includes("brass")) return "copper-brass";
  if (n.includes("brass") && (n.includes("jaali") || n.includes("jali")))
    return "brass-jaali";
  if (n.includes("minakari")) return "minakari";
  if (n.includes("diamond")) return "diamond";
  if ((n.includes("wood") && !n.includes("nowood")) || n.includes("carving"))
    return "wooden";
  if (n.includes("silver")) return "silver";
  if (n.includes("copper")) return "copper";
  if (n.includes("polish")) return "polish";
  if (n.includes("inlay") || n.includes("emboss")) return "inlay";
  if (n.includes("jaali") || n.includes("jali")) return "brass-jaali";
  if (n.includes("brass")) return "brass";
  return null;
}

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
}: {
  title: string;
  gallery: ProductGallery;
  /** Catalogue finishes, used to build coins when photos aren't split by finish. */
  variants?: string[];
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
        iconKey: matchIcon(v),
        images: base,
      }));
    }
    return [];
  }, [groups, variants]);

  const hasSelector = finishes.length > 1;
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  const activeFinish = hasSelector
    ? finishes[Math.min(active, finishes.length - 1)]
    : undefined;
  const images = activeFinish?.images ?? groups[0]?.images ?? [];
  const caption = useMemo(
    () => (activeFinish ? `${title} · ${activeFinish.label}` : title),
    [activeFinish, title],
  );

  return (
    <div>
      {/* material selector — big circular coin buttons */}
      {hasSelector && (
        <div
          role="tablist"
          aria-label="Choose a finish"
          className="mb-10 flex flex-wrap gap-x-6 gap-y-5 sm:gap-x-8"
        >
          {finishes.map((f, i) => {
            const on = i === active;
            const iconSrc = f.iconKey ? MATERIAL_ICONS[f.iconKey] : undefined;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={on}
                title={f.label}
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
                    // no coin art for this finish — a tonal disc with the initial.
                    <span className="grid size-full place-items-center rounded-full bg-gradient-to-b from-cream-deep to-[#E4D6B6] font-display text-xl text-olive-deep">
                      {f.label.charAt(0)}
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-center font-display text-[10px] leading-tight tracking-[0.12em] uppercase transition-colors sm:text-[11px]",
                    on
                      ? "text-olive-deep"
                      : "text-olive-deep/60 group-hover:text-olive-deep",
                  )}
                >
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* True masonry: each frame takes its photo's OWN aspect ratio (width/
          height from the manifest), so every image fills its frame completely —
          no crop, no empty bands — whether it's a tall dhwajadand or a wide
          bhandar. CSS columns balance the varying heights. */}
      <div className="[column-fill:_balance] gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setOpen(i)}
            aria-label={`View ${caption} photo ${i + 1}`}
            className="group block w-full break-inside-avoid overflow-hidden rounded-card border border-olive/15 bg-cream-deep transition-colors duration-300 hover:border-olive/50"
          >
            <Image
              src={img.src}
              width={img.w}
              height={img.h}
              alt={`${caption} — ${i + 1}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.04]"
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
