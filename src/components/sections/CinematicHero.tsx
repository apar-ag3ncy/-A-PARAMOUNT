"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { SITE } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import Wordmark from "@/components/ui/Wordmark";
import FeaturedGallery from "@/components/sections/FeaturedGallery";
import { holdHeader } from "@/lib/cinema";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

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

/**
 * CinematicHero — ACTS 2 and 3 of the home page's ONE CONTINUOUS SHOT.
 *
 *   1. DoorScroll  — scroll the temple doors open; sunrays burst through; cream flood.
 *   2. ARRIVAL     — that same cream resolves INTO the mandir: we stand in the carved
 *                    marble colonnade, drifting down it. The line "The doors everyone
 *                    has been opening since 1968." breathes in, holds, dissolves.
 *   3. THE LANDING — the camera LIFTS off the corridor to the octagonal dome overhead,
 *                    and the brand resolves on that mandala: mark → wordmark →
 *                    divider → tagline. The visitor is indoors for all of it.
 *
 * SCROLL IS THE ONLY PLAYHEAD — exactly as in DoorScroll, and that is the point.
 * An earlier cut drove this on a TIMER (an auto-playing GSAP timeline) while the
 * doors above were scroll-scrubbed, so the film stopped tracking the hand halfway
 * through and the two halves felt like different websites. Now both acts use the
 * SAME machinery as the door:
 *
 *   • every state is a PURE FUNCTION of scroll progress, written with `gsap.set`
 *     inside `apply(p)` — no tweens, no captured start values, so scrubbing BACK
 *     restores the exact frame (the StrictMode bug the door already learned about);
 *   • the drawn progress eases toward the scroll target on its own rAF loop with
 *     the door's identical time constant (TAU_MS 165), which is what gives both
 *     acts the same weighty, slow-mo glide on top of ScrollSmoother;
 *   • the same dual pin strategy — GSAP pin on a mouse (ScrollSmoother transforms
 *     #smooth-content so CSS sticky cannot hold), native `position: sticky` on
 *     touch (a GSAP pin is jittery there).
 *
 * The section opens on the door's EXACT cream with the interior at opacity 0, so
 * the flood→temple seam is invisible: one shot, three acts.
 *
 * The HEADER stays away for the whole film and returns only once the brand has
 * resolved (`P.brandDone`) — held through the door→hero seam by the shared hold in
 * `lib/cinema`, so the bar can never flash in mid-shot.
 *
 * Legibility (client mandate): the marble is bright and detail-dense, so a warm
 * cream veil + the divine bloom sit BETWEEN the photo and the type. The marble
 * still reads at the edges — you are unmistakably indoors — but the centre calms
 * to light so the copy holds.
 */

/**
 * Scroll-progress beats (fractions of the pinned span), with their LENGTHS —
 * deliberately long and heavily overlapped, so every change is a slow cross-fade
 * and nothing ever steps or snaps.
 *
 * Tuned against three client notes on the first cut:
 *  • "too much blank after the 1st transition" — the temple used to take until
 *    p≈0.12 to appear, so the doors handed over to a long empty cream. The
 *    interior now resolves from p=0 (the instant the section pins) and the line
 *    is already arriving by p=0.05. There is no dead scroll.
 *  • "the 2nd transition isn't that smooth" — the corridor→dome lift used
 *    LINEAR, MISMATCHED fades (corridor out over 0.17, dome in over 0.20), which
 *    read as a muddy double-exposure. It is now ONE eased value driving both, so
 *    it is a true matched cross-dissolve, and it runs over a much longer span.
 *  • "the 3rd should be better" — the brand now resolves slowly, eased-out, with
 *    each element deeply overlapping the last.
 */
