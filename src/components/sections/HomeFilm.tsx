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
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * HomeFilm — the ENTIRE home-page opening as ONE continuous shot, driven by a
 * SINGLE pinned scroll. There used to be two stacked pinned sections (DoorScroll,
 * then CinematicHero); the unpin→repin boundary plus a stretch of blank cream
 * between them read as "breaky / three different animations" (client). This is
 * the merge: one section, one pin, one progress P 0→1, one slow-mo glide — so
 * there is no seam left to break.
 *
 * The film, in one unbroken scroll — TWO temple videos concatenated into ONE H.264
 * <video> (doorscroll.mp4 0-7s, then ceilingvideo.mp4 0-4s; the last doorscroll
 * frame ≈ the first ceiling frame, a seamless MATCH CUT). It is SCRUBBED by SEEKING
 * video.currentTime — never played — so it runs at NATIVE resolution (sharp),
 * hardware-decoded and low-memory. It is ALL-INTRA (every frame a keyframe), so
 * every seek is a single-frame decode (measured seek latency ~½ of the g=4 cut) —
 * that + a decoder-paced one-seek-at-a-time scrub is what makes it buttery, not
 * draggy. (This replaced a 167-WebP-frame
 * canvas film that had to be downscaled to fight memory — which is what made it
 * blurry and heavy; the mandate against video-seeking assumed a naive sparse-GOP clip.)
 *   [0 .. FILM_END]  a slow dolly IN to the carved marble doors, which swing open
 *                    (god-rays + gold bloom that ease off so it reads clean), then
 *                    we WALK THROUGH into the golden sanctum hall — the "1968" line
 *                    breathes in and dissolves over it — and the camera CRANES UP
 *                    to the ornate carved ceiling.
 *   [FILM_END .. 1]  the seek HOLDS the settled ceiling; the brand resolves on it in
 *                    a clean warm halo field, then dissolves and "Our Works" lands.
 *
 * Everything is a PURE FUNCTION of P written with gsap.set inside apply(P) — no
 * tweens, no captured start values, so scrubbing BACK restores the exact frame.
 * The scroll target eases toward the seek on its own rAF loop with the door's time
 * constant (TAU_MS), giving the whole film one weighty glide — Lenis' page lerp
 * (SmoothScrollProvider) feeds it an already-smooth scroll position. Dual pin:
 * GSAP pin on a mouse, native `position: sticky` on touch (Lenis keeps native
 * scroll, so sticky works — the dual path simply predates the smoother swap).
 * The header is withheld for the whole film via lib/cinema and returns only once
 * the brand has resolved.
 *
 * There is no static interior plate any more — the ceiling video IS the backdrop the
 * brand resolves on (a static ceiling poster stands in only under reduced motion).
 * Legibility (client mandate): a warm veil + a clean brand-halo field sit between the
 * marble and the type so the copy always reads and the brand never looks pasted-on.
 */

// -- the film: "final - 1 -60fps.mp4" (client's fresh graded master, ONE continuous
//    take, 9.82s @ 60fps, native 1928×1072): closed brass doors in the marble gate
//    (0-1s) → doors swing open onto the golden sanctum, real god-rays baked in
//    (1-2.5s) → walk-in through the pillared hall toward the shrine (2.5-7s) →
//    camera cranes UP to the carved golden ceiling (7-9.82s). The last frame
//    (settled ceiling) is the brand's backdrop. Encoded ALL-INTRA (every frame a
//    keyframe) so every seek is a single-frame decode — instant; 60fps gives the
//    slow-mo scrub twice the temporal granularity of the old 24fps cut.
//    Scrubbed by SEEKING currentTime — hardware-decoded, native-sharp, low-memory. --
const FILM = "/door/film.mp4";
const FILM_SM = "/door/film-960.mp4"; // 960w 30fps cut for phones / frugal links
const FILM_DURATION = 9.82; // seconds — overridden by video.duration once known
const POSTER = "/door/door-open-poster.jpg";
const CEIL_POSTER = "/door/ceiling-poster.jpg"; // reduced-motion fallback backdrop
const GOLD = "var(--color-gold)";

// The whole film (doors → walk-in → ceiling crane) scrubs across P 0→FILM_END;
// past it the settled ceiling frame HOLDS while the brand resolves on it, then
// "Our Works" lands. There is no dome image any more — the ceiling video is it.
const FILM_END = 0.62;

