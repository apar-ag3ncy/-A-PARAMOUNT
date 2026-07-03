"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE } from "@/lib/constants";
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
 * Cinematic "heavenly" landing hero — built around the ORIGINAL logo artwork
 * (public/brand/a-mark / a-wordmark, untouched crops of a-paramount.png).
 *
 * Movement 1 — INTRO (auto-plays, slow-mo): divine bloom breathes in, the mark
 * resolves out of blurred light, a golden sweep passes THROUGH the logo (masked
 * by its own alpha), the wordmark rises, and a line-art mandir skyline draws
 * itself beneath.
 *
 * Movement 2 — SCROLL (pinned, scrub: 2): slow push-in -> golden swell ->
 * layered ascension -> light-wash into the site. Scrub animates wrappers only,
 * so it never fights the intro.
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
        // recurring golden sweep through the logo glyphs
        gsap.fromTo(
          ".hv-shine",
          { xPercent: -170 },
          {
            xPercent: 320,
            duration: 1.8,
            ease: "power2.inOut",
            repeat: -1,
            repeatDelay: 4.6,
            delay: 3.4,
          },
        );
      });

      // Desktop: auto intro + slow scrubbed cinematic.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        templeStrokes.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 });
        });
        gsap.set(".hv-markimg", { opacity: 0, scale: 1.16, filter: "blur(18px)" });
        gsap.set([".hv-eyebrow", ".hv-word", ".hv-div", ".hv-tag"], { opacity: 0, y: 26 });
        gsap.set(".hv-bloom", { scale: 0.55, opacity: 0, transformOrigin: "50% 50%" });
        gsap.set(".hv-rays", { opacity: 0 });
        gsap.set([".hv-frame", ".hv-cue"], { opacity: 0 });

        // ---- 1. the intro apparition (slow-mo, plays once on load) ----
        const intro = gsap
          .timeline({ defaults: { ease: "power2.out" } })
          .to(".hv-bloom", { scale: 1, opacity: 0.9, duration: 2.4, ease: "power2.inOut" }, 0)
          .to(".hv-rays", { opacity: 0.36, duration: 2.4, ease: "power2.inOut" }, 0.4)
          .to(".hv-eyebrow", { opacity: 1, y: 0, duration: 1.1 }, 0.5)
          .to(
            ".hv-markimg",
            { opacity: 1, scale: 1, filter: "blur(0px)", duration: 2.4, ease: "power2.inOut" },
            0.8,
          )
          .set(templeStrokes, { opacity: 1 }, 1.0)
          .to(templeStrokes, { strokeDashoffset: 0, duration: 2.4, stagger: 0.1, ease: "power2.inOut" }, 1.0)
          .to(".hv-word", { opacity: 1, y: 0, duration: 1.2 }, 2.9)
          .to(".hv-div", { opacity: 1, y: 0, duration: 1 }, 3.3)
          .to(".hv-tag", { opacity: 1, y: 0, duration: 1.2 }, 3.5)
          .to(".hv-frame", { opacity: 1, duration: 1.6 }, 3.3)
          .to(".hv-cue", { opacity: 1, duration: 1 }, 4.0);

        // Opened in a background tab? Hold and play in full once visible.
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

        // ---- 2. the scroll cinematic (wrappers only) ----
        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top top", end: "+=320%", pin: true, scrub: 2 },
            defaults: { ease: "none" },
          })
          .to(".hv-zoom", { scale: 1.06, duration: 2.2 }, 0)
          .to(".hv-bloom-wrap", { scale: 1.3, duration: 2.2 }, 0)
          .to(".hv-temple-wrap", { y: -16, duration: 2.2 }, 0)
          .to(".hv-cue", { opacity: 0, duration: 0.3, overwrite: "auto" }, 0.2)
          .to(".hv-bloom-wrap", { scale: 2.9, opacity: 0.96, duration: 2.6 }, 2.4)
          .to(".hv-lift-a", { y: -96, duration: 2.4, ease: "power1.in" }, 2.7)
          .to(".hv-lift-b", { y: -52, duration: 2.4, ease: "power1.in" }, 2.7)
          .to(".hv-temple-wrap", { y: -44, opacity: 0, duration: 1.9 }, 2.7)
          .to(".hv-rays-wrap", { opacity: 0.15, duration: 1.7 }, 3.1)
          .to(".hv-frame", { opacity: 0, duration: 1.3, overwrite: "auto" }, 3.1)
          .to(".hv-stage", { opacity: 0, duration: 1.5 }, 4.3);

        return () => {
          if (onVis) document.removeEventListener("visibilitychange", onVis);
        };
      });

      // Mobile / reduced-motion: fully formed, gentle entrance, no pin.
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        gsap.set(templeStrokes, { strokeDashoffset: 0, opacity: 1 });
        gsap.set(".hv-markimg", { opacity: 1, scale: 1, filter: "blur(0px)" });
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
            <path className="temple-stroke" d="M535,200 C542,118 562,64 600,38 C638,64 658,118 665,200" />
            <path className="temple-stroke" d="M556,200 C560,132 575,88 600,66 C625,88 640,132 644,200" />
            <path className="temple-stroke" d="M600,24 l5,7 -5,7 -5,-7 z" />
            <path className="temple-stroke" d="M600,24 L600,8 L626,14 L600,20" />
            <path className="temple-stroke" d="M415,200 C415,152 442,132 470,132 C498,132 525,152 525,200" />
            <path className="temple-stroke" d="M470,132 L470,120 M470,112 l4,5 -4,5 -4,-5 z" />
            <path className="temple-stroke" d="M675,200 C675,152 702,132 730,132 C758,132 785,152 785,200" />
            <path className="temple-stroke" d="M730,132 L730,120 M730,112 l4,5 -4,5 -4,-5 z" />
            <path className="temple-stroke" d="M270,200 C276,148 288,116 308,100 C328,116 340,148 346,200" />
            <path className="temple-stroke" d="M308,100 L308,88 M308,80 l4,5 -4,5 -4,-5 z" />
            <path className="temple-stroke" d="M854,200 C860,148 872,116 892,100 C912,116 924,148 930,200" />
            <path className="temple-stroke" d="M892,100 L892,88 M892,80 l4,5 -4,5 -4,-5 z" />
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
            <p className="hv-eyebrow mb-9 font-display text-[11px] tracking-[0.34em] text-olive uppercase">
              {SITE.name} · Since {SITE.since}
            </p>

            {/* THE mark — original artwork, untouched */}
            <div className="hv-mark relative aspect-[269/234] h-32 sm:h-44">
              <Image
                src="/brand/a-mark-olive.png"
                alt="A Paramount"
                fill
                priority
                sizes="200px"
                className="hv-markimg object-contain"
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

            {/* THE wordmark — original artwork, untouched */}
            <div className="hv-word mt-9">
              <Image
                src="/brand/paramount-word-olive.png"
                alt="A Paramount — Engineering Works"
                width={1117}
                height={219}
                priority
                className="h-auto w-[min(380px,70vw)]"
              />
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
