"use client";

import { useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { createFrameSequence } from "@/lib/frameSequence";

/**
 * KalashOrbit — the silver kalash, turned by the visitor's own hand.
 *
 * A real 360° turntable film of the product photograph (AI-generated from the
 * client's `Pakshal kalash` shot, start & end frame pinned to the same photo so
 * the loop closes seamlessly) is baked offline to WebP frames and scrubbed on a
 * canvas. No three.js, no WebGL, nothing procedural at runtime — every angle is
 * a finished photograph, so the look can never smear or glitch (the house rule
 * after three failed photo-projection attempts; see CLAUDE.md).
 *
 * Interaction, in the register of a Cartier product viewer:
 *  - drag maps 1:1 to rotation (pointer capture; vertical page scroll preserved)
 *  - release carries momentum — velocity decays on an exponential falloff
 *  - after a quiet pause the vessel resumes a slow, museum-turntable idle spin,
 *    easing in; any touch instantly yields it back to the hand
 *  - keyboard: ← → rotate (Shift for coarse), Home returns to the front face
 *  - `prefers-reduced-motion`: no idle spin, no inertia — drag alone rotates
 *
 * Frames decode progressively (createImageBitmap, off the main thread) in a
 * coarse-to-fine stride order, and the painter falls back to the nearest
 * decoded frame — the drag feels instant while the tail is still arriving.
 * (Same proven machinery as DoorScroll.)
 */

/** Must match the bake (scripts in git history / public/kalash/orbit). */
const FRAME_COUNT = 96;
const TIERS = [640, 1024] as const;
const srcFor = (tier: number, i: number) =>
  `/kalash/orbit/${tier}/f-${String(i).padStart(3, "0")}.webp`;

const DEG_PER_FRAME = 360 / FRAME_COUNT;
/** Full revolution ≈ one comfortable drag across the card (~2.2x its width). */
const DEG_PER_PX = 0.45;
/** Inertia: v *= exp(-dt/TAU); stops below EPS. */
const TAU = 0.75;
const EPS_DEG_S = 2;
/** Idle spin: eases in after IDLE_MS of stillness, at IDLE_DEG_S degrees/sec. */
const IDLE_MS = 2800;
const IDLE_DEG_S = 16;
const EASE_IN_S = 1.6;

export default function KalashOrbit({ label }: { label?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx2d = cv.getContext("2d");
    if (!ctx2d) return;

    /* ---------- frame store: progressive, decoded off the main thread ---------- */
    // Pick the tier once from the rendered size — the card is static layout.
    const px = wrap.getBoundingClientRect().width * Math.min(devicePixelRatio, 2);
    const tier = px > 700 ? TIERS[1] : TIERS[0];

    // `wrap: true` because this is a LOOP — frame 95's neighbour is frame 0, so
    // a gap near the seam falls back across it rather than to the far side.
    const seq = createFrameSequence({
      count: FRAME_COUNT,
      src: (i) => srcFor(tier, i),
      // Every 8th frame lands in the first breath, so dragging is responsive
      // immediately; the gaps fill in behind it.
      strides: [8, 4, 2, 1],
      concurrency: 4,
      wrap: true,
      onFrame: (_i, first) => {
        if (!first) return;
        setReady(true);
        requestPaint();
      },
    });

    /* ---------- painter ---------- */
    let angle = 0; // degrees, unbounded; frame = angle mod 360
    let drawn = -1;
    let needPaint = false;

    const paint = () => {
      needPaint = false;
      const idx =
        ((Math.round(angle / DEG_PER_FRAME) % FRAME_COUNT) + FRAME_COUNT) %
        FRAME_COUNT;
      const j = seq.nearest(idx);
      if (j < 0 || j === drawn) return;
      const img = seq.get(j)!;
      const w = cv.width;
      if (w === 0) return;
      ctx2d.drawImage(img, 0, 0, w, w);
      drawn = j;
      wrap.setAttribute("aria-valuenow", String(idx * DEG_PER_FRAME | 0));
    };
    const requestPaint = () => {
      needPaint = true;
      wake();
    };

    // Canvas backing store follows the card's rendered size.
    const fit = () => {
      const side = Math.round(
        wrap.getBoundingClientRect().width * Math.min(devicePixelRatio, 2),
      );
      if (side && cv.width !== side) {
        cv.width = side;
        cv.height = side;
        drawn = -1;
        requestPaint();
      }
    };
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);

    /* ---------- motion loop: runs only while something moves ---------- */
    let raf = 0;
    let running = false;
    let last = 0;
    let velocity = 0; // deg/s, from release
    let lastInputAt = -Infinity; // performance.now() of the last user touch
    let dragging = false;
    let inView = false;

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      let moving = false;
      if (!dragging && Math.abs(velocity) > EPS_DEG_S) {
        // momentum from the throw
        angle += velocity * dt;
        velocity *= Math.exp(-dt / TAU);
        if (Math.abs(velocity) <= EPS_DEG_S) velocity = 0;
        requestPaintOnly();
        moving = true;
      }

      if (needPaint) paint();
      if (moving || needPaint) {
        raf = requestAnimationFrame(tick);
        running = true;
      } else {
        running = false;
      }
    };
    const requestPaintOnly = () => {
      needPaint = true;
    };
    const wake = () => {
      if (!running && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
        running = true;
      }
    };

    // Paint initial view when scrolled into view
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) {
          requestPaint();
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(wrap);

    /* ---------- drag ---------- */
    let startX = 0;
    let startAngle = 0;
    // short history for a stable release velocity (px/ms over the last ~80ms)
    let hist: { x: number; t: number }[] = [];

    const onDown = (e: PointerEvent) => {
      dragging = true;
      velocity = 0;
      startX = e.clientX;
      startAngle = angle;
      hist = [{ x: e.clientX, t: e.timeStamp }];
      lastInputAt = performance.now();
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      angle = startAngle + (e.clientX - startX) * DEG_PER_PX;
      hist.push({ x: e.clientX, t: e.timeStamp });
      while (hist.length > 2 && e.timeStamp - hist[0].t > 80) hist.shift();
      lastInputAt = performance.now();
      requestPaint();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = "grab";
      lastInputAt = performance.now();
      if (!reduced && hist.length > 1) {
        const a = hist[0];
        const b = hist[hist.length - 1];
        const dt = (b.t - a.t) / 1000;
        if (dt > 0) {
          // px/s -> deg/s, capped so a flick never becomes a blur
          velocity = Math.max(-540, Math.min(540, ((b.x - a.x) / dt) * DEG_PER_PX));
        }
      }
      wake();
    };
    const onKey = (e: KeyboardEvent) => {
      const step = (e.shiftKey ? 3 : 1) * DEG_PER_FRAME;
      if (e.key === "ArrowLeft") angle -= step;
      else if (e.key === "ArrowRight") angle += step;
      else if (e.key === "Home") angle = 0;
      else return;
      e.preventDefault();
      velocity = 0;
      lastInputAt = performance.now();
      requestPaint();
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    wrap.addEventListener("keydown", onKey);

    fit();
    seq.start();
    if (!reduced) wake();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("keydown", onKey);
      seq.dispose(); // cancels in-flight decodes and frees the ImageBitmaps
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        ref={wrapRef}
        role="slider"
        aria-label="Rotate the silver kalash"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={0}
        aria-valuetext="Drag, or use the arrow keys, to turn the vessel"
        tabIndex={0}
        className="relative aspect-square w-full touch-pan-y overflow-hidden rounded-card border border-olive/25 bg-cream-deep outline-none select-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        style={{ cursor: "grab" }}
      >
        <canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-out"
          style={{ opacity: ready ? 1 : 0 }}
        />
        {!ready && (
          <span className="absolute inset-0 flex items-center justify-center font-display text-[12px] tracking-[0.24em] text-maroon/50 uppercase">
            Loading…
          </span>
        )}
        {label && (
          <span className="pointer-events-none absolute right-0 bottom-4 left-0 text-center font-display text-[12px] tracking-[0.24em] text-maroon/60 uppercase">
            {label} · drag to rotate
          </span>
        )}
      </div>
    </div>
  );
}
