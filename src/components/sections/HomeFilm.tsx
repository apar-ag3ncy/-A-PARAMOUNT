"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SITE } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import Wordmark from "@/components/ui/Wordmark";
import FeaturedGallery from "@/components/sections/FeaturedGallery";
import { openDoors, resetDoors } from "@/lib/doors";
import { holdHeader } from "@/lib/cinema";
import { createFrameSequence, frameSize } from "@/lib/frameSequence";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * HomeFilm — the ENTIRE home-page opening as ONE continuous shot, driven by a
 * SINGLE pinned scroll. There used to be two stacked pinned sections (DoorScroll,
 * then CinematicHero); the unpin→repin boundary plus a stretch of blank cream
 * between them read as "breaky / three different animations" (client). This is
 * the merge: one section, one pin, one progress P 0→1, one slow-mo glide — so
 * there is no seam left to break.
 *
 * The film, in one unbroken scroll:
 *   [0 .. DOOR_END]     the marble temple DOORS part (a scrubbed WebP frame film),
 *                       REAL golden god-rays spilling OUT through the widening gap
 *                       toward you (a live additive light layer, `.hf-rays`), a
 *                       geometric push THROUGH the opening, then the warm bloom and
 *                       a cream flood — which is the EXACT cream the interior opens
 *                       on, so the join is invisible.
 *   [DOOR_END .. 1]     we are INSIDE: the colonnade resolves out of that cream, the
 *                       "1968" line breathes in and dissolves, the camera lifts to
 *                       the carved dome, the brand resolves on it, then the brand
 *                       dissolves and "Our Works" lands on the same dome.
 *
 * Everything is a PURE FUNCTION of P written with gsap.set inside apply(P) — no
 * tweens, no captured start values, so scrubbing BACK restores the exact frame.
 * The drawn progress eases toward the scroll target on its own rAF loop with the
 * old door's time constant (TAU_MS 165), giving the whole film one weighty glide.
 * Dual pin: GSAP pin on a mouse (ScrollSmoother transforms #smooth-content so CSS
 * sticky can't hold), native `position: sticky` on touch (a GSAP pin is jittery
 * there). The header is withheld for the whole film via lib/cinema and returns
 * only once the brand has resolved.
 *
 * Interior plates: 4K Nano-Banana-Pro renders of the client's own reference
 * photos (public/interior/*). Legibility (client mandate): a warm veil + the
 * divine bloom sit between the marble and the type so the copy always reads.
 */

// -- the door film (public/door/seq/<w>/f-###.webp, 15fps) --
const FRAME_COUNT = 151;
const doorSeq = (w: 1600 | 800) => (i: number) =>
  `/door/seq/${w}/f-${String(i).padStart(3, "0")}.webp`;
const POSTER = "/door/door-open-poster.jpg";
const GOLD = "var(--color-gold)";

// Where the DOORS hand over to the INTERIOR, as a fraction of the whole pinned
// scroll. At this point the door's cream flood is complete AND the interior opens
// on that same cream — one continuous cream, so the boundary cannot be seen.
const DOOR_END = 0.4;

/** Door sub-beats, in DOOR-LOCAL progress dp = P / DOOR_END. */
const D = {
  cueOut: 0.03,
  pushIn: 0.03, // geometric dolly IN across the whole door — one slow, even creep
  raysIn: 0.12, // god-rays strengthen as the gap widens
  raysPeak: 0.5,
  bloomIn: 0.48, // warm gold bloom spreads from the sunburst
  filmEnd: 0.78, // last drawn frame — the full sunburst
  floodIn: 0.8, // cream wash → completes by dp≈0.96, the exact interior cream
  doorsOpen: 0.85,
};

/** Interior/brand/works beats, in HERO-LOCAL progress hp = (P-DOOR_END)/(1-DOOR_END). */
const H = {
  interiorIn: 0.0, len_interior: 0.05,
  lineIn: 0.04, len_lineIn: 0.11,
  lineOut: 0.23, len_lineOut: 0.1,
  lift: 0.32, len_lift: 0.22,
  bloomIn: 0.41, len_bloom: 0.17,
  markIn: 0.44, len_mark: 0.15,
  wordIn: 0.51, len_word: 0.12,
  divIn: 0.56, len_div: 0.1,
  tagIn: 0.59, len_tag: 0.1,
  brandDone: 0.69, // brand fully formed → the header may return; the landing HOLDS
  brandOut: 0.78, len_brandOut: 0.09,
  blurIn: 0.79, len_blur: 0.13,
  worksIn: 0.85, len_works: 0.1,
};

// Global progress at which the brand is fully resolved (header returns after this).
const GLOBAL_BRAND_DONE = DOOR_END + (1 - DOOR_END) * H.brandDone;

const BLUR_PX = 5;
const WASH_MAX = 0.42;
const TAU_MS = 165; // the glide's time constant — the whole film's slow-mo weight

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
  const filmCv = useRef<HTMLCanvasElement>(null);
  const raysCv = useRef<HTMLCanvasElement>(null);
  const motesCv = useRef<HTMLCanvasElement>(null);

  // ---------------------------------------------------------------- god-rays --
  // A live additive light layer over the door film: soft shafts radiating from
  // the sunburst (50% 44%) and spilling OUT through the opening. Its STRENGTH is
  // scroll-driven (set in apply); its shimmer is time-driven on this rAF loop —
  // the same split as the dust motes. NOT a crossing-gradient (that read as a
  // diamond lattice); discrete irregular soft beams read as natural god-rays.
  const rayStrength = useRef(0);
  useIsomorphicLayoutEffect(() => {
    const cv = raysCv.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    // Irregular beams — varied angle, width, length, shimmer — so they never form
    // a regular lattice. Weighted to fan outward and downward (light falls out of
    // the opening), with a few long ones reaching the screen edges.
    const N = 15;
    const beams = Array.from({ length: N }, (_, i) => {
      const t = i / N;
      return {
        ang: t * Math.PI * 2 + (i % 3) * 0.19 + t * 0.5, // spread, non-uniform
        half: (0.7 + ((i * 37) % 10) / 10) * 0.12, // half-angle width (rad)
        len: 0.85 + ((i * 53) % 10) / 10 * 0.7, // reach, in max-dims
        base: 0.05 + ((i * 29) % 10) / 10 * 0.06, // per-beam brightness
        tw: 0.5 + ((i * 17) % 10) / 10 * 1.4, // shimmer speed
        ph: i * 1.7, // shimmer phase
      };
    });

    const resize = () => {
      const nw = cv.clientWidth;
      const nh = cv.clientHeight;
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let running = false;
    let t = 0;
    const tick = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      const s = rayStrength.current;
      if (s > 0.002) {
        const cx = w * 0.5;
        const cy = h * 0.44; // the sunburst — rays pour from here
        const R = Math.hypot(w, h);
        ctx.globalCompositeOperation = "lighter";
        for (const bm of beams) {
          const a = s * bm.base * (0.55 + 0.45 * Math.sin(t * bm.tw + bm.ph));
          if (a < 0.002) continue;
          const ang = bm.ang + Math.sin(t * 0.2 + bm.ph) * 0.02; // gentle sway
          const len = R * bm.len;
          const x1 = cx + Math.cos(ang - bm.half) * len;
          const y1 = cy + Math.sin(ang - bm.half) * len;
          const x2 = cx + Math.cos(ang + bm.half) * len;
          const y2 = cy + Math.sin(ang + bm.half) * len;
          const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, len);
          g.addColorStop(0, `rgba(255,246,214,${a})`);
          g.addColorStop(0.28, `rgba(255,238,188,${a * 0.5})`);
          g.addColorStop(1, "rgba(255,236,180,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.closePath();
          ctx.fill();
        }
        // warm core glow at the source
        const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.24);
        core.addColorStop(0, `rgba(255,249,226,${s * 0.5})`);
        core.addColorStop(1, "rgba(255,244,206,0)");
        ctx.fillStyle = core;
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = "source-over";
      }
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
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const N = window.innerWidth < 640 ? 30 : 52;
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
    const cv = filmCv.current;
    if (!rootEl || !stageEl || !cv) return;
    const ctx2d = cv.getContext("2d", { alpha: false });
    if (!ctx2d) return;
    cv.style.opacity = "0";

    let disposed = false;
    let firedOpen = false;
    resetDoors();
    const fireDoorsOpen = () => {
      if (firedOpen) return;
      firedOpen = true;
      openDoors();
    };

    // ---- door frame store (progressive decode off the main thread) ----
    type NetInfo = { saveData?: boolean; effectiveType?: string };
    const net = (navigator as Navigator & { connection?: NetInfo }).connection;
    const frugal =
      net?.saveData === true || /^(slow-)?2g$|^3g$/.test(net?.effectiveType ?? "");
    const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 900;
    const src = doorSeq(frugal || smallScreen ? 800 : 1600);
    let cw = 0;
    let ch = 0;
    let drawnF = -1;
    let doorCurrent = 0;

    const paint = (j: number, alpha: number) => {
      const img = seq.get(j);
      if (!img) return;
      const { w, h } = frameSize(img);
      if (!w || !h) return;
      const s = Math.max(cw / w, ch / h);
      const dw = w * s;
      const dh = h * s;
      ctx2d.globalAlpha = alpha;
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx2d.globalAlpha = 1;
    };
    const draw = (f: number) => {
      if (drawnF >= 0 && Math.abs(f - drawnF) < 0.008) return;
      const i0 = Math.floor(f);
      const frac = f - i0;
      const j0 = seq.nearest(i0);
      if (j0 < 0) return;
      paint(j0, 1);
      if (frac > 0.004 && i0 + 1 < FRAME_COUNT) {
        const j1 = seq.nearest(i0 + 1);
        if (j1 >= 0 && j1 !== j0) paint(j1, frac);
      }
      drawnF = f;
    };
    const seq = createFrameSequence({
      count: FRAME_COUNT,
      src,
      strides: [16, 8, 4, 2, 1],
      concurrency: 6,
      wrap: false,
      onFrame: (_i, first) => {
        drawnF = -1;
        draw(doorCurrent);
        if (first) cv.style.opacity = "1";
      },
    });
    const resize = () => {
      const w = stageEl.clientWidth;
      const h = stageEl.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (w === cw && h === ch && cv.width === Math.round(w * dpr)) return;
      cw = w;
      ch = h;
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawnF = -1;
      draw(doorCurrent);
    };
    resize();
    window.addEventListener("resize", resize);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) seq.start();

    const ctx = gsap.context(() => {
      const q = <T extends HTMLElement>(s: string) => rootEl.querySelector<T>(s);
      // door overlays
      const zoomEl = q(".hf-zoom");
      const dvignetteEl = q(".hf-dvignette");
      const dbloomEl = q(".hf-dbloom");
      const dfloodEl = q(".hf-dflood");
      const dcueEl = q(".hf-dcue");
      // interior + brand + works
      const interiorEl = q(".hv-interior");
      const corridorEl = q(".hv-corridor");
      const domeEl = q(".hv-dome");
      const lineEl = q(".hv-line");
      const eyebrowEl = q(".hv-eyebrow");
      const markEl = q(".hv-markimg");
      const wordEl = q(".hv-word");
      const divEl = q(".hv-div");
      const tagEl = q(".hv-tag");
      const bloomEl = q(".hv-bloom");
      const raysEl = q(".hv-rays");
      const cueEl = q(".hv-cue");
      const brandEl = q(".hv-brand");
      const worksEl = q(".hv-works");
      const washEl = q(".hv-wash");
      const veilEl = q(".hv-veil");

      if (zoomEl) gsap.set(zoomEl, { transformOrigin: "50% 44%" });
      if (dbloomEl) gsap.set(dbloomEl, { transformOrigin: "50% 44%" });
      if (corridorEl) gsap.set(corridorEl, { transformOrigin: "50% 46%" });
      if (domeEl) gsap.set(domeEl, { transformOrigin: "50% 50%" });
      if (bloomEl) gsap.set(bloomEl, { transformOrigin: "50% 50%" });

      const easeIn = gsap.parseEase("power1.in");
      const rise = (el: HTMLElement | null, v: number, from = 26) => {
        if (el) gsap.set(el, { opacity: v, y: from * (1 - v) });
      };

      holdHeader("film", true);
      let held = true;

      const apply = (P: number) => {
        const dp = gsap.utils.clamp(0, 1, P / DOOR_END);
        const hp = gsap.utils.clamp(0, 1, (P - DOOR_END) / (1 - DOOR_END));

        // ---------------- DOORS (dp) ----------------
        // freeze the film once it has reached the sunburst (dp >= filmEnd)
        doorCurrent = seg(dp, 0, D.filmEnd) * (FRAME_COUNT - 1);
        if (dp < 1) draw(doorCurrent);
        if (dcueEl) gsap.set(dcueEl, { opacity: 1 - easeIn(seg(dp, D.cueOut, 0.05)) });
        // geometric push THROUGH the opening — film + rays zoom together
        const push = seg(dp, D.pushIn, 0.92);
        if (zoomEl) gsap.set(zoomEl, { scale: Math.pow(1.4, push) });
        // god-rays: strengthen as the gap widens, fade as the flood takes over
        rayStrength.current =
          smooth(seg(dp, D.raysIn, D.raysPeak - D.raysIn)) *
          (1 - smooth(seg(dp, 0.82, 0.16)));
        // warm bloom + vignette lift
        const db = seg(dp, D.bloomIn, 0.4);
        if (dbloomEl) gsap.set(dbloomEl, { opacity: db, scale: 1 + 1.4 * db });
        if (dvignetteEl) gsap.set(dvignetteEl, { opacity: 1 - db });
        // cream flood — completes by dp≈0.96, the EXACT cream the interior opens on
        if (dfloodEl) gsap.set(dfloodEl, { opacity: seg(dp, D.floodIn, 0.16) });
        if (dp >= D.doorsOpen) fireDoorsOpen();

        // ---------------- INTERIOR / BRAND / WORKS (hp) ----------------
        // interior opens at hp=0, which is P=DOOR_END, where the door flood is full
        // cream — so cream → colonnade, no flash, no seam.
        if (interiorEl) gsap.set(interiorEl, { opacity: smooth(seg(hp, H.interiorIn, H.len_interior)) });

        const L = smooth(seg(hp, H.lift, H.len_lift));
        if (corridorEl)
          gsap.set(corridorEl, {
            scale: Math.pow(1.24, seg(hp, 0, 0.5)) * (1 + 0.14 * L),
            yPercent: 16 * L,
            opacity: 1 - L,
          });

        if (lineEl) {
          const i = easeOut(seg(hp, H.lineIn, H.len_lineIn));
          const o = smooth(seg(hp, H.lineOut, H.len_lineOut));
          gsap.set(lineEl, { opacity: i * (1 - o), y: 22 * (1 - i) - 18 * o });
        }

        const gone = smooth(seg(hp, H.brandOut, H.len_brandOut));
        const blur = smooth(seg(hp, H.blurIn, H.len_blur));
        const works = easeOut(seg(hp, H.worksIn, H.len_works));

        if (domeEl)
          gsap.set(domeEl, {
            opacity: L,
            scale: 1.34 - 0.3 * L + 0.1 * smooth(seg(hp, H.brandDone, 0.06)) + 0.025 * blur,
            yPercent: -14 * (1 - L),
            filter: blur > 0.001 ? `blur(${(BLUR_PX * blur).toFixed(2)}px)` : "none",
          });

        const b = smooth(seg(hp, H.bloomIn, H.len_bloom));
        if (bloomEl) gsap.set(bloomEl, { opacity: 0.92 * b * (1 - 0.88 * works), scale: 0.55 + 0.45 * b });
        if (raysEl) gsap.set(raysEl, { opacity: 0.3 * b * (1 - 0.85 * works) });
        if (washEl) gsap.set(washEl, { opacity: WASH_MAX * blur });
        if (veilEl) gsap.set(veilEl, { opacity: 1 - 0.28 * works });

        const m = easeOut(seg(hp, H.markIn, H.len_mark));
        if (markEl)
          gsap.set(markEl, {
            opacity: m,
            scale: 1.16 - 0.16 * m,
            filter: `blur(${(18 * (1 - m)).toFixed(2)}px)`,
          });
        rise(eyebrowEl, easeOut(seg(hp, H.markIn - 0.05, 0.12)));
        rise(wordEl, easeOut(seg(hp, H.wordIn, H.len_word)));
        rise(divEl, easeOut(seg(hp, H.divIn, H.len_div)), 16);
        rise(tagEl, easeOut(seg(hp, H.tagIn, H.len_tag)));

        if (brandEl)
          gsap.set(brandEl, {
            opacity: 1 - gone,
            y: -34 * gone,
            pointerEvents: gone > 0.5 ? "none" : "auto",
          });
        if (worksEl)
          gsap.set(worksEl, {
            opacity: works,
            y: 36 * (1 - works),
            pointerEvents: works > 0.5 ? "auto" : "none",
          });
        if (cueEl)
          gsap.set(cueEl, {
            opacity: seg(hp, H.brandDone, 0.04) * (1 - smooth(seg(hp, H.brandOut, 0.06))),
          });

        // header withheld for the whole film, back once the brand resolves
        const wantHold = P < GLOBAL_BRAND_DONE;
        if (wantHold !== held) {
          held = wantHold;
          holdHeader("film", wantHold);
        }
      };

      if (process.env.NODE_ENV !== "production") {
        (window as unknown as { __pmFilm?: unknown }).__pmFilm = { apply, DOOR_END, H, D };
      }

      const mm = gsap.matchMedia();

      // Reduced motion: no film, no pin — land indoors on the dome with the brand
      // and the work as static, flowing content. The header is never withheld.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        fireDoorsOpen();
        gsap.set(rootEl, { height: "auto" });
        gsap.set(stageEl, { height: "auto", display: "block", paddingTop: "7rem", paddingBottom: "7rem" });
        gsap.set([".hf-zoom", ".hf-dvignette", ".hf-dbloom", ".hf-dflood", ".hf-dcue"], { opacity: 0 });
        gsap.set(".hv-interior", { opacity: 1 });
        gsap.set(".hv-corridor", { opacity: 0 });
        gsap.set(".hv-dome", { opacity: 1, scale: 1.04, yPercent: 0, filter: "none" });
        gsap.set(".hv-wash", { opacity: 0.42 });
        gsap.set(".hv-veil", { opacity: 0.85 });
        gsap.set(".hv-line", { opacity: 0 });
        gsap.set(".hv-markimg", { opacity: 1, scale: 1, filter: "blur(0px)" });
        gsap.set([".hv-eyebrow", ".hv-word", ".hv-div", ".hv-tag"], { opacity: 1, y: 0 });
        gsap.set(".hv-brand", { opacity: 1, y: 0, pointerEvents: "auto" });
        gsap.set(".hv-bloom", { scale: 1, opacity: 0.55 });
        gsap.set(".hv-rays", { opacity: 0.2 });
        gsap.set(".hv-cue", { opacity: 0 });
        gsap.set(".hv-works", { position: "static", opacity: 1, y: 0, pointerEvents: "auto", marginTop: "5rem" });
        holdHeader("film", false);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
      seq.dispose();
      holdHeader("film", false);
      window.removeEventListener("resize", resize);
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={root}
      // ONE long pinned span for the WHOLE film — doors + interior + landing +
      // works. DOOR_END splits it. ScrollTrigger reads this height.
      className="hf relative bg-cream h-[900svh] md:h-[1250svh] lg:h-[1500svh]"
    >
      <div
        ref={stage}
        className="hf-pin relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-cream"
      >
        {/* ===================== ACT 1 — THE DOORS ===================== */}
        {/* poster, so the doors are on screen from the first paint */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-cover bg-center"
          style={{ backgroundImage: `url(${POSTER})` }}
          aria-hidden
        />
        {/* the film + the god-rays zoom together through the opening */}
        <div className="hf-zoom pointer-events-none absolute inset-0 z-[2] will-change-transform" aria-hidden>
          <canvas ref={filmCv} className="absolute inset-0 h-full w-full" />
          <canvas ref={raysCv} className="absolute inset-0 h-full w-full" />
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
        {/* warm gold bloom from the sunburst */}
        <div
          className="hf-dbloom pointer-events-none absolute inset-0 z-[4] opacity-0 will-change-[transform,opacity]"
          aria-hidden
          style={{
            background:
              "radial-gradient(closest-side circle at 50% 45%, #FFFDF6 0%, #FFF4D2 28%, rgb(var(--gold-rgb) / 0.5) 46%, rgb(var(--gold-rgb) / 0) 70%)",
          }}
        />
        {/* cream flood — the exact interior cream, so the join is invisible */}
        <div
          className="hf-dflood pointer-events-none absolute inset-0 z-[5] opacity-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(125% 105% at 50% 45%, #FFFDF6 0%, #FEF4DA 58%, #FBEEC9 100%)",
          }}
        />
        {/* door scroll cue */}
        <div className="hf-dcue pointer-events-none absolute bottom-8 left-1/2 z-[6] flex -translate-x-1/2 flex-col items-center gap-3">
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
            <div className="hv-corridor absolute inset-0 will-change-transform">
              <Image src="/interior/corridor-2560.webp" alt="" fill priority sizes="100vw" className="object-cover" />
            </div>
            <div className="hv-dome absolute inset-0 opacity-0 will-change-transform">
              <Image src="/interior/dome-2560.webp" alt="" fill priority sizes="100vw" className="object-cover" />
            </div>
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

        {/* the 1968 line */}
        <div className="hv-line pointer-events-none absolute inset-0 z-[20] grid place-items-center px-6 opacity-0">
          <p className="pm-display max-w-[22ch] text-center font-display text-heading-brown">
            The doors everyone has been opening since 1968.
          </p>
        </div>

        {/* the brand */}
        <div className="hv-brand relative z-[20] flex flex-col items-center px-6 text-center">
          <p className="hv-eyebrow mb-9 font-display text-[11px] tracking-[0.34em] text-maroon uppercase opacity-0">
            {SITE.name} · Since {SITE.since}
          </p>
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
            Crafting Divine <span className="font-body text-maroon italic">Elegance</span>
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
