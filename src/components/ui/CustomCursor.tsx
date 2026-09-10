"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Desktop custom cursor: the brand arch-"A" monogram pointer.
 * GUARANTEED SWITCH TO THE WHITE MARK OVER ALL DARK SECTIONS AND DARK GRADIENTS.
 *
 * HOW IT CLICKS — rebuilt because links and buttons were "so hard to click".
 * The causes, and what replaced each:
 *
 *   1. THE MARK TRAILED THE POINTER. It rode a gsap.quickTo (0.2s, power3),
 *      which restarts on every mousemove, so while moving it sat permanently
 *      behind the real click point. It now follows on its own rAF loop with a
 *      22ms exponential ease: enough to iron out uneven mousemove timing (the
 *      judder you get setting position straight from events), about one frame
 *      of lag, and it settles before a hand can stop and click.
 *   2. IT GREW OVER THE TARGET. Hover scaled it UP 18%, covering the very link
 *      being aimed at. It now steps back (0.88) and a hairline ring opens
 *      around the click point instead.
 *   3. SMALL TARGETS. The nav is 12px caps on an 18px line. A link or button
 *      now counts as under the cursor anywhere within ASSIST_RADIUS of it: the
 *      mark glides onto its edge, the ring shows, and a click there is handed to
 *      it. The ring's radius IS that radius, so what the ring touches is what
 *      gets clicked.
 *   4. NO CURSOR AT ALL, in three places. Below 1024px (the native cursor was
 *      hidden at every width but the mark was `hidden lg:block`); under the
 *      photo Lightbox and the first-visit loading screen (both z-200, the mark
 *      was z-101); and after a reload until the mouse moved (the native cursor
 *      was hidden on mount, the mark only appeared on the first move).
 *
 * WHEN THE HAND-OFF STANDS DOWN. It only ever rescues a click that would
 * otherwise have hit nothing. So it never acts on a press that lands on text
 * (that is selecting or copying, not a missed click — double-clicking a name
 * beside a phone number must not dial it), a press something captures (a drag
 * surface owns it), a press that moved, a modified click, or a target that is
 * no longer within reach when the button comes up (the page can glide under a
 * press).
 *
 * The click point is the arch's APEX — the PNG's ink reaches its top edge, at
 * 49.8% of its width — so the mark hangs BELOW the point it clicks and never
 * sits on top of what you are aiming at.
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
        /171208|241D10|1A140A|120D05|7C7144|8A7F4A|2E2713|2A2511|3A321B|59502B|6E643B|574F2E|1A150C|171208|766B3B|5E552E/i.test(
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
        if (lum < 0.48) return true; // Dark ground
        if (lum >= 0.48) return false; // Light ground
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
        if (count > 0 && sumL / count < 0.48) {
          return true;
        }
      }
    }

    node = node.parentElement;
  }
  return false; // Default cream
}

/* ── FEEL ─────────────────────────────────────────────────────────────────── */

/** px — how far from a link or button the cursor still counts as ON it. */
const ASSIST_RADIUS = 14;
/** s — follow ease. Settles in ~3 frames at 60Hz. */
const FOLLOW_TAU = 0.022;
/** s — the glide onto a nearby target. Slower than the follow, so it reads as
 *  a gentle pull rather than a jump. */
const SNAP_TAU = 0.075;
/** px/s — faster than this the hand is travelling, not aiming, so the nearby
 *  search waits. It runs again the moment it slows. */
const AIMING_SPEED = 1400;
/** ms — the nearby search runs at most this often (~30 a second). The magnet
 *  eases over SNAP_TAU, so a target found a frame later is invisible. */
const SEARCH_INTERVAL_MS = 33;
/** ms — a scroll counts as still moving this long after its last event. Lenis
 *  glides for about a second per wheel notch and fires every frame; while the
 *  page moves under a resting pointer only the cheap direct hit-test runs, and
 *  the full search follows once it settles. */
const SCROLL_QUIET_MS = 120;
/** ms — while scrolling, the ground colour is re-read at most this often. */
const GROUND_INTERVAL_MS = 100;
/** px — a press that moves further than this is a drag, never handed on. */
const PRESS_SLOP = 6;

/** The mark, at the PNG's own 269:234. It was 28.5px wide. */
const MARK_W = 22;
const MARK_H = (MARK_W * 234) / 269;

const OLIVE = "#8A7F4A";
const CREAM = "#FEF1DA";

