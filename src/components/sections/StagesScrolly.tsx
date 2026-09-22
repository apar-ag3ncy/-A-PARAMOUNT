"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

export interface Stage {
  n: string;
  title: string;
  body: string;
  img: string;
  alt: string;
}

/** Share of a stage's scroll spent on the change-over to it. */
const WIPE = 0.55;

/**
 * StagesScrolly — the four stages as one screen each. The stage is a
 * `position: sticky` viewport (native scroll stays native, so Lenis and the
 * pins elsewhere are untouched) that the page scrolls through for 100svh per
 * stage; a single scrubbed timeline is the ONLY thing that changes it, so the
 * picture is a pure function of scroll position, forwards and backwards.
 *
 * At each change-over the next photograph wipes UP over the last (clip-path)
 * while it settles from a slight zoom; the copy dissolves down-and-out and the
 * next rises in; the tick rail and the "01 / 04" counter advance; a gold
 * hairline along the base of the photograph fills across the whole passage.
 *
 * Reduced motion: the sticky stage is hidden and a plain grid of the four
 * stages renders instead (the two are switched by CSS, not JS, so there is no
 * flash and no tall empty section).
 */
export default function StagesScrolly({ stages }: { stages: Stage[] }) {
  const root = useRef<HTMLElement>(null);
  const n = stages.length;

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el || n < 2) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(el);
        const photos = q<HTMLElement>("[data-photo]");
        const pics = q<HTMLElement>("[data-pic]");
        const copies = q<HTMLElement>("[data-copy]");
        const ticks = q<HTMLElement>("[data-tick]");
        const bar = q<HTMLElement>("[data-bar]")[0];
        const counter = q<HTMLElement>("[data-counter]")[0];
        if (photos.length !== n || copies.length !== n) return;

        // Resting states. Everything after this is written by the timeline.
        gsap.set(photos, {
          clipPath: (i: number) => (i === 0 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)"),
        });
        gsap.set(pics, { scale: (i: number) => (i === 0 ? 1 : 1.12) });
        gsap.set(copies, {
          opacity: (i: number) => (i === 0 ? 1 : 0),
          y: (i: number) => (i === 0 ? 0 : 40),
        });
        gsap.set(ticks, {
          opacity: (i: number) => (i === 0 ? 1 : 0.3),
          scaleY: (i: number) => (i === 0 ? 1.6 : 1),
        });
        if (bar) gsap.set(bar, { scaleX: 0 });

        // One unit of timeline time = one stage's screen of scroll.
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              if (!counter) return;
              const unit = self.progress * n;
              const i = gsap.utils.clamp(0, n - 1, Math.floor(Math.max(0, unit - 0.3)));
              counter.textContent = String(i + 1).padStart(2, "0");
            },
          },
        });
        if (bar) tl.to(bar, { scaleX: 1, ease: "none", duration: n }, 0);
        for (let k = 1; k < n; k++) {
          tl.to(photos[k], { clipPath: "inset(0% 0 0 0)", ease: "power3.inOut", duration: WIPE }, k)
            .to(pics[k], { scale: 1, ease: "power2.out", duration: WIPE + 0.25 }, k)
            .to(pics[k - 1], { scale: 1.06, ease: "none", duration: WIPE }, k)
            .to(copies[k - 1], { opacity: 0, y: -28, ease: "power2.in", duration: 0.25 }, k)
            .to(copies[k], { opacity: 1, y: 0, ease: "power3.out", duration: 0.4 }, k + 0.2)
            .to(ticks[k - 1], { opacity: 0.3, scaleY: 1, duration: 0.3 }, k)
            .to(ticks[k], { opacity: 1, scaleY: 1.6, duration: 0.3 }, k);
        }
        // the last stage holds for its own full screen
        tl.to({}, { duration: 0 }, n);

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set([...photos, ...pics, ...copies, ...ticks, ...(bar ? [bar] : [])], {
            clearProps: "all",
          });
        };
      });
    }, el);
    return () => ctx.revert();
  }, [n]);

  const total = String(n).padStart(2, "0");

  return (
    <>
      {/* The scrolling stage: one full screen of scroll per stage, plus one
          so the last stage holds on screen before the page moves on. */}
      <section
        ref={root}
        aria-label="The four stages"
        className="relative motion-reduce:hidden"
        style={{ height: `calc(${n + 1} * 100svh)` }}
      >
        <div className="sticky top-0 h-svh overflow-hidden">
          <div className="grid h-full grid-rows-[42svh_1fr] lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1">
            {/* The photographs, stacked; each wipes up over the one before. */}
            <div className="relative overflow-hidden" style={{ background: "#2A2416" }}>
              {stages.map((s, i) => (
                <div key={s.n} data-photo className="absolute inset-0 will-change-[clip-path]">
                  <div data-pic className="absolute inset-0 will-change-transform">
                    <Image
                      src={s.img}
                      alt={s.alt}
                      fill
                      priority={i === 0}
                      sizes="(min-width:1024px) 52vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(38,33,18,0.55) 0%, rgba(38,33,18,0.12) 35%, transparent 60%), linear-gradient(to bottom, rgba(38,33,18,0.45) 0%, transparent 28%)",
                    }}
                  />
                </div>
              ))}

              <div className="pm-micro absolute top-6 left-6 flex items-baseline gap-2 font-body text-cream/85 sm:top-8 sm:left-8">
                <span data-counter className="text-gold tabular-nums">
                  01
                </span>
                <span className="text-cream/55">/ {total}</span>
              </div>
              <span className="pm-micro absolute top-6 right-6 font-body text-cream/70 sm:top-8 sm:right-8">
                The Making
              </span>

              {/* a gold hairline fills along the base across the whole passage */}
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-cream/20">
                <div data-bar className="h-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
              </div>
            </div>

            {/* The copy for every stage, stacked in one grid cell so the panel
                is as tall as the longest; the timeline crossfades them. */}
            <div className="relative bg-cream">
              <ol
                aria-hidden
                className="absolute top-1/2 left-6 hidden -translate-y-1/2 flex-col gap-3 lg:flex xl:left-10"
              >
                {stages.map((s) => (
                  <li key={s.n} data-tick className="h-7 w-px origin-center bg-olive" />
                ))}
              </ol>
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 sm:inset-x-10 lg:right-14 lg:left-20 xl:left-28">
                <div className="mx-auto grid max-w-xl items-center lg:mx-0">
                  {stages.map((s) => (
                    <div key={s.n} data-copy className="[grid-area:1/1]">
                      <span className="pm-eyebrow font-body text-maroon/80">Stage {s.n}</span>
                      <h3 className="pm-h2 mt-4 font-display text-heading-brown">{s.title}</h3>
                      <OrnamentDivider width="sm" className="mt-5 text-olive/50" />
                      <p className="pm-body mt-6 font-body text-maroon/80">{s.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reduced motion: the same four stages as a plain grid. */}
      <ol className="mx-auto hidden max-w-7xl gap-10 px-6 py-12 sm:grid-cols-2 motion-reduce:grid">
        {stages.map((s) => (
          <li key={s.n}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.25rem]" style={{ background: "#2A2416" }}>
              <Image src={s.img} alt={s.alt} fill sizes="(min-width:640px) 50vw, 100vw" className="object-cover" />
            </div>
            <span className="pm-eyebrow mt-5 block font-body text-maroon/80">Stage {s.n}</span>
            <h3 className="pm-h3 mt-2 font-display text-heading-brown">{s.title}</h3>
            <p className="pm-small mt-3 font-body text-maroon/80">{s.body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
