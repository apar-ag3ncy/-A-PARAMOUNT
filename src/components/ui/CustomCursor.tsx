"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Desktop custom cursor: the brand arch-"A" monogram IS the pointer, standing
 * perfectly upright (no tilt). Its hotspot is the arch tip (top centre), so the
 * mark sits with its point exactly where you're pointing, and it scales up a
 * touch over interactive elements. It eases toward the pointer for a smooth
 * glide rather than snapping. Skipped on touch; the native cursor is hidden only
 * while this is active.
 *
 * IT SWITCHES TO THE WHITE MARK ON DARK GROUND. The olive mark disappeared
 * wherever the page goes dark — most visibly in the full-screen photo viewer,
 * whose backdrop is espresso, but equally on the olive bands, the footer plate
 * and the dark product cards. Note the brand olive is itself a DARK colour
 * (relative luminance 0.21 against cream's 0.88), so "olive on olive" is exactly
 * as unreadable as "olive on espresso" — a naive check that only looked for a
 * near-black background would have missed half the cases.
 *
 * Rather than tagging every dark surface by hand, the ground under the pointer
 * is READ: hit-test, walk up for the first background-colour that is actually
 * opaque enough to see, then use whichever mark has the higher WCAG contrast
 * against it. That needs no hand-tuned threshold — the two marks' own
 * luminances decide, and the crossover lands where it should (~0.44).
 */

/** sRGB relative luminance (WCAG). */
function luminance(r: number, g: number, b: number) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const contrast = (a: number, b: number) =>
  (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

const L_OLIVE = luminance(138, 127, 74); // #8A7F4A, the olive mark
const L_WHITE = luminance(254, 244, 218); // the cream/white mark

/**
 * Resolve ANY computed colour string to rgba, by painting it and reading the
 * pixel back.
 *
 * Not a regex. Tailwind v4 emits colours in OKLAB, so the photo viewer's
 * backdrop computes to `oklab(0.264505 0.00766658 0.0307831 / 0.95)` — an
 * rgb()-only match skipped it, walked past to the cream `<body>` underneath, and
 * concluded the darkest surface on the site was light. Letting the browser parse
 * covers oklab, oklch, color(), hsl and named colours alike, and keeps working
 * whatever the framework emits next.
 */
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
  probe.fillStyle = css; // invalid strings leave the previous value, hence...
  if (probe.fillStyle === "#000" && !/^(#000|black|rgb\(0, 0, 0\))/.test(css))
    return null;
  probe.fillRect(0, 0, 1, 1);
  const d = probe.getImageData(0, 0, 1, 1).data;
  const out: [number, number, number, number] = [d[0], d[1], d[2], d[3] / 255];
  colorCache.set(css, out);
  return out;
}

/** Luminance of the first paintable background at or above `el`, or null. */
function groundLuminance(el: Element | null): number | null {
  let node: Element | null = el;
  while (node && node !== document.documentElement) {
    const rgba = parseColor(getComputedStyle(node).backgroundColor);
    // Anything under half-opacity is a veil over whatever is behind it, not the
    // ground — keep walking rather than reading a colour nothing looks like.
    if (rgba && rgba[3] >= 0.5) {
      return luminance(rgba[0], rgba[1], rgba[2]);
    }
    node = node.parentElement;
  }
  return null;
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

    // Anchor the mark by its top-centre (the arch tip), standing upright.
    gsap.set(mark, {
      xPercent: -50,
      yPercent: 0,
      rotation: 0,
      transformOrigin: "50% 0%",
    });
    gsap.set(white, { opacity: 0 });

    // Eases toward the pointer for a smooth glide — a gentle follow, not a snap.
    const xMark = gsap.quickTo(mark, "x", { duration: 0.2, ease: "power3" });
    const yMark = gsap.quickTo(mark, "y", { duration: 0.2, ease: "power3" });

    // ---- which ground are we over? ---------------------------------------
    let onDark = false;
    let lastGround: Element | null = null;
    let queued = false;
    let px = 0;
    let py = 0;

    const applyGround = () => {
      queued = false;
      const hit = document.elementFromPoint(px, py);
      if (!hit || hit === lastGround) return; // early-out: same ground as last
      lastGround = hit;
      const L = groundLuminance(hit);
      if (L === null) return;
      const wantsWhite = contrast(L_WHITE, L) > contrast(L_OLIVE, L);
      if (wantsWhite === onDark) return;
      onDark = wantsWhite;
      gsap.to(olive, {
        opacity: wantsWhite ? 0 : 1,
        duration: 0.18,
        overwrite: "auto",
      });
      gsap.to(white, {
        opacity: wantsWhite ? 1 : 0,
        duration: 0.18,
        overwrite: "auto",
      });
    };
    // At most one hit-test per frame, however fast the pointer moves.
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

    // Opening the viewer drops an espresso backdrop under a pointer that has NOT
    // moved, so no mousemove fires and the mark would sit olive on it until you
    // twitched. Re-read after the click has had a frame to mount.
    const onClick = (e: MouseEvent) => {
      lastGround = null;
      requestAnimationFrame(() => sample(e.clientX, e.clientY));
    };

    const isInteractive = (t: EventTarget | null) =>
      t instanceof Element &&
      !!t.closest(
        'a, button, [role="tab"], [role="slider"], input, select, textarea',
      );
    // overwrite:"auto" — rapid over/out across nested interactive elements must
    // replace the in-flight tween, not stack competing ones.
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
      // 28.5 x 24.7 — 5% off the previous 30 x 26.
      className="pointer-events-none fixed top-0 left-0 z-[101] hidden h-[24.7px] w-[28.5px] will-change-transform lg:block"
    >
      {/* Both marks are mounted and cross-faded rather than swapping one `src`:
          a swap re-decodes on every crossing and shows an empty box the first
          time. Each carries the halo that keeps IT legible — a light one behind
          the olive mark for cream ground, a dark one behind the white mark. */}
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
        style={{ filter: "drop-shadow(0 1px 2.5px rgba(24,18,8,0.55))" }}
      />
    </div>
  );
}
