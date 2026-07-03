"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE } from "@/lib/constants";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Cinematic "heavenly" landing hero. A pinned, scroll-scrubbed sequence: the
 * Paramount arch-monogram draws itself out of a divine light bloom, godrays turn
 * behind it, gold motes drift up, the wordmark + tagline reveal, then the whole
 * mark ascends and the light washes into the site below. Reduced-motion / mobile
 * get a calm, fully-formed version with no pin.
 *
 * Bloom + godrays are centered with `grid place-items-center` (not CSS translate)
 * so GSAP scale/rotate compose from their own centre without fighting a translate.
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
        vy: 0.15 + Math.random() * 0.5,
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
        m.x += Math.sin((t + m.p) * 0.4) * 0.25;
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

  // The scroll-scrubbed cinematic timeline.
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const strokes = gsap.utils.toArray<SVGPathElement>(q(".mono-stroke"));

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Ambient motion (any non-reduced viewport): godrays turn, mark breathes.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".hv-rays", { rotate: 360, duration: 90, ease: "none", repeat: -1 });
        gsap.to(".hv-mark", {
          scale: 1.025,
          transformOrigin: "50% 50%",
          duration: 5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // Desktop: full pinned, scrubbed reveal.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        strokes.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.set(strokes, { opacity: 0 });
        gsap.set(".hv-fill", { opacity: 0 });
        gsap.set([".hv-word", ".hv-tag", ".hv-eyebrow"], { opacity: 0, y: 24 });
        gsap.set(".hv-bloom", { scale: 0.72, opacity: 0.5, transformOrigin: "50% 50%" });
        gsap.set(".hv-rays", { opacity: 0.12 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top top", end: "+=280%", pin: true, scrub: 1 },
          defaults: { ease: "none" },
        });

        tl.to(".hv-bloom", { scale: 1, opacity: 1, duration: 1.2 }, 0)
          .to(".hv-rays", { opacity: 0.55, duration: 1.4 }, 0.1)
          .to(".hv-eyebrow", { opacity: 1, y: 0, duration: 0.8 }, 0.2)
          .set(strokes, { opacity: 1 }, 0.28)
          .to(strokes, { strokeDashoffset: 0, duration: 2.4, stagger: 0.22, ease: "power1.inOut" }, 0.3)
          .to(".hv-fill", { opacity: 1, duration: 1 }, 2.2)
          .to(".hv-word", { opacity: 1, y: 0, duration: 1 }, 2.6)
          .to(".hv-tag", { opacity: 1, y: 0, duration: 1 }, 3.1)
          .to(".hv-mark, .hv-word, .hv-eyebrow", { y: -80, duration: 1.4 }, 4.0)
          .to(".hv-tag", { y: -40, duration: 1.4 }, 4.0)
          .to(".hv-bloom", { scale: 2.7, opacity: 0.92, duration: 1.6 }, 4.0)
          .to(".hv-stage", { opacity: 0, duration: 1.2 }, 4.5)
          .to(".hv-cue", { opacity: 0, duration: 0.4 }, 0.4);
      });

      // Mobile / reduced-motion: fully formed, gentle fade — no pin.
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        strokes.forEach((p) => gsap.set(p, { strokeDashoffset: 0 }));
        gsap.set([".hv-fill", ".hv-word", ".hv-tag", ".hv-eyebrow"], { opacity: 1, y: 0 });
        gsap.set(".hv-bloom", { opacity: 0.85 });
        gsap.set(".hv-rays", { opacity: 0.32 });
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
      <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
        <div
          className="hv-bloom h-[130vmax] w-[130vmax] rounded-full"
          style={{
            background:
              "radial-gradient(circle, #FFFBEF 0%, #FBF1D2 26%, rgba(226,202,130,0.35) 46%, rgba(138,127,74,0.12) 66%, rgba(138,127,74,0) 78%)",
          }}
        />
      </div>
      {/* rotating godrays */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
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

      {/* stage */}
      <div className="hv-stage relative z-10 flex flex-col items-center px-6 text-center">
        <p className="hv-eyebrow mb-8 font-display text-[11px] tracking-[0.34em] text-olive uppercase">
          {SITE.name} · Since {SITE.since}
        </p>

        <svg className="hv-mark h-40 w-auto sm:h-52" viewBox="0 0 100 124" fill="none" aria-label="A Paramount">
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

        <p className="hv-tag mt-10 font-serif text-2xl text-olive italic sm:text-4xl">
          Crafting Divine Elegance
        </p>
      </div>

      <div className="hv-cue absolute bottom-8 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.34em] text-olive/50 uppercase">
        Scroll to enter
      </div>
    </section>
  );
}
