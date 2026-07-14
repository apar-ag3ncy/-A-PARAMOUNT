"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import type { CatalogCategory } from "@/lib/catalog";

/**
 * ProductCoverflow — a family's pieces as a clickable 3D Cover Flow (reference:
 * the Voyager2 layout). The centre card stands upright and largest; cards fan
 * outward, turning on their Y-axis, sinking and shrinking as they recede, so the
 * row reads as one deep, cinematic shelf. Drag or use the arrows to glide the
 * flow; click a side card to bring it to the front, click the front card to open
 * its page (real static info, brand fonts). NOTHING IS CROPPED — every photo
 * sits `contain` in an identical portrait frame, so pieces of different shapes
 * stay whole and the frames stay perfectly consistent.
 */

const RATIO = 0.72; // card width / height — a calm portrait, close to the shots
const STEP = 0.62; // neighbour offset as a fraction of card WIDTH — airy spread
const DROP = 30; // px a neighbour sinks per step
const SCALE_STEP = 0.14; // shrink per step
const TURN = 34; // deg of Y-rotation per step (capped at ±2 steps) — real depth
const VISIBLE = 2; // fully-shown cards each side; the next fades out
const CAP = 3; // transforms stop growing past this many steps out

function frame(o: number): { transform: string; zIndex: number; opacity: number } {
  const mag = Math.abs(o);
  const capped = Math.min(mag, CAP);
  const turn = Math.max(-2, Math.min(2, o)) * -TURN;
  return {
    transform: `translateX(calc(var(--cw) * ${STEP} * ${o})) translateY(${capped * DROP}px) scale(${1 - capped * SCALE_STEP}) rotateY(${turn}deg)`,
    zIndex: Math.round(100 - mag * 10),
    opacity: mag <= VISIBLE ? 1 : Math.max(0, 1 - (mag - VISIBLE)),
  };
}