// Scrub pacing — control points [filmProgress fp, frameFraction], retimed to the
// NEW master's beats (doors part 0–2.5s = frac 0–0.255; walk-in 2.5–7s = 0.255–
// 0.713; ceiling crane 7–9.82s = 0.713–1). The door-swing gets the biggest slice
// of scroll — the slow-mo payoff the client keeps asking for — then the walk-in
// and the ceiling glide at a steady, even rate. Piecewise linear.
const PACE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.0],
  [0.14, 0.09], // up to the first crack of gold between the doors
  [0.5, 0.255], // the swing itself in slow-mo — fully open exactly at fp 0.5
  [0.78, 0.713], // the walk-in through the pillared hall to the shrine
  [1.0, 1.0], // ceiling crane settles — the brand's backdrop
];
const paceMap = (fp: number): number => {
  for (let i = 1; i < PACE.length; i++) {
    if (fp <= PACE[i][0]) {
      const [f0, v0] = PACE[i - 1];
      const [f1, v1] = PACE[i];
      return v0 + ((v1 - v0) * (fp - f0)) / (f1 - f0);
    }
  }
  return 1;
};

/** Door-open light, in FILM progress fp — the doors swing SLOWLY over fp≈0.14…0.5,
 *  so the light pours out for the length of the open, then eases as we step in. */
const D = {
  cueOut: 0.12, // "scroll to open" holds through the approach, fades as doors near
  raysIn: 0.22, raysLen: 0.28, raysFade: 0.56, raysFadeLen: 0.16,
  bloomIn: 0.26, bloomLen: 0.24, bloomFade: 0.54, bloomFadeLen: 0.15,
};

/** Interior veil + brand + works, in GLOBAL progress P. The film settles on the
 *  ceiling at FILM_END; the brand resolves just after, over that held frame. */
const B = {
  veilIn: 0.28, veilLen: 0.16, // warm legibility veil eases in as we go inside
  lineIn: 0.28, lineInLen: 0.08, lineOut: 0.4, lineOutLen: 0.08,
  markIn: 0.58, markLen: 0.13,
  wordIn: 0.64, wordLen: 0.11,
  divIn: 0.68, divLen: 0.09,
  tagIn: 0.71, tagLen: 0.09,
  brandDone: 0.8, // brand fully formed → the header may return
  brandOut: 0.86, brandOutLen: 0.08,
  blurIn: 0.87, blurLen: 0.1,
  worksIn: 0.9, worksLen: 0.09,
};

// Global progress at which the brand is fully resolved (header returns after this).
const GLOBAL_BRAND_DONE = B.brandDone;

