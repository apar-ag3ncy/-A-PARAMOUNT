"use client";

import { useRef } from "react";
import Image from "next/image";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * FannedGalleryRail — the portfolio as a single horizontal FAN of cards that the
 * visitor SWIPES left↔right (reference design). Uniform portrait tiles ride a
 * stationary shallow arc: whatever card sits on the left leans out one way and
 * dips a touch, the centre one stands upright and highest, the right one leans
 * out the other way — and the cards FLOW THROUGH that fixed arc as the rail
 * scrolls, so the envelope stays put while the imagery moves under it.
 *
 * ONE rAF owns everything (no per-frame React render): it advances a single
 * `offset` (px) by a gentle auto-scroll plus any release inertia, wraps it
 * modulo the reel width for a seamless infinite loop, and writes each visible
 * card's transform/opacity/z directly. A pointer drag scrubs `offset` 1:1 and
 * hands its velocity to the inertia on release; a fine-pointer hover pauses the
 * auto-drift so the work can be inspected. Reduced-motion => no drift, drag only.
 *
 * The photos are in-situ INSTALLATION photography (not white-ground studio
 * shots), so a uniform portrait card with `object-cover` is correct here — the
 * no-crop mandate governs the /products catalog tiles, not these scenes.
 */

export interface ReelCard {
  src: string;
  label: string;
  href: string;
}

const ASPECT = 0.64; // card width / height — tall portrait, matching the reference
const PITCH_FRAC = 1.14; // card-to-card pitch as a fraction of card width (small gap)
const ROT_MAX = 7; // deg the outermost card in the arc leans
const LIFT_FRAC = 0.05; // edge cards dip this fraction of card height below centre
const SCALE_DROP = 0.06; // outermost card shrinks by this much
const SPEED = 46; // px/sec auto-drift (≈ one card every ~4s)
const FRICTION = 0.94; // per-frame inertia decay (frame-rate normalised)

interface Metrics {
  cardW: number;
  cardH: number;
  pitch: number;
  total: number; // full reel width, the wrap period
  radius: number; // px from centre at which a card reaches full ROT_MAX
  visHalf: number; // half-width of the visible band (beyond it a card is parked)
  fade: number; // fade band width
  lift: number; // px
}

