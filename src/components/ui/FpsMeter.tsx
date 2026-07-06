"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Live FPS overlay — opt-in via ?fps in the URL (e.g. /?fps). Shown so smoothness
 * can be read on a real foreground display without opening DevTools. Renders
 * nothing otherwise, so it never affects normal visitors.
 */
export default function FpsMeter() {
  const [on, setOn] = useState(false);
  const [fps, setFps] = useState(0);
  const [lo, setLo] = useState(0);
  const loRef = useRef(999);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!new URLSearchParams(window.location.search).has("fps")) return;
    setOn(true);

    let raf = 0;
    let frames = 0;
    let mark = performance.now();
    let warmupUntil = mark + 3000; // ignore load/hydration jitter — min tracks scrolling, not boot
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - mark >= 400) {
        const f = Math.round((frames * 1000) / (now - mark));
        setFps(f);
        if (now > warmupUntil) {
          loRef.current = Math.min(loRef.current, f);
          setLo(loRef.current);
        }
        frames = 0;
        mark = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (!on) return null;
  const color = fps >= 55 ? "#2f6b32" : fps >= 40 ? "#8a6d1f" : "#7a1f1a";
  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-[300] rounded-button px-3 py-1.5 font-display text-xs text-cream tabular-nums shadow-lg"
      style={{ background: color }}
    >
      {fps} fps{" "}
      <span className="opacity-70">· min {loRef.current === 999 ? "—" : lo}</span>
    </div>
  );
}
