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
 * "Our Works" — the drifting arc ribbon of the client's pieces.
 *
 * This is CONTENT ONLY: no <section>, no background, no panel. It is mounted
 * INSIDE `HomeFilm`'s pinned stage as the film's fourth act, so it lands on
 * the very same mandir dome the camera lifted onto — the brand fades out, and the
 * work fades in on that identical backdrop. It used to be its own section with a
 * SECOND copy of the dome behind an opaque cream panel; the client saw the dome
 * rendered twice and called it out ("it feels like duplicated bg in both"). Do not
 * give this component a background again.
 *
 * The cards ride a CONVEX ARC — the one nearest the centre stands upright, tallest
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

// Derived from module constants — resolve once, outside render.
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
        // row = [set][duplicate]; drifting exactly one set (-50%) loops seamlessly.
        drift.current = gsap.to(row, {
          xPercent: -50,
          duration: 46,
          ease: "none",
          repeat: -1,
        });
        layout();
        let ticking = false;
        const start = () => {
          if (ticking) return;
          gsap.ticker.add(layout);
          ticking = true;
        };
        const stop = () => {
          if (!ticking) return;
          gsap.ticker.remove(layout);
          ticking = false;
        };
        const io = new IntersectionObserver(
          ([e]) => {
            if (e.isIntersecting) {
              drift.current?.play();
              start();
            } else {
              drift.current?.pause();
              stop();
            }
          },
          { threshold: 0 },
        );
        io.observe(rootEl);
        return () => {
          stop();
          io.disconnect();
        };
      });

      // Reduced motion: no drift — a static arc, scrollable by hand.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        scroller.style.overflowX = "auto";
        layout();
      });
    }, rootEl);
    return () => ctx.revert();
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
      <span className="pm-label inline-flex items-center rounded-full bg-cream/60 px-4 py-1.5 font-display text-maroon ring-1 ring-olive/20 backdrop-blur-sm">
        Selected Works · Since 1968
      </span>
      <h2 className="pm-display-lg font-display mt-5 text-heading-brown">
        Our Works
      </h2>
      <p className="pm-body mx-auto mt-4 max-w-xl font-body text-maroon/80">
        Three generations of engineering and artistry — each piece handcrafted
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
                {/* title reveals on hover — clean photo at rest */}
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