const P = {
  interiorIn: 0.0, len_interior: 0.05, // the colonnade is THERE the moment we pin
  lineIn: 0.04, len_lineIn: 0.11, // the 1968 line breathes in …
  lineOut: 0.23, len_lineOut: 0.1, // … holds, then softly dissolves — before any logo
  lift: 0.32, len_lift: 0.22, // the camera lifts — long, eased, matched cross-dissolve
  bloomIn: 0.41, len_bloom: 0.17, // divine light gathers on the dome
  markIn: 0.44, len_mark: 0.15, // the arch-A resolves out of that light
  wordIn: 0.51, len_word: 0.12,
  divIn: 0.56, len_div: 0.1,
  tagIn: 0.59, len_tag: 0.1, // … brand complete at 0.69
  brandDone: 0.69, // brand fully formed → the header may return; the landing HOLDS

  // -- ACT 4 — the work arrives on the SAME background --------------------------
  // The client rejected a separate "Our Works" section with its own copy of the
  // dome ("it feels like duplicated bg in both"). So the backdrop never changes:
  // the brand simply dissolves off it, the dome softens to a light blur, and the
  // work fades in on that identical ceiling. One background, a content swap.
  brandOut: 0.78, len_brandOut: 0.09, // the brand dissolves — the dome stays put
  blurIn: 0.79, len_blur: 0.13, // the dome melts to a soft, light blur
  worksIn: 0.85, len_works: 0.1, // "Our Works" lands on it
};

