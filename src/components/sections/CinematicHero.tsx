"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { SITE } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import Wordmark from "@/components/ui/Wordmark";
import { onDoorsOpen } from "@/lib/doors";
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

    // Pre-rendered soft glow sprite — drawImage is far cheaper than the previous
    // per-particle shadowBlur (which repaints the whole canvas each mote).
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
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
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
    // Only burn frames while the hero is actually on screen.
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

  // Intro (auto) + pinned scroll cinematic.
  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = gsap.utils.selector(el);
    const templeStrokes = gsap.utils.toArray<SVGGeometryElement>(q(".temple-stroke"));

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // Ambient life on any non-reduced viewport. (Godrays are static now — a
      // rotating masked conic gradient repaints a huge area every frame.)
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const breathe = gsap.to(".hv-mark", {
          scale: 1.02,
          transformOrigin: "50% 50%",
          duration: 5.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        // recurring golden sweep through the logo glyphs — constant travel with
        // a fade-out BEFORE the far edge, so the gleam melts away instead of
        // visibly parking at the end of the wordmark
        const shine = gsap
          .timeline({ repeat: -1, repeatDelay: 4.6, delay: 3.4 })
          .fromTo(
            ".hv-shine",
            { xPercent: -170, opacity: 0 },
            { xPercent: 320, duration: 1.6, ease: "power1.inOut" },
            0,
          )
          .to(".hv-shine", { opacity: 1, duration: 0.35, ease: "power1.in" }, 0.12)
          .to(".hv-shine", { opacity: 0, duration: 0.5, ease: "power1.out" }, 1.0);
        // Same deal as the motes canvas: only burn frames while the hero is
        // actually on screen — both repeat:-1 tweens sleep offscreen.
        const io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              breathe.play();
              shine.play();
            } else {
              breathe.pause();
              shine.pause();
            }
          },
          { threshold: 0 },
        );
        io.observe(el);
        return () => io.disconnect();
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

        // On the home page the DoorScroll section above owns the arrival: the
        // visitor scrolls the doors open, and the once-only doors-open handoff
        // launches this apparition beneath the cream flood (already mid-flight
        // by the time the hero reaches the viewport).
        const doorWillPlay = window.location.pathname === "/";
        let onVis: (() => void) | undefined;
        let offDoors: (() => void) | undefined;

        // The intro and the scroll cinematic touch the same stage. If the
        // user starts scrolling while the intro is still playing, both animate
        // at once and the motion reads doubled/laggy — so the first scroll
        // intent gracefully hurries the intro to its end (no jump cut). On the
        // door path this must arm only AFTER the handoff — the door scrub
        // itself is driven by wheel events and would consume it instantly.
        const hurry = () => {
          if (intro.isActive()) intro.timeScale(4);
          window.removeEventListener("wheel", hurry);
          window.removeEventListener("touchmove", hurry);
        };
        const armHurry = () => {
          window.addEventListener("wheel", hurry, { passive: true });
          window.addEventListener("touchmove", hurry, { passive: true });
        };

        if (doorWillPlay) {
          intro.pause(0);
          // onDoorsOpen fires immediately if the doors are already open (a
          // reload that restored scroll past them), so the apparition can never
          // be stranded at opacity 0.
          offDoors = onDoorsOpen(() => {
            intro.play(0);
            armHurry();
          });
        } else if (document.hidden) {
          // Opened in a background tab? Hold and play in full once visible.
          intro.pause(0);
          onVis = () => {
            if (!document.hidden) {
              intro.play(0);
              if (onVis) document.removeEventListener("visibilitychange", onVis);
            }
          };
          document.addEventListener("visibilitychange", onVis);
          armHurry();
        } else {
          armHurry();
        }

        // ---- 2. the scroll cinematic (wrappers only) ----
        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=320%",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
            defaults: { ease: "none" },
          })
          .to(".hv-zoom", { scale: 1.06, duration: 2.2 }, 0)
          .to(".hv-bloom-wrap", { scale: 1.25, duration: 2.2 }, 0)
          .to(".hv-temple-wrap", { y: -16, duration: 2.2 }, 0)
          .to(".hv-cue", { opacity: 0, duration: 0.3, overwrite: "auto" }, 0.2)
          .to(".hv-bloom-wrap", { scale: 2.2, opacity: 0.96, duration: 2.6 }, 2.4)
          .to(".hv-lift-a", { y: -96, duration: 2.4, ease: "power1.in" }, 2.7)
          .to(".hv-lift-b", { y: -52, duration: 2.4, ease: "power1.in" }, 2.7)
          .to(".hv-temple-wrap", { y: -44, opacity: 0, duration: 1.9 }, 2.7)
          .to(".hv-rays-wrap", { opacity: 0.15, duration: 1.7 }, 3.1)
          .to(".hv-frame", { opacity: 0, duration: 1.3, overwrite: "auto" }, 3.1)
          .to(".hv-stage", { opacity: 0, duration: 1.5 }, 4.3);

        return () => {
          if (onVis) document.removeEventListener("visibilitychange", onVis);
          offDoors?.();
          window.removeEventListener("wheel", hurry);
          window.removeEventListener("touchmove", hurry);
        };
      });

      // Mobile / reduced-motion: fully formed, gentle entrance, no pin.
      mm.add("(max-width: 1023px), (prefers-reduced-motion: reduce)", () => {
        gsap.set(templeStrokes, { strokeDashoffset: 0, opacity: 1 });
        gsap.set(".hv-markimg", { opacity: 1, scale: 1, filter: "blur(0px)" });
        gsap.set(".hv-bloom", { opacity: 0.85 });
        gsap.set(".hv-rays", { opacity: 0.3 });

        // On the home page the DoorScroll section above owns the arrival —
        // hold the entrance and launch it on the once-only doors-open handoff.
        // Reduced motion keeps its immediate fade regardless (no event dep).
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const doorWillPlay = !reduce && window.location.pathname === "/";
        let offDoors: (() => void) | undefined;
        if (doorWillPlay) {
          gsap.set(".hv-stage", { opacity: 0 });
          // Fires synchronously when the doors are already open, so a reload
          // past the doors cannot leave the whole stage invisible.
          offDoors = onDoorsOpen(() => {
            gsap.to(".hv-stage", { opacity: 1, duration: 1.2, ease: "power2.out" });
          });
        } else {
          gsap.from(".hv-stage", { opacity: 0, duration: 1.2, ease: "power2.out" });
        }
        return () => {
          offDoors?.();
        };
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="hv relative flex h-[100svh] items-center justify-center overflow-hidden bg-cream"
    >
      {/* warm base wash — imperceptible edge, keeps the whole frame golden */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 46%, #FDF7E3 0%, #FEF4DA 55%, #FBEEC9 100%)",
        }}
      />
      {/* divine light bloom — sized by vmin so the halo stays a true, un-clipped
          circle at every aspect ratio (vmax clipped into a squashed dome) */}
      <div className="hv-bloom-wrap pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
        <div
          className="hv-bloom h-[130vmin] w-[130vmin] rounded-full"
          style={{
            background:
              "radial-gradient(circle, #FFFBEF 0%, #FBF1D2 30%, rgba(226,202,130,0.32) 52%, rgba(138,127,74,0.10) 68%, rgba(138,127,74,0) 78%)",
          }}
        />
      </div>
      {/* rotating godrays */}
      <div className="hv-rays-wrap pointer-events-none absolute inset-0 -z-10 grid place-items-center overflow-hidden">
        <div
          className="hv-rays h-[120vmax] w-[120vmax] will-change-transform"
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

            {/* THE wordmark — live text in the real Storica face (see Wordmark) */}
            <div className="hv-word mt-9">
              <Wordmark className="text-[clamp(32px,7.4vw,54px)] text-olive" />
            </div>
          </div>

          <div className="hv-lift-b flex flex-col items-center">
            <OrnamentDivider className="hv-div mt-9 text-olive/60" />

            <p className="hv-tag mt-7 font-display text-2xl text-[color:var(--color-heading-brown)] sm:text-4xl">
              Crafting Divine{" "}
              <span className="font-body text-olive italic">Elegance</span>
            </p>
          </div>
        </div>
      </div>

      <div className="hv-cue absolute bottom-8 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-[0.34em] text-olive/50 uppercase">
        Scroll to continue
      </div>
    </section>
  );
}
