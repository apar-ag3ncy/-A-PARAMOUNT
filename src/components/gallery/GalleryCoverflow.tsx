"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, ScrollSmoother } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import type { CoverflowFlow } from "@/lib/galleryCoverflow";

/**
 * GalleryCoverflow — the whole portfolio as ONE CONTINUOUS scroll-driven Cover
 * Flow. This is a showcase, not a shop: the visitor doesn't click through, they
 * *scroll*, and the flow glides photo to photo under a pinned timeline. When one
 * collection's photos run out the next carries straight on — Doors → Kalash →
 * Samovasaran → … — and the collection NAME changes with it. There is no filter
 * to pick from; the river IS the navigation, and the film-strip rail beneath
 * jumps to any collection.
 *
 * SIZING (the load-bearing bit). The stage is pinned at the very top of the
 * viewport, so ANY height it doesn't fit inside `100vh` is unreachable forever —
 * an earlier cut put the rail and the CTA permanently below the fold on a
 * 1366x768 laptop. So the stage is exactly `h-screen` (minus the header bar via
 * --pm-bar-bottom), the flow box takes the leftover space (`flex-1 min-h-0`), and
 * the card height `--ch` is MEASURED from that box at runtime (ResizeObserver)
 * rather than guessed from a viewport clamp. `--ch` is then also bounded so the
 * widest card in the flow still fits the box's width. Everything else — card
 * widths, x-offsets, the drop — is expressed in units of `--ch`, so a resize just
 * re-resolves one number.
 *
 * NO CROP (client mandate). Each card is `height: --ch; width: calc(--ch * ratio)`
 * with its own photo's ratio, so the frame matches the photo exactly and
 * object-cover crops zero pixels. The neighbour DROP is in --ch units too, not
 * px — a fixed px drop pushed off-centre cards past the bottom of the box on
 * small screens and the container shaved them.
 *
 * Because card widths differ, cards can't sit on a fixed grid: each card's slot
 * is the running sum of its neighbours' half-widths (`slots[]`, in --ch units),
 * so neighbours overlap by a consistent FRACTION of their own width in every run.
 *
 * On a fine pointer with motion allowed the section pins and scroll IS the
 * playhead — `pos` (0 … n-1) drives every card imperatively (no per-frame React
 * render); the glide comes from ScrollSmoother (smooth: 1.25), not from `scrub`.
 * On touch or reduced-motion it falls back to a 1:1 drag of the same flow, with
 * no pin. Arrow keys drive it on both.
 */

const STEP = 0.62; // neighbour pitch as a fraction of card width — loose = airy
const DROP_RATIO = 0.05; // a neighbour sinks this much of --ch per step (< 0.07 slack)
const SCALE_STEP = 0.14;
const TURN = 6; // deg of Y-rotation per step (capped at ±2 steps)
const VISIBLE = 2; // fully-shown cards each side; the next fades out
const CAP = 3; // transforms stop growing past this many steps out
const PARKED = CAP + 1; // past this the card is invisible — pose it once, then skip
const VH_PER_PHOTO = 24; // scrub runway each photo gets
const MOUNT_WINDOW = 6; // cards each side that mount an <Image>
const EAGER_WINDOW = 3; // …of which these fetch immediately (overflow-hidden defeats
//                          native lazy-load: a parked card is clipped out of the
//                          intersection rect, so it would only start loading as it
//                          slid into view, and pop in.)
const MAX_CH = 480; // px — the card never grows past this, however big the screen
const FIT = 0.88; // card height as a fraction of the flow box — the remainder is
//                   the slack a dropped, turned neighbour needs so the container
//                   never shaves its bottom corners.

/** Per-card pose. `o` = signed index distance from centre; `dx` = x offset in --ch units. */
function pose(o: number, dx: number) {
  const mag = Math.abs(o);
  const capped = Math.min(mag, CAP);
  const turn = Math.max(-2, Math.min(2, o)) * -TURN;
  return {
    transform:
      `translateX(calc(var(--ch) * ${dx.toFixed(4)})) ` +
      `translateY(calc(var(--ch) * ${(capped * DROP_RATIO).toFixed(4)})) ` +
      `scale(${(1 - capped * SCALE_STEP).toFixed(4)}) ` +
      `rotateY(${turn.toFixed(2)}deg)`,
    zIndex: Math.round(100 - mag * 10),
    opacity: mag <= VISIBLE ? 1 : Math.max(0, 1 - (mag - VISIBLE)),
  };
}