export default function CinematicHero() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // Drifting gold light-motes — dust in the temple light. Own rAF loop.
  useIsomorphicLayoutEffect(() => {
    const cv = canvas.current;
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
    // Assigning cv.width reallocates the backing store and seed() re-randomises
    // every mote; `resize` also fires when a phone's address bar slides away.
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

  // The scrubbed film.
  useIsomorphicLayoutEffect(() => {
    const rootEl = root.current;
    const stageEl = stage.current;
    if (!rootEl || !stageEl) return;

    let disposed = false;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Ambient life — independent of scroll (breath + the gleam through the mark).
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const breathe = gsap.to(".hv-mark", {
          scale: 1.02,
          transformOrigin: "50% 50%",
          duration: 5.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        const shine = gsap
          .timeline({ repeat: -1, repeatDelay: 4.6, delay: 3.4 })
          .fromTo(".hv-shine", { xPercent: -170, opacity: 0 }, { xPercent: 320, duration: 1.6, ease: "power1.inOut" }, 0)
          .to(".hv-shine", { opacity: 1, duration: 0.35, ease: "power1.in" }, 0.12)
          .to(".hv-shine", { opacity: 0, duration: 0.5, ease: "power1.out" }, 1.0);
        const io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) { breathe.play(); shine.play(); }
            else { breathe.pause(); shine.pause(); }
          },
          { threshold: 0 },
        );
        io.observe(rootEl);
        return () => io.disconnect();
      });

      // Reduced motion: no film and no pin — so the four acts can't be scrubbed.
      // Land fully formed indoors on the dome, and let ACT 4 simply FLOW beneath
      // the brand as an ordinary block (it is absolutely positioned for the film;
      // static here) — otherwise "Our Works" would be unreachable for these users.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(rootEl, { height: "auto" });
        gsap.set(stageEl, {
          height: "auto",
          display: "block",
          paddingTop: "7rem",
          paddingBottom: "7rem",
        });
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
        gsap.set(".hv-works", {
          position: "static",
          opacity: 1,
          y: 0,
          pointerEvents: "auto",
          marginTop: "5rem",
        });
        holdHeader("hero", false);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Resolve every driven element ONCE — `apply` runs on every rAF tick of
        // the scrub, and a selector string would re-run querySelectorAll each time.
        const q = <T extends HTMLElement>(s: string) => rootEl.querySelector<T>(s);
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
        const brandEl = q(".hv-brand"); // the whole brand stack — fades as a group
        const worksEl = q(".hv-works"); // ACT 4, on the same backdrop
        const washEl = q(".hv-wash"); // the light wash the softened dome sits under
        const veilEl = q(".hv-veil"); // the landing's veil — lifts a little in Act 4

        const seg = (p: number, from: number, len: number) =>
          gsap.utils.clamp(0, 1, (p - from) / len);
        // Everything is EASED, never linear. A linear cross-fade reads as a hard,
        // mechanical blend; `sine.inOut` leaves and arrives at zero velocity, so
        // each beat melts in and out — the slow-mo the client keeps asking for.
        const io = gsap.parseEase("sine.inOut"); // cross-dissolves, the camera lift
        const out = gsap.parseEase("power2.out"); // copy rising into place

        // How far the dome softens behind "Our Works". Kept DELIBERATELY light:
        // at 16px + a full wash the client couldn't read the marble any more
        // ("i want it visible but less blurry"). The carving must stay legible —
        // it is the temple, not wallpaper — while still dropping back far enough
        // that the work and its copy sit clearly in front of it.
        const BLUR_PX = 5;
        const WASH_MAX = 0.42;

        // Anchor the dolly on the corridor's vanishing point (a touch above
        // centre), so we push INTO the light rather than out of dead centre.
        if (corridorEl) gsap.set(corridorEl, { transformOrigin: "50% 46%" });
        if (domeEl) gsap.set(domeEl, { transformOrigin: "50% 50%" });
        if (bloomEl) gsap.set(bloomEl, { transformOrigin: "50% 50%" });

        /** A soft rise for a piece of copy: opacity in, y settling to 0. */
        const rise = (el: HTMLElement | null, v: number, from = 26) => {
          if (el) gsap.set(el, { opacity: v, y: from * (1 - v) });
        };

        let held = true; // the header starts withheld — the film owns the screen

        const apply = (p: number) => {
          // -- ACT 2 : we are indoors. The cream becomes the colonnade. --
          // From p=0, so the doors never hand over to an empty screen.
          if (interiorEl)
            gsap.set(interiorEl, { opacity: io(seg(p, P.interiorIn, P.len_interior)) });

          // THE LIFT — ONE eased value drives BOTH plates, so the corridor leaves
          // at exactly the rate the dome arrives: a true matched cross-dissolve
          // instead of the muddy double-exposure two mismatched linear fades made.
          const L = io(seg(p, P.lift, P.len_lift));

          // One continuous, unbroken drift down the corridor. GEOMETRIC, like the
          // door's push: scale grows exponentially with progress so the PERCEIVED
          // speed is constant start-to-finish (a linear scale reads slow early and
          // then "zaps" late, because zoom is multiplicative).
          if (corridorEl)
            gsap.set(corridorEl, {
              scale: Math.pow(1.24, seg(p, 0, 0.5)) * (1 + 0.14 * L),
              yPercent: 16 * L,
              opacity: 1 - L,
            });

          // The line — in, hold, out. Entirely before the brand.
          if (lineEl) {
            const i = out(seg(p, P.lineIn, P.len_lineIn));
            const o = io(seg(p, P.lineOut, P.len_lineOut));
            gsap.set(lineEl, {
              opacity: i * (1 - o),
              y: 22 * (1 - i) - 18 * o,
            });
          }

          // -- ACT 4 values (needed by Act 3's layers too, so compute them here) --
          const gone = io(seg(p, P.brandOut, P.len_brandOut)); // the brand dissolving
          const blur = io(seg(p, P.blurIn, P.len_blur)); // the dome softening
          const works = out(seg(p, P.worksIn, P.len_works)); // the work arriving

          // -- ACT 3 : the dome arrives, and the brand resolves on it --
          // …and it NEVER leaves. In Act 4 it only softens to a light blur and the
          // work lands on it — the backdrop is continuous from here to "Our Works".
          if (domeEl)
            gsap.set(domeEl, {
              opacity: L,
              // settles at 1.04, keeps easing in on the landing, then a touch more
              // as it blurs (a blurred layer must overscan, or its edges show).
              scale: 1.34 - 0.3 * L + 0.1 * io(seg(p, P.brandDone, 0.06)) + 0.025 * blur,
              yPercent: -14 * (1 - L),
              filter: blur > 0.001 ? `blur(${(BLUR_PX * blur).toFixed(2)}px)` : "none",
            });

          const b = io(seg(p, P.bloomIn, P.len_bloom));
          // The divine light exists to make the BRAND legible on the dome. Once the
          // brand has dissolved it is just cream over the carving — and it was the
          // biggest remaining veil at frame centre (0.41), which is why the dome
          // still looked washed out behind the work even after the blur came down.
          // So it recedes almost entirely as the work takes the stage; a whisper
          // stays, so the temple keeps its light.
          if (bloomEl)
            gsap.set(bloomEl, {
              opacity: 0.92 * b * (1 - 0.88 * works),
              scale: 0.55 + 0.45 * b,
            });
          if (raysEl) gsap.set(raysEl, { opacity: 0.3 * b * (1 - 0.85 * works) });
          // the light wash that makes the softened dome a calm ground for the work —
          // capped, so the marble stays clearly VISIBLE rather than washed to milk
          if (washEl) gsap.set(washEl, { opacity: WASH_MAX * blur });
          // …and the landing's own veil LIFTS as the work arrives, so the carving
          // reads MORE behind "Our Works", not less
          if (veilEl) gsap.set(veilEl, { opacity: 1 - 0.28 * works });

          const m = out(seg(p, P.markIn, P.len_mark));
          if (markEl)
            gsap.set(markEl, {
              opacity: m,
              scale: 1.16 - 0.16 * m,
              filter: `blur(${(18 * (1 - m)).toFixed(2)}px)`,
            });
          rise(eyebrowEl, out(seg(p, P.markIn - 0.05, 0.12)));
          rise(wordEl, out(seg(p, P.wordIn, P.len_word)));
          rise(divEl, out(seg(p, P.divIn, P.len_div)), 16);
          rise(tagEl, out(seg(p, P.tagIn, P.len_tag)));

          // -- ACT 4 : the brand dissolves off the backdrop; the work lands on it --
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
          // the cue belongs to the landing — it goes out with the brand
          if (cueEl)
            gsap.set(cueEl, {
              opacity: seg(p, P.brandDone, 0.04) * (1 - io(seg(p, P.brandOut, 0.06))),
            });

          // The bar returns ONLY once the brand is fully formed — never during
          // any of the three acts. Toggle on CHANGE, not every frame.
          const wantHold = p < P.brandDone;
          if (wantHold !== held) {
            held = wantHold;
            holdHeader("hero", wantHold);
          }
        };

        // Dev-only handle (same idea as `__gsap` in lib/gsap): every state here is
        // a pure function of scroll progress, so the whole film can be seeked and
        // MEASURED without driving the scroll — which is the only way to verify it
        // in an automation tab, where rAF is frozen and screenshots paint stale.
        // Stripped from production builds.
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __pmHero?: unknown }).__pmHero = { apply, P };
        }

        // ---- the door's buttery slow-mo glide, to the millisecond ----
        // The DRAWN progress eases toward the scroll target on its own rAF loop,
        // so a coarse wheel step unfolds as a long, deliberate slide instead of a
        // snap. Same TAU as DoorScroll, so both acts have the SAME weight.
        let targetP = 0;
        let renderedP = 0;
        let looping = false;
        let rafId = 0;
        let lastT = 0;
        const TAU_MS = 165;
        const tickLerp = (now: number) => {
          if (disposed) return;
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

        // Pinning strategy — matched to SmoothScrollProvider, exactly as DoorScroll:
        //  • Mouse → ScrollSmoother transforms #smooth-content, so CSS sticky can't
        //    hold; GSAP must pin (position: fixed).
        //  • Touch → the smoother uses NATIVE scroll (no transform), where a GSAP
        //    pin is jittery on phones, but native sticky holds perfectly.
        const nativeScroll = !window.matchMedia("(pointer: fine)").matches;
        let st: ScrollTrigger | undefined;
        let onNativeScroll: (() => void) | undefined;
        let onNativeResize: (() => void) | undefined;

        if (nativeScroll) {
          gsap.set(stageEl, { position: "sticky", top: 0 });
          // The sticky stage stays pinned for exactly (section − stage) of scroll,
          // so THAT is the span. Both are svh-based layout pixels — stable while a
          // phone's address bar slides (window.innerHeight is NOT, and reading it
          // made the door skip frames).
          let spanPx = Math.max(1, rootEl.offsetHeight - stageEl.offsetHeight);
          onNativeScroll = () => {
            targetP = gsap.utils.clamp(
              0,
              1,
              -rootEl.getBoundingClientRect().top / spanPx,
            );
            kick();
          };
          window.addEventListener("scroll", onNativeScroll, { passive: true });
          let lastW = window.innerWidth;
          onNativeResize = () => {
            if (window.innerWidth === lastW) return; // ignore address-bar flicker
            lastW = window.innerWidth;
            spanPx = Math.max(1, rootEl.offsetHeight - stageEl.offsetHeight);
            onNativeScroll!();
          };
          window.addEventListener("resize", onNativeResize, { passive: true });
          onNativeScroll();
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
            // A reload that restores scroll INSIDE (or past) the hero must land on
            // the right frame — and must not strand the header.
            onRefresh(self) {
              targetP = renderedP = self.progress;
              apply(renderedP);
            },
          });
          apply(0);
        }

        return () => {
          cancelAnimationFrame(rafId);
          holdHeader("hero", false);
          st?.kill();
          if (onNativeScroll) window.removeEventListener("scroll", onNativeScroll);
          if (onNativeResize) window.removeEventListener("resize", onNativeResize);
        };
      });
    }, rootEl);

    return () => {
      disposed = true;
      holdHeader("hero", false);
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section
      ref={root}
      // A long pinned span = slow, deliberate, majestic — the same reasoning (and
      // the same responsive ladder) as the doors above, so every act scrolls at one
      // consistent pace. ScrollTrigger reads this height, so the class alone retunes
      // the whole film. Lengthened again when "Our Works" became ACT 4 (it needs its
      // own scroll to dissolve the brand, blur the dome and land the work).
      className="hv relative bg-cream h-[520svh] md:h-[700svh] lg:h-[880svh]"
    >
      <div
        ref={stage}
        className="hv-pin relative flex h-[100svh] items-center justify-center overflow-hidden bg-cream"
      >
        {/* THE MANDIR INTERIOR. Starts invisible over the door's exact cream, so
            the flood resolves INTO the temple and the seam never shows. */}
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <div className="hv-interior absolute inset-0 opacity-0">
            {/* the carved colonnade we arrive in and drift down */}
            <div className="hv-corridor absolute inset-0 will-change-transform">
              <Image
                src="/interior/corridor-2560.webp"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            {/* the octagonal dome overhead — the camera lifts to this. `priority`,
                NOT lazy: it is Act 3's payoff and must be decoded before the lift,
                or the camera rises onto a blank plate. */}
            <div className="hv-dome absolute inset-0 opacity-0 will-change-transform">
              <Image
                src="/interior/dome-2560.webp"
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            {/* warm veil — the marble still reads at the edges (you are indoors),
                but the centre calms to light so the brand copy stays legible. It
                LIFTS a little in Act 4, so the dome becomes MORE visible behind the
                work, not less. */}
            <div
              className="hv-veil absolute inset-0"
              style={{
                background:
                  "radial-gradient(115% 88% at 50% 50%, rgba(254,244,218,0.80) 0%, rgba(254,244,218,0.56) 34%, rgba(254,244,218,0.26) 62%, rgba(254,244,218,0.06) 100%)",
              }}
            />
            {/* a breath of depth at the edges — keeps it a room, not a wash */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 100% at 50% 48%, rgba(46,35,19,0) 52%, rgba(46,35,19,0.16) 100%)",
              }}
            />
            {/* ACT 4's light wash. The dome BLURS behind "Our Works" rather than
                being covered by a panel — the client explicitly did not want a
                white card there ("i want light blurry behind the our works"). This
                lifts the blurred marble to a calm, bright ground so the work and
                its copy read cleanly, while you are still plainly inside the temple. */}
            <div
              className="hv-wash absolute inset-0 opacity-0"
              style={{
                background:
                  "radial-gradient(130% 110% at 50% 45%, rgba(254,244,218,0.72) 0%, rgba(254,244,218,0.60) 45%, rgba(254,244,218,0.52) 100%)",
              }}
            />
          </div>
        </div>

        {/* divine light bloom */}
        <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
          <div
            className="hv-bloom h-[130vmin] w-[130vmin] rounded-full opacity-0"
            style={{
              background:
                "radial-gradient(circle, #FFFBEF 0%, #FBF1D2 30%, rgb(var(--gold-rgb) / 0.32) 52%, rgba(138,127,74,0.10) 68%, rgba(138,127,74,0) 78%)",
            }}
          />
        </div>
        {/* godrays */}
        <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
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
        {/* dust in the temple light */}
        <canvas ref={canvas} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

        {/* ACT 2's line — the only thing on screen before the brand. */}
        <div className="hv-line pointer-events-none absolute inset-0 z-20 grid place-items-center px-6 opacity-0">
          <p className="pm-display max-w-[22ch] text-center font-display text-[color:var(--color-heading-brown)]">
            The doors everyone has been opening since 1968.
          </p>
        </div>

        {/* ACT 3 — the brand, on the dome. In ACT 4 it dissolves as a GROUP off
            this same backdrop, and "Our Works" takes its place. */}
        <div className="hv-brand relative z-10 flex flex-col items-center px-6 text-center">
          <p className="hv-eyebrow mb-9 font-display text-[11px] tracking-[0.34em] text-olive-deep uppercase opacity-0">
            {SITE.name} · Since {SITE.since}
          </p>

          <div className="hv-mark relative aspect-[269/234] h-32 sm:h-44">
            <Image
              src="/brand/a-mark-olive.png"
              alt="A Paramount"
              fill
              priority
              sizes="200px"
              className="hv-markimg object-contain opacity-0"
            />
            {/* golden sweep clipped INSIDE the logo alpha */}
            <div className="pointer-events-none absolute inset-0" style={MASK_STYLE}>
              <div
                className="hv-shine absolute inset-y-0 left-0 w-1/2"
                style={{
                  background:
                    "linear-gradient(100deg, transparent 0%, rgba(255,252,235,0.95) 50%, transparent 100%)",
                  transform: "translateX(-170%)",
                }}
              />
            </div>
          </div>

          <div className="hv-word mt-9 opacity-0">
            <Wordmark className="text-[clamp(32px,7.4vw,54px)] text-olive-deep" />
          </div>

          <OrnamentDivider className="hv-div mt-9 text-olive/70 opacity-0" />

          <p className="hv-tag mt-7 font-display text-2xl text-[color:var(--color-heading-brown)] opacity-0 sm:text-4xl">
            Crafting Divine{" "}
            <span className="font-body text-olive italic">Elegance</span>
          </p>
        </div>

        <div className="hv-cue absolute bottom-8 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.34em] text-olive-deep/70 uppercase opacity-0">
          Scroll to continue
        </div>

        {/* ACT 4 — "Our Works", landing on the very same dome. No section of its
            own, no second backdrop, no white panel: the brand simply dissolves and
            the work arrives on the identical ceiling. */}
        <div className="hv-works pointer-events-none absolute inset-0 z-30 flex items-center justify-center opacity-0">
          <FeaturedGallery />
        </div>
      </div>
    </section>
  );
}