/** Everything the cursor treats as clickable. */
const HOVERABLE = [
  "a[href]",
  "button",
  "summary",
  "label",
  "select",
  "textarea",
  'input:not([type="hidden"])',
  '[role="button"]',
  '[role="link"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="slider"]',
  '[data-cursor="hover"]',
].join(",");

/** Clickable, but a click from NEAR it would be wrong: a slider is dragged. */
const NEVER_ASSIST = '[role="slider"]';
/** Pointer inside one of these: exact clicks only. Text editing, and an explicit
 *  opt-out for any surface that ever needs one. */
const EXACT_ZONE =
  '[contenteditable]:not([contenteditable="false"]), [data-cursor="exact"]';
/** A forwarded click does nothing useful on these; focus them instead. */
const TEXT_ENTRY =
  'textarea, select, input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"]):not([type="file"]):not([type="range"]):not([type="color"])';

/** Where to hit-test around the pointer: 8 points on the full radius (10.7px
 *  apart — finer than the 18px line of the smallest link here) and 4 at half
 *  the radius, turned 45deg so they fill the diagonals the outer ring leaves.
 *  Each hit-test costs ~0.065ms on the home film, so this is kept lean. */
const SAMPLES: [number, number][] = (() => {
  const out: [number, number][] = [];
  const ring = (n: number, r: number, phase = 0) => {
    for (let i = 0; i < n; i++) {
      const a = phase + (i / n) * Math.PI * 2;
      out.push([Math.cos(a) * r, Math.sin(a) * r]);
    }
  };
  ring(4, ASSIST_RADIUS / 2, Math.PI / 4);
  ring(8, ASSIST_RADIUS);
  return out;
})();

type Target = {
  el: Element;
  /** true when the pointer is ON it; false when it was found nearby */
  direct: boolean;
  /** the point the click is aimed at — the pointer itself, or the target's
   *  nearest edge */
  x: number;
  y: number;
  d: number;
};

function usable(el: Element) {
  if (el.matches(":disabled") || el.getAttribute("aria-disabled") === "true")
    return false;
  return !el.closest("[inert]");
}

/** The point on `el` nearest (x, y), 1px inside its edge so a hit-test there
 *  lands on it. Every client rect counts, so a link wrapped over two lines is
 *  measured by its lines, not by the box around both. */
function nearestOn(el: Element, x: number, y: number) {
  let d = Infinity;
  let nx = x;
  let ny = y;
  for (const r of Array.from(el.getClientRects())) {
    if (r.width < 1 || r.height < 1) continue;
    const cx = Math.min(Math.max(x, r.left + 1), r.right - 1);
    const cy = Math.min(Math.max(y, r.top + 1), r.bottom - 1);
    const dd = Math.hypot(cx - x, cy - y);
    if (dd < d) {
      d = dd;
      nx = cx;
      ny = cy;
    }
  }
  return { d, x: nx, y: ny };
}

/**
 * True when (x, y) is inside the box of a rendered, non-space character. A
 * press there is aimed at the TEXT — selecting or copying it — not a missed
 * click on a link beside it, so neither the ring nor the hand-off may claim it.
 *
 * The caret API snaps to the nearest text even from empty space, so the
 * character on each side of the caret is measured and must actually contain
 * the point; a press in the gap between two lines is still empty space.
 */
function onGlyph(x: number, y: number): boolean {
  const doc = document as Document & {
    caretPositionFromPoint?: (
      x: number,
      y: number,
    ) => { offsetNode: Node; offset: number } | null;
  };
  let node: Node | null = null;
  let offset = 0;
  if (doc.caretPositionFromPoint) {
    const p = doc.caretPositionFromPoint(x, y);
    if (p) {
      node = p.offsetNode;
      offset = p.offset;
    }
  } else if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    if (r) {
      node = r.startContainer;
      offset = r.startOffset;
    }
  }
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const text = node.textContent ?? "";
  const range = document.createRange();
  for (const i of [offset - 1, offset]) {
    if (i < 0 || i >= text.length || /\s/.test(text[i])) continue;
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    for (const b of Array.from(range.getClientRects())) {
      if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) return true;
    }
  }
  return false;
}

/**
 * What a click at (x, y) should reach. Hit-testing (rather than measuring a
 * list of links) means everything the browser already knows is respected for
 * free: an element behind the open menu, under a modal, clipped by a rail,
 * `invisible`, or `pointer-events-none` is simply never returned.
 */