const BLUR_PX = 5;
const WASH_MAX = 0.42;
const TAU_MS = 115; // the glide's time constant — weighty but tight enough that the
//                     video tracks the scroll (higher felt "draggy/laggy")

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
  const filmVideo = useRef<HTMLVideoElement>(null);
  const raysCv = useRef<HTMLCanvasElement>(null);
  const motesCv = useRef<HTMLCanvasElement>(null);

  // ---------------------------------------------------------------- god-rays --
  // A live additive light layer over the door film: soft shafts radiating from
  // the sunburst (50% 44%) and spilling OUT through the opening. Its STRENGTH is
  // scroll-driven (set in apply); its shimmer is time-driven on this rAF loop —
  // the same split as the dust motes. NOT a crossing-gradient (that read as a
  // diamond lattice); discrete irregular soft beams read as natural god-rays.
  const rayStrength = useRef(0);
  // timestamp of the last scroll tick — while scrolling, ambient effects (dust
  // motes) pause so the whole frame budget goes to the film scrub + overlays.
  const scrollActive = useRef(0);
  useIsomorphicLayoutEffect(() => {
    const cv = raysCv.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const dpr = 1; // soft additive light layer — retina is wasted here
    let w = 0;
    let h = 0;
    // Irregular beams — varied angle, width, length, shimmer — so they never form
    // a regular lattice. Weighted to fan outward and downward (light falls out of
    // the opening), with a few long ones reaching the screen edges.
    // Long soft shafts that pour OUT of the door opening (the mid) and reach PAST
    // the frame — a fan across the whole lower arc and the sides, so the light
    // spills toward the viewer as the doors part rather than haloing evenly around.
    const N = 13;
    const beams = Array.from({ length: N }, (_, i) => {
      const t = i / (N - 1); // 0..1 across the fan
      return {
        // centred on straight-down (π/2), spread ±~1.6rad → lower hemisphere + sides
        ang: Math.PI / 2 + (t - 0.5) * 3.2 + ((i % 3) - 1) * 0.09,
        half: (0.7 + ((i * 37) % 10) / 10) * 0.1, // half-angle width (rad)
        len: 1.1 + (((i * 53) % 10) / 10) * 0.8, // reach past the frame, in max-dims
        base: 0.06 + (((i * 29) % 10) / 10) * 0.06, // per-beam brightness
        tw: 0.5 + (((i * 17) % 10) / 10) * 1.4, // shimmer speed
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
    let cleared = false;
    const tick = () => {
      const s = rayStrength.current;
      // Rays only exist during the door-opening (a small slice of the film). For
      // the rest, clear ONCE then idle — no full-canvas clear+composite per frame.
      if (s <= 0.002) {
        if (!cleared) {
          ctx.clearRect(0, 0, w, h);
          cleared = true;
        }
        raf = requestAnimationFrame(tick);
        return;
      }
      cleared = false;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      {
        const cx = w * 0.5;
        const cy = h * 0.48; // the door opening — rays pour from mid, down & out
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
    const video = filmVideo.current;
    if (!rootEl || !stageEl || !video) return;
    video.style.opacity = "0";

    let disposed = false;
    let firedOpen = false;
    resetDoors();
    const fireDoorsOpen = () => {
      if (firedOpen) return;
      firedOpen = true;
      openDoors();
    };

    // ---- the film <video>: SEEKED by scroll, never played ----
    // One concatenated H.264 clip with dense keyframes, so setting currentTime is a
    // near-instant single-frame decode — buttery scrubbing at native resolution
    // with the browser managing memory (no bitmap store to blur or thrash).
    type NetInfo = { saveData?: boolean; effectiveType?: string };
    const net = (navigator as Navigator & { connection?: NetInfo }).connection;
    const frugal =
      net?.saveData === true || /^(slow-)?2g$|^3g$/.test(net?.effectiveType ?? "");
    // Only PHONES get the light cut — key off width so desktops (even short ones)
    // always get the sharp 1928 film. This is what the "blurry" complaint was:
    // the old min-dimension test handed short desktops the low-res version.
    const smallScreen = window.innerWidth < 800;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let duration = FILM_DURATION;
    let ready = false;
    let target = 0; // the video time the scrub currently wants
    let lastSeek = -1;
    let seeking = false;
    let seekStartT = 0;
    // Scrub the video ONE seek at a time. While a seek is still decoding we just
    // remember the latest target and fire it the instant `seeked` lands — this
    // PACES seeks to the decoder instead of piling them up, which is the fix for
    // the fast/draggy/laggy stutter. The video then tracks the scroll as fast as
    // it can, smoothly, never queuing behind itself. Clamp off the very last frame
    // so the settled ceiling holds cleanly. A 300ms watchdog self-heals if a seek
    // ever stalls (e.g. a dropped `seeked`), so the film can never freeze.
    const seek = (t: number) => {
      if (!ready) return;
      target = Math.min(duration - 0.05, Math.max(0, t));
      if (seeking && performance.now() - seekStartT < 300) return;
      if (Math.abs(target - lastSeek) < 0.008) return;
      lastSeek = target;
      seeking = true;
      seekStartT = performance.now();
      try {
        video.currentTime = target;
      } catch {
        seeking = false; // not seekable yet — the next tick retries
      }
    };
    const onSeeked = () => {
      seeking = false;
      if (Math.abs(target - lastSeek) >= 0.008) seek(target); // chase a target that moved mid-seek
    };
    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) duration = video.duration;
    };
    const onReady = () => {
      if (ready || disposed) return;
      ready = true;
      video.style.opacity = "1"; // crossfades over the poster (same closed door)
      lastSeek = -1;
      seek(target);
    };
    if (!reducedMotion) {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.addEventListener("loadedmetadata", onMeta);
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("seeked", onSeeked);
      video.src = frugal || smallScreen ? FILM_SM : FILM;
      video.load();
    }

    const ctx = gsap.context(() => {
      const q = <T extends HTMLElement>(s: string) => rootEl.querySelector<T>(s);
      // door overlays
      const zoomEl = q(".hf-zoom");
      const dvignetteEl = q(".hf-dvignette");
      const dbloomEl = q(".hf-dbloom");
      const dcueEl = q(".hf-dcue");
      // interior + brand + works
      const interiorEl = q(".hv-interior");
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
      const brandveilEl = q(".hv-brandveil");
      const worksEl = q(".hv-works");
      const washEl = q(".hv-wash");
      const veilEl = q(".hv-veil");

      if (zoomEl) gsap.set(zoomEl, { transformOrigin: "50% 44%" });
      if (dbloomEl) gsap.set(dbloomEl, { transformOrigin: "50% 44%" });
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
        // one continuous scrub: doorscroll (approach → doors open → walk into the
        // sanctum hall) then ceilingvideo (crane up to the carved ceiling). paceMap
        // lingers on the door-swing and the ceiling reveal; past FILM_END the seek
        // holds the settled-ceiling frame as the brand resolves on it.
        const fp = seg(P, 0, FILM_END);
        seek(paceMap(fp) * duration);
        if (dcueEl) gsap.set(dcueEl, { opacity: 1 - easeIn(seg(fp, D.cueOut, 0.14)) });

        // ---- door-open light + cinematic push (fp) ----
        // a slow synthetic zoom INTO the doorway across the approach and the swing,
        // layered on the video's own dolly for a deeper, cinematic push-in.
        if (zoomEl) gsap.set(zoomEl, { scale: 1 + 0.12 * smooth(seg(fp, 0, 0.52)) });
        // god-rays POUR OUT of the opening as the doors swing, then dissolve inside
        rayStrength.current =
          0.9 *
          smooth(seg(fp, D.raysIn, D.raysLen)) *
          (1 - smooth(seg(fp, D.raysFade, D.raysFadeLen)));
        // warm gold bloom swells through the opening then eases so the hall reads clean
        const db =
          smooth(seg(fp, D.bloomIn, D.bloomLen)) *
          (1 - smooth(seg(fp, D.bloomFade, D.bloomFadeLen)));
        if (dbloomEl) gsap.set(dbloomEl, { opacity: 0.8 * db, scale: 1 + 1.1 * db });
        if (dvignetteEl) gsap.set(dvignetteEl, { opacity: 0.4 + 0.42 * (1 - db) });
        if (fp >= 0.5) fireDoorsOpen();

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
        rise(eyebrowEl, easeOut(seg(P, B.markIn - 0.04, 0.11)));
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
        gsap.set([".hf-zoom", ".hf-dvignette", ".hf-dbloom", ".hf-dcue"], { opacity: 0 });
        gsap.set(".hv-interior", { opacity: 1 });
        gsap.set(".hv-ceiling", { opacity: 1, backgroundImage: `url(${CEIL_POSTER})` }); // static ceiling backdrop
        gsap.set(".hv-wash", { opacity: 0.3 });
        gsap.set(".hv-veil", { opacity: 0.85 });
        gsap.set(".hv-line", { opacity: 0 });
        gsap.set(".hv-markimg", { opacity: 1, scale: 1, filter: "blur(0px)" });
        gsap.set([".hv-eyebrow", ".hv-word", ".hv-div", ".hv-tag"], { opacity: 1, y: 0 });
        gsap.set(".hv-brand", { opacity: 1, y: 0, pointerEvents: "auto" });
        gsap.set(".hv-brandveil", { opacity: 0.92, scale: 1 });
        gsap.set(".hv-bloom", { scale: 1, opacity: 0.4 });
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
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("seeked", onSeeked);
      video.removeAttribute("src");
      video.load();
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={root}
      // ONE pinned span for the WHOLE film — doors → walk-in → ceiling → brand →
      // works. Sized so the film plays through in ~3.5-4 screen-heights of scroll:
      // short enough that a modest scroll carries it start-to-finish, long enough
      // that it never whips (the first short cut at 320-400svh read "very fast" —
      // client). Lenis' lerp + the TAU_MS glide supply the smoothness on top.
      // FILM_END splits scrub from hold; ScrollTrigger reads this.
      className="hf relative bg-cream h-[550svh] md:h-[640svh] lg:h-[720svh]"
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
        {/* the film + the god-rays layer over the opening. The <video> is scrubbed
            by scroll (currentTime), never played — hardware-decoded and native-sharp. */}
        <div className="hf-zoom pointer-events-none absolute inset-0 z-[2]" aria-hidden>
          <video
            ref={filmVideo}
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            poster={POSTER}
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
          />
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
            {/* static ceiling backdrop for REDUCED MOTION only — the scrubbed
                <video> supplies the moving ceiling in the normal experience, so the
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
