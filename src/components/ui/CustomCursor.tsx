"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Desktop custom cursor: the brand arch-"A" monogram pointer.
 * GUARANTEED SWITCH TO THE WHITE MARK OVER ALL DARK SECTIONS AND DARK GRADIENTS.
 */

function luminance(r: number, g: number, b: number) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

const colorCache = new Map<string, [number, number, number, number]>();
let probe: CanvasRenderingContext2D | null = null;
function parseColor(css: string): [number, number, number, number] | null {
  const hit = colorCache.get(css);
  if (hit) return hit;
  if (!probe) {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    probe = c.getContext("2d", { willReadFrequently: true });
  }
  if (!probe) return null;
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = css;
  if (probe.fillStyle === "#000" && !/^(#000|black|rgb\(0, 0, 0\))/i.test(css))
    return null;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  const out: [number, number, number, number] = [d[0], d[1], d[2], d[3] / 255];
  colorCache.set(css, out);
  return out;
}

/** Check if the ground under element `el` is dark (luminance < 0.45 or dark tokens) */
function groundIsDark(el: Element | null): boolean {
  let node: Element | null = el;
  while (node && node !== document.documentElement && node !== document.body) {
    // 1. Fast check for dark attribute or dark classes
    if (
      node.hasAttribute("data-dark") ||
      node.classList.contains("pm-footer") ||
      node.classList.contains("bg-[#171208]") ||
      node.classList.contains("bg-black") ||
      node.classList.contains("bg-[#1A150C]")
    ) {
      return true;
    }

    // 2. Check inline style for dark color hexes, gradients, or dark RGBs
    const styleAttr = node.getAttribute("style") || "";
    if (styleAttr) {
      if (
        /171208|241D10|1A140A|120D05|7C7144|8A7F4A|2E2713|2A2511|3A321B|59502B|6E643B|574F2E|1A150C|171208/i.test(
          styleAttr
        ) ||
        /rgba?\(\s*([0-9]{1,2}|1[0-7][0-9])\s*,\s*([0-9]{1,2}|1[0-6][0-9])\s*,\s*([0-9]{1,2}|1[0-4][0-9])/i.test(
          styleAttr
        )
      ) {
        return true;
      }
    }

    // 3. Check computed background color
    const style = getComputedStyle(node);
    const bgCol = style.backgroundColor;
    if (bgCol && bgCol !== "transparent" && bgCol !== "rgba(0, 0, 0, 0)") {
      const rgba = parseColor(bgCol);
      if (rgba && rgba[3] >= 0.25) {
        const lum = luminance(rgba[0], rgba[1], rgba[2]);
        if (lum < 0.45) return true; // Dark ground
        if (lum >= 0.45) return false; // Light ground
      }
    }

    // 4. Check computed background image for gradient hexes
    const bgImg = style.backgroundImage || "";
    if (bgImg.includes("gradient")) {
      const hexes = bgImg.match(/#([0-9a-fA-F]{3,8})/g);
      if (hexes && hexes.length > 0) {
        let sumL = 0;
        let count = 0;
        for (const h of hexes) {
          const parsed = parseColor(h);
          if (parsed) {
            sumL += luminance(parsed[0], parsed[1], parsed[2]);
            count++;
          }
        }
        if (count > 0 && sumL / count < 0.45) {
          return true;
        }
      }
    }

    node = node.parentElement;
  }
  return false; // Default cream
}

export default function CustomCursor() {
  const markRef = useRef<HTMLDivElement>(null);
  const oliveRef = useRef<HTMLImageElement>(null);
  const whiteRef = useRef<HTMLImageElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const mark = markRef.current;
    const olive = oliveRef.current;
    const white = whiteRef.current;
    if (!mark || !olive || !white) return;

    gsap.set(mark, {
      xPercent: -50,
      yPercent: 0,
      rotation: 0,
      transformOrigin: "50% 0%",
    });
    gsap.set(white, { opacity: 0 });

    const xMark = gsap.quickTo(mark, "x", { duration: 0.2, ease: "power3" });
    const yMark = gsap.quickTo(mark, "y", { duration: 0.2, ease: "power3" });

    let onDark = false;
    let queued = false;
    let px = 0;
    let py = 0;

    const applyGround = () => {
      queued = false;
      const hit = document.elementFromPoint(px, py);
      if (!hit) return;
      const wantsWhite = groundIsDark(hit);
      if (wantsWhite === onDark) return;
      onDark = wantsWhite;
      gsap.to(olive, {
        opacity: wantsWhite ? 0 : 1,
        duration: 0.15,
        overwrite: "auto",
      });
      gsap.to(white, {
        opacity: wantsWhite ? 1 : 0,
        duration: 0.15,
        overwrite: "auto",
      });
    };

    const sample = (x: number, y: number) => {
      px = x;
      py = y;
      if (queued) return;
      queued = true;
      requestAnimationFrame(applyGround);
    };

    const move = (e: MouseEvent) => {
      xMark(e.clientX);
      yMark(e.clientY);
      sample(e.clientX, e.clientY);
    };

    const onClick = (e: MouseEvent) => {
      requestAnimationFrame(() => sample(e.clientX, e.clientY));
    };

    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element &&
      !!t.closest(
        'a, button, [role="tab"], [role="slider"], input, select, textarea'
      );

    const over = (e: MouseEvent) => {
      if (isInteractive(e.target))
        gsap.to(mark, { scale: 1.18, duration: 0.3, overwrite: "auto" });
    };
    const out = (e: MouseEvent) => {
      if (isInteractive(e.target))
        gsap.to(mark, { scale: 1, duration: 0.3, overwrite: "auto" });
    };

    document.body.classList.add("has-custom-cursor");
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mouseout", out);
    window.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mouseout", out);
      window.removeEventListener("click", onClick, true);
      document.body.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={markRef}
      className="pointer-events-none fixed top-0 left-0 z-[101] hidden h-[24.7px] w-[28.5px] will-change-transform lg:block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={oliveRef}
        src="/brand/a-mark-olive.png"
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ filter: "drop-shadow(0 1px 2.5px rgba(254,248,235,0.55))" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={whiteRef}
        src="/brand/a-mark-white.png"
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-0 h-full w-full object-contain"
        style={{ filter: "drop-shadow(0 1px 2.5px rgba(24,18,8,0.75))" }}
      />
    </div>
  );
}