function resolveAt(
  x: number,
  y: number,
  assist = true,
  /** when given, receives every target within reach, not only the nearest */
  found?: Map<Element, Target>,
): { under: Element | null; target: Target | null } {
  const under = document.elementFromPoint(x, y);
  const own = under?.closest(HOVERABLE);
  if (own && usable(own))
    return { under, target: { el: own, direct: true, x, y, d: 0 } };
  if (!assist || !under || under.closest(EXACT_ZONE) || onGlyph(x, y))
    return { under, target: null };

  const W = window.innerWidth;
  const H = window.innerHeight;
  const settled = new Set<Element>(); // measured exactly — nothing left to refine
  const skipped = new Set<Element>(); // disabled, or never assisted
  const shapeless = new Set<Element>(); // its box is not its shape
  let best: Target | null = null;
  const consider = (el: Element, tx: number, ty: number, d: number) => {
    if (d > ASSIST_RADIUS) return;
    const t: Target = { el, direct: false, x: tx, y: ty, d };
    const prev = found?.get(el);
    if (found && (!prev || d < prev.d)) found.set(el, t);
    if (!best || d < best.d) best = t;
  };
  for (const [ox, oy] of SAMPLES) {
    const sx = x + ox;
    const sy = y + oy;
    if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
    const el = document.elementFromPoint(sx, sy)?.closest(HOVERABLE);
    if (!el || settled.has(el) || skipped.has(el)) continue;
    if (!usable(el) || el.matches(NEVER_ASSIST)) {
      skipped.add(el);
      continue;
    }
    if (!shapeless.has(el)) {
      const n = nearestOn(el, x, y);
      const at = document.elementFromPoint(n.x, n.y);
      if (at && el.contains(at)) {
        settled.add(el);
        consider(el, n.x, n.y, n.d);
        continue;
      }
      shapeless.add(el);
    }
    // Its box's nearest edge is empty space — a tilted Our Works card, a rounded
    // pill, something clipped. Walk in from this sample (known to land on it)
    // toward the pointer to find where it really begins in this direction:
    // three halvings, within ~1.75px. Every sample that hits it refines it, so
    // the closest real entry wins. Taking the coarse ring distance instead let
    // a click 4px from one tilted card open its neighbour.
    let lo = 0;
    let hi = 1;
    for (let k = 0; k < 3; k++) {
      const m = (lo + hi) / 2;
      const e = document.elementFromPoint(x + ox * m, y + oy * m);
      if (e && el.contains(e)) hi = m;
      else lo = m;
    }
    consider(el, x + ox * hi, y + oy * hi, Math.hypot(ox, oy) * hi);
  }
  return { under, target: best };
}

