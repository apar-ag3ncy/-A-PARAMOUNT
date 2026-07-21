"use client";

import Link from "next/link";
import Image from "next/image";
import { type CSSProperties, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * "Our Works", the drifting arc ribbon of the client's pieces.
 *
 * This is CONTENT ONLY: no <section>, no background, no panel. It is mounted
 * INSIDE `HomeFilm`'s pinned stage as the film's fourth act, so it lands on
 * the very same mandir dome the camera lifted onto, the brand fades out, and the
 * work fades in on that identical backdrop. It used to be its own section with a
 * SECOND copy of the dome behind an opaque cream panel; the client saw the dome
 * rendered twice and called it out ("it feels like duplicated bg in both"). Do not
 * give this component a background again.
 *
 * The cards ride a CONVEX ARC, the one nearest the centre stands upright, tallest
 * and largest, while cards fan outward (rotating away, dropping and shrinking)
 * toward both edges; each straightens as it passes the middle and leans as it
 * exits, so the ribbon reads like a slow carousel. Hover pauses the drift and
 * reveals a card's title while its photo slow-zooms.
 *
 * It lives inside a 100svh pinned stage, so every vertical size is viewport-HEIGHT
 * aware (`clamp(…, Nvh, …)`): a fixed card height would overflow the stage on a
 * short laptop and be unreachable, exactly like the /gallery rail bug.
 *
 * NOTHING IS CROPPED: each card fixes only its HEIGHT and derives its width from
 * the photo's own aspect-ratio. Every WORK is therefore a ~0.56 portrait.
 */
const WORKS = [
  { slug: "brass-gate", src: "/gallery/brass-gate/all/00.webp", w: 900, h: 1600 },
  { slug: "rath", src: "/gallery/rath/all/03.webp", w: 900, h: 1600 },
  { slug: "kalpavruksh-naan", src: "/gallery/kalpavruksh-naan/all/00.webp", w: 893, h: 1600 },
  { slug: "samovasaran-trigadu", src: "/gallery/samovasaran-trigadu/all/04.webp", w: 893, h: 1600 },
  { slug: "doors", src: "/gallery/doors/diamond-door/01.webp", w: 893, h: 1600 },
  { slug: "vyaakhyan-kamal", src: "/gallery/vyaakhyan-kamal/all/03.webp", w: 893, h: 1600 },
  { slug: "brass-grill-jali", src: "/gallery/brass-grill-jali/all/06.webp", w: 900, h: 1600 },
  { slug: "vyaakhyan-paat", src: "/gallery/vyaakhyan-paat/all/04.webp", w: 893, h: 1600 },
] as const;

// Derived from module constants, resolve once, outside render.
const ITEMS = WORKS.map((work) => {
  const category = CATEGORIES.find((c) => c.slug === work.slug);
  if (!category) return null;
  return {
    ...work,
    title: category.title,
    href: `/products/${category.family}/${category.slug}`,
  };
}).filter((x): x is NonNullable<typeof x> => x !== null);

// Arc shape: p is a card's centre distance from the strip centre, normalised so
// the viewport edges are ~±1. Centre card → upright/tall/large; edges fan out.
const ROT = 8; // deg of lean at the edge
const DROP = 46; // px the edge cards sink below the centre one
const SHRINK = 0.07; // edge cards scale down by this much

export default function FeaturedGallery() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const drift = useRef<gsap.core.Tween | null>(null);

  useIsomorphicLayoutEffect(() => {
    const rootEl = rootRef.current;
    const scroller = scrollRef.current;
    const row = rowRef.current;
    if (!rootEl || !scroller || !row) return;
    const cards = Array.from(row.children) as HTMLElement[];

    // Lay each card on the arc from its live on-screen position (read-all then
    // write-all, so 16 cards never thrash layout).
    const layout = () => {
      const box = scroller.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      const half = box.width / 2 || 1;
      const ps = cards.map((c) => {
        const r = c.getBoundingClientRect();
        return (r.left + r.width / 2 - mid) / half;
      });
      cards.forEach((c, i) => {
        const p = Math.max(-1.4, Math.min(1.4, ps[i]));
        const a = Math.min(Math.abs(p), 1);
        c.style.transform = `translateY(${p * p * DROP}px) rotate(${p * ROT}deg) scale(${1 - a * SHRINK})`;
        c.style.zIndex = String(Math.round(50 - a * 40));
      });
    };

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // The row is [set][duplicate], so ONE cycle must advance exactly one set's
        // PITCH — the distance from card 0 to card N, gap included. That is NOT a
        // percentage of the row, which is what `xPercent: -50` assumed: the row also
        // carries `px-[14vw]` padding and a gap between every card, so half the row
        // overshot one set by roughly 14vw minus half a gap (~190px at 1440 wide).
        // Every cycle therefore jumped by that much — the visible break at the end.
        // Measured from the elements instead, padding and gap cannot desync it.
        const measurePitch = () =>
          cards[ITEMS.length].offsetLeft - cards[0].offsetLeft;
        let pitch = measurePitch();
        let active = false;
        const build = () => {
          drift.current?.kill();
          pitch = measurePitch();
          if (!pitch) return;
          drift.current = gsap.to(row, {
            x: `-=${pitch}`,
            duration: 46,
            ease: "none",
            repeat: -1,
            // Wrap x into (-pitch, 0]. The distance alone already makes the restart
            // invisible; this keeps float error from accumulating over a long idle
            // loop, so it is still seamless on the hundredth pass.
            modifiers: { x: (v) => `${parseFloat(v) % pitch}px` },
          });
          drift.current.pause(); // tick() decides when it may run
          active = false;
        };
        build();
        // The cards are viewport-HEIGHT sized (`h-[clamp(11rem,30vh,22rem)]`) and the
        // padding is vw, so a resize changes the pitch and would desync the loop
        // again. Re-measure and rebuild when it actually moves.
        const ro = new ResizeObserver(() => {
          if (Math.abs(measurePitch() - pitch) > 1) build();
        });
        ro.observe(row);
        layout();
        // This gallery is ACT 4 inside HomeFilm's PINNED stage: it sits in the
        // viewport (at opacity 0) for the WHOLE film, so IntersectionObserver
        // alone would keep the drift + the per-frame arc layout (16 rect reads +
        // 16 transform writes) running while the doors/walk-in/crane scrub —
        // invisible work stealing frame budget from the film (measured as
        // sporadic dropped frames mid-scrub). Gate ALL of it on the `.hv-works`
        // overlay actually being faded in; HomeFilm writes that opacity as an
        // INLINE style via gsap.set, so reading it back is a plain string read —
        // no style recalc, no layout flush. Standalone use (no overlay) is
        // always "visible".
        const overlay = rootEl.closest(".hv-works") as HTMLElement | null;
        const overlayVisible = () =>
          !overlay || parseFloat(overlay.style.opacity || "1") > 0.005;
        let onScreen = false;
        const tick = () => {
          const want = onScreen && overlayVisible();
          if (want !== active) {
            active = want;
            if (want) drift.current?.play();
            else drift.current?.pause();
          }
          if (active) layout();
        };
        gsap.ticker.add(tick); // build() left it paused; tick() resumes it
        const io = new IntersectionObserver(
          ([e]) => {
            onScreen = e.isIntersecting;
          },
          { threshold: 0 },
        );
        io.observe(rootEl);
        return () => {
          gsap.ticker.remove(tick);
          io.disconnect();
          ro.disconnect();
        };
      });

      // Reduced motion: no drift, a static arc, scrollable by hand.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        scroller.style.overflowX = "auto";
        layout();
      });
    }, rootEl);

    // Pre-decode every card photo once the page is GENUINELY idle, so the works
    // landing never pays a synchronous first-paint image decode mid-film
    // (measured as a ~170ms hitch right where "Our Works" fades in). No idle
    // TIMEOUT on purpose: a forced deadline made this fire during the initial
    // load rush (film frames + fonts still streaming) and jammed the main
    // thread; if the page never goes idle the images simply decode at paint,
    // which is the old behavior — strictly no worse. Decodes are CHAINED one at
    // a time so the raster work trickles instead of bursting 16-wide.
    let cancelled = false;
    const preDecode = async () => {
      for (const img of Array.from(rootEl.querySelectorAll("img"))) {
        if (cancelled) return;
        await img.decode().catch(() => {}); // best-effort; a miss decodes at paint
      }
    };
    // Safari still lacks requestIdleCallback — typeof-guard, not a lib assumption.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idleId = hasIdle
      ? window.requestIdleCallback(() => void preDecode())
      : (setTimeout(() => void preDecode(), 6000) as unknown as number);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      ctx.revert();
    };
  }, []);

  if (ITEMS.length < 5) return null;

  // Ease the drift to a stop on hover (and back) for a considered pause.
  const setPaused = (paused: boolean) => {
    if (drift.current)
      gsap.to(drift.current, { timeScale: paused ? 0 : 1, duration: 0.5, overwrite: true });
  };

  const loop = [...ITEMS, ...ITEMS];

  return (
    <div
      ref={rootRef}
      aria-label="Our works"
      className="flex w-full flex-col items-center text-center"
    >
      {/* py-2, not py-1.5: at 12px caps with a 13.2px line box, 6px of padding left
          the pill only 25px tall and the caps read as though they were touching its
          edges. 8px gives 29px and lets them sit.
          The right padding is SHORTER than the left by exactly the letter-spacing.
          Tracked caps put a trailing space after the LAST glyph, which is inside the
          content box but carries no ink, so the visible text sat 0.96px left of the
          pill's centre. Taking 0.16em back off the right re-centres the glyphs, and
          in em it stays correct if the tracking or size ever changes. */}
      <span className="pm-label inline-flex items-center rounded-full bg-cream/60 py-2 pl-4 pr-[calc(1rem-0.16em)] font-display text-maroon ring-1 ring-olive/20 backdrop-blur-sm">
        Selected Works · Since 1968
      </span>
      {/* 24 above the title, 20 below it — a DESCENDING rhythm, so the three read as
          one titled group. They were 20 and 16: near enough to equal that the kicker,
          title and body read as an evenly-spaced list with no hierarchy. Both were
          tuned when this title was 72px; it is 48px since the type scale was bracketed
          to the client's spec, and the smaller title needs relatively more air, not
          the same absolute gap. */}
      <h2 className="pm-display-lg font-display mt-6 text-heading-brown">
        Our Works
      </h2>
      <p className="pm-body mx-auto mt-5 max-w-xl font-body text-maroon/80">
        Three generations of engineering and artistry, each piece handcrafted
        for Jain derasars and Hindu temples.
      </p>

      {/* ---------- the endless arc ribbon ----------
          Edge mask fades cards off both sides; GSAP drifts the (duplicated) row
          left forever while each card is re-laid on the arc every frame. */}
      <div
        ref={scrollRef}
        className="relative mt-[clamp(1.5rem,4vh,3rem)] w-screen overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)",
        }}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
      >
        <div
          ref={rowRef}
          className="flex w-max items-center gap-4 px-[14vw] py-6 sm:gap-5"
        >
          {loop.map((c, i) => {
            const clone = i >= ITEMS.length;
            return (
              <Link
                key={`${c.slug}-${i}`}
                href={c.href}
                aria-label={c.title}
                aria-hidden={clone || undefined}
                tabIndex={clone ? -1 : undefined}
                className={cn(
                  // viewport-HEIGHT aware: this rides inside a 100svh pinned stage,
                  // and a fixed height would overflow it on a short laptop.
                  "group relative block h-[clamp(11rem,30vh,22rem)] shrink-0 overflow-hidden rounded-[22px] bg-cream-deep shadow-[0_30px_55px_-26px_rgba(46,35,19,0.5)] ring-1 ring-olive/15 will-change-transform",
                  "hover:ring-olive/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                )}
                style={
                  {
                    aspectRatio: `${c.w} / ${c.h}`,
                    transformOrigin: "50% 100%",
                  } as CSSProperties
                }
              >
                <Image
                  src={c.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"
                />
                {/* title reveals on hover, clean photo at rest */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
                <span className="pm-label absolute inset-x-0 bottom-0 block translate-y-1 px-4 pb-4 font-display text-cream opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {c.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-[clamp(1rem,3vh,2.5rem)] flex justify-center">
        <Button variant="solid" size="lg" href="/products">
          View all collections
        </Button>
      </div>
    </div>
  );
}
