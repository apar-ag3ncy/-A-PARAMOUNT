"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import type { CoverflowCategory } from "@/lib/galleryCoverflow";

/**
 * GalleryCoverflow — the portfolio as a SCROLL-DRIVEN Cover Flow. This is a
 * showcase, not a shop: the visitor doesn't click through, they *scroll*, and
 * the flow glides one photo to the next under a pinned, GSAP-scrubbed timeline.
 *
 * On a fine pointer with motion allowed the section pins and the scroll position
 * IS the playhead — a continuous `pos` (0 … n-1) drives every card's transform
 * imperatively (no per-frame React render). On touch or reduced-motion it falls
 * back to a 1:1 drag/swipe of the same flow (a finger drag is itself scrolling),
 * with no pin to hijack the page.
 *
 * Geometry is pure CSS `calc` off one `--cw` (card width = shared height ×the
 * category's aspect ratio), so photos fill their frames UNCROPPED and the spacing
 * stays even. `STEP` is deliberately loose so the cards breathe and spread across
 * the width rather than stacking tightly.
 */

const STEP = 0.66; // neighbour offset as a fraction of card WIDTH — loose = airy
const DROP = 26; // px a neighbour sinks per step
const SCALE_STEP = 0.14;
const TURN = 6; // deg of Y-rotation per step (capped at ±2 steps)
const VISIBLE = 2; // fully-shown cards each side; the next one fades out
const CAP = 3; // transforms stop growing past this many steps out

/** Per-card visual state as a pure function of its signed offset from centre. */
function frame(o: number): {
  transform: string;
  zIndex: number;
  opacity: number;
} {
  const mag = Math.abs(o);
  const capped = Math.min(mag, CAP);
  const turn = Math.max(-2, Math.min(2, o)) * -TURN;
  return {
    transform: `translateX(calc(var(--cw) * ${STEP} * ${o})) translateY(${capped * DROP}px) scale(${1 - capped * SCALE_STEP}) rotateY(${turn}deg)`,
    zIndex: Math.round(100 - mag * 10),
    opacity: mag <= VISIBLE ? 1 : Math.max(0, 1 - (mag - VISIBLE)),
  };
}

export default function GalleryCoverflow({
  categories,
}: {
  categories: CoverflowCategory[];
}) {
  const [cat, setCat] = useState(0);
  const active = categories[cat];
  const photos = active.photos;
  const mid = (photos.length - 1) / 2;

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const lenRef = useRef(photos.length);
  const progressRef = useRef(0); // last scrub progress (0…1), survives filtering
  const drag = useRef<{ x: number; from: number; moved: boolean } | null>(null);

  /** Position every card for a continuous centre `pos` (0 … n-1). Imperative:
   *  runs every scrub frame, so it must never touch React state. */
  const place = (pos: number) => {
    const cards = cardRefs.current;
    for (let i = 0; i < cards.length; i++) {
      const el = cards[i];
      if (!el) continue;
      const f = frame(i - pos);
      el.style.transform = f.transform;
      el.style.zIndex = String(f.zIndex);
      el.style.opacity = String(f.opacity);
      el.style.pointerEvents = f.opacity < 0.05 ? "none" : "auto";
    }
    if (cueRef.current) {
      // the "scroll" cue fades away as soon as the flow starts moving
      cueRef.current.style.opacity = String(
        Math.max(0, 1 - (pos / Math.max(1, lenRef.current - 1)) * 5),
      );
    }
  };

  // ---- scroll-scrub (fine pointer) / drag fallback (touch · reduced motion) ----
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        "(pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          root.style.height = "300vh"; // scrub runway; the stage pins within it
          const st = ScrollTrigger.create({
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            pin: stage,
            scrub: 1, // one second of glide — smooth, never twitchy
            anticipatePin: 1,
            onUpdate: (self) => {
              progressRef.current = self.progress;
              place(self.progress * (lenRef.current - 1));
            },
            onRefresh: (self) => place(self.progress * (lenRef.current - 1)),
          });
          return () => {
            st.kill();
            root.style.height = "";
          };
        },
      );

      // Touch / reduced-motion: no pin (never hijack the page). A finger drag —
      // itself a scroll gesture — moves the flow 1:1.
      mm.add("(pointer: coarse), (prefers-reduced-motion: reduce)", () => {
        root.style.height = "";
        let pos = mid;
        place(pos);
        const stepPx = () =>
          (stage.querySelector("[data-card]")?.clientWidth ?? 260) * STEP;
        const down = (e: PointerEvent) => {
          drag.current = { x: e.clientX, from: pos, moved: false };
        };
        const move = (e: PointerEvent) => {
          const d = drag.current;
          if (!d) return;
          const dx = e.clientX - d.x;
          if (Math.abs(dx) > 6) d.moved = true;
          pos = gsap.utils.clamp(0, lenRef.current - 1, d.from - dx / stepPx());
          place(pos);
        };
        const up = () => {
          if (!drag.current) return;
          pos = gsap.utils.clamp(0, lenRef.current - 1, Math.round(pos));
          gsap.to(
            { v: pos },
            {
              v: pos,
              duration: 0.4,
              ease: "power2.out",
              onUpdate() {
                place(pos);
              },
            },
          );
          place(pos);
          drag.current = null;
        };
        stage.addEventListener("pointerdown", down);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        return () => {
          stage.removeEventListener("pointerdown", down);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };
      });
    }, root);

    return () => ctx.revert();
  }, []);

  // Re-place when the filter changes the set, keeping the current scroll depth.
  useIsomorphicLayoutEffect(() => {
    lenRef.current = photos.length;
    place(progressRef.current * (photos.length - 1));
    ScrollTrigger.refresh();
  }, [cat, photos.length]);

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={stageRef}
        className="flex min-h-screen flex-col items-center justify-center gap-10 py-10"
      >
        {/* ---------- filter pills ---------- */}
        <div className="flex max-w-6xl flex-wrap items-center justify-center gap-2.5 px-4 sm:gap-3">
          {categories.map((c, i) => (
            <button
              key={c.label}
              type="button"
              onClick={() => setCat(i)}
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
          <Button variant="outline" size="md" href="/products">
            View all
          </Button>
        </div>

        {/* ---------- the flow ---------- */}
        <div
          className="relative flex h-[clamp(17rem,42vw,30rem)] w-full touch-pan-y items-center justify-center overflow-hidden [perspective:1600px]"
          style={{
            ["--ch" as string]: "clamp(17rem,42vw,30rem)",
            ["--cw" as string]: `calc(var(--ch) * ${active.ratio.toFixed(4)})`,
          }}
        >
          {photos.map((p, i) => {
            const f = frame(i - mid); // SSR-friendly initial pose
            return (
              <div
                key={`${active.label}-${i}`}
                data-card
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute h-[var(--ch)] w-[var(--cw)] overflow-hidden rounded-[20px] shadow-[0_30px_64px_-30px_rgba(46,35,19,0.6)] ring-1 ring-black/5 select-none"
                style={{
                  transform: f.transform,
                  zIndex: f.zIndex,
                  opacity: f.opacity,
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
              </div>
            );
          })}
        </div>

        {/* ---------- scroll cue (fades as the flow begins) ---------- */}
        <div
          ref={cueRef}
          aria-hidden
          className="flex flex-col items-center gap-2 font-display text-[10px] tracking-[0.3em] text-olive/60 uppercase"
        >
          Scroll to explore
          <svg
            viewBox="0 0 24 24"
            className="size-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M6 13l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
