"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE } from "@/lib/constants";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Cinematic "heavenly" landing hero.
 *
 * Two movements, cleanly separated so they never fight:
 *  1. INTRO (time-driven, auto-plays on load ~5s, slow-mo): the divine bloom
 *     breathes in, the arch-monogram and a line-art mandir skyline draw
 *     themselves stroke by stroke, wordmark + tagline rise. First paint is
 *     never empty.
 *  2. SCROLL (pinned, scrub: 2 for heavy slow-mo smoothing): a slow push-in,
 *     the light swells gold, then the mark ascends and the wash reveals the
 *     site. Scrub animates WRAPPERS (hv-zoom, hv-lift-a/b, hv-bloom-wrap, etc.)
 *     while the intro animates inner elements — zero shared tween targets.
 *
 * Mobile / reduced-motion: fully formed, gentle fade, no pin.
 */
export default function CinematicHero() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  // Drifting gold light-motes on their own rAF loop.
  useIsomorphicLayoutEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const N = window.innerWidth < 640 ? 34 : 64;
    type Mote = { x: number; y: number; r: number; vy: number; a: number; tw: number; p: number };
    let motes: Mote[] = [];

    const seed = () => {
      motes = Array.from({ length: N }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 2.2,
        vy: 0.12 + Math.random() * 0.42,
        a: 0.15 + Math.random() * 0.5,
        tw: 0.6 + Math.random() * 1.6,
        p: i,
      }));
    };
    const resize = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    window.addEventListener("resize", resize);

    let t = 0;
    const tick = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      ctx.shadowColor = "rgba(226,202,130,0.9)";
      ctx.shadowBlur = 8;
      for (const m of motes) {
        m.y -= m.vy;
        m.x += Math.sin((t + m.p) * 0.4) * 0.22;
        if (m.y < -8) {
          m.y = h + 8;
          m.x = Math.random() * w;
        }
        const tw = 0.5 + 0.5 * Math.sin(t * m.tw + m.p);
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 202, 130, ${(m.a * tw).toFixed(3)})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Intro (auto) + pinned scroll cinematic.
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const markStrokes = gsap.utils.toArray<SVGGeometryElement>(q(".mono-stroke"));
    const templeStrokes = gsap.utils.toArray<SVGGeometryElement>(q(".temple-stroke"));

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Ambient life on any non-reduced viewport.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hv-rays", { rotate: 360, duration: 100, ease: "none", repeat: -1 });
        gsap.to(".hv-mark", {
          scale: 1.02,
          transformOrigin: "50% 50%",
          duration: 5.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // Desktop: auto intro + slow scrubbed cinematic.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        // prime self-drawing strokes
        [...markStrokes, ...templeStrokes].forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        // hide until each draw begins — round line-caps otherwise peek as dots
        gsap.set([...markStrokes, ...templeStrokes], { opacity: 0 });
        gsap.set(".hv-fill", { opacity: 0 });
        gsap.set([".hv-eyebrow", ".hv-word", ".hv-div", ".hv-tag"], { opacity: 0, y: 26 });
        gsap.set(".hv-bloom", { scale: 0.55, opacity: 0, transformOrigin: "50% 50%" });
        gsap.set(".hv-rays", { opacity: 0 });
        gsap.set([".hv-frame", ".hv-cue"], { opacity: 0 });

        // ---- 1. the intro inscription (slow-mo, plays once on load) ----
        const intro = gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .to(".hv-bloom", { scale: 1, opacity: 0.9, duration: 2.4, ease: "power2.inOut" }, 0)
          .to(".hv-rays", { opacity: 0.36, duration: 2.4, ease: "power2.inOut" }, 0.4)
          .to(".hv-eyebrow", { opacity: 1, y: 0, duration: 1.1 }, 0.5)
          .set(markStrokes, { opacity: 1 }, 0.68)
          .to(markStrokes, { strokeDashoffset: 0, duration: 2.6, stagger: 0.22, ease: "power2.inOut" }, 0.7)
          .set(templeStrokes, { opacity: 1 }, 0.98)
          .to(templeStrokes, { strokeDashoffset: 0, duration: 2.4, stagger: 0.1, ease: "power2.inOut" }, 1.0)
          .to(".hv-fill", { opacity: 1, duration: 1.4 }, 2.9)
          .to(".hv-word", { opacity: 1, y: 0, duration: 1.2 }, 3.15)
          .to(".hv-div", { opacity: 1, y: 0, duration: 1 }, 3.45)
          .to(".hv-tag", { opacity: 1, y: 0, duration: 1.2 }, 3.6)
          .to(".hv-frame", { opacity: 1, duration: 1.6 }, 3.4)
          .to(".hv-cue", { opacity: 1, duration: 1 }, 4.1);

        // Opened in a background tab? Hold at the first frame and play the full
        // inscription the moment the tab becomes visible.
        let onVis: (() => void) | undefined;
        if (document.hidden) {
          intro.pause(0);
          onVis = () => {
            if (!document.hidden) {
              intro.play(0);
              if (onVis) document.removeEventListener("visibilitychange", onVis);
            }
          };
          document.addEventListener("visibilitychange", onVis);
        }

        // ---- 2. the scroll cinematic (wrappers only — never intro targets) ----
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top top", end: "+=320%", pin: true, scrub: 2 },
            defaults: { ease: "none" },
          })
          // slow push-in
          .to(".hv-zoom", { scale: 1.06, duration: 2.2 }, 0)
          .to(".hv-bloom-wrap", { scale: 1.3, duration: 2.2 }, 0)
          .to(".hv-temple-wrap", { y: -16, duration: 2.2 }, 0)
          .to(".hv-cue", { opacity: 0, duration: 0.3, overwrite: "auto" }, 0.2)
          // golden swell
          .to(".hv-bloom-wrap", { scale: 2.9, opacity: 0.96, duration: 2.6 }, 2.4)
          // ascension
          .to(".hv-lift-a", { y: -96, duration: 2.4, ease: "power1.in" }, 2.7)
          .to(".hv-lift-b", { y: -52, duration: 2.4, ease: "power1.in" }, 2.7)
          .to(".hv-temple-wrap", { y: -44, opacity: 0, duration: 1.9 }, 2.7)
          .to(".hv-rays-wrap", { opacity: 0.15, duration: 1.7 }, 3.1)
          .to(".hv-frame", { opacity: 0, duration: 1.3, overwrite: "auto" }, 3.1)
          // wash into the site
          .to(".hv-stage", { opacity: 0, duration: 1.5 }, 4.3);

        return () => {
          if (onVis) document.removeEventListener("visibilitychange", onVis);
        };
      });

      // Mobile / reduced-motion: fully formed, gentle entrance, no pin.
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        gsap.set([...markStrokes, ...templeStrokes], { strokeDashoffset: 0 });
        gsap.set(".hv-bloom", { opacity: 0.85 });
        gsap.set(".hv-rays", { opacity: 0.3 });
        gsap.from(".hv-stage", { opacity: 0, duration: 1.2, ease: "power2.out" });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="hv relative flex h-[100svh] items-center justify-center overflow-hidden bg-cream"
    >
      {/* divine light bloom */}
      <div className="hv-bloom-wrap pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
        <div
          className="hv-bloom h-[130vmax] w-[130vmax] rounded-full"
          style={{
            background:
              "radial-gradient(circle, #FFFBEF 0%, #FBF1D2 26%, rgba(226,202,130,0.35) 46%, rgba(138,127,74,0.12) 66%, rgba(138,127,74,0) 78%)",
          }}
        />
      </div>
      {/* rotating godrays */}
      <div className="hv-rays-wrap pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
        <div
          className="hv-rays h-[160vmax] w-[160vmax]"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, rgba(226,202,130,0) 0deg, rgba(226,202,130,0.10) 3deg, rgba(226,202,130,0) 8deg, rgba(226,202,130,0) 14deg)",
            maskImage: "radial-gradient(circle, #000 0%, #000 30%, transparent 66%)",
            WebkitMaskImage: "radial-gradient(circle, #000 0%, #000 30%, transparent 66%)",
          }}
        />
      </div>
      {/* drifting motes */}
      <canvas ref={canvas} className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

      {/* line-art mandir skyline — shikhars, domes, dhwaja */}
      <div className="hv-temple-wrap pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
        <svg
          className="hv-temple h-auto w-[min(1100px,96vw)] opacity-[0.32]"
          viewBox="0 0 1200 224"
          fill="none"
          aria-hidden
        >
          <g stroke="#8A7F4A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {/* central shikhar */}
            <path className="temple-stroke" d="M535,200 C542,118 562,64 600,38 C638,64 658,118 665,200" />
            <path className="temple-stroke" d="M556,200 C560,132 575,88 600,66 C625,88 640,132 644,200" />
            {/* finial diamond + dhwaja pennant */}
            <path className="temple-stroke" d="M600,24 l5,7 -5,7 -5,-7 z" />
            <path className="temple-stroke" d="M600,24 L600,8 L626,14 L600,20" />
            {/* flanking mandap domes */}
            <path className="temple-stroke" d="M415,200 C415,152 442,132 470,132 C498,132 525,152 525,200" />
            <path className="temple-stroke" d="M470,132 L470,120 M470,112 l4,5 -4,5 -4,-5 z" />
            <path className="temple-stroke" d="M675,200 C675,152 702,132 730,132 C758,132 785,152 785,200" />
            <path className="temple-stroke" d="M730,132 L730,120 M730,112 l4,5 -4,5 -4,-5 z" />
            {/* outer small shikhars */}
            <path className="temple-stroke" d="M270,200 C276,148 288,116 308,100 C328,116 340,148 346,200" />
            <path className="temple-stroke" d="M308,100 L308,88 M308,80 l4,5 -4,5 -4,-5 z" />
            <path className="temple-stroke" d="M854,200 C860,148 872,116 892,100 C912,116 924,148 930,200" />
            <path className="temple-stroke" d="M892,100 L892,88 M892,80 l4,5 -4,5 -4,-5 z" />
            {/* plinth */}
            <path className="temple-stroke" d="M96,200 L1104,200" />
            <path className="temple-stroke" d="M300,214 L900,214" strokeWidth={1.4} />
          </g>
        </svg>
      </div>

      {/* deck-style hairline frame */}
      <div className="hv-frame pointer-events-none absolute inset-4 rounded-[2px] border border-olive/25 sm:inset-6" />

      {/* stage */}
      <div className="hv-zoom relative z-10 will-change-transform">
        <div className="hv-stage flex flex-col items-center px-6 text-center">
          <div className="hv-lift-a flex flex-col items-center">
            <p className="hv-eyebrow mb-8 font-display text-[11px] tracking-[0.34em] text-olive uppercase">
              {SITE.name} · Since {SITE.since}
            </p>

            <svg className="hv-mark h-36 w-auto sm:h-48" viewBox="0 0 100 124" fill="none" aria-label="A Paramount">
              <g className="hv-fill">
                <path
                  d="M22,112 L22,58 C22,34 35,18 50,12 C65,18 78,34 78,58 L78,112 L67,112 L67,60 C67,41 59,28 50,23 C41,28 33,41 33,60 L33,112 Z"
                  fill="#8A7F4A"
                  opacity="0.16"
                />
              </g>
              <g stroke="#6F6639" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
                <path className="mono-stroke" d="M50,4 l5,6 -5,6 -5,-6 z" />
                <path className="mono-stroke" d="M22,112 L22,58 C22,34 35,18 50,12 C65,18 78,34 78,58 L78,112" />
                <path className="mono-stroke" d="M33,112 L33,60 C33,41 41,28 50,23 C59,28 67,41 67,60 L67,112" />
                <path className="mono-stroke" d="M50,46 L39,98" />
                <path className="mono-stroke" d="M50,46 L61,98" />
                <path className="mono-stroke" d="M43.5,80 L56.5,80" />
              </g>
            </svg>

            <div className="hv-word mt-8">
              <h1 className="font-display text-3xl font-light tracking-[0.36em] text-olive-deep sm:text-5xl sm:tracking-[0.42em]">
                PARAMOUNT
              </h1>
              <p className="mt-3 font-display text-[10px] tracking-[0.5em] text-olive/70 uppercase">
                Engineering Works
              </p>
            </div>
          </div>

          <div className="hv-lift-b flex flex-col items-center">
            <div className="hv-div mt-9 flex items-center gap-3 text-olive/60" aria-hidden>
              <span className="h-px w-14 bg-current" />
              <span className="text-[13px]">✦</span>
              <span className="h-px w-14 bg-current" />
            </div>
            <p className="hv-tag mt-7 font-serif text-2xl text-olive italic sm:text-4xl">
              Crafting Divine Elegance
            </p>
          </div>
        </div>
      </div>

      <div className="hv-cue absolute bottom-8 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.34em] text-olive/50 uppercase">
        Scroll to enter
      </div>
    </section>
  );
}
