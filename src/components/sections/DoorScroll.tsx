"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { openDoors, resetDoors } from "@/lib/doors";
import { holdHeader } from "@/lib/cinema";
import { createFrameSequence, frameSize } from "@/lib/frameSequence";

/**
 * DoorScroll — the temple doors, opened BY the visitor's own scroll.
 *
 * The AI-rendered door film (one continuous dolly through the opening doors
 * into cream light) is baked to a WebP frame sequence and scrubbed on a canvas
 * by a pinned ScrollTrigger: scroll down and the doors swing open exactly as
 * far as you have scrolled — stop and they stop, scroll back and they close.
 * ScrollSmoother (1.25s catch-up) supplies the butter; every scroll event is
 * one hardware-accelerated blit, no video seeking, no layout, no filters.
 *
 * The section ends enveloped in the same cream as the landing hero behind it,
 * and fires `pm:doors-open` near the end so the hero's apparition is already
 * mid-flight when the doors give way to it. NO text sits over the doors — the
 * film speaks for itself; only the "scroll to open" cue at the bottom survives,
 * and the brand is revealed once, in the hero.
 */

/** Frames extracted from the film at 15fps (public/door/seq/<w>/f-###.webp).
 *  The film is the marble Swaminarayan-style gate (Kling 2.5 i2v, 1080p 10s):
 *  the doors part and REAL golden sunrays burst through the widening gap and
 *  fall toward the camera, ending in a full-frame sunburst — no interior is
 *  ever revealed (client dropped the earlier interior-courtyard film), and the
 *  door hardware stays exactly the source image's (the prompt forbids invented
 *  handles — an earlier take hallucinated extras). Master film at
 *  assets/door/door-open.mp4. */
const FRAME_COUNT = 151;
const seqSrc = (w: 1600 | 800) => (i: number) =>
  `/door/seq/${w}/f-${String(i).padStart(3, "0")}.webp`;
const POSTER = "/door/door-open-poster.jpg";
const GOLD = "var(--color-gold)"; // token, not a raw hex

/** Scroll-progress beats (fractions of the pinned span). The film carries the
 *  sunrays (they burst through the gap and fall toward the floor as the doors
 *  part) and ends on a full-frame sunburst. The last stretch is a cinematic
 *  light passage — all overlapping so nothing steps: the frame eases FORWARD
 *  (push-in) so the falling rays rush at the viewer and off the edges, its warm
 *  core blooms outward in gold, the vignette lifts to pure light, then the cream
 *  flood lands the hero. NO synthetic ray layer — its crossing gradients read
 *  as a lattice pattern over the real light. */
const P = {
  cueOut: 0.03,
  pushIn: 0.03, // camera dollies IN across the WHOLE scroll — one slow, even creep
  bloomIn: 0.48, // warm gold bloom spreads outward from the sunburst
  floodIn: 0.8, // cream wash → identical to the hero ground → seamless unpin
  doorsOpen: 0.85, // hand the hero its cue (mid-flood, logo already mid-flight)
  filmEnd: 0.75, // last drawn frame — the full sunburst
};

