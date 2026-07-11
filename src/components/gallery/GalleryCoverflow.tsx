"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { CoverflowCategory } from "@/lib/galleryCoverflow";

/**
 * GalleryCoverflow — the portfolio as a Cover Flow carousel (per the client's
 * reference): a large upright centre card with cards receding in scale, dropping
 * into an arc and turning away on both sides. A pill row filters which set of
 * photos is on the flow; circular arrows and drag/swipe move the centre.
 *
 * Geometry is pure CSS `calc` off a single `--cw` (card width) custom property,
 * so it scales fluidly with the viewport and needs no measurement/JS on resize.
 * Each card's transform is a function of its signed offset `o` from the centre
 * (wrapped, so the flow is endless): translate out by `o`, drop and shrink by
 * `|o|`, turn by `o`, and sit behind by `|o|`.
 *
 * Cards are a uniform 3:4 frame filled with `object-cover`, exactly as in the
 * reference; the data layer picks each category's photos closest to that ratio
 * so the crop stays gentle.
 */

const VISIBLE = 2; // cards shown each side of centre (5 on screen at once)
const STEP = 0.52; // neighbour offset as a fraction of card WIDTH (→ ~48% overlap)
const DROP = 22; // px each side card sinks
const SCALE_STEP = 0.12;
const TURN = 6; // deg of Y-rotation per step

export default function GalleryCoverflow({
  categories,
}: {
  categories: CoverflowCategory[];
}) {
  const [cat, setCat] = useState(0);
  const active = categories[cat];
  const photos = active.photos;
  const [center, setCenter] = useState(() => Math.floor(photos.length / 2));
  const drag = useRef<{ x: number; moved: boolean } | null>(null);

  const wrap = useCallback(
    (i: number, n: number) => ((i % n) + n) % n,
    [],
  );

  const go = useCallback(
    (dir: number) => setCenter((c) => wrap(c + dir, photos.length)),
    [photos.length, wrap],
  );

  const pickCategory = useCallback((i: number, n: number) => {
    setCat(i);
    setCenter(Math.floor(n / 2));
  }, []);

  // Signed, wrapped offset of card `i` from centre: -n/2 … n/2.
  const offset = (i: number) => {
    const n = photos.length;
    let o = i - center;
    if (o > n / 2) o -= n;
    if (o < -n / 2) o += n;
    return o;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    if (Math.abs(e.clientX - drag.current.x) > 8) drag.current.moved = true;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1); // drag left → advance
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* ---------- filter pills ---------- */}
      <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        {categories.map((c, i) => (
          <button
            key={c.label}
            type="button"
            onClick={() => pickCategory(i, c.photos.length)}
            aria-pressed={i === cat}
            className={cn(
              "rounded-full px-5 py-2 font-body text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
              i === cat
                ? "bg-olive-deep text-cream"
                : "border border-olive/25 text-olive-deep hover:border-olive/60",
            )}
          >
            {c.label}
          </button>
        ))}
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 rounded-full border border-olive-deep px-5 py-2 font-body text-[13px] text-olive-deep transition-colors hover:bg-olive-deep hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          View all <span aria-hidden>→</span>
        </Link>
      </div>

      {/* ---------- the flow ----------
          Cards are sized by a shared HEIGHT (`--ch`) and the category's own
          aspect `ratio`, so width = height × ratio and the photo fills the frame
          with nothing cropped. `--cw` (the card width) is derived from those two,
          and the horizontal step is a fraction of it, so spacing stays even. */}
      <div
        className="relative flex h-[calc(var(--ch)+4.5rem)] touch-pan-y items-center justify-center overflow-hidden [perspective:1600px]"
        style={{
          ["--ch" as string]: "clamp(17rem,42vw,30rem)",
          ["--cw" as string]: `calc(var(--ch) * ${active.ratio.toFixed(4)})`,
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => (drag.current = null)}
      >
        {photos.map((p, i) => {
          const o = offset(i);
          const mag = Math.abs(o);
          const hidden = mag > VISIBLE;
          return (
            <button
              key={`${active.label}-${i}`}
              type="button"
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-hidden={hidden}
              tabIndex={hidden ? -1 : 0}
              onClick={() => {
                if (!drag.current?.moved) setCenter(i);
              }}
              className="absolute h-[var(--ch)] w-[var(--cw)] cursor-pointer overflow-hidden rounded-[20px] shadow-[0_28px_60px_-28px_rgba(46,35,19,0.6)] ring-1 ring-black/5 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              style={{
                transform: `translateX(calc(var(--cw) * ${STEP} * ${o})) translateY(${mag * DROP}px) scale(${1 - mag * SCALE_STEP}) rotateY(${o * -TURN}deg)`,
                zIndex: 40 - mag,
                opacity: hidden ? 0 : 1,
                pointerEvents: hidden ? "none" : "auto",
              }}
            >
              <Image
                src={p.src}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 1024px) 46vw, 88vw"
                className="object-cover select-none"
              />
              {/* the centre card gets a faint bottom scrim for depth */}
              {o === 0 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/25 to-transparent"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ---------- arrows ---------- */}
      <div className="mt-10 flex items-center justify-center gap-4">
        {[-1, 1].map((dir) => (
          <button
            key={dir}
            type="button"
            onClick={() => go(dir)}
            aria-label={dir < 0 ? "Previous photo" : "Next photo"}
            className="grid size-12 place-items-center rounded-full border border-olive/30 text-olive-deep transition-colors hover:border-olive-deep hover:bg-olive-deep hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
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
    </div>
  );
}
