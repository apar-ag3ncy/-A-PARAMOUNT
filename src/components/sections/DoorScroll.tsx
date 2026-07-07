"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

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
 * mid-flight when the doors give way to it. The brand lockup lives in the
 * header (always visible) and in the hero's reveal — this section carries only
 * the serif invitation line, so the brand is revealed once, not three times.
 */

/** Frames extracted from the film at 30fps (public/door/seq/<w>/f-###.webp).
 *  30fps keeps the slow, long scrub smooth — no visible frame-stepping. */
const FRAME_COUNT = 241;
const seqSrc = (w: 1600 | 800) => (i: number) =>
  `/door/seq/${w}/f-${String(i).padStart(3, "0")}.webp`;
const POSTER = "/door/door-open-poster.jpg";
const GOLD = "#E2CA82";

/** Scroll-progress beats (fractions of the pinned span). */
const P = {
  textOut: 0.05, // invitation line lifts away as the doors begin to part
  cueOut: 0.03,
  bloomIn: 0.58, // warm centre bloom as the camera pushes into the light
  floodIn: 0.8, // cream wash → identical to the hero ground → seamless unpin
  doorsOpen: 0.85, // hand the hero its cue
  filmEnd: 0.9, // last frame; the final 10% is pure light
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
    const ctx2d = cv.getContext("2d");
    if (!ctx2d) return;

    const fireDoorsOpen = () => {
      if (fired.current) return;
      fired.current = true;
      try {
        sessionStorage.setItem("pm-loaded", "1");
      } catch {
        /* storage may be blocked — the event is what matters */
      }
      window.dispatchEvent(new CustomEvent("pm:doors-open"));
    };

    // ---------- frame store (progressive, decode off the main thread) ----------
    const src = seqSrc(window.innerWidth < 768 ? 800 : 1600);
    const frames: (ImageBitmap | HTMLImageElement | null)[] =
      Array(FRAME_COUNT).fill(null);
    let disposed = false;
    let current = 0; // frame the scrub wants
    let drawn = -1; // frame actually on the canvas

    const dims = (img: ImageBitmap | HTMLImageElement) =>
      img instanceof HTMLImageElement
        ? { w: img.naturalWidth, h: img.naturalHeight }
        : { w: img.width, h: img.height };

    /** Nearest already-decoded frame — lets the scrub feel instant while the
     *  full sequence is still streaming in. */
    const nearest = (i: number) => {
      if (frames[i]) return i;
      for (let d = 1; d < FRAME_COUNT; d++) {
        if (i - d >= 0 && frames[i - d]) return i - d;
        if (i + d < FRAME_COUNT && frames[i + d]) return i + d;
      }
      return -1;
    };

    let cw = 0;
    let ch = 0;
    const draw = (i: number) => {
      const j = nearest(i);
      if (j < 0 || j === drawn) return;
      const img = frames[j]!;
      const { w, h } = dims(img);
      if (!w || !h) return;
      const s = Math.max(cw / w, ch / h); // cover
      const dw = w * s;
      const dh = h * s;
      ctx2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
      drawn = j;
    };

    const resize = () => {
      cw = stageEl.clientWidth;
      ch = stageEl.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(cw * dpr);
      cv.height = Math.round(ch * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawn = -1;
      draw(current);
    };
    resize();
    window.addEventListener("resize", resize);

    const decode = async (i: number) => {
      if (frames[i] || disposed) return;
      try {
        // createImageBitmap decodes off-thread — scrolling never stutters.
        const blob = await (await fetch(src(i))).blob();
        frames[i] = await createImageBitmap(blob);
      } catch {
        try {
          const im = new window.Image();
          im.decoding = "async";
          im.src = src(i);
          await im.decode();
          frames[i] = im;
        } catch {
          return; // missing frame — nearest() covers the gap
        }
      }
      if (disposed) return;
      drawn = -1; // a closer frame may have arrived — repaint
      draw(current);
    };

    // Coarse lattice first (whole film scrubbable in ~16 fetches), then fill.
    const order: number[] = [];
    const seen = new Set<number>();
    for (const step of [16, 8, 4, 2, 1]) {
      for (let i = 0; i < FRAME_COUNT; i += step) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    const queue = [...order];
    let inFlight = 0;
    const pump = () => {
      if (disposed) return;
      while (inFlight < 6 && queue.length) {
        const i = queue.shift()!;
        inFlight++;
        void decode(i).finally(() => {
          inFlight--;
          pump();
        });
      }
    };
    pump();

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

          // Reduced motion: a still landing tableau — no pin, no scrub.
          if (cond.reduce) {
            gsap.set(rootEl, { height: "100svh" });
            fireDoorsOpen();
            return;
          }

          // The invitation line's entrance is pure CSS (`ds-rise` keyframes in
          // globals.css) — it plays once on load. The moment real scrubbing
          // starts, the animation is cancelled so the deterministic writer
          // below owns the elements outright (CSS animations beat inline
          // styles while they run — the two must never coexist).
          let entranceDone = false;
          const textEls = gsap.utils.toArray<HTMLElement>(".ds-text > *", rootEl);
          const settleEntrance = () => {
            if (entranceDone) return;
            entranceDone = true;
            for (const el of textEls) el.style.animation = "none";
          };
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
          const apply = (p: number) => {
            current = Math.round(seg(p, 0, P.filmEnd) * (FRAME_COUNT - 1));
            draw(current);
            const t = easeIn(seg(p, P.textOut, 0.13));
            gsap.set(textEls, { opacity: 1 - t, y: -30 * t });
            gsap.set(".ds-cue", { opacity: 1 - easeIn(seg(p, P.cueOut, 0.05)) });
            const b = easeIn(seg(p, P.bloomIn, 0.32));
            gsap.set(".ds-bloom", { opacity: 0.85 * b, scale: 1 + 0.12 * b });
            gsap.set(".ds-flood", { opacity: seg(p, P.floodIn, 0.16) });
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
          const EASE = 0.17;
          const tickLerp = () => {
            if (disposed) return;
            const d = targetP - renderedP;
            if (Math.abs(d) < 0.0002) {
              renderedP = targetP;
              apply(renderedP);
              looping = false;
              return;
            }
            renderedP += d * EASE;
            apply(renderedP);
            rafId = requestAnimationFrame(tickLerp);
          };
          const kick = () => {
            if (looping || disposed) return;
            looping = true;
            rafId = requestAnimationFrame(tickLerp);
          };

          // The door scroll IS the intro "page": while it owns the screen the
          // site header would break the spell, so <html> carries `pm-intro`
          // (CSS lifts the header away) for exactly as long as the section is
          // active, and restores it the instant the doors give way to the site.
          const setIntro = (on: boolean) =>
            document.documentElement.classList.toggle("pm-intro", on);

          const st = ScrollTrigger.create({
            trigger: rootEl,
            start: "top top",
            end: "bottom bottom",
            pin: stageEl,
            anticipatePin: 1,
            onToggle: (self) => setIntro(self.isActive),
            onUpdate(self) {
              if (self.progress > 0.03) settleEntrance();
              if (self.progress >= P.doorsOpen) fireDoorsOpen();
              targetP = self.progress;
              kick();
            },
            // Deep links / restored scroll positions land past the doors — snap
            // (no glide) so a mid-page reload isn't caught mid-animation.
            onRefresh(self) {
              if (self.progress >= P.doorsOpen) fireDoorsOpen();
              setIntro(self.isActive);
              targetP = renderedP = self.progress;
              apply(renderedP);
            },
          });
          // Hidden from the very first paint (the page opens ON the intro).
          setIntro(st.isActive !== false);

          return () => {
            cancelAnimationFrame(rafId);
            setIntro(false);
            cuePulse.kill();
            st.kill();
          };
        },
      );
    }, rootEl);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      ctx.revert();
      for (const f of frames) if (f && "close" in f) f.close();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative bg-cream"
      // A long pinned span = slow, deliberate, majestic: it takes a real,
      // unhurried scroll to swing the doors fully open.
      style={{ height: "640svh" }}
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
        {/* the film, scrubbed frame-by-frame */}
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" />

        {/* filmic vignette — keeps the render reading as photographed footage */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 105% at 50% 45%, rgba(0,0,0,0) 52%, rgba(28,20,8,0.10) 78%, rgba(24,16,6,0.26) 100%)",
          }}
        />

        {/* soft bloom, enriching the centre as the camera enters the light */}
        <div
          className="ds-bloom pointer-events-none absolute inset-0 will-change-transform"
          style={{
            opacity: 0,
            background:
              "radial-gradient(closest-side circle at 50% 45%, #FFFDF6 0%, #FCF3D6 30%, rgba(226,202,130,0.34) 50%, rgba(226,202,130,0) 72%)",
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

        {/* the invitation — the brand lockup itself belongs to the header
            above and to the hero's reveal after; here, only the line */}
        <div
          className="ds-text absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center px-6 text-center"
          style={{ textShadow: "0 0 26px rgba(226,202,130,0.55)" }}
        >
          <p className="font-serif text-2xl text-cream italic sm:text-3xl">
            The doors have been opening since 1968.
          </p>
          <div
            className="mt-[2.5vh] flex items-center gap-3"
            style={{ color: GOLD }}
          >
            <span className="h-px w-12 bg-current" />
            <span className="text-[12px]">✦</span>
            <span className="h-px w-12 bg-current" />
          </div>
          <p
            className="mt-[2.5vh] font-display text-[11px] tracking-[0.28em] uppercase"
            style={{ color: GOLD }}
          >
            Temple Artefacts · Crafted in Mumbai
          </p>
        </div>

        {/* scroll cue — scrolling is the door handle now */}
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
