"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import Wordmark from "@/components/ui/Wordmark";
import FeaturedGallery from "@/components/sections/FeaturedGallery";
import { openDoors, resetDoors } from "@/lib/doors";
import { holdHeader } from "@/lib/cinema";
import { createFrameSequence, frameSize, type Frame } from "@/lib/frameSequence";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * HomeFilm — the ENTIRE home-page opening as ONE continuous shot, driven by a
 * SINGLE pinned scroll. There used to be two stacked pinned sections (DoorScroll,
 * then CinematicHero); the unpin→repin boundary plus a stretch of blank cream
 * between them read as "breaky / three different animations" (client). This is
 * the merge: one section, one pin, one progress P 0→1, one slow-mo glide — so
 * there is no seam left to break.
 *
 * The film, in one unbroken scroll — the graded master baked to a WebP FRAME
 * SEQUENCE (200 frames per tier) and drawn on a canvas. Scroll progress picks a
 * frame; the nearest DECODED frame is painted object-cover in a single drawImage
 * per rAF. This REPLACED a scrubbed <video> (seek video.currentTime): seeking has
 * resolution-dependent decode latency and coalesces under continuous input, so slow
 * scrolling read as laggy/inconsistent — a pre-decoded frame draw is frame-perfect
 * at any speed. The earlier frame film looked blurry because its SOURCE was
 * downscaled to save memory; here the source stays sharp and only the DECODE width
 * is capped (frameSequence.decodeWidth), so the bitmap store stays light without
 * softening. This is the architecture CLAUDE.md prescribes ("bake frames, don't
 * re-animate live"; never <video> currentTime-seeking).
 *   [0 .. FILM_END]  a slow dolly IN to the carved marble doors, which swing open
 *                    (god-rays + gold bloom that ease off so it reads clean), then
 *                    we WALK THROUGH into the golden sanctum hall — the "1968" line
 *                    breathes in and dissolves over it — and the camera CRANES UP
 *                    to the ornate carved ceiling.
 *   [FILM_END .. 1]  the frame HOLDS the settled ceiling; the brand resolves on it in
 *                    a clean warm halo field, then dissolves and "Our Works" lands.
 *
 * Everything is a PURE FUNCTION of P written with gsap.set inside apply(P) — no
 * tweens, no captured start values, so scrubbing BACK restores the exact frame.
 * The scroll target eases toward the frame on its own rAF loop with the door's time
 * constant (TAU_MS), giving the whole film one weighty glide — Lenis' page lerp
 * (SmoothScrollProvider) feeds it an already-smooth scroll position. Dual pin:
 * GSAP pin on a mouse, native `position: sticky` on touch (Lenis keeps native
 * scroll, so sticky works — the dual path simply predates the smoother swap).
 * The header is withheld for the whole film via lib/cinema and returns only once
 * the brand has resolved.
 *
 * There is no static interior plate any more — the ceiling frames ARE the backdrop the
 * brand resolves on (a static ceiling poster stands in only under reduced motion).
 * Legibility (client mandate): a warm veil + a clean brand-halo field sit between the
 * marble and the type so the copy always reads and the brand never looks pasted-on.
 */

// -- the film, rooted in the client's graded master (assets/door/final-1-60fps-
//    master.mp4, 9.82s @60fps, 1928×1072): closed brass doors in the marble gate
//    → doors swing open onto the golden sanctum with real god-rays baked in →
//    slow walk-in through the pillared hall toward the shrine → camera cranes UP
//    to the carved ceiling, settling flat-on on the lotus medallion — the brand's
//    backdrop.
//    BAKED to a WebP FRAME SEQUENCE and drawn on a canvas — NOT scrubbed as a
//    <video>. Seeking video.currentTime has resolution-dependent decode latency
//    and coalesces under continuous input, so slow scrolling read as laggy /
//    inconsistent (measured: 237ms per scrub seek at 1928 CABAC); drawing a
//    pre-decoded frame in one synchronous drawImage per rAF is frame-perfect at
//    ANY scroll speed. This is the architecture CLAUDE.md prescribes ("bake
//    frames, don't re-animate live"; never <video> currentTime-seeking).
//    RE-BAKE: scripts/bake-door-film.sh <master> <tail> 7.0 20 — then dedupe and
//    set FRAME_COUNT to what it prints. --
// TWO segments baked into ONE consecutive sequence by scripts/bake-door-film.sh.
// The client's master is kept VERBATIM for everything it does well; only its
// ending was replaced, because the master craned into a dark, angled, all-gold
// ceiling that is not this temple's actual ceiling (the real one is flat-on and
// symmetrical: white marble bracket capitals radiating around a centred gold
// coffered panel with a lotus medallion — see assets/door/ceiling-reference.png).
//   f 000-130  BODY — client master 0→7.0s, untouched: the doors swing open and
//              we walk down the pillared hall. Real client footage; never regenerate.
//   f 131-222  TAIL — Kling 3.0, 8s @1080p, generated FROM the master's own frame
//              at 7.0s and END-pinned to the real ceiling photograph, so it
//              continues the master's existing upward tilt and lands on the true
//              ceiling. Trimmed to its live 4.5s: measured frame-difference showed
//              motion decaying to noise after ~4.5s, and dead frames are the one
//              thing a scrubbed film must not contain (scroll with no picture change).
// Both sampled at 20fps and renumbered consecutively — no video concat, so the
// master is never re-encoded and the join carries no seam (verified: the frames
// straddling it show one continuous tilt, with no difference spike at 130/131).
//
// Then DEDUPED: any frame within 5% of peak motion of the previous KEPT frame is
// dropped, because the master itself holds nearly still for ~0.45s in the hall
// and those frames were scroll that produced no picture. 232 baked → 223 kept;
// minimum frame-to-frame motion rose 0.17 → 0.97, i.e. every frame now moves.
// Same principle as bake-kalash-orbit.py resampling at equal-ROTATION steps:
// a scrubbed sequence wants equal MOTION per frame, not equal time per frame.
const FRAME_COUNT = 223; // MUST match the bake in public/door/seq/*
const FRAME_TIERS = [800, 1600] as const; // phone tier, desktop (native) tier
const frameSrc = (tier: number, i: number) =>
  `/door/seq/${tier}/f-${String(i).padStart(3, "0")}.webp`;
const POSTER = "/door/door-open-poster.jpg";
const CEIL_POSTER = "/door/ceiling-poster.jpg"; // reduced-motion fallback backdrop
const GOLD = "var(--color-gold)";

// The whole film (doors → walk-in → ceiling crane) scrubs across P 0→FILM_END;
// past it the settled ceiling frame HOLDS while the brand resolves on it, then
// "Our Works" lands. There is no dome image any more — the ceiling frames are it.
const FILM_END = 0.68;

// Scrub pacing — control points [filmProgress fp, frameFraction]. This is now
// almost a straight line ON PURPOSE. The old curve existed to re-time three
// stitched clips whose internal speeds disagreed; the film is now the client's
// own single continuous move plus a crane generated to continue it, and EVERY
// baked frame carries real motion (the dead tail was trimmed before baking). So
// the camera's own pacing is already right, and the honest mapping is to hand
// the scroll straight to it — any curve here would re-introduce the "changing
// gear" feel this map was fighting. Only the very ends are shaped: a gentle
// ease off zero so the first flick of the wheel doesn't jump the doors, and a
// slight settle into the final ceiling frame.
const PACE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.0],
  [0.08, 0.06], // eased entry — the doors take up the first scroll gently
  [0.5, 0.5], // dead linear through the swing and the walk down the hall
  [0.92, 0.945], // crane rising, still linear to the eye
  [1.0, 1.0], // and settles onto the true ceiling — the brand's backdrop
];

