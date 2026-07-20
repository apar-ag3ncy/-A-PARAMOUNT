"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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
 * The film, in one unbroken scroll — the client's graded master PLAYED AS ITSELF,
 * with scroll driving video.currentTime. It is deliberately NOT a baked frame
 * sequence any more. Every bake pipeline resamples: WebP re-encodes at a tier width,
 * decoded down again into an ImageBitmap and blitted, so the master's 1928x1072
 * could not survive the trip and the film read soft ("1080p master but it looks like
 * 720p"). Handing the file to the browser deletes every one of those stages.
 *
 * The known cost is that seeking is ASYNCHRONOUS and browsers coalesce seeks under
 * continuous input, which is why this was a frame sequence for several iterations.
 * Two things hold it together: the encode is ALL-INTRA, so a seek decodes exactly
 * one frame with no GOP walk, and the scrubber keeps a single in-flight seek and
 * re-targets on `seeked` rather than letting requests queue. See the encode block
 * below. If the film ever reads LAGGY rather than soft, that is this trade coming
 * due, and the bake scripts are still in the tree.
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

// -- the film, rooted in the client's graded master (assets/door/final-1-120fps-
//    master.mp4, 9.89s @120fps, 1928×1072): closed brass doors in the marble gate
//    → doors swing open onto the golden sanctum with real god-rays baked in →
//    slow walk-in through the pillared hall toward the shrine → camera cranes UP
//    to the carved ceiling, settling flat-on on the lotus medallion — the brand's
//    backdrop.
//    PLAYED AS THE VIDEO ITSELF, scrubbed by scroll — no frame bake, no canvas.
//    The client's requirement is that the master render exactly as delivered and
//    stay crystal clear, and every baked-frame pipeline necessarily resamples it:
//    the frames were WebP re-encodes at a tier width (1200 latterly), decoded down
//    again into an ImageBitmap and blitted, so the master's 1928x1072 could never
//    reach the glass intact. Handing the file to the browser removes every one of
//    those steps — the decoder feeds the compositor at native resolution, and the
//    only scaling left is the GPU fitting 1928 to the viewport.
//
//    THE TRADE, on the record. Seeking video.currentTime is asynchronous and
//    browsers COALESCE seeks under continuous input, so a scroll handler asking for
//    60 positions a second does not get 60 frames back — it gets the ones the
//    decoder finishes, and the film can lag the hand. That is why this was a frame
//    sequence for several iterations (measured then: 237ms per seek at 1928 CABAC,
//    tuned to 58ms avg / 110ms max in software decode). Two things keep it honest
//    here: the file is ALL-INTRA, so every seek decodes exactly one frame with no
//    GOP to walk, and the scrubber below never issues a seek while one is in
//    flight — it keeps only the latest wanted time and re-seeks on `seeked`, so
//    seeks never queue up. If the film ever reads laggy again rather than soft,
//    that is this trade coming due, and the frame-bake route is in git history
//    (scripts/bake-home-film.sh, scripts/bake-door-film.sh).
//
//    RE-ENCODE (all-intra is what makes it seekable; it costs size, ~38MB desktop):
//      ffmpeg -i <master> -an -vf fps=30 -c:v libx264 -preset slow -crf 20 \
//        -coder 0 -tune fastdecode -x264opts keyint=1:min-keyint=1:no-scenecut \
//        -pix_fmt yuv420p -movflags +faststart public/door/film.mp4
//    CAVLC (-coder 0) over CABAC halves decode cost — measured on this footage —
//    and +faststart puts the moov atom first so seeking works before a full load.
//
//    The acts, as fractions of the film's duration (PACE maps scroll onto these):
//      0.000-0.253   door approach + swing   0-2.5s
//      0.253-0.708   slow walk-in            2.5-7.0s
//      0.708-1.000   ceiling crane           7.0-9.89s
//
//    This restores the master's OWN ending. A previous cut replaced its last ~3s
//    (a Kling 3.0 crane pinned to assets/door/ceiling-reference.png) because that
//    ending cranes into a dark angled ceiling that is not this temple's actual one.
//    The client asked for the master verbatim; if that judgement flips again,
//    scripts/bake-door-film.sh and the reference photograph are both still here. --
const FILM_DESKTOP = "/door/film.mp4"; // 1928x1072, all-intra, native master res
const FILM_MOBILE = "/door/film-960.mp4"; // 960w, all-intra
// Below this CSS width the phone encode is used — it is the smaller download and
// no phone paints anywhere near 1928 across.
const FILM_MOBILE_MAX_W = 820;
const POSTER = "/door/door-open-poster.jpg";
const CEIL_POSTER = "/door/ceiling-poster.jpg"; // reduced-motion fallback backdrop
const GOLD = "var(--color-gold)";

// The whole film (doors → walk-in → ceiling crane) scrubs across P 0→FILM_END;
// past it the settled ceiling frame HOLDS while the brand resolves on it, then
// "Our Works" lands. There is no dome image any more — the ceiling frames are it.
const FILM_END = 0.68;

// Scrub pacing — control points [filmProgress fp, frameFraction], timed to the
// master's own act boundaries (doors stand open at 2.5s = frac 0.253; the walk-in
// ends and the crane starts at 7.0s = frac 0.708 — both verified frame by frame).
// The fp (scroll) column carries the art direction and is unchanged from the cut
// the client approved: the door swing gets the first 42% of the film's scroll —
// the slow-mo payoff — then the walk-in lingers through the hall, then the crane
// glides up and settles. Only the frame column follows this bake.
const PACE: ReadonlyArray<readonly [number, number]> = [
  [0.0, 0.0],
  [0.16, 0.082], // the approach — SLOWEST beat, dwelling on the closed doors
  [0.42, 0.253], // the swing itself in slow-mo (doors open at 2.5s → f 50/199)
  [0.72, 0.708], // the lingering walk-in to the shrine (ends 7.0s → f 141/199)
  [0.89, 0.907], // the crane lifts up the ceiling
  [1.0, 1.0], // ...and EASES to rest on the full ceiling — the brand's backdrop
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
  const filmVideo = useRef<HTMLVideoElement>(null);
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
    const video = filmVideo.current;
    if (!rootEl || !stageEl || !video) return;
    video.style.opacity = "0"; // the poster covers until the first frame is decoded

    let disposed = false;
    let firedOpen = false;
    resetDoors();
    const fireDoorsOpen = () => {
      if (firedOpen) return;
      firedOpen = true;
      openDoors();
    };

    // ---- the film: the client's master, decoded by the BROWSER at native size ----
    // Scroll progress maps to video.currentTime. Nothing is re-encoded, resampled or
    // blitted on the way to the screen, which is the whole point: the master reaches
    // the compositor at 1928x1072 and the GPU alone fits it to the viewport.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Source tier. Phones take the 960 encode — a smaller download, and no phone
    // paints anywhere near 1928 across.
    // Reduced motion never scrubs — the branch below lands on the static ceiling
    // poster instead — so it must never pay for the film either. Leaving `src` unset
    // is what keeps a 38MB all-intra download off that path entirely.
    const src = window.innerWidth <= FILM_MOBILE_MAX_W ? FILM_MOBILE : FILM_DESKTOP;
    if (!reducedMotion && video.getAttribute("src") !== src) {
      video.src = src;
      video.load();
    }

    // The film's length in seconds, once metadata lands. PACE emits a FRACTION of
    // the film, so nothing downstream needs to know the duration but this.
    let duration = 0;
    let primed = false;
    const onMeta = () => {
      duration = Number.isFinite(video.duration) ? video.duration : 0;
      seek(); // the scroll may already be parked somewhere
    };
    const onReady = () => {
      if (disposed) return;
      video.style.opacity = "1"; // crossfade over the poster (closed doors)
      // iOS will not paint a frame from a seek alone until the element has decoded
      // once. A muted+playsInline play/pause primes it and is a no-op elsewhere.
      if (!primed) {
        primed = true;
        void video.play().then(() => video.pause()).catch(() => {});
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", onReady);

    // SELF-COALESCING SCRUBBER. A scroll handler wants a new time ~60x a second, but
    // a seek is asynchronous — assigning currentTime while a seek is in flight makes
    // the browser drop the intermediate requests, which is exactly the "film lags the
    // hand" failure this architecture is known for. So keep only the LATEST wanted
    // time, issue one seek at a time, and re-issue on `seeked` if the target moved
    // while we waited. Seeks never queue, and the film always converges on where the
    // scroll actually is rather than trailing through stale positions.
    let wantT = 0;
    let seeking = false;
    const EPS = 1 / 60; // half a frame at 30fps — closer than this is already correct
    const onSeeked = () => {
      seeking = false;
      if (disposed) return;
      if (Math.abs(wantT - video.currentTime) > EPS) seek();
    };
    video.addEventListener("seeked", onSeeked);
    const seek = () => {
      if (disposed || seeking || !duration) return;
      const t = Math.min(duration - EPS, Math.max(0, wantT));
      if (Math.abs(video.currentTime - t) <= EPS) return;
      seeking = true;
      try {
        video.currentTime = t;
      } catch {
        seeking = false; // not seekable yet; the next scroll tick retries
      }
    };
    /** Called from apply() with the film fraction PACE produced. */
    const scrubTo = (frac: number) => {
      wantT = gsap.utils.clamp(0, 1, frac) * duration;
      seek();
    };

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
        scrubTo(paceMap(fp)); // PACE emits a fraction of the film; see scrubTo
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
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("seeked", onSeeked);
      // Drop the decoder and its buffers — without this a client-side nav away from
      // "/" leaves a 38MB all-intra video resident and still buffering.
      video.pause();
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
          {/* the scrubbed film — the client's master itself, scroll driving
              currentTime, crossfading over the poster (closed doors) once the first
              frame decodes. object-cover so it fills the stage exactly as the canvas
              did. `src` is set in the effect, not here, so the phone tier can be
              chosen before a byte is fetched. */}
          <video
            ref={filmVideo}
            className="absolute inset-0 h-full w-full object-cover opacity-0"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden
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
