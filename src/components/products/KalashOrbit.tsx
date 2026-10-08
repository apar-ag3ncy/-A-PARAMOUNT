"use client";

import { useRef, useState } from "react";
import { getLenis } from "@/lib/lenis";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { createFrameSequence } from "@/lib/frameSequence";

const FRAME_COUNT = 96;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Isolated vertical gestures scrub the film; page scrolling never changes its view. */
export default function KalashOrbit() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const painter = canvas.getContext("2d", { alpha: false });
    if (!painter) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const tier = wrap.clientWidth * Math.min(devicePixelRatio, 2) > 700 ? 960 : 640;
    let target = 0;
    let current = 0;
    let inView = false;
    let disposed = false;
    let raf = 0;
    let lastTime = 0;
    let drawn = -1;
    let announced = -1;
    let dirty = true;

    const sequence = createFrameSequence({
      count: FRAME_COUNT,
      src: (i) => `/kalash/inspection/${tier}/f-${String(i).padStart(3, "0")}.webp`,
      strides: [8, 4, 2, 1],
      concurrency: 2,
      decodeWidth: Math.min(tier, 720),
      onFrame: () => { dirty = true; wake(); },
    });

    function paint() {
      const value = Math.round(current * 100);
      if (value !== announced) {
        wrap!.setAttribute("aria-valuenow", String(value));
        wrap!.setAttribute("aria-valuetext", value === 0 ? "Front view" : value === 100 ? "Top view" : "Viewing upper details");
        announced = value;
      }
      const frame = sequence.nearest(Math.round(current * (FRAME_COUNT - 1)));
      if (frame < 0 || frame === drawn || !canvas!.width) return;
      painter!.drawImage(sequence.get(frame)!, 0, 0, canvas!.width, canvas!.height);
      if (drawn < 0) setReady(true);
      drawn = frame;
    }
    function tick(now: number) {
      raf = 0;
      if (disposed || !inView || document.hidden) { lastTime = 0; return; }
      const dt = lastTime ? Math.min(now - lastTime, 50) : 16.67;
      lastTime = now;
      const delta = target - current;
      current = reducedMotion.matches || Math.abs(delta) < 0.0008
        ? target : current + delta * (1 - Math.exp(-dt / 65));
      if (dirty || delta !== 0) { paint(); dirty = false; }
      if (Math.abs(target - current) > 0.0008) raf = requestAnimationFrame(tick);
      else { current = target; paint(); lastTime = 0; }
    }
    function wake() {
      if (!disposed && !raf && inView && !document.hidden) raf = requestAnimationFrame(tick);
    }
    const setTarget = (value: number) => { target = clamp(value); wake(); };
    const fit = () => {
      const size = Math.min(960, Math.round(wrap.clientWidth * Math.min(devicePixelRatio, 2)));
      if (size > 0 && canvas.width !== size) {
        canvas.width = canvas.height = size;
        drawn = -1;
        dirty = true;
        wake();
      }
    };
    const resize = new ResizeObserver(fit);
    resize.observe(wrap);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) { sequence.start(); wake(); }
      else { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
    }, { rootMargin: "240px" });
    observer.observe(wrap);

    const stopPageMomentum = () => {
      const lenis = getLenis();
      if (lenis?.isScrolling) lenis.scrollTo(lenis.actualScroll, { immediate: true });
    };
    const travel = () => Math.max(wrap.clientHeight * 1.5, 480);
    const onWheel = (event: WheelEvent) => {
      // Preserve browser pinch-to-zoom. Ordinary wheel / two-finger swipe
      // belongs exclusively to the viewer, including at its two endpoints.
      if (event.ctrlKey) return;
      event.preventDefault();
      event.stopPropagation();
      stopPageMomentum();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? wrap.clientHeight : 1;
      // With natural trackpad scrolling, a downward finger swipe emits -deltaY.
      setTarget(target - event.deltaY * unit / travel());
    };

    // Touchscreens use the same vertical motion. Rebase when finger count
    // changes so adding a second finger cannot jump the camera.
    let touchY: number | null = null;
    let touchCount = 0;
    const averageY = (touches: TouchList) =>
      Array.from(touches).reduce((sum, touch) => sum + touch.clientY, 0) / touches.length;
    const onTouchStart = (event: TouchEvent) => {
      touchCount = event.targetTouches.length;
      touchY = touchCount ? averageY(event.targetTouches) : null;
      stopPageMomentum();
    };
    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const touches = event.targetTouches;
      if (!touches.length) return;
      const nextY = averageY(touches);
      if (touchY !== null && touches.length === touchCount) {
        setTarget(target + (nextY - touchY) / travel());
      }
      touchY = nextY;
      touchCount = touches.length;
    };
    const onTouchEnd = (event: TouchEvent) => {
      touchCount = event.targetTouches.length;
      touchY = touchCount ? averageY(event.targetTouches) : null;
    };
    const onKey = (event: KeyboardEvent) => {
      let next = target;
      if (event.key === "ArrowDown") next += 0.05;
      else if (event.key === "ArrowUp") next -= 0.05;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = 1;
      else return;
      event.preventDefault();
      event.stopPropagation();
      stopPageMomentum();
      setTarget(next);
    };
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
      else wake();
    };
    const onMotionChange = () => wake();
    wrap.addEventListener("wheel", onWheel, { passive: false });
    wrap.addEventListener("touchstart", onTouchStart, { passive: true });
    wrap.addEventListener("touchmove", onTouchMove, { passive: false });
    wrap.addEventListener("touchend", onTouchEnd);
    wrap.addEventListener("touchcancel", onTouchEnd);
    wrap.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", onMotionChange);
    fit();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      resize.disconnect();
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("touchstart", onTouchStart);
      wrap.removeEventListener("touchmove", onTouchMove);
      wrap.removeEventListener("touchend", onTouchEnd);
      wrap.removeEventListener("touchcancel", onTouchEnd);
      wrap.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", onMotionChange);
      sequence.dispose();
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        ref={wrapRef}
        role="slider"
        aria-label="Kalash view: swipe downward inside the image to see the top"
        data-lenis-prevent
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        aria-valuetext="Front view"
        tabIndex={0}
        className="relative aspect-square w-full touch-none overscroll-none overflow-hidden rounded-card border border-olive/25 bg-cream-deep bg-contain bg-center bg-no-repeat outline-none select-none focus-visible:ring-2 focus-visible:ring-olive focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        style={{ backgroundImage: "url(/kalash/inspection/640/f-000.webp)" }}
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full transition-opacity duration-300 motion-reduce:transition-none" style={{ opacity: ready ? 1 : 0 }} />
      </div>
    </div>
  );
}