// Monotone-cubic (Fritsch–Carlson) interpolation of PACE, NOT piecewise linear.
// Linear made the playback SPEED a step function — the camera audibly "changed
// gear" at every control point (slopes jumped 0.55 → 0.79 → 1.04 → 1.27), which
// is the opposite of a cinema shot. A monotone cubic is C1-continuous, so speed
// varies smoothly and the move now reads as one unbroken ease-in → sustain →
// settle. Monotone (not a plain spline) matters: the film must never overshoot
// and run backwards mid-scrub.
const PACE_X = PACE.map((p) => p[0]);
const PACE_Y = PACE.map((p) => p[1]);
const PACE_M = (() => {
  const n = PACE_X.length;
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++)
    d.push((PACE_Y[i + 1] - PACE_Y[i]) / (PACE_X[i + 1] - PACE_X[i]));
  const m: number[] = new Array(n);
  m[0] = d[0];
  m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++)
    m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i];
      m[i + 1] = t * b * d[i];
    }
  }
  return m;
})();

const paceMap = (fp: number): number => {
  const x = gsap.utils.clamp(0, 1, fp);
  let i = PACE_X.length - 2;
  for (let k = 1; k < PACE_X.length; k++)
    if (x <= PACE_X[k]) {
      i = k - 1;
      break;
    }
  const h = PACE_X[i + 1] - PACE_X[i];
  const t = (x - PACE_X[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    (2 * t3 - 3 * t2 + 1) * PACE_Y[i] +
    (t3 - 2 * t2 + t) * h * PACE_M[i] +
    (-2 * t3 + 3 * t2) * PACE_Y[i + 1] +
    (t3 - t2) * h * PACE_M[i + 1]
  );
};

/** Door-open light, in FILM progress fp — the doors swing SLOWLY over fp≈0.10…0.34
 *  (the swing ends earlier in the longer film), so the light pours out for the
 *  length of the open, then eases off through the walk-in. */
const D = {
  cueOut: 0.08, // "scroll to open" holds through the approach, fades as doors near
  // (the raysIn/bloomIn timings that used to live here went with the synthetic
  //  god-ray + gold-bloom overlays — the footage supplies that light itself)
};

/** Interior veil + brand + works, in GLOBAL progress P. The film settles on the
 *  ceiling at FILM_END; the brand resolves just after, over that held frame. */
const B = {
  // The walk-in now spans P≈0.23-0.48 (fp 0.34-0.70 × FILM_END) — the veil and
  // the "1968" line ride that stretch; everything after shifts with FILM_END.
  veilIn: 0.24, veilLen: 0.14, // warm legibility veil eases in as we go inside
  lineIn: 0.26, lineInLen: 0.08, lineOut: 0.42, lineOutLen: 0.08,
  markIn: 0.64, markLen: 0.13,
  wordIn: 0.7, wordLen: 0.1,
  divIn: 0.74, divLen: 0.08,
  tagIn: 0.77, tagLen: 0.08,
  brandDone: 0.84, // brand fully formed → the header may return
  brandOut: 0.88, brandOutLen: 0.07,
  blurIn: 0.89, blurLen: 0.09,
  worksIn: 0.91, worksLen: 0.08,
};

// Global progress at which the brand is fully resolved (header returns after this).
const GLOBAL_BRAND_DONE = B.brandDone;

const BLUR_PX = 5;
const WASH_MAX = 0.42;
const TAU_MS = 150; // the glide's time constant — the "sticky" weight. Raised from
//                     115 once the film became frame-perfect: the old draggy feel
//                     came from VIDEO seek latency stacking on top of this, not
//                     from the glide. With sub-frame blending the extra weight now
//                     reads as a camera settling, not as lag.

const MASK_STYLE: React.CSSProperties = {
  WebkitMaskImage: "url(/brand/a-mark-white.png)",
  maskImage: "url(/brand/a-mark-white.png)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
};

const smooth = gsap.parseEase("sine.inOut");
const easeOut = gsap.parseEase("power2.out");
const seg = (p: number, from: number, len: number) =>
  gsap.utils.clamp(0, 1, (p - from) / len);

export default function HomeFilm() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const filmCanvas = useRef<HTMLCanvasElement>(null);
  const motesCv = useRef<HTMLCanvasElement>(null);

  // NOTE: a synthetic god-ray layer (a live additive canvas of soft beams) and a
  // gold BLOOM used to sit over the doorway here. Both were REMOVED — together
  // they washed the marble carving out in a bright haze exactly as the doors
  // parted (bloom peaked at 0.78 opacity, scaled 2.07x). The film's own god-rays
  // are baked into the footage, so the light pouring through the opening is now
  // the REAL thing rather than two overlays on top of it. Restore from git
  // history if the synthetic version is ever wanted again.
  // timestamp of the last scroll tick — while scrolling, ambient effects (dust
  // motes) pause so the whole frame budget goes to the film scrub + overlays.
  const scrollActive = useRef(0);

  // ----------------------------------------------------------- dust motes --
  useIsomorphicLayoutEffect(() => {
    const cv = motesCv.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const SP = 34;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = SP;
    const sc = sprite.getContext("2d");
    if (sc) {
      const g = sc.createRadialGradient(SP / 2, SP / 2, 0, SP / 2, SP / 2, SP / 2);
      g.addColorStop(0, "rgba(232,204,132,1)");
      g.addColorStop(0.35, "rgba(232,204,132,0.45)");
      g.addColorStop(1, "rgba(232,204,132,0)");
      sc.fillStyle = g;
      sc.fillRect(0, 0, SP, SP);
    }
    let w = 0;
    let h = 0;
    const dpr = 1; // ambient dust never needs retina — halve its fill
    const N = window.innerWidth < 640 ? 16 : 26;
    type Mote = { x: number; y: number; s: number; vy: number; a: number; tw: number; p: number };
    let motes: Mote[] = [];
    const seed = () => {
      motes = Array.from({ length: N }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        s: 4 + Math.random() * 13,
        vy: 0.12 + Math.random() * 0.4,
        a: 0.14 + Math.random() * 0.42,
        tw: 0.6 + Math.random() * 1.5,
        p: i,
      }));
    };
    const resize = () => {
      const nw = cv.clientWidth;
      const nh = cv.clientHeight;
      if (nw === w && nh === h) return;
      const first = motes.length === 0;
      w = nw;
      h = nh;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (first) seed();
      else for (const m of motes) { m.x = m.x % (w || 1); m.y = m.y % (h || 1); }
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    let running = false;
    let t = 0;
    const tick = () => {
      // While the film is scrubbing, HOLD the dust (its last frame stays painted)
      // so the whole frame budget goes to the scrub + text; resume when settled.
      if (performance.now() - scrollActive.current < 140) {
        raf = requestAnimationFrame(tick);
        return;
      }
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.vy;
        m.x += Math.sin((t + m.p) * 0.4) * 0.2;
        if (m.y < -m.s) {
          m.y = h + m.s;
          m.x = Math.random() * w;
        }
        ctx.globalAlpha = m.a * (0.5 + 0.5 * Math.sin(t * m.tw + m.p));
        ctx.drawImage(sprite, m.x - m.s / 2, m.y - m.s / 2, m.s, m.s);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      threshold: 0,
    });
    io.observe(cv);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // -------------------------------------------------- the one scrubbed film --
  useIsomorphicLayoutEffect(() => {
    const rootEl = root.current;
    const stageEl = stage.current;
    const canvas = filmCanvas.current;
    if (!rootEl || !stageEl || !canvas) return;
    // alpha:false — the film always covers the full canvas, so an opaque backing
    // lets the compositor skip per-pixel blending of a fullscreen layer (matters
    // on retina). The poster behind it covers until the first frame draws.
    const c2d = canvas.getContext("2d", { alpha: false });
    if (!c2d) return;
    canvas.style.opacity = "0";

    let disposed = false;
    let firedOpen = false;
    resetDoors();
    const fireDoorsOpen = () => {
      if (firedOpen) return;
      firedOpen = true;
      openDoors();
    };

    // ---- the film: a BAKED FRAME SEQUENCE drawn on a canvas ----
    // Scroll progress picks a frame index; the nearest DECODED frame is drawn
    // object-cover in ONE synchronous drawImage per rAF. There is no video seek and
    // no async decode gating, so the film tracks the scroll frame-for-frame at any
    // speed — the fix for the slow-scroll lag/inconsistency of the old <video>
    // scrub. Frames decode OFF the main thread (createImageBitmap), coarse-to-fine,
    // so the whole film is scrubbable within a breath and the tail fills in behind
    // the cursor; nearest() covers any not-yet-landed frame.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dprCap = Math.min(window.devicePixelRatio || 1, 2);
    // Tier + a memory-safe decode width, sized to the ACTUAL painted size (the stage
    // is full-viewport). Phones take the light 800 tier; everything else the sharp
    // 1600 source, decoded DOWN to a cap so the whole-film bitmap store stays light
    // (the store holds every frame — decoding native 1600 for all 200 would be
    // ~0.7GB). Capping decode — not the source — keeps it sharp AND light; decoding
    // the *source* too small is what made the team's earlier frame film look blurry.
    const cssW = canvas.clientWidth || window.innerWidth;
    const backingW = Math.round(cssW * dprCap);
    const tier = backingW > 900 ? FRAME_TIERS[1] : FRAME_TIERS[0];
    // 200 frames now (was 128) — decode caps trimmed to keep the whole-film
    // bitmap store near the same memory envelope (~500MB desktop / ~230MB phone).
    const decodeWidth = Math.min(backingW, tier === 1600 ? 1080 : 720);

    let currentIdx = 0; // the FRACTIONAL frame the scrub currently wants
    // What is actually painted, packed into ONE number (j0, j1, blend step) so the
    // hot path allocates nothing — a template-string key here would mint a fresh
    // string every rAF, i.e. ~60 short-lived objects a second feeding the GC.
    let drawnKey = -1;
    const LAST = FRAME_COUNT - 1;
    const BLEND_STEPS = 24; // sub-frame resolution of the cross-dissolve
    // SUB-FRAME CROSS-DISSOLVE — this is what makes it read as film rather than a
    // flipbook. `renderedP` is a continuous float, but snapping it to one of 200
    // frames threw that smoothness away: scrolling slowly advanced the film only
    // ~3-4 frames a second, which is exactly the "steppy, not slow-mo" feel. We
    // now blend the two NEIGHBOURING frames by the fractional part, so the image
    // drifts continuously instead of stepping, and the blend doubles as a gentle
    // motion blur. Cost is two drawImage calls (~1.3ms laptop / 4ms retina) inside
    // a 16.7ms budget. The blend is quantised so a parked scrub stops repainting.
    const drawFilm = (idx: number) => {
      currentIdx = idx;
      const cw = canvas.width;
      const ch = canvas.height;
      if (!cw || !ch) return;
      const i0 = Math.min(LAST, Math.floor(idx));
      const q = Math.round((idx - i0) * BLEND_STEPS);
      const j0 = seq.nearest(i0);
      if (j0 < 0) return;
      const j1 = q > 0 ? seq.nearest(Math.min(LAST, i0 + 1)) : j0;
      const key = (j0 * FRAME_COUNT + j1) * (BLEND_STEPS + 1) + q;
      if (key === drawnKey) return;
      const paint = (frame: Frame, alpha: number) => {
        const { w: iw, h: ih } = frameSize(frame);
        const s = Math.max(cw / iw, ch / ih); // cover-fit, centred
        const dw = iw * s;
        const dh = ih * s;
        if (alpha < 1) c2d.globalAlpha = alpha;
        c2d.drawImage(frame, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
        if (alpha < 1) c2d.globalAlpha = 1;
      };
      const f0 = seq.get(j0);
      if (!f0) return;
      paint(f0, 1); // the base frame, fully opaque (the canvas is alpha:false)
      if (j1 !== j0) {
        const f1 = seq.get(j1);
        if (f1) paint(f1, q / BLEND_STEPS); // ...the next one dissolved over it
      }
      drawnKey = key;
    };

    // Backing store follows the painted size × dpr (capped). A resize clears it, so
    // repaint the current frame after.
    const fitCanvas = () => {
      const w = Math.round((canvas.clientWidth || window.innerWidth) * dprCap);
      const h = Math.round((canvas.clientHeight || window.innerHeight) * dprCap);
      if (w && h && (canvas.width !== w || canvas.height !== h)) {
        canvas.width = w;
        canvas.height = h;
        drawnKey = -1;
        drawFilm(currentIdx);
      }
    };

    const seq = createFrameSequence({
      count: FRAME_COUNT,
      src: (i) => frameSrc(tier, i),
      // 16→…→1: the whole span is coarsely scrubbable after a handful of decodes.
      strides: [16, 8, 4, 2, 1],
      // Deliberately LOW. createImageBitmap decodes off-thread, but each finished
      // bitmap still lands on the main thread (GPU upload), so N decodes finishing
      // together punch a hole in the scrub. At 200 frames a concurrency of 6 cost
      // an ~80ms hitch mid-scrub; 3 keeps the handoffs trickling. The tail simply
      // arrives a little later, which nearest() already covers invisibly.
      concurrency: 3,
      wrap: false, // a FILM, not a loop — a gap falls back to the nearest side
      decodeWidth,
      onFrame: (_i, first) => {
        if (first) canvas.style.opacity = "1"; // crossfade over the poster (closed doors)
        drawFilm(currentIdx); // a newly-landed frame may better match where we're parked
      },
    });

    let onResize: (() => void) | undefined;
    if (!reducedMotion) {
      fitCanvas();
      onResize = () => fitCanvas();
      window.addEventListener("resize", onResize, { passive: true });
      seq.start();
    }

    const ctx = gsap.context(() => {
      const q = <T extends HTMLElement>(s: string) => rootEl.querySelector<T>(s);
      // door overlays
      const zoomEl = q(".hf-zoom");
      const dvignetteEl = q(".hf-dvignette");
      const dcueEl = q(".hf-dcue");
      // interior + brand + works
      const interiorEl = q(".hv-interior");
      const lineEl = q(".hv-line");
      const markEl = q(".hv-markimg");
      const wordEl = q(".hv-word");
      const divEl = q(".hv-div");
      const tagEl = q(".hv-tag");
      const bloomEl = q(".hv-bloom");
      const raysEl = q(".hv-rays");
      const cueEl = q(".hv-cue");
      const brandEl = q(".hv-brand");
      const brandveilEl = q(".hv-brandveil");
      const worksEl = q(".hv-works");
      const washEl = q(".hv-wash");
      const veilEl = q(".hv-veil");

      if (zoomEl) gsap.set(zoomEl, { transformOrigin: "50% 44%" });
      if (bloomEl) gsap.set(bloomEl, { transformOrigin: "50% 50%" });
      if (brandveilEl) gsap.set(brandveilEl, { transformOrigin: "50% 50%" });

      const easeIn = gsap.parseEase("power1.in");
      const rise = (el: HTMLElement | null, v: number, from = 26) => {
        if (el) gsap.set(el, { opacity: v, y: from * (1 - v) });
      };

      holdHeader("film", true);
      let held = true;

      const apply = (P: number) => {
        // ---------------- THE FILM (fp) ----------------
        // one continuous scrub: the approach → doors open → walk into the sanctum
        // hall → crane up to the carved ceiling. paceMap lingers on the door-swing
        // and the ceiling reveal; past FILM_END the last frame holds the settled
        // ceiling as the brand resolves on it.
        const fp = seg(P, 0, FILM_END);
        drawFilm(paceMap(fp) * (FRAME_COUNT - 1)); // fractional — see drawFilm
        if (dcueEl) gsap.set(dcueEl, { opacity: 1 - easeIn(seg(fp, D.cueOut, 0.14)) });

        // ---- door-open light + cinematic push (fp) ----
        // a slow synthetic zoom INTO the doorway across the approach and the swing,
        // layered on the film's own dolly for a deeper, cinematic push-in.
        if (zoomEl) gsap.set(zoomEl, { scale: 1 + 0.12 * smooth(seg(fp, 0, 0.35)) });
        // No synthetic light over the doorway any more — the god-ray canvas and the
        // gold bloom that used to swell here were removed (they hazed the carving
        // out); the footage carries its own rays. The vignette is now a STEADY
        // filmic edge-darkening instead of breathing against the bloom it used to
        // counterweight — held mid-way between its old 0.40 and 0.82 extremes.
        if (dvignetteEl) gsap.set(dvignetteEl, { opacity: 0.52 });
        if (fp >= 0.34) fireDoorsOpen();

        // ---------------- VEIL / TYPE / BRAND / WORKS (P) ----------------
        const inside = smooth(seg(P, B.veilIn, B.veilLen));
        const brandInP = smooth(seg(P, B.markIn, 0.18));
        const gone = smooth(seg(P, B.brandOut, B.brandOutLen));
        const blur = smooth(seg(P, B.blurIn, B.blurLen));
        const works = easeOut(seg(P, B.worksIn, B.worksLen));

        // the warm veil eases in as we walk inside — legibility for the "1968"
        // line, fuller for the brand on the ceiling, then lifts again for works
        if (interiorEl) gsap.set(interiorEl, { opacity: inside });
        if (washEl) gsap.set(washEl, { opacity: WASH_MAX * blur });
        if (veilEl)
          gsap.set(veilEl, { opacity: (0.58 + 0.42 * brandInP) * (1 - 0.24 * works) });

        // "the doors everyone has been opening since 1968" — over the walk-in
        if (lineEl) {
          const i = easeOut(seg(P, B.lineIn, B.lineInLen));
          const o = smooth(seg(P, B.lineOut, B.lineOutLen));
          gsap.set(lineEl, { opacity: i * (1 - o), y: 22 * (1 - i) - 18 * o });
        }

        // a clean warm glow field behind the brand — the ornate ceiling frames it
        // at the edges while the type reads on a still, lit centre
        if (brandveilEl)
          gsap.set(brandveilEl, { opacity: brandInP * (1 - 0.55 * works), scale: 0.9 + 0.1 * brandInP });
        // divine glow behind the brand mark, on the ceiling (subtle, under the field)
        if (bloomEl)
          gsap.set(bloomEl, { opacity: 0.5 * brandInP * (1 - 0.9 * works), scale: 0.55 + 0.45 * brandInP });
        if (raysEl) gsap.set(raysEl, { opacity: 0.18 * brandInP * (1 - 0.85 * works) });

        const m = easeOut(seg(P, B.markIn, B.markLen));
        if (markEl)
          gsap.set(markEl, {
            opacity: m,
            scale: 1.16 - 0.16 * m,
            filter: `blur(${(18 * (1 - m)).toFixed(2)}px)`,
          });
        rise(wordEl, easeOut(seg(P, B.wordIn, B.wordLen)));
        rise(divEl, easeOut(seg(P, B.divIn, B.divLen)), 16);
        rise(tagEl, easeOut(seg(P, B.tagIn, B.tagLen)));

        if (brandEl)
          gsap.set(brandEl, {
            opacity: 1 - gone,
            y: -34 * gone,
            pointerEvents: gone > 0.5 ? "none" : "auto",
            filter: blur > 0.001 ? `blur(${(BLUR_PX * blur).toFixed(2)}px)` : "none",
          });
        if (worksEl)
          gsap.set(worksEl, {
            opacity: works,
            y: 36 * (1 - works),
            pointerEvents: works > 0.5 ? "auto" : "none",
          });
        if (cueEl)
          gsap.set(cueEl, {
            opacity: seg(P, B.brandDone, 0.04) * (1 - smooth(seg(P, B.brandOut, 0.06))),
          });

        // header withheld for the whole film, back once the brand resolves
        const wantHold = P < GLOBAL_BRAND_DONE;
        if (wantHold !== held) {
          held = wantHold;
          holdHeader("film", wantHold);
        }
      };

      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __pmFilm?: unknown }).__pmFilm = { apply, FILM_END, B, D, paceMap };
      }

      const mm = gsap.matchMedia();

      // Reduced motion: no film, no pin — land indoors on the carved ceiling with
      // the brand and the work as static, flowing content. Header never withheld.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        fireDoorsOpen();
        gsap.set(rootEl, { height: "auto" });
        gsap.set(stageEl, { height: "auto", display: "block", paddingTop: "7rem", paddingBottom: "7rem" });
        gsap.set([".hf-zoom", ".hf-dvignette", ".hf-dcue"], { opacity: 0 });
        gsap.set(".hv-interior", { opacity: 1 });
        gsap.set(".hv-ceiling", { opacity: 1, backgroundImage: `url(${CEIL_POSTER})` }); // static ceiling backdrop
        gsap.set(".hv-wash", { opacity: 0.3 });
        gsap.set(".hv-veil", { opacity: 0.85 });
        gsap.set(".hv-line", { opacity: 0 });
        gsap.set(".hv-markimg", { opacity: 1, scale: 1, filter: "blur(0px)" });
        gsap.set([".hv-word", ".hv-div", ".hv-tag"], { opacity: 1, y: 0 });
        gsap.set(".hv-brand", { opacity: 1, y: 0, pointerEvents: "auto" });
        gsap.set(".hv-brandveil", { opacity: 0.92, scale: 1 });
        gsap.set(".hv-bloom", { scale: 1, opacity: 0.4 });
        gsap.set(".hv-rays", { opacity: 0.2 });
        gsap.set(".hv-cue", { opacity: 0 });
        gsap.set(".hv-works", { position: "static", opacity: 1, y: 0, pointerEvents: "auto", marginTop: "5rem" });
        holdHeader("film", false);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The sticky site header reserves a `--pm-bar-bottom` (65px) flow slot at
        // the top of the body. For the whole film the header is lifted away
        // (html.pm-intro), but its slot REMAINS — leaving a cream strip of body
        // background above the doors (the intro wasn't full-bleed). Pull the film,
        // and with it the page, up by exactly the bar height so the doors run
        // full-bleed from the very top. Set ONCE (static) so there's no layout jump
        // when the header glides back in after the film, and scoped to this branch
        // so reduced motion — where the header stays visible — keeps its slot.
        // (Restores the full-bleed the old DoorScroll had via `marginTop: -gap`;
        // it was dropped in the rewrite to HomeFilm.) Must run before the scroll
        // geometry below is measured. A raw `.hf{}` rule in globals.css can't do
        // this — Tailwind v4's Lightning CSS silently drops it.
        gsap.set(rootEl, { marginTop: "calc(-1 * var(--pm-bar-bottom))" });

        // one glide loop — renderedP eases toward targetP, one weighty slow-mo
        let targetP = 0;
        let renderedP = 0;
        let looping = false;
        let rafId = 0;
        let lastT = 0;
        const tickLerp = (now: number) => {
          if (disposed) return;
          const dt = lastT ? Math.min(now - lastT, 50) : 1000 / 60;
          lastT = now;
          // the glide only ticks while the film is moving — mark that, so ambient
          // dust pauses during the scrub and resumes the moment it settles.
          scrollActive.current = now;
          const d = targetP - renderedP;
          if (Math.abs(d) < 0.00015) {
            renderedP = targetP;
            apply(renderedP);
            looping = false;
            lastT = 0;
            return;
          }
          renderedP += d * (1 - Math.exp(-dt / TAU_MS));
          apply(renderedP);
          rafId = requestAnimationFrame(tickLerp);
        };
        const kick = () => {
          if (looping || disposed) return;
          looping = true;
          rafId = requestAnimationFrame(tickLerp);
        };

        const nativeScroll = !window.matchMedia("(pointer: fine)").matches;
        let st: ScrollTrigger | undefined;
        let onNativeScroll: (() => void) | undefined;
        let onNativeResize: (() => void) | undefined;

        if (nativeScroll) {
          gsap.set(stageEl, { position: "sticky", top: 0 });
          let spanPx = Math.max(1, rootEl.offsetHeight - stageEl.offsetHeight);
          onNativeScroll = () => {
            targetP = gsap.utils.clamp(0, 1, -rootEl.getBoundingClientRect().top / spanPx);
            kick();
          };
          window.addEventListener("scroll", onNativeScroll, { passive: true });
          let lastW = window.innerWidth;
          onNativeResize = () => {
            if (window.innerWidth === lastW) return;
            lastW = window.innerWidth;
            spanPx = Math.max(1, rootEl.offsetHeight - stageEl.offsetHeight);
            onNativeScroll!();
          };
          window.addEventListener("resize", onNativeResize, { passive: true });
          onNativeScroll();
          renderedP = targetP;
          apply(renderedP);
        } else {
          st = ScrollTrigger.create({
            trigger: rootEl,
            start: "top top",
            end: "bottom bottom",
            pin: stageEl,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate(self) {
              targetP = self.progress;
              kick();
            },
            onRefresh(self) {
              targetP = renderedP = self.progress;
              apply(renderedP);
            },
          });
          apply(0);
        }

        return () => {
          cancelAnimationFrame(rafId);
          holdHeader("film", false);
          st?.kill();
          if (onNativeScroll) window.removeEventListener("scroll", onNativeScroll);
          if (onNativeResize) window.removeEventListener("resize", onNativeResize);
        };
      });
    }, rootEl);

    return () => {
      disposed = true;
      holdHeader("film", false);
      if (onResize) window.removeEventListener("resize", onResize);
      seq.dispose(); // cancel in-flight decodes + free the ImageBitmaps
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={root}
      // ONE pinned span for the WHOLE film — doors → walk-in → ceiling → brand →
      // works. The span sets how much scroll each film-second costs, i.e. the
      // slow-mo: more span = the camera moves less per notch of wheel. Widened
      // again for the cinema pass; sub-frame blending is what lets it go this slow
      // without the frames stepping. Lenis' lerp + the TAU_MS glide supply the
      // weight on top. FILM_END splits scrub from hold; ScrollTrigger reads this.
      className="hf relative bg-cream h-[900svh] md:h-[1050svh] lg:h-[1200svh]"
    >
      {/* 100lvh, NOT 100svh. On a phone the page loads with the URL bar showing
          (viewport == svh) but the bar RETRACTS the moment you scroll — which is
          exactly when the film plays — and the viewport grows to lvh. At 100svh
          the stage stayed short and the extra strip showed the section's cream
          through, as a blank band under the film. lvh is the LARGEST state, so the
          plate covers in both. dvh would track the change exactly but resizes the
          pinned stage mid-scrub, which re-fits the canvas and re-measures
          ScrollTrigger every time the bar moves — the one thing this film cannot
          afford. Stable height, always covered. */}
      <div
        ref={stage}
        className="hf-pin relative flex h-[100lvh] w-full items-center justify-center overflow-hidden bg-cream"
      >
        {/* ===================== ACT 1 — THE DOORS ===================== */}
        {/* poster, so the doors are on screen from the first paint */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-cover bg-center"
          style={{ backgroundImage: `url(${POSTER})` }}
          aria-hidden
        />
        {/* the film. Nothing is layered over the doorway any more — the light
            coming through the opening is the footage's own baked god-rays. */}
        <div className="hf-zoom pointer-events-none absolute inset-0 z-[2]" aria-hidden>
          {/* the scrubbed film — a baked WebP frame sequence drawn object-cover on
              a canvas (scroll picks the frame), crossfading over the poster (closed
              doors) once the first frame lands */}
          <canvas
            ref={filmCanvas}
            className="absolute inset-0 h-full w-full opacity-0"
          />
        </div>
        {/* filmic vignette */}
        <div
          className="hf-dvignette pointer-events-none absolute inset-0 z-[3] will-change-[opacity]"
          aria-hidden
          style={{
            background:
              "radial-gradient(130% 105% at 50% 45%, rgba(0,0,0,0) 52%, rgba(28,20,8,0.10) 78%, rgba(24,16,6,0.26) 100%)",
          }}
        />
        {/* door scroll cue — anchored to the SMALL viewport, not the stage bottom.
            The stage is 100lvh, so on a phone with the URL bar still showing its
            bottom edge sits below the fold; a `bottom-8` cue would load off-screen,
            which is precisely when this cue has a job to do. Positioning it from
            the top at 100svh keeps it a fixed gap above the fold in both states. */}
        <div
          className="hf-dcue pointer-events-none absolute left-1/2 z-[6] flex -translate-x-1/2 flex-col items-center gap-3"
          style={{ top: "calc(100svh - 5.25rem)" }}
        >
          <span className="font-display text-[10px] tracking-[0.3em] text-cream/70 uppercase">
            Scroll to open
          </span>
          <span
            className="block h-10 w-px"
            style={{ background: `linear-gradient(to bottom, ${GOLD}, transparent)` }}
          />
        </div>

        {/* ===================== ACTS 2–4 — INSIDE ===================== */}
        <div className="pointer-events-none absolute inset-0 z-[10] overflow-hidden" aria-hidden>
          <div className="hv-interior absolute inset-0 opacity-0">
            {/* static ceiling backdrop for REDUCED MOTION only — the scrubbed frame
                sequence supplies the moving ceiling in the normal experience, so the
                poster is loaded lazily via the reduced-motion branch (backgroundImage). */}
            <div className="hv-ceiling absolute inset-0 bg-cover bg-center opacity-0" />
            <div
              className="hv-veil absolute inset-0"
              style={{
                background:
                  "radial-gradient(115% 88% at 50% 50%, rgba(254,244,218,0.80) 0%, rgba(254,244,218,0.56) 34%, rgba(254,244,218,0.26) 62%, rgba(254,244,218,0.06) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 48%, rgba(46,35,19,0) 52%, rgba(46,35,19,0.16) 100%)",
              }}
            />
            <div
              className="hv-wash absolute inset-0 opacity-0"
              style={{
                background:
                  "radial-gradient(130% 110% at 50% 45%, rgba(254,244,218,0.72) 0%, rgba(254,244,218,0.60) 45%, rgba(254,244,218,0.52) 100%)",
              }}
            />
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 z-[11] grid place-items-center overflow-hidden" aria-hidden>
          <div
            className="hv-bloom h-[130vmin] w-[130vmin] rounded-full opacity-0"
            style={{
              background:
                "radial-gradient(circle, #FFFBEF 0%, #FBF1D2 30%, rgb(var(--gold-rgb) / 0.32) 52%, rgba(138,127,74,0.10) 68%, rgba(138,127,74,0) 78%)",
            }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[11] grid place-items-center overflow-hidden" aria-hidden>
          <div
            className="hv-rays h-[120vmax] w-[120vmax] opacity-0 will-change-[opacity]"
            style={{
              background:
                "repeating-conic-gradient(from 0deg at 50% 50%, rgb(var(--gold-rgb) / 0) 0deg, rgb(var(--gold-rgb) / 0.10) 3deg, rgb(var(--gold-rgb) / 0) 8deg, rgb(var(--gold-rgb) / 0) 14deg)",
              maskImage: "radial-gradient(circle, #000 0%, #000 30%, transparent 66%)",
              WebkitMaskImage: "radial-gradient(circle, #000 0%, #000 30%, transparent 66%)",
            }}
          />
        </div>
        <canvas ref={motesCv} className="pointer-events-none absolute inset-0 z-[12] h-full w-full" aria-hidden />

        {/* clean warm field behind the brand — a soft halo of light so the brand
            sits on a still centre while the ornate ceiling frames it at the edges
            (fixes the "pasted on a busy ceiling" look). */}
        <div className="hv-brandveil pointer-events-none absolute inset-0 z-[13] grid place-items-center opacity-0" aria-hidden>
          <div
            className="h-[112vmin] w-[112vmin] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(254,247,227,0.94) 0%, rgba(254,245,220,0.8) 28%, rgba(253,239,210,0.48) 50%, rgba(252,234,198,0.17) 71%, rgba(252,234,198,0) 85%)",
            }}
          />
        </div>

        {/* the 1968 line */}
        <div className="hv-line pointer-events-none absolute inset-0 z-[20] grid place-items-center px-6 opacity-0">
          <p className="pm-display max-w-[22ch] text-center font-display text-heading-brown">
            The doors everyone has been opening since 1968.
          </p>
        </div>

        {/* the brand — sits a touch BELOW the stage's centre line so the lockup
            rests with the ceiling's carved medallion instead of straddling it.
            Offset with `top` (not a transform) because apply() drives `y` on this
            block via gsap; the two would fight over the transform. There is no
            eyebrow line any more — "A Paramount Engineering Works · Since 1968"
            was removed: at 11px in maroon it could not clear 4.5:1 against ANY
            backdrop (max ≈3.6:1 even on solid cream), and the wordmark already
            says the name. */}
        <div className="hv-brand relative top-[6svh] z-[20] flex flex-col items-center px-6 text-center">
          <div className="hv-mark relative aspect-[269/234] h-32 sm:h-44">
            <Image src="/brand/a-mark-olive.png" alt="A Paramount" fill priority sizes="200px" className="hv-markimg object-contain opacity-0" />
            <div className="pointer-events-none absolute inset-0" style={MASK_STYLE}>
              <div
                className="hv-shine absolute inset-y-0 left-0 w-1/2"
                style={{
                  background: "linear-gradient(100deg, transparent 0%, rgba(255,252,235,0.95) 50%, transparent 100%)",
                  transform: "translateX(-170%)",
                }}
              />
            </div>
          </div>
          <div className="hv-word mt-9 opacity-0">
            <Wordmark className="text-[clamp(32px,7.4vw,54px)] text-heading-brown" />
          </div>
          <OrnamentDivider className="hv-div mt-9 text-olive/70 opacity-0" />
          <p className="hv-tag mt-7 font-display text-2xl text-heading-brown opacity-0 sm:text-4xl">
            Crafting Divine <span className="font-body text-maroon">Elegance</span>
          </p>
        </div>

        <div className="hv-cue absolute bottom-8 left-1/2 z-[20] -translate-x-1/2 font-display text-[10px] tracking-[0.34em] text-maroon/70 uppercase opacity-0">
          Scroll to continue
        </div>

        {/* ACT 4 — Our Works, on the same dome */}
        <div className="hv-works pointer-events-none absolute inset-0 z-[30] flex items-center justify-center opacity-0">
          <FeaturedGallery />
        </div>
      </div>
    </section>
  );
}
