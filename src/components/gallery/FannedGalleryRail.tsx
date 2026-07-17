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
 * `offset` (px) by a CONTINUOUS always-on auto-scroll (≈1 card-pitch/sec, like
 * the reference marquee — it never pauses on hover) plus any release inertia,
 * wraps it modulo the reel width for a seamless infinite loop, and writes each
 * visible card's transform/opacity/z directly. A pointer drag scrubs `offset`
 * 1:1 and hands its velocity to the inertia on release, then the drift resumes.
 * Reduced-motion => no drift, drag only.
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

const ASPECT = 0.667; // card width / height — 2:3 portrait (measured 122×183 off the reference)
const PITCH_FRAC = 1.13; // card-to-card pitch as a fraction of card width (~13% gap, no overlap — ref)
const ROT_MAX = 8; // deg the cropped edge card leans (reference fans ~±8; outer-visible ~±5.4)
const LIFT_FRAC = 0.02; // near-zero: the reference arc is PURE rotation, centres ~collinear (<5px lift)
const SCALE_DROP = 0.05; // outermost card shrinks by this much
const AUTO_RATE = 1.0; // auto-drift in card-PITCHES per second (the reference marquee glides ~1/sec, linear)
const FRICTION = 0.94; // per-frame inertia decay (frame-rate normalised)

interface Metrics {
  cardW: number;
  cardH: number;
  pitch: number;
  total: number; // full reel width, the wrap period
  radius: number; // px from centre at which a card reaches full ROT_MAX
  visHalf: number; // half-width of the visible band (beyond it a card is parked)
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
  const reducedRef = useRef(false);
  const metricsRef = useRef<Metrics | null>(null);

  // ---- measure the arc from the real container so it stays responsive ----
  const measure = () => {
    const root = rootRef.current;
    if (!root) return;
    const w = root.clientWidth;
    if (!w) return;
    const cardW = Math.min(214, Math.max(156, w * 0.146));
    const cardH = cardW / ASPECT;
    const pitch = cardW * PITCH_FRAC;
    const m: Metrics = {
      cardW,
      cardH,
      pitch,
      total: n * pitch,
      radius: w * 0.4,
      visHalf: w / 2 + cardW * 0.9,
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

      el.style.transform =
        `translate(-50%,-50%) translateX(${cx.toFixed(2)}px) ` +
        `translateY(${ty.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) ` +
        `scale(${sc.toFixed(4)})`;
      el.style.zIndex = String(Math.round(1000 - mag));
      // OPAQUE: no edge fade — a card stays fully solid right up to the moment it
      // is clipped off by the card's rounded edge (overflow-hidden), then parks.
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
    }
  };

  // ---- the animation loop + drag, all in one context for clean teardown ----
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !n) return;

    reducedRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

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
        // Continuous always-on marquee — the reference NEVER pauses (no hover
        // stop); only reduced-motion or an active drag halts the drift.
        const pitch = metricsRef.current?.pitch || 0;
        if (!reducedRef.current) offsetRef.current += pitch * AUTO_RATE * dt;
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

    // Dev-only handle so the marquee can be stepped & MEASURED without a live rAF
    // (the preview tab freezes rAF). Stripped in production. Mirrors HomeFilm's
    // `window.__pmFilm`. `advance(sec)` runs exactly what one second of drift does.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __rail?: unknown }).__rail = {
        advance: (sec: number) => {
          const pitch = metricsRef.current?.pitch || 0;
          offsetRef.current = wrap(offsetRef.current + pitch * AUTO_RATE * sec);
          layout();
        },
        offset: () => offsetRef.current,
        pitch: () => metricsRef.current?.pitch || 0,
      };
    }

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

    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    root.addEventListener("pointercancel", up);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
      root.removeEventListener("pointercancel", up);
      if (process.env.NODE_ENV !== "production") {
        delete (window as unknown as { __rail?: unknown }).__rail;
      }
    };
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
      style={{ height: "calc(var(--ch, 20rem) + 2.75rem)", ["--cw" as string]: "12rem", ["--ch" as string]: "18rem" }}
    >
      {cards.map((c, i) => (
        <figure
          key={`${c.src}-${i}`}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute top-1/2 left-1/2 m-0 overflow-hidden rounded-[1.15rem] bg-cream-deep opacity-0 shadow-[0_10px_38px_-18px_rgba(46,35,19,0.18)] ring-1 ring-black/[0.04] will-change-transform"
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
            sizes="240px"
            className="pointer-events-none object-cover select-none"
          />
        </figure>
      ))}
      {/* No edge vignette — the reference clips its end cards HARD at the card's
          rounded corner (this rail sits inside the page's overflow-hidden card). */}
    </div>
  );
}

/** performance.now, guarded for SSR (the effect only runs client-side anyway). */
function now() {
  return typeof performance !== "undefined" ? performance.now() : 0;
}