export default function DoorScroll() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fired = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const rootEl = root.current;
    const stageEl = stage.current;
    const cv = canvas.current;
    if (!rootEl || !stageEl || !cv) return;
    // `alpha: false` — the frames are opaque and cover the canvas, so there is
    // nothing to blend. It lets the compositor treat the canvas as an opaque
    // layer instead of alpha-blending 3024x1800 px every frame. The trade: an
    // opaque canvas paints BLACK before the first frame decodes, which would
    // hide the poster behind it, so the canvas stays invisible until frame 1
    // lands (see `onFrame` below).
    const ctx2d = cv.getContext("2d", { alpha: false });
    if (!ctx2d) return;
    cv.style.opacity = "0";

    // A fresh mount means the doors are shut again — reset before anything can
    // fire, so a client-side return to "/" replays the intro. `fired` must be
    // cleared with it: the ref survives StrictMode's double-invoked effect, so
    // leaving it set would make the second pass skip openDoors() and strand the
    // hero behind the gate this reset just closed.
    fired.current = false;
    resetDoors();

    const fireDoorsOpen = () => {
      if (fired.current) return;
      fired.current = true;
      try {
        sessionStorage.setItem("pm-loaded", "1");
      } catch {
        /* storage may be blocked — the handoff is what matters */
      }
      // Records the state as well as dispatching, so the hero can still learn
      // the doors opened even if it subscribes after this call (reload landing
      // past the doors fires during DoorScroll's layout effect, which runs
      // before the hero's).
      openDoors();
    };

    // ---------- frame store (progressive, decode off the main thread) ----------
    // Key off the SHORTER screen dimension so a landscape phone or a small
    // tablet can't fall into the heavy 1600px tier over a mobile connection.
    // A metered or slow link takes the light tier whatever the screen: the film
    // is 5.8 MB at 800px and 14 MB at 1600px.
    type NetInfo = { saveData?: boolean; effectiveType?: string };
    const net = (navigator as Navigator & { connection?: NetInfo }).connection;
    const frugal =
      net?.saveData === true || /^(slow-)?2g$|^3g$/.test(net?.effectiveType ?? "");
    const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 900;
    const src = seqSrc(frugal || smallScreen ? 800 : 1600);
    let disposed = false;
    let current = 0; // FRACTIONAL frame the scrub wants (0 … FRAME_COUNT-1)
    let drawnF = -1; // fractional frame actually on the canvas
    let cw = 0;
    let ch = 0;

    const paint = (j: number, alpha: number) => {
      const img = seq.get(j);
      if (!img) return;
      const { w, h } = frameSize(img);
      if (!w || !h) return;
      const s = Math.max(cw / w, ch / h); // cover
      const dw = w * s;
      const dh = h * s;
      ctx2d.globalAlpha = alpha;
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      ctx2d.globalAlpha = 1;
    };

    // Cross-dissolve between the two frames straddling the fractional position.
    // This is what makes a SLOW scrub buttery: instead of snapping to whole
    // frames (visible stepping), adjacent frames blend by the sub-frame fraction
    // so the doors move continuously at any scroll speed. The base frame is
    // opaque and covers the canvas, so no clear is needed before compositing.
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

    // Coarse lattice first (whole film scrubbable in ~16 fetches), then fill.
    const seq = createFrameSequence({
      count: FRAME_COUNT,
      src,
      strides: [16, 8, 4, 2, 1],
      concurrency: 6,
      // A film, not a loop: frame 240 must never fall back to frame 0.
      wrap: false,
      onFrame: (_i, first) => {
        drawnF = -1; // a closer frame may have arrived — repaint
        draw(current);
        // Only now is the opaque canvas safe to show; until here the poster
        // behind it is what the visitor sees.
        if (first) cv.style.opacity = "1";
      },
    });

    // Assigning cv.width/height REALLOCATES and clears the backing store — at
    // dpr 2 that is a ~5.4M-pixel buffer. On a phone, `resize` also fires every
    // time the address bar slides away, i.e. mid-scroll, so this ran in the
    // middle of the door scrub. The stage is sized in `svh`, so its layout box
    // does NOT change when the bar collapses: bail out unless the box really
    // moved.
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
      draw(current);
    };
    resize();
    window.addEventListener("resize", resize);

    // Reduced motion never scrubs the film — it shows a still tableau — so
    // fetching all 241 frames would burn 5.8-14 MB for pixels nobody sees. The
    // canvas stays hidden (see `alpha: false` above) and the poster behind it is
    // the tableau. `seq.start()` is idempotent, so the motion branch of the
    // matchMedia below can start it if the user re-enables motion.
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!reducedMotion) seq.start();

    // ---------- the scrubbed show ----------
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (mctx) => {
          const cond = (mctx.conditions ?? {}) as { reduce?: boolean };

          // Reduced motion: a still landing tableau — no pin, no scrub, and no
          // frame sequence at all (the poster is the tableau).
          if (cond.reduce) {
            gsap.set(rootEl, { height: "100svh" });
            fireDoorsOpen();
            return;
          }
          // Motion (re-)enabled: safe to call repeatedly, start() is idempotent.
          seq.start();

          const cuePulse = gsap.fromTo(
            ".ds-cueline",
            { scaleY: 0.35, transformOrigin: "top center", opacity: 0.4 },
            {
              scaleY: 1,
              opacity: 1,
              duration: 1.3,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            },
          );

          // Every overlay state is a pure function of scroll progress —
          // recomputed each tick with gsap.set. No tween state, no captured
          // start values: scrubbing back always restores the exact landing
          // view. (A handful of sets per scroll tick is negligible.)
          const seg = (p: number, from: number, len: number) =>
            gsap.utils.clamp(0, 1, (p - from) / len);
          const easeIn = gsap.parseEase("power1.in");

          // Resolve the overlay elements ONCE. A selector string makes gsap.set
          // re-run querySelectorAll on every call, and `apply` runs every rAF
          // tick of the scrub — that was 3 DOM queries per frame, ~180 per
          // second, for the whole length of the door.
          const cueEl = rootEl.querySelector<HTMLElement>(".ds-cue");
          const vignetteEl = rootEl.querySelector<HTMLElement>(".ds-vignette");
          const bloomEl = rootEl.querySelector<HTMLElement>(".ds-bloom");
          const floodEl = rootEl.querySelector<HTMLElement>(".ds-flood");
          // Anchor the push-in and the bloom on the sunburst (a touch above
          // centre), so the frame grows FROM the light, not from dead centre.
          gsap.set(cv, { transformOrigin: "50% 44%" });
          if (bloomEl) gsap.set(bloomEl, { transformOrigin: "50% 44%" });

          const apply = (p: number) => {
            current = seg(p, 0, P.filmEnd) * (FRAME_COUNT - 1);
            draw(current);
            if (cueEl)
              gsap.set(cueEl, { opacity: 1 - easeIn(seg(p, P.cueOut, 0.05)) });
            // Cinematic push THROUGH the doorway: the whole frame eases forward
            // so the falling sunrays rush toward the viewer and slide off the
            // edges — the "rays coming through the screen" feel. Its warm core
            // then blooms OUTWARD in gold (the ray colour stays consistent, no
            // sudden white), the vignette lifts so the edges go pure light, and
            // the cream flood lands the hero. Every value is a continuous
            // function of scroll — scrub back and it all reverses, no step.
            // GEOMETRIC dolly-in, spread across the whole scroll: scale grows
            // exponentially with progress, so the PERCEIVED zoom speed is
            // constant start-to-finish (a linear scale looks slow early then
            // "zaps" late, because zoom is multiplicative). One slow, even,
            // cinematic push toward the sunburst — you feel yourself entering
            // the doorway the whole way, never a lurch. Reaches ~1.4x by the
            // threshold; edges slide past as you go in.
            const push = seg(p, P.pushIn, 0.92);
            gsap.set(cv, { scale: Math.pow(1.4, push) });
            // Linear bloom crossfade (no easeIn) so the light spreads at an even
            // rate too — the whole passage reads as one consistent motion.
            const b = seg(p, P.bloomIn, 0.4);
            if (bloomEl) gsap.set(bloomEl, { opacity: b, scale: 1 + 1.4 * b });
            if (vignetteEl) gsap.set(vignetteEl, { opacity: 1 - b });
            if (floodEl) gsap.set(floodEl, { opacity: seg(p, P.floodIn, 0.16) });
          };

          // ---- buttery slow-mo glide ----
          // The DRAWN progress eases toward the scroll target on its own rAF
          // loop, so a coarse wheel step unfolds as a smooth, deliberate slide
          // through the frames rather than a snap. ScrollSmoother already glides
          // the scroll position; this second, light ease is what makes the door
          // itself feel weighty and majestic. EASE is tuned to stay responsive
          // on top of ScrollSmoother's own glide — sticky, never laggy.
          let targetP = 0;
          let renderedP = 0;
          let looping = false;
          let rafId = 0;
          let lastT = 0;
          // Exponential glide, expressed as a TIME constant rather than a
          // per-frame fraction (refresh-rate independent). Tuned UP from the
          // original 89.45ms: each wheel step now unfolds as a long, weighty
          // slow-mo slide (~90% settled in ~380ms, fully in ~800ms) — the
          // deliberate, almost-VR glide the client asked for — while staying
          // sticky enough on top of ScrollSmoother's own ease to never lag the
          // hand. Scrubbing back gets the same treatment in reverse.
          const TAU_MS = 165;
          const tickLerp = (now: number) => {
            if (disposed) return;
            // Clamp dt so a backgrounded tab (or a long GC pause) resumes with a
            // glide rather than a jump.
            const dt = lastT ? Math.min(now - lastT, 50) : 1000 / 60;
            lastT = now;
            const d = targetP - renderedP;
            if (Math.abs(d) < 0.0002) {
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

          // The door scroll IS the intro "page": while it owns the screen the
          // site header would break the spell. But the film does not END here —
          // CinematicHero carries straight on INSIDE the mandir and wants the bar
          // gone too, until the brand resolves. So the hold is shared (see
          // lib/cinema): if this section simply removed `pm-intro` when it went
          // inactive, the header would flash in for a frame at the door→interior
          // seam, in the middle of the shot.
          const setIntro = (on: boolean) => holdHeader("doors", on);

          // Pinning strategy depends on the scroll environment (matched to
          // SmoothScrollProvider):
          //  • Fine pointer (mouse) → ScrollSmoother transforms #smooth-content,
          //    so native CSS sticky can't hold; GSAP must pin (position:fixed).
          //  • Touch (coarse) → the smoother uses NATIVE scroll (smoothTouch:0,
          //    no transform), where a GSAP pin is notoriously jittery/broken on
          //    phones — but native `position:sticky` holds the stage perfectly.
          const nativeScroll = !window.matchMedia("(pointer: fine)").matches;
          let st: ScrollTrigger | undefined;
          let onNativeScroll: (() => void) | undefined;
          let onNativeResize: (() => void) | undefined;

          if (nativeScroll) {
            // ---- TOUCH / native scroll ----
            // Pin the stage with native CSS sticky (validated to hold on native
            // scroll), and read scroll progress STRAIGHT FROM the section's own
            // position. Both GSAP pinning and ScrollTrigger's scrub are flaky on
            // phones; this layout-read progress is correct under any native or
            // momentum scrolling, so the doors track the finger exactly.
            gsap.set(stageEl, { position: "sticky", top: 0 });
            // With native scroll the site header can sit in normal flow and push
            // this first section down. Measure whatever gap actually exists at
            // the top and pull the section up by exactly that, so the doors are
            // full-bleed from the very top without ever over-pulling (the header
            // is lifted away during the intro anyway).
            const gap = rootEl.getBoundingClientRect().top;
            if (gap > 1) gsap.set(rootEl, { marginTop: -gap });
            // The sticky stage stays pinned for exactly (section − stage) of
            // scroll, so THAT is the scrub span. Both are `svh`-based layout
            // pixels, stable regardless of the mobile address bar.
            //
            // The old span used `window.innerHeight` — the VISUAL viewport,
            // which grows/shrinks as the phone's address bar hides/shows while
            // the svh layout stays fixed. That mismatch made the same finger
            // position resolve to a different progress mid-scroll, so the doors
            // jumped and skipped frames on phones. Reading the stage height
            // instead keeps progress monotonic with the finger.
            // Cached: both heights are svh-based layout pixels that only change
            // on a real resize. Reading offsetHeight twice per scroll event
            // forced a synchronous layout right after the rAF loop had written
            // styles — a reflow on every scroll tick, on exactly the devices
            // that can least afford one.
            let spanPx = Math.max(1, rootEl.offsetHeight - stageEl.offsetHeight);
            onNativeScroll = () => {
              const p = gsap.utils.clamp(
                0,
                1,
                -rootEl.getBoundingClientRect().top / spanPx,
              );
              if (p >= P.doorsOpen) fireDoorsOpen();
              setIntro(p < 0.999);
              targetP = p;
              kick();
            };
            window.addEventListener("scroll", onNativeScroll, { passive: true });
            // Only react to real layout changes (orientation), not the address
            // bar's height flicker — recomputing mid-scroll on every bar nudge
            // is itself a source of jump. Width is stable across bar show/hide.
            let lastW = window.innerWidth;
            onNativeResize = () => {
              if (window.innerWidth === lastW) return;
              lastW = window.innerWidth;
              spanPx = Math.max(1, rootEl.offsetHeight - stageEl.offsetHeight);
              onNativeScroll!();
            };
            window.addEventListener("resize", onNativeResize, { passive: true });
            onNativeScroll(); // paint the closed doors + hide header immediately
          } else {
            // ---- MOUSE ----
            // ScrollSmoother transforms #smooth-content, so CSS sticky can't
            // hold; GSAP pins (position:fixed) and drives the scrub via scrub.
            st = ScrollTrigger.create({
              trigger: rootEl,
              start: "top top",
              end: "bottom bottom",
              pin: stageEl,
              anticipatePin: 1,
              onToggle: (self) => setIntro(self.isActive),
              onUpdate(self) {
                if (self.progress >= P.doorsOpen) fireDoorsOpen();
                targetP = self.progress;
                kick();
              },
              // Deep links / restored scroll positions land past the doors.
              onRefresh(self) {
                if (self.progress >= P.doorsOpen) fireDoorsOpen();
                setIntro(self.isActive);
                targetP = renderedP = self.progress;
                apply(renderedP);
              },
            });
            // Hidden from the very first paint (the page opens ON the intro).
            setIntro(st.isActive !== false);
          }

          return () => {
            cancelAnimationFrame(rafId);
            setIntro(false);
            cuePulse.kill();
            st?.kill();
            if (onNativeScroll)
              window.removeEventListener("scroll", onNativeScroll);
            if (onNativeResize)
              window.removeEventListener("resize", onNativeResize);
          };
        },
      );
    }, rootEl);

    return () => {
      disposed = true;
      seq.dispose(); // cancels in-flight decodes and frees the ImageBitmaps
      window.removeEventListener("resize", resize);
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={root}
      // A long pinned span = slow, deliberate, majestic. Responsive: a phone
      // shouldn't demand 6 screen-heights of swiping to open the doors, so the
      // scrub distance scales up with the device. ScrollTrigger reads this
      // element's height, so the CSS class alone retunes the whole scrub.
      className="relative bg-cream h-[420svh] md:h-[600svh] lg:h-[780svh]"
      aria-label="The temple doors open as you scroll"
    >
      <div
        ref={stage}
        className="relative h-[100svh] w-full overflow-hidden bg-cream"
      >
        {/* poster behind the canvas — the doors are on screen from the very
            first paint, before a single frame has decoded */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${POSTER})` }}
        />
        {/* the film, scrubbed frame-by-frame — CSS-scaled for the push-in */}
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full will-change-transform"
        />

        {/* filmic vignette — keeps the render reading as photographed footage;
            lifts away as the light passage takes over (see `apply`) */}
        <div
          className="ds-vignette pointer-events-none absolute inset-0 will-change-[opacity]"
          style={{
            background:
              "radial-gradient(130% 105% at 50% 45%, rgba(0,0,0,0) 52%, rgba(28,20,8,0.10) 78%, rgba(24,16,6,0.26) 100%)",
          }}
        />

        {/* warm gold bloom — the frame's core spreads OUTWARD to envelop the
            screen as the camera enters the light (scaled/faded in `apply`) */}
        <div
          className="ds-bloom pointer-events-none absolute inset-0 will-change-[transform,opacity]"
          style={{
            opacity: 0,
            background:
              "radial-gradient(closest-side circle at 50% 45%, #FFFDF6 0%, #FFF4D2 28%, rgb(var(--gold-rgb) / 0.5) 46%, rgb(var(--gold-rgb) / 0) 70%)",
          }}
        />

        {/* cream wash — the exact hero ground, so the unpin is invisible */}
        <div
          className="ds-flood pointer-events-none absolute inset-0"
          style={{
            opacity: 0,
            background:
              "radial-gradient(125% 105% at 50% 45%, #FFFDF6 0%, #FEF4DA 58%, #FBEEC9 100%)",
          }}
        />

        {/* No text over the doors — the film speaks for itself. Only the
            scroll cue below survives; scrolling is the door handle. */}
        <div className="ds-cue pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
          <span className="font-display text-[10px] tracking-[0.3em] text-cream/70 uppercase">
            Scroll to open
          </span>
          <span
            className="ds-cueline block h-10 w-px"
            style={{
              background: `linear-gradient(to bottom, ${GOLD}, transparent)`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