export default function FannedGalleryRail({ cards }: { cards: ReelCard[] }) {
  const n = cards.length;

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const parkedRef = useRef<boolean[]>([]);

  const offsetRef = useRef(0); // the single playhead (px), wrapped to [0,total)
  const velRef = useRef(0); // inertia on top of the auto-drift (px/sec)
  const draggingRef = useRef(false);
  const hoverRef = useRef(false);
  const reducedRef = useRef(false);
  const metricsRef = useRef<Metrics | null>(null);

  // ---- measure the arc from the real container so it stays responsive ----
  const measure = () => {
    const root = rootRef.current;
    if (!root) return;
    const w = root.clientWidth;
    if (!w) return;
    const cardW = Math.min(196, Math.max(146, w * 0.14));
    const cardH = cardW / ASPECT;
    const pitch = cardW * PITCH_FRAC;
    const m: Metrics = {
      cardW,
      cardH,
      pitch,
      total: n * pitch,
      radius: w * 0.42,
      visHalf: w / 2 + cardW * 0.9,
      fade: cardW * 0.8,
      lift: cardH * LIFT_FRAC,
    };
    metricsRef.current = m;
    root.style.setProperty("--cw", `${cardW}px`);
    root.style.setProperty("--ch", `${cardH}px`);
  };

  const wrap = (o: number) => {
    const total = metricsRef.current?.total || 1;
    return ((o % total) + total) % total;
  };

  /** Position every card for the current `offset`. Imperative — no React state. */
  const layout = () => {
    const m = metricsRef.current;
    const cards = cardRefs.current;
    const parked = parkedRef.current;
    if (!m) return;
    const off = offsetRef.current;
    const half = m.total / 2;

    for (let i = 0; i < cards.length; i++) {
      const el = cards[i];
      if (!el) continue;
      // Signed distance from centre, wrapped into [-half, half) so a card that
      // runs off one side reappears on the other — the seamless loop.
      let cx = i * m.pitch - off;
      cx = ((cx % m.total) + m.total) % m.total;
      if (cx > half) cx -= m.total;

      const mag = Math.abs(cx);
      if (mag > m.visHalf) {
        // Off the visible band: hide once, then skip (no style writes/frame).
        if (parked[i]) continue;
        parked[i] = true;
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        continue;
      }
      parked[i] = false;

      const t = cx / m.radius; // -1 … 1 across the arc (clamped for the pose)
      const tc = Math.max(-1, Math.min(1, t));
      const rot = ROT_MAX * tc;
      const ty = m.lift * Math.min(t * t, 1.6);
      const sc = 1 - SCALE_DROP * Math.abs(tc);
      const op =
        mag <= m.visHalf - m.fade
          ? 1
          : Math.max(0, (m.visHalf - mag) / m.fade);

      el.style.transform =
        `translate(-50%,-50%) translateX(${cx.toFixed(2)}px) ` +
        `translateY(${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) ` +
        `scale(${sc.toFixed(4)})`;
      el.style.zIndex = String(Math.round(1000 - mag));
      el.style.opacity = op.toFixed(3);
      el.style.pointerEvents = op < 0.05 ? "none" : "auto";
    }
  };

  // ---- the animation loop + drag, all in one context for clean teardown ----
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !n) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    measure();
    // measure() no-ops until the box has a real width; the ResizeObserver below
    // fires with the true size and finishes the setup, so never assume metrics.
    let seeded = false;
    const seedOffset = () => {
      const m = metricsRef.current;
      if (!m || seeded) return;
      seeded = true;
      offsetRef.current = wrap(m.pitch * 0.5); // start just off a seam
    };
    seedOffset();
    layout();

    const ro = new ResizeObserver(() => {
      measure();
      seedOffset();
      layout();
    });
    ro.observe(root);

    // -------- rAF: auto-drift + inertia --------
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      if (!draggingRef.current) {
        const drifting =
          !reducedRef.current && !(finePointer && hoverRef.current);
        if (drifting) offsetRef.current += SPEED * dt;
        if (velRef.current) {
          offsetRef.current += velRef.current * dt;
          velRef.current *= Math.pow(FRICTION, dt * 60);
          if (Math.abs(velRef.current) < 2) velRef.current = 0;
        }
        offsetRef.current = wrap(offsetRef.current);
        layout();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // -------- pointer drag: scrub 1:1, hand velocity to inertia --------
    let active: number | null = null;
    let lastX = 0;
    let lastT = 0;

    const down = (e: PointerEvent) => {
      active = e.pointerId;
      draggingRef.current = true;
      velRef.current = 0;
      lastX = e.clientX;
      lastT = now();
      root.setPointerCapture(e.pointerId);
      root.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (active === null || e.pointerId !== active) return;
      if (e.buttons === 0 && e.pointerType === "mouse") return void up(e);
      const dx = e.clientX - lastX;
      const t = now();
      const dtm = Math.max(0.001, (t - lastT) / 1000);
      lastX = e.clientX;
      lastT = t;
      offsetRef.current = wrap(offsetRef.current - dx);
      // smoothed release velocity (px/sec); drag left => offset grows => +vel
      velRef.current = 0.8 * (-dx / dtm) + 0.2 * velRef.current;
      layout();
    };
    const up = (e: PointerEvent) => {
      if (active === null) return;
      try {
        root.releasePointerCapture(active);
      } catch {
        /* capture may already be gone on cancel */
      }
      active = null;
      draggingRef.current = false;
      root.style.cursor = "";
      void e;
    };

    const enter = () => {
      hoverRef.current = true;
    };
    const leave = () => {
      hoverRef.current = false;
    };

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  // Keyboard: nudge the reel one card either way (via the inertia channel).
  const onKeyDown = (e: React.KeyboardEvent) => {
    const m = metricsRef.current;
    if (!m) return;
    if (e.key === "ArrowRight") velRef.current = m.pitch * 3;
    else if (e.key === "ArrowLeft") velRef.current = -m.pitch * 3;
    else return;
    e.preventDefault();
  };

  if (!n) return null;

  return (
    <div
      ref={rootRef}
      role="group"
      tabIndex={0}
      aria-label="Installation gallery — drag left or right to explore"
      onKeyDown={onKeyDown}
      className="relative w-full cursor-grab touch-pan-y select-none overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      style={{ height: "calc(var(--ch, 22rem) + 4rem)", ["--cw" as string]: "12rem", ["--ch" as string]: "19rem" }}
    >
      {cards.map((c, i) => (
        <figure
          key={`${c.src}-${i}`}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute top-1/2 left-1/2 m-0 overflow-hidden rounded-[1.4rem] bg-cream-deep opacity-0 shadow-[0_34px_70px_-34px_rgba(46,35,19,0.62)] ring-1 ring-black/[0.06] will-change-transform"
          style={{ width: "var(--cw)", height: "var(--ch)" }}
        >
          {/* Clean photo cards (reference has no labels). Every image is eager
              with a small `sizes`, so a card that wraps or drags into view is
              already painted — no blank pop, the client's smoothness bar. */}
          <Image
            src={c.src}
            alt={`${c.label} — installation`}
            fill
            draggable={false}
            loading="eager"
            sizes="224px"
            className="pointer-events-none object-cover select-none"
          />
        </figure>
      ))}

      {/* soft cream edges — cards drift out instead of being hard-cut */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[1200] w-12 bg-gradient-to-r from-cream to-transparent sm:w-28"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-[1200] w-12 bg-gradient-to-l from-cream to-transparent sm:w-28"
      />
    </div>
  );
}

/** performance.now, guarded for SSR (the effect only runs client-side anyway). */
function now() {
  return typeof performance !== "undefined" ? performance.now() : 0;
}