export default function GalleryCoverflow({ flow }: { flow: CoverflowFlow }) {
  const { photos, collections } = flow;
  const n = photos.length;

  /** Widest card in the flow — `--ch` is capped so even that one fits the box. */
  const maxRatio = useMemo(
    () => photos.reduce((m, p) => Math.max(m, p.ratio), 0.0001),
    [photos],
  );

  /** Slot centre of each card, in units of --ch: the running sum of half-widths,
   *  so a wide card pushes its neighbours further out than a narrow one does. */
  const slots = useMemo(() => {
    const s = new Array<number>(Math.max(1, n)).fill(0);
    for (let i = 1; i < n; i++) {
      s[i] = s[i - 1] + ((photos[i - 1].ratio + photos[i].ratio) / 2) * STEP;
    }
    return s;
  }, [photos, n]);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const fillRefs = useRef<(HTMLElement | null)[]>([]);
  const stRef = useRef<ScrollTrigger | null>(null);
  const parkedRef = useRef<boolean[]>([]);

  const posRef = useRef(0); // continuous centre (0 … n-1) — the single playhead
  const colRef = useRef(0);
  const centerRef = useRef(0);

  const [activeCol, setActiveCol] = useState(0);
  const [center, setCenter] = useState(0); // rounded centre — drives image mounting

  const clampPos = (p: number) => gsap.utils.clamp(0, Math.max(0, n - 1), p);

  /** Interpolated slot coordinate for a continuous position. */
  const slotAt = (p: number) => {
    const c = clampPos(p);
    const i = Math.floor(c);
    if (i >= n - 1) return slots[n - 1];
    return slots[i] + (slots[i + 1] - slots[i]) * (c - i);
  };

  /** Position every card for a continuous centre `pos`. Imperative: runs every
   *  frame, so it must never touch React state except on a real crossing. */
  const place = (pos: number) => {
    posRef.current = pos;
    const P = slotAt(pos);
    const cards = cardRefs.current;
    const parked = parkedRef.current;

    for (let i = 0; i < cards.length; i++) {
      const el = cards[i];
      if (!el) continue;
      const o = i - pos;
      // Far-off cards are invisible and unchanging — pose them once, then skip.
      // (Without this we'd write ~236 style props/frame for the whole runway.)
      if (Math.abs(o) > PARKED) {
        if (parked[i]) continue;
        parked[i] = true;
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        continue;
      }
      parked[i] = false;
      const p = pose(o, slots[i] - P);
      el.style.transform = p.transform;
      el.style.zIndex = String(p.zIndex);
      el.style.opacity = String(p.opacity);
      el.style.pointerEvents = p.opacity < 0.05 ? "none" : "auto";
    }

    // Film-strip rail: each collection's segment fills as the flow crosses it.
    for (let c = 0; c < collections.length; c++) {
      const el = fillRefs.current[c];
      if (!el) continue;
      const { start, count } = collections[c];
      const f = gsap.utils.clamp(0, 1, (pos - start + 0.5) / count);
      el.style.transform = `scaleX(${f.toFixed(4)})`;
    }

    if (cueRef.current) {
      cueRef.current.style.opacity = String(
        Math.max(0, 1 - (pos / Math.max(1, n - 1)) * 8),
      );
    }

    // Crossings — the only things allowed to re-render React.
    const idx = Math.round(clampPos(pos));
    if (idx !== centerRef.current) {
      centerRef.current = idx;
      setCenter(idx);
    }
    const col = photos[idx]?.collection ?? 0;
    if (col !== colRef.current) {
      colRef.current = col;
      setActiveCol(col);
    }
  };

  /** Send the flow to a photo index — scrolling in pinned mode, directly on touch. */
  const jumpTo = (index: number) => {
    const target = clampPos(index);
    const st = stRef.current;
    if (st) {
      const y = st.start + (target / Math.max(1, n - 1)) * (st.end - st.start);
      const smoother = ScrollSmoother.get();
      if (smoother) smoother.scrollTo(y, true);
      else window.scrollTo({ top: y, behavior: "smooth" });
      return;
    }
    gsap.to(posRef, {
      current: target,
      duration: 0.7,
      ease: "power3.out",
      overwrite: true,
      onUpdate: () => place(posRef.current),
    });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const at = Math.round(posRef.current);
    let target: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") target = at + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") target = at - 1;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = n - 1;
    if (target === null) return;
    e.preventDefault();
    jumpTo(target);
  };

  // ---- measure --ch from the box the flow actually got, so the stage always fits ----
  useIsomorphicLayoutEffect(() => {
    const box = flowRef.current;
    if (!box || !n) return;
    const apply = () => {
      const h = box.clientHeight;
      const w = box.clientWidth;
      if (!h || !w) return;
      // Three bounds, tightest ALWAYS wins — no lower floor, because a floor that
      // outgrew the box would make the card taller than its overflow-hidden
      // parent and bring the crop straight back:
      //  - HEIGHT: only FIT of the box, so a dropped+turned neighbour still has
      //    slack under it. (At ch == h the drop + perspective magnification push
      //    the bottom corner onto the clip edge and shave the photo.)
      //  - WIDTH: the widest card in the whole flow must fit the box.
      //  - an absolute cap, so it never gets silly on a huge screen.
      const ch = Math.min(h * FIT, (w * 0.92) / maxRatio, MAX_CH);
      box.style.setProperty("--ch", `${ch}px`);
      ScrollTrigger.refresh();
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(box);
    return () => ro.disconnect();
  }, [n, maxRatio]);

  // ---- scroll-scrub (fine pointer) / drag fallback (touch · reduced motion) ----
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const box = flowRef.current;
    if (!root || !stage || !box || !n) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        // The runway grows with the flow. The stage is exactly 100vh, so the
        // pin spacer and this height stay consistent.
        root.style.height = `${Math.max(300, n * VH_PER_PHOTO)}vh`;
        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => place(self.progress * (n - 1)),
          onRefresh: (self) => place(self.progress * (n - 1)),
        });
        stRef.current = st;
        return () => {
          st.kill();
          stRef.current = null;
          root.style.height = "";
        };
      });

      // Touch / reduced-motion: no pin (never hijack the page). A finger drag —
      // itself a scroll gesture — moves the flow 1:1 with the card under it.
      mm.add("(pointer: coarse), (prefers-reduced-motion: reduce)", () => {
        root.style.height = "";
        place(0);
        let active: { id: number; x: number; from: number } | null = null;

        /** px the flow travels per unit of `pos` AT this point in the flow — the
         *  local slot gradient. A constant would only be right for square cards. */
        const gradient = (at: number) => {
          const ch =
            parseFloat(getComputedStyle(box).getPropertyValue("--ch")) || 300;
          const g = (slotAt(at + 0.5) - slotAt(at - 0.5)) * ch;
          return Math.abs(g) < 1 ? 1 : g;
        };

        const down = (e: PointerEvent) => {
          active = { id: e.pointerId, x: e.clientX, from: posRef.current };
          box.setPointerCapture(e.pointerId);
          gsap.killTweensOf(posRef);
        };
        const move = (e: PointerEvent) => {
          if (!active || e.pointerId !== active.id) return;
          if (e.buttons === 0 && e.pointerType === "mouse") return void end();
          place(
            clampPos(active.from - (e.clientX - active.x) / gradient(active.from)),
          );
        };
        const end = () => {
          if (!active) return;
          active = null;
          gsap.to(posRef, {
            current: clampPos(Math.round(posRef.current)),
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
            onUpdate: () => place(posRef.current),
          });
        };

        box.addEventListener("pointerdown", down);
        box.addEventListener("pointermove", move);
        box.addEventListener("pointerup", end);
        // A vertical page-swipe that starts on the flow is taken over by the
        // browser and fires pointercancel, NOT pointerup — without this the drag
        // stays "active" with a stale origin and the next move teleports the flow.
        box.addEventListener("pointercancel", end);
        return () => {
          box.removeEventListener("pointerdown", down);
          box.removeEventListener("pointermove", move);
          box.removeEventListener("pointerup", end);
          box.removeEventListener("pointercancel", end);
        };
      });
    }, root);

    return () => {
      ctx.revert();
      // jump/snap tweens are created from callbacks, so the context never adopted them.
      gsap.killTweensOf(posRef);
    };
  }, [n]);

  // A React re-render (image window / name) re-applies the JSX `style` prop, so
  // re-assert the live pose before paint. useLayoutEffect => no flicker.
  useIsomorphicLayoutEffect(() => {
    if (n) place(posRef.current);
  });

  // The collection name arrives with the flow.
  useIsomorphicLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    const tw = gsap.fromTo(
      el,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.55, ease: "power2.out", overwrite: true },
    );
    return () => {
      tw.kill();
    };
  }, [activeCol]);

  if (!n) return null;

  const col = collections[activeCol];
  const within = center - col.start + 1; // 1-based position inside this collection

  return (
    <div ref={rootRef} className="relative">
      <div
        ref={stageRef}
        // h-screen (not min-h): the stage is pinned at the top, so anything that
        // doesn't fit inside the viewport can never be scrolled to.
        className="flex h-screen flex-col items-center justify-center gap-5 px-4 pb-6 pt-[var(--pm-bar-bottom,4rem)]"
      >
        {/* ---------- the collection, named as the flow reaches it ---------- */}
        <div ref={nameRef} className="flex flex-col items-center gap-1.5 text-center">
          {/* Only the collection is announced — the per-photo counter below would
              otherwise fire the live region on all 58 photo crossings. */}
          <div aria-live="polite">
            <p className="pm-eyebrow font-body text-maroon/70">
              Collection {activeCol + 1} of {collections.length}
            </p>
            <h2 className="pm-h2 mt-1 font-display text-heading-brown">
              {col.label}
            </h2>
          </div>
          <p className="pm-small font-body text-maroon/70" aria-hidden>
            {within} of {col.count}{" "}
            {col.count === 1 ? "installation" : "installations"}
          </p>
        </div>

        {/* ---------- the flow (takes whatever height is left) ---------- */}
        <div
          ref={flowRef}
          role="slider"
          tabIndex={0}
          aria-label="Gallery position — use the arrow keys"
          aria-valuemin={0}
          aria-valuemax={n - 1}
          aria-valuenow={center}
          aria-valuetext={`${col.label}, ${within} of ${col.count}`}
          onKeyDown={onKeyDown}
          className="relative flex w-full min-h-0 flex-1 touch-pan-y items-center justify-center overflow-hidden [perspective:1600px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          // SSR fallback until the ResizeObserver measures the real box.
          style={{ ["--ch" as string]: "clamp(15rem,38vh,30rem)" }}
        >
          {photos.map((p, i) => {
            const init = pose(i - center, slots[i] - slots[center]);
            const d = Math.abs(i - center);
            if (d > MOUNT_WINDOW) {
              // Keep the node (transforms target it) but don't pay for the image.
              return (
                <div
                  key={p.src}
                  data-card
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  aria-hidden
                  className="absolute h-[var(--ch)] rounded-card"
                  style={{
                    width: `calc(var(--ch) * ${p.ratio.toFixed(4)})`,
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                />
              );
            }
            const label = collections[p.collection].label;
            return (
              <div
                key={p.src}
                data-card
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="absolute h-[var(--ch)] overflow-hidden rounded-card bg-cream-deep shadow-[0_30px_64px_-30px_rgba(46,35,19,0.6)] ring-1 ring-black/5 select-none"
                style={{
                  // The frame adopts the photo's own ratio -> zero crop.
                  width: `calc(var(--ch) * ${p.ratio.toFixed(4)})`,
                  transform: init.transform,
                  zIndex: init.zIndex,
                  opacity: init.opacity,
                }}
              >
                <Image
                  src={p.src}
                  alt={`${label} — installation ${i - collections[p.collection].start + 1}`}
                  fill
                  draggable={false}
                  loading={d <= EAGER_WINDOW ? "eager" : "lazy"}
                  sizes={`(min-width: 1024px) ${Math.round(MAX_CH * p.ratio)}px, ${Math.round((92 * p.ratio) / maxRatio)}vw`}
                  className="object-cover select-none"
                />
              </div>
            );
          })}

          {/* Soft edges: cards drift into the cream instead of being hard-cut by
              the container. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[200] w-10 bg-gradient-to-r from-cream to-transparent sm:w-24"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-[200] w-10 bg-gradient-to-l from-cream to-transparent sm:w-24"
          />
        </div>

        {/* ---------- film-strip rail: every collection, in flow order ---------- */}
        <div className="flex w-full max-w-4xl flex-col items-center gap-3 px-2">
          <div className="flex w-full items-center gap-1.5">
            {collections.map((c, i) => (
              <button
                key={c.label}
                type="button"
                onClick={() => jumpTo(c.start)}
                title={`${c.label} — ${c.count} photos`}
                aria-label={`Jump to ${c.label}`}
                aria-current={i === activeCol ? "true" : undefined}
                style={{ flexGrow: c.count }}
                className="group relative h-5 basis-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <span
                  className={cn(
                    "absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full transition-colors duration-300",
                    i === activeCol
                      ? "bg-olive/25"
                      : "bg-olive/12 group-hover:bg-olive/25",
                  )}
                >
                  <span
                    ref={(el) => {
                      fillRefs.current[i] = el;
                    }}
                    className="absolute inset-0 origin-left rounded-full bg-gold"
                    style={{ transform: "scaleX(0)" }}
                  />
                </span>
              </button>
            ))}
          </div>

          <Button variant="outline" size="md" href={col.href}>
            View all {col.label}
          </Button>
        </div>

        {/* ---------- scroll cue (fades as the flow begins) ---------- */}
        <div
          ref={cueRef}
          aria-hidden
          className="flex items-center gap-2 font-display pm-micro text-maroon/60"
        >
          Scroll — each collection flows into the next
          <svg
            viewBox="0 0 24 24"
            className="size-4 animate-bounce text-olive/60"
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