export default function ProductCoverflow({
  products,
  familySlug,
}: {
  products: CatalogCategory[];
  familySlug: string;
}) {
  const items = products;
  // Open on a piece that actually has a photo, as near the middle as possible —
  // a strong first impression instead of an empty placeholder in the centre.
  const mid = (() => {
    const m = Math.floor((items.length - 1) / 2);
    if (items[m]?.image) return m;
    for (let d = 1; d < items.length; d++) {
      if (items[m - d]?.image) return m - d;
      if (items[m + d]?.image) return m + d;
    }
    return m;
  })();

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const pos = useRef(mid); // continuous centre position (0 … n-1)
  const drag = useRef<{ x: number; from: number; moved: boolean } | null>(null);
  const [active, setActive] = useState(mid); // rounded centre — for the caption/aria

  /** Position every card for a continuous centre `pos`. Imperative — runs every
   *  drag/tween frame, never touches React state. */
  const place = (p: number) => {
    for (let i = 0; i < cardRefs.current.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const f = frame(i - p);
      el.style.transform = f.transform;
      el.style.zIndex = String(f.zIndex);
      el.style.opacity = String(f.opacity);
      el.style.pointerEvents = f.opacity < 0.05 ? "none" : "auto";
    }
  };

  const clamp = (n: number) => gsap.utils.clamp(0, items.length - 1, n);

  // Glide the flow to a target centre index; snaps `active` when it lands.
  const glideTo = (target: number) => {
    const to = clamp(target);
    gsap.to(pos, {
      current: to,
      duration: 0.7,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => place(pos.current),
      onComplete: () => setActive(Math.round(pos.current)),
    });
  };

  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    place(pos.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stepPx = () =>
      ((stage.querySelector("[data-idx]") as HTMLElement | null)?.clientWidth ?? 280) * STEP;

    const down = (e: PointerEvent) => {
      drag.current = { x: e.clientX, from: pos.current, moved: false };
      gsap.killTweensOf(pos);
    };
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      if (Math.abs(dx) > 6) d.moved = true;
      pos.current = clamp(d.from - dx / stepPx());
      place(pos.current);
    };
    const up = () => {
      const d = drag.current;
      if (!d) return;
      drag.current = null;
      if (!d.moved) return; // a tap — let the click handler decide
      const snap = clamp(Math.round(pos.current));
      if (reduce) {
        pos.current = snap;
        place(snap);
        setActive(snap);
      } else {
        glideTo(snap);
      }
    };

    stage.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      stage.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [items.length]);

  // A card click: a drag suppresses it; a side card centres instead of opening;
  // only the already-centred card follows its link to the product page.
  const onClickCapture = (e: React.MouseEvent) => {
    if (drag.current?.moved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-idx]");
    if (!card) return;
    const idx = Number(card.dataset.idx);
    if (idx !== Math.round(pos.current)) {
      e.preventDefault();
      glideTo(idx);
    }
  };

  if (!items.length) return null;

  return (
    <div className="relative">
      <div
        ref={stageRef}
        role="listbox"
        aria-label="Pieces in this collection"
        onClickCapture={onClickCapture}
        className="relative flex h-[clamp(20rem,52vw,34rem)] w-full touch-pan-y cursor-grab items-center justify-center overflow-hidden select-none active:cursor-grabbing [perspective:2000px]"
        style={{
          ["--ch" as string]: "clamp(20rem,52vw,34rem)",
          ["--cw" as string]: `calc(var(--ch) * ${RATIO})`,
        }}
      >
        {items.map((p, i) => {
          const f = frame(i - mid); // SSR-friendly initial pose
          const isActive = i === active;
          return (
            <Link
              key={p.slug}
              href={`/products/${familySlug}/${p.slug}`}
              data-idx={i}
              role="option"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              draggable={false}
              className="group absolute block h-[var(--ch)] w-[var(--cw)] overflow-hidden rounded-[22px] shadow-[0_40px_80px_-38px_rgba(0,0,0,0.85)] ring-1 ring-cream/10 [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              style={{ transform: f.transform, zIndex: f.zIndex, opacity: f.opacity }}
            >
              {/* warm ground — the piece floats whole (contain), never cropped */}
              <span
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 90% at 50% 32%, #2A2011 0%, #1E1709 70%, #140F06 100%)",
                }}
              />
              {p.image ? (
                <Image
                  src={p.image}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(min-width:1024px) 30vw, 70vw"
                  className="object-contain select-none"
                />
              ) : (
                <span
                  aria-hidden
                  className="absolute inset-0 grid place-items-center text-gold/25"
                >
                  <svg viewBox="0 0 100 120" className="w-1/3" fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M50,6 l4,5 -4,5 -4,-5 z" fill="currentColor" stroke="none" />
                    <path d="M24,112 L24,58 C24,36 36,20 50,14 C64,20 76,36 76,58 L76,112" />
                    <path d="M50,44 L41,96 M50,44 L59,96 M45,78 L55,78" strokeWidth={3} />
                  </svg>
                </span>
              )}
              {/* scrim + title, as in the reference */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 via-black/30 to-transparent"
              />
              <span className="pm-h3 absolute inset-x-0 bottom-0 block px-6 pb-6 text-center font-display text-cream">
                {p.title}
              </span>
              {/* gold hairline warms on the focused card */}
              <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-transparent transition-colors duration-500 group-hover:ring-gold/50" />
            </Link>
          );
        })}
      </div>

      {/* controls — circular arrows + live piece name */}
      <div className="mt-10 flex flex-col items-center gap-5">
        <p aria-live="polite" className="pm-eyebrow font-display text-gold">
          {items[active]?.title}
        </p>
        <div className="flex items-center gap-4">
          {[-1, 1].map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => glideTo(Math.round(pos.current) + dir)}
              aria-label={dir < 0 ? "Previous piece" : "Next piece"}
              className="grid size-12 place-items-center rounded-full border border-cream/25 text-cream/75 transition-colors duration-300 hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                {dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
