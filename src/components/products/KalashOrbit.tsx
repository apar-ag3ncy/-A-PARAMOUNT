"use client";

import { useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { createFrameSequence } from "@/lib/frameSequence";

/**
 * KalashOrbit — Multi-Axis 4D Spatial Orbit Viewer
 *
 *  - 360° Horizontal turntable rotation (scratches through 96 photographic frames)
 *  - Vertical spatial tilt (3D pitch perspective -14° to +14°)
 *  - Dynamic 4D Specular Shading (light angle & reflections shift with rotation + tilt)
 *  - Contact shadow response (pedestal shadow tilts & scales with perspective)
 *  - Micro-depth scale on drag (1.025x hand feel)
 *  - Keyboard navigation (← → rotate, ↑ ↓ tilt, Home resets)
 */

const FRAME_COUNT = 96;
const TIERS = [640, 1024] as const;
const srcFor = (tier: number, i: number) =>
  `/kalash/orbit/${tier}/f-${String(i).padStart(3, "0")}.webp`;

const DEG_PER_FRAME = 360 / FRAME_COUNT;
const DEG_PER_PX_X = 0.45;
const DEG_PER_PX_Y = 0.25;
const MAX_PITCH = 14;
const TAU = 0.75;
const EPS_DEG_S = 2;

export default function KalashOrbit({ label }: { label?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    const cv = canvasRef.current;
    const light = lightRef.current;
    const shadow = shadowRef.current;
    if (!wrap || !stage || !cv) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx2d = cv.getContext("2d");
    if (!ctx2d) return;

    const px = wrap.getBoundingClientRect().width * Math.min(devicePixelRatio, 2);
    const tier = px > 700 ? TIERS[1] : TIERS[0];

    const seq = createFrameSequence({
      count: FRAME_COUNT,
      src: (i) => srcFor(tier, i),
      strides: [8, 4, 2, 1],
      concurrency: 4,
      wrap: true,
      onFrame: (_i, first) => {
        if (!first) return;
        setReady(true);
        requestPaint();
      },
    });

    let angle = 0;
    let pitch = 0;
    let drawn = -1;
    let drawnPitch = -999;
    let needPaint = false;

    const paint = () => {
      needPaint = false;
      const idx =
        ((Math.round(angle / DEG_PER_FRAME) % FRAME_COUNT) + FRAME_COUNT) %
        FRAME_COUNT;
      const j = seq.nearest(idx);

      const clampedPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));
      const currentScale = dragging ? 1.025 : 1;
      stage.style.transform = `perspective(1000px) rotateX(${clampedPitch}deg) scale(${currentScale})`;

      if (light) {
        const rad = (angle * Math.PI) / 180;
        const lightX = 50 + Math.sin(rad) * 35;
        const lightY = 40 - (clampedPitch / MAX_PITCH) * 20;
        light.style.background = `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255, 245, 220, 0.35) 0%, rgba(240, 215, 160, 0.12) 30%, transparent 65%)`;
      }

      if (shadow) {
        const shadowShiftY = (clampedPitch / MAX_PITCH) * 8;
        shadow.style.transform = `translateY(${shadowShiftY}px) scale(${1 - Math.abs(clampedPitch) * 0.015})`;
        shadow.style.opacity = String(0.7 - Math.abs(clampedPitch) * 0.02);
      }

      if (j < 0 || (j === drawn && Math.abs(clampedPitch - drawnPitch) < 0.1)) return;

      const img = seq.get(j)!;
      const w = cv.width;
      if (w === 0) return;
      ctx2d.clearRect(0, 0, w, w);
      ctx2d.drawImage(img, 0, 0, w, w);
      drawn = j;
      drawnPitch = clampedPitch;
      wrap.setAttribute("aria-valuenow", String(idx * DEG_PER_FRAME | 0));
    };

    const requestPaint = () => {
      needPaint = true;
      wake();
    };

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

    let raf = 0;
    let running = false;
    let last = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragging = false;

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      let moving = false;
      if (!dragging && (Math.abs(velocityX) > EPS_DEG_S || Math.abs(velocityY) > 0.5)) {
        angle += velocityX * dt;
        pitch += velocityY * dt;
        pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch));

        velocityX *= Math.exp(-dt / TAU);
        velocityY *= Math.exp(-dt / (TAU * 0.5));

        if (Math.abs(velocityX) <= EPS_DEG_S) velocityX = 0;
        if (Math.abs(velocityY) <= 0.5) velocityY = 0;

        requestPaintOnly();
        moving = true;
      } else if (!dragging && Math.abs(pitch) > 0.1) {
        pitch *= Math.exp(-dt * 4);
        if (Math.abs(pitch) <= 0.1) pitch = 0;
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

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          requestPaint();
        }
      },
      { rootMargin: "80px" },
    );
    io.observe(wrap);

    let startX = 0;
    let startY = 0;
    let startAngle = 0;
    let startPitch = 0;
    let hist: { x: number; y: number; t: number }[] = [];

    const onDown = (e: PointerEvent) => {
      dragging = true;
      velocityX = 0;
      velocityY = 0;
      startX = e.clientX;
      startY = e.clientY;
      startAngle = angle;
      startPitch = pitch;
      hist = [{ x: e.clientX, y: e.clientY, t: e.timeStamp }];
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = "grabbing";
      requestPaint();
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      angle = startAngle + dx * DEG_PER_PX_X;
      pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, startPitch - dy * DEG_PER_PX_Y));

      hist.push({ x: e.clientX, y: e.clientY, t: e.timeStamp });
      while (hist.length > 2 && e.timeStamp - hist[0].t > 80) hist.shift();
      requestPaint();
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = "grab";

      if (!reduced && hist.length > 1) {
        const a = hist[0];
        const b = hist[hist.length - 1];
        const dt = (b.t - a.t) / 1000;
        if (dt > 0) {
          velocityX = Math.max(-540, Math.min(540, ((b.x - a.x) / dt) * DEG_PER_PX_X));
          velocityY = Math.max(-120, Math.min(120, ((a.y - b.y) / dt) * DEG_PER_PX_Y));
        }
      }
      wake();
    };

    const onKey = (e: KeyboardEvent) => {
      const step = (e.shiftKey ? 3 : 1) * DEG_PER_FRAME;
      if (e.key === "ArrowLeft") angle -= step;
      else if (e.key === "ArrowRight") angle += step;
      else if (e.key === "ArrowUp") pitch = Math.min(MAX_PITCH, pitch + 4);
      else if (e.key === "ArrowDown") pitch = Math.max(-MAX_PITCH, pitch - 4);
      else if (e.key === "Home") {
        angle = 0;
        pitch = 0;
      } else return;

      e.preventDefault();
      velocityX = 0;
      velocityY = 0;
      requestPaint();
    };

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    wrap.addEventListener("keydown", onKey);

    fit();
    seq.start();
    wake();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("keydown", onKey);
      seq.dispose();
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        ref={wrapRef}
        role="slider"
        aria-label="Turn the silver kalash in 4D"
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuenow={0}
        aria-valuetext="Drag across and up/down, or use arrow keys, to turn the vessel in 4D"
        tabIndex={0}
        className="relative aspect-square w-full touch-none overflow-hidden rounded-card border border-olive/25 bg-cream-deep outline-none select-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        style={{ cursor: "grab" }}
      >
        {/* Pedestal Contact Shadow Layer */}
        <div
          ref={shadowRef}
          aria-hidden
          className="pointer-events-none absolute bottom-[6%] left-[15%] right-[15%] h-[12%] rounded-[100%] bg-maroon/20 blur-md transition-transform duration-100 ease-out"
        />

        {/* 4D Spatial Stage Frame */}
        <div
          ref={stageRef}
          className="relative h-full w-full transition-transform duration-150 ease-out will-change-transform"
        >
          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 h-full w-full transition-opacity duration-700 ease-out"
            style={{ opacity: ready ? 1 : 0 }}
          />

          {/* Dynamic 4D Specular Shading / Catch-Light Overlay */}
          <div
            ref={lightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-soft-light transition-opacity duration-300"
            style={{ opacity: ready ? 1 : 0 }}
          />
        </div>

        {!ready && (
          <span className="absolute inset-0 flex items-center justify-center font-display text-[12px] tracking-[0.24em] text-maroon/50 uppercase">
            Loading 4D Orbit…
          </span>
        )}

        <div className="pointer-events-none absolute right-0 bottom-4 left-0 flex items-center justify-center gap-2 text-center">
          <span className="rounded-full bg-cream/75 px-3.5 py-1 font-display text-[11px] tracking-[0.22em] text-maroon uppercase backdrop-blur-sm shadow-xs border border-olive/20">
            {label ? `${label} · 4D ORBIT` : "4D SPATIAL ORBIT"} · TURN IN YOUR HANDS
          </span>
        </div>
      </div>
    </div>
  );
}