export default function CustomCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const oliveRef = useRef<HTMLImageElement>(null);
  const whiteRef = useRef<HTMLImageElement>(null);

  useIsomorphicLayoutEffect(() => {
    // A mouse or pen, not a finger. Checked positively: a touch-only device
    // never gets the class that hides the native cursor.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const wrap = wrapRef.current;
    const mark = markRef.current;
    const ring = ringRef.current;
    const olive = oliveRef.current;
    const white = whiteRef.current;
    if (!wrap || !mark || !ring || !olive || !white) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    gsap.set(mark, { transformOrigin: "50% 0%" }); // scale about the click point
    gsap.set(ring, { scale: 0.4, opacity: 0, color: OLIVE });
    gsap.set(white, { opacity: 0 });

    let px = 0; // the real pointer
    let py = 0;
    let fx = 0; // where the mark is drawn (eased toward the pointer)
    let fy = 0;
    let gx = 0; // pull toward a nearby target: goal…
    let gy = 0;
    let ox = 0; // …and eased
    let oy = 0;
    let rx = 0; // pointer at the last resolve, for aiming speed
    let ry = 0;
    let rt = 0;
    let hasPointer = false;
    let visible = false;
    let hovering = false;
    let pressed = false;
    let onDark = false;
    let dirty = false;
    let polling = false;
    let pendingSearch = false;
    let searchOwed = false;
    let searchedAt = -Infinity;
    let scrollingUntil = 0;
    let groundAt = -Infinity;
    let raf = 0;
    let last = 0;
    let under: Element | null = null;
    let target: Target | null = null;
    // dev diagnostics only: why the last refresh did or did not search
    let lastDecision: Record<string, unknown> | null = null;
    let lastHandOff = "none yet";
    const why = (reason: string) => {
      if (process.env.NODE_ENV !== "production") lastHandOff = reason;
    };
    let press: { x: number; y: number; el: Element } | null = null;
    const stats = { resolves: 0, ms: 0 };

    const dur = (s: number) => (reduce ? 0 : s);

    const applyScale = () => {
      gsap.to(ring, {
        scale: hovering ? (pressed ? 0.78 : 1) : 0.4,
        opacity: hovering ? 1 : 0,
        duration: dur(pressed ? 0.12 : hovering ? 0.32 : 0.22),
        ease: "power3.out",
        overwrite: "auto",
      });
      gsap.to(mark, {
        scale: pressed ? 0.8 : hovering ? 0.88 : 1,
        duration: dur(pressed ? 0.12 : 0.3),
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    const setGround = (dark: boolean) => {
      if (dark === onDark) return;
      onDark = dark;
      gsap.to(olive, { opacity: dark ? 0 : 1, duration: dur(0.15), overwrite: "auto" });
      gsap.to(white, { opacity: dark ? 1 : 0, duration: dur(0.15), overwrite: "auto" });
      gsap.to(ring, { color: dark ? CREAM : OLIVE, duration: dur(0.15), overwrite: "auto" });
    };

    const setVisible = (on: boolean) => {
      if (on === visible) return;
      visible = on;
      gsap.to(wrap, { opacity: on ? 1 : 0, duration: dur(0.18), overwrite: "auto" });
    };

    // The native cursor is hidden ONLY while the mark is being drawn for a real
    // pointer position. Before the first move, after the window loses focus, or
    // once a finger takes over, the native cursor comes back — hiding it earlier
    // left a visitor who scrolls straight after a reload with no pointer at all.
    const release = () => {
      hasPointer = false;
      press = null;
      pendingSearch = false;
      searchOwed = false;
      if (pressed) {
        pressed = false;
        applyScale();
      }
      setVisible(false);
      document.body.classList.remove("has-custom-cursor");
    };

    // Hit-testing is the one costly step. It runs at most once a frame and only
    // when something moved. The nearby search inside it is most of that cost
    // (measured on the home film: 2.5ms per resolve with it, 0.5ms without), so
    // it also waits while the hand sweeps past or the page glides, and runs at
    // most every SEARCH_INTERVAL_MS.
    const refresh = () => {
      // ONE clock for every comparison. The rAF timestamp is when the frame
      // began, not now, and the scroll handler stamps performance.now().
      const t = performance.now();
      const elapsed = Math.max(1, t - rt);
      const moved = px !== rx || py !== ry;
      const speed = (Math.hypot(px - rx, py - ry) / elapsed) * 1000;
      rx = px;
      ry = py;
      rt = t;
      // Movement — of the hand here, of the page in onScroll — means what is
      // nearby may have changed, so a search is PENDING until one has actually
      // run. Only running it clears the flag. (It used to be recomputed every
      // frame, so a poll landing in the frame after a fast move could write the
      // owed search off and leave the ring unarmed until the mouse moved again.)
      if (moved) pendingSearch = true;
      const aiming = speed <= AIMING_SPEED;
      const scrolling = t < scrollingUntil;
      // A poll re-checks a target being held; with nothing held and nothing
      // pending it only looks at what is directly underneath.
      const wanted = pendingSearch || (polling && hovering);
      polling = false;
      const search =
        wanted && aiming && !scrolling && t - searchedAt >= SEARCH_INTERVAL_MS;
      if (search) {
        searchedAt = t;
        pendingSearch = false;
      }
      searchOwed = pendingSearch; // the loop keeps ticking until it has run
      if (process.env.NODE_ENV !== "production")
        lastDecision = { speed: Math.round(speed), aiming, scrolling, pending: pendingSearch, search };

      const t0 = performance.now();
      const r = resolveAt(px, py, search);
      stats.ms += performance.now() - t0;
      stats.resolves++;

      let next = r.target;
      // Between searches, hold a nearby target the pointer is still within
      // reach of — otherwise the ring would blink off on every skipped frame.
      if (!next && !search && aiming && target && !target.direct && target.el.isConnected) {
        const n = nearestOn(target.el, px, py);
        if (n.d <= ASSIST_RADIUS) next = { ...target, x: n.x, y: n.y, d: n.d };
      }
      target = next;
      gx = target && !target.direct ? target.x - px : 0;
      gy = target && !target.direct ? target.y - py : 0;
      if (!!target !== hovering) {
        hovering = !!target;
        applyScale();
      }
      if (
        r.under &&
        r.under !== under &&
        (!scrolling || t - groundAt >= GROUND_INTERVAL_MS)
      ) {
        under = r.under;
        groundAt = t;
        setGround(groundIsDark(under));
      }
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (dirty || searchOwed) {
        dirty = false;
        refresh();
      }
      if (reduce) {
        fx = px;
        fy = py;
        ox = gx;
        oy = gy;
      } else {
        const a = 1 - Math.exp(-dt / FOLLOW_TAU);
        const b = 1 - Math.exp(-dt / SNAP_TAU);
        fx += (px - fx) * a;
        fy += (py - fy) * a;
        ox += (gx - ox) * b;
        oy += (gy - oy) * b;
      }
      const settled =
        Math.abs(px - fx) < 0.05 &&
        Math.abs(py - fy) < 0.05 &&
        Math.abs(gx - ox) < 0.05 &&
        Math.abs(gy - oy) < 0.05;
      if (settled) {
        fx = px;
        fy = py;
        ox = gx;
        oy = gy;
      }
      wrap.style.transform = `translate3d(${fx + ox}px, ${fy + oy}px, 0)`;
      if (settled && !dirty && !searchOwed) last = 0;
      else raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        // a finger took over: don't leave a stale mark (and a live magnet)
        // parked where the mouse last was
        if (hasPointer) release();
        return;
      }
      px = e.clientX;
      py = e.clientY;
      if (!hasPointer) {
        // first sighting: appear AT the pointer, not glide in from the corner
        hasPointer = true;
        fx = rx = px;
        fy = ry = py;
        ox = oy = gx = gy = 0;
        pendingSearch = true;
        document.body.classList.add("has-custom-cursor");
      }
      // a release the page never received (a context menu took it)
      if (pressed && e.buttons === 0) {
        pressed = false;
        applyScale();
      }
      setVisible(true);
      dirty = true;
      kick();
    };

    // Content moving under a still pointer — a scroll, the menu opening, a
    // reveal — changes what is under it without a single pointermove.
    const onScroll = () => {
      if (!hasPointer || !visible) return;
      scrollingUntil = performance.now() + SCROLL_QUIET_MS;
      pendingSearch = true;
      dirty = true;
      kick();
    };
    const poll = window.setInterval(() => {
      if (!visible || document.hidden || !document.hasFocus()) return;
      polling = true;
      dirty = true;
      kick();
    }, 250);

    const onOut = (e: MouseEvent) => {
      if (!e.relatedTarget) setVisible(false); // left the window
    };
    const onVisibility = () => {
      if (document.hidden) release();
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") {
        if (hasPointer) release();
        return;
      }
      press = null;
      if (e.button !== 0) return; // right and middle buttons: no press, no hand-off
      pressed = true;
      applyScale();
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const { target: t } = resolveAt(e.clientX, e.clientY);
      if (t && !t.direct) press = { x: e.clientX, y: e.clientY, el: t.el };
      why(
        "pressed " +
          (t ? (t.direct ? "ON " : "NEAR ") + (t.el.getAttribute("href") || t.el.tagName) + " d=" + t.d.toFixed(1) : "on nothing"),
      );
    };
    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      applyScale();
    };
    const dropPress = () => {
      press = null;
      onUp();
    };
    // Something took the pointer — a drag surface (the Our Works ribbon, the
    // gallery rail, the Kalash orbit). Its press is never a near-miss, and its
    // click is retargeted to the capturing container, which would otherwise
    // read as "landed on nothing clickable" and be handed on.
    const onCapture = () => {
      if (press) why("cancelled: pointer captured");
      press = null;
    };

    // THE HAND-OFF. Only a press that began NEAR a target — not on one — and
    // ended where it began, and whose real click landed on nothing clickable.
    // A click that hits a real link or button is never touched.
    const onClick = (e: MouseEvent) => {
      const p = press;
      press = null;
      dirty = true; // the click may have changed what is under the pointer
      kick();
      if (!p) return;
      if (e.button !== 0 || e.detail > 1) return why("skipped: button " + e.button + " detail " + e.detail);
      if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > PRESS_SLOP) return why("skipped: moved");
      if (e.target instanceof Element && e.target.closest(HOVERABLE))
        return why("skipped: real click landed on " + (e.target.closest(HOVERABLE)?.getAttribute("href") || "a control"));
      if (!p.el.isConnected || !usable(p.el)) return why("skipped: target gone or disabled");
      // The page can glide during a press (Lenis keeps moving after the wheel
      // stops; the Our Works ribbon drifts). Hand on only if the target pressed
      // for is STILL WITHIN REACH at release — not necessarily still the very
      // nearest. Between two tilted ribbon cards the nearest can flip with a
      // pixel of drift, and requiring it to stay first cancelled the click.
      const reach = new Map<Element, Target>();
      const atRelease = resolveAt(e.clientX, e.clientY, true, reach);
      if (atRelease.target?.direct)
        return why("skipped: released ON " + (atRelease.target.el.getAttribute("href") || atRelease.target.el.tagName));
      const still = reach.get(p.el);
      if (!still)
        return why("skipped: " + (p.el.getAttribute("href") || p.el.tagName) + " no longer within reach at release");
      why("handed to " + (p.el.getAttribute("href") || p.el.tagName));
      e.preventDefault();
      e.stopImmediatePropagation();
      if (p.el.matches(TEXT_ENTRY)) {
        (p.el as HTMLElement).focus();
      } else {
        p.el.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: still.x,
            clientY: still.y,
            screenX: e.screenX,
            screenY: e.screenY,
            button: 0,
            detail: 1,
          }),
        );
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { capture: true, passive: true });
    window.addEventListener("pointerup", onUp, { capture: true, passive: true });
    window.addEventListener("pointercancel", dropPress, { capture: true, passive: true });
    window.addEventListener("gotpointercapture", onCapture, true);
    window.addEventListener("contextmenu", dropPress, true);
    window.addEventListener("click", onClick, true);
    // capture, so scrolls inside a panel (the menu's own scroll box) count too
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("mouseout", onOut);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", onVisibility);

    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __pmCursor?: unknown }).__pmCursor = {
        ASSIST_RADIUS,
        resolveAt,
        onGlyph,
        state: () => ({
          pointer: [px, py],
          drawn: [fx + ox, fy + oy],
          hasPointer,
          hovering,
          pressed,
          onDark,
          visible,
          nativeCursorHidden: document.body.classList.contains("has-custom-cursor"),
          target: target && {
            tag: target.el.tagName,
            text: (target.el.textContent || "").trim().slice(0, 40),
            direct: target.direct,
            d: +target.d.toFixed(2),
          },
          lastDecision,
          lastHandOff,
          avgResolveMs: stats.resolves ? +(stats.ms / stats.resolves).toFixed(3) : 0,
          resolves: stats.resolves,
        }),
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(poll);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", dropPress, true);
      window.removeEventListener("gotpointercapture", onCapture, true);
      window.removeEventListener("contextmenu", dropPress, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", onVisibility);
      gsap.killTweensOf([wrap, mark, ring, olive, white]);
      document.body.classList.remove("has-custom-cursor");
      if (process.env.NODE_ENV !== "production") {
        delete (window as unknown as { __pmCursor?: unknown }).__pmCursor;
      }
    };
  }, []);

  return (
    // ABOVE EVERYTHING. The native cursor is hidden under every overlay too, so
    // any layer painted over the mark leaves the visitor with no pointer at all
    // — the photo Lightbox and the first-visit loading screen (both z-200) did
    // exactly that at the old z-101. It is pointer-events-none, so sitting on
    // top blocks nothing.
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[2147483647] opacity-0 will-change-transform"
    >
      {/* The capture ring. Its radius IS ASSIST_RADIUS, centred on the click
          point: whatever it touches is what a click reaches. Hidden until the
          cursor is on or near something clickable. */}
      <div
        ref={ringRef}
        className="absolute rounded-full"
        style={{
          width: ASSIST_RADIUS * 2,
          height: ASSIST_RADIUS * 2,
          left: -ASSIST_RADIUS,
          top: -ASSIST_RADIUS,
          border: "1px solid color-mix(in srgb, currentColor 70%, transparent)",
          background: "color-mix(in srgb, currentColor 8%, transparent)",
        }}
      />
      {/* the mark hangs from its apex, which sits exactly on the click point */}
      <div
        ref={markRef}
        className="absolute top-0"
        style={{ width: MARK_W, height: MARK_H, left: -MARK_W / 2 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={oliveRef}
          src="/brand/a-mark-olive.png"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={whiteRef}
          src="/brand/a-mark-white.png"
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-contain"
        />
      </div>
    </div>
  );
}
