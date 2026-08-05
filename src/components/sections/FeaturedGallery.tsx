"use client";

import Link from "next/link";
import Image from "next/image";
import { type CSSProperties, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import Button from "@/components/ui/Button";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * "Our Works", the drifting & user-draggable arc ribbon of the client's pieces.
 * Smooth, seamless drag control with inertia momentum and infinite wrapping.
 */
const WORKS = [
  { slug: "brass-gate", src: "/gallery/brass-gate/all/00.webp", w: 900, h: 1600 },
  { slug: "rath", src: "/gallery/rath/all/03.webp", w: 900, h: 1600 },
  { slug: "kalpavruksh-naan", src: "/gallery/kalpavruksh-naan/all/00.webp", w: 893, h: 1600 },
  { slug: "samovasaran-trigadu", src: "/gallery/samovasaran-trigadu/all/04.webp", w: 893, h: 1600 },
  { slug: "doors", src: "/gallery/doors/carved-temple-door/00.webp", w: 900, h: 1600 },
  { slug: "vyaakhyan-kamal", src: "/gallery/vyaakhyan-kamal/all/03.webp", w: 893, h: 1600 },
  { slug: "brass-grill-jali", src: "/gallery/brass-grill-jali/all/06.webp", w: 900, h: 1600 },
  { slug: "vyaakhyan-paat", src: "/gallery/vyaakhyan-paat/all/04.webp", w: 893, h: 1600 },
] as const;

const ITEMS = WORKS.map((work) => {
  const category = CATEGORIES.find((c) => c.slug === work.slug);
  if (!category) return null;
  return {
    ...work,
    title: category.title,
    href: `/products/${category.family}/${category.slug}`,
  };
}).filter((x): x is NonNullable<typeof x> => x !== null);

const ROT = 8; // deg of lean at the edge
const DROP = 46; // px the edge cards sink below the centre one
const SHRINK = 0.07; // edge cards scale down by this much

export default function FeaturedGallery() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const drift = useRef<gsap.core.Tween | null>(null);

  // Drag physics state
  const isDragging = useRef(false);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const startX = useRef(0);
  const startRowX = useRef(0);
  const currentX = useRef(0);
  const velocity = useRef(0);
  const lastPointerX = useRef(0);
  const lastTime = useRef(0);
  const pitchRef = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const rootEl = rootRef.current;
    const scroller = scrollRef.current;
    const row = rowRef.current;
    if (!rootEl || !scroller || !row) return;
    const cards = Array.from(row.children) as HTMLElement[];

    // Lay each card on the arc from its live on-screen position
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
        const measurePitch = () =>
          cards[ITEMS.length].offsetLeft - cards[0].offsetLeft;
        let pitch = measurePitch();
        pitchRef.current = pitch;
        let active = false;

        const build = () => {
          drift.current?.kill();
          pitch = measurePitch();
          pitchRef.current = pitch;
          if (!pitch) return;
          drift.current = gsap.to(row, {
            x: `-=${pitch}`,
            duration: 46,
            ease: "none",
            repeat: -1,
            modifiers: {
              x: (v) => {
                const pxVal = parseFloat(v);
                let wrapped = pxVal % pitch;
                if (wrapped > 0) wrapped -= pitch;
                currentX.current = wrapped;
                return `${wrapped}px`;
              },
            },
          });
          drift.current.pause();
          active = false;
        };

        build();

        const ro = new ResizeObserver(() => {
          if (Math.abs(measurePitch() - pitch) > 1) build();
        });
        ro.observe(row);
        layout();

        const overlay = rootEl.closest(".hv-works") as HTMLElement | null;
        const overlayVisible = () =>
          !overlay || parseFloat(overlay.style.opacity || "1") > 0.005;
        let onScreen = false;

        const tick = () => {
          const want = onScreen && overlayVisible();

          // Handle user drag and momentum physics
          if (isDragging.current) {
            layout();
            return;
          }

          if (Math.abs(velocity.current) > 0.05) {
            const p = pitchRef.current;
            if (p) {
              let nextX = currentX.current + velocity.current;
              let wrapped = nextX % p;
              if (wrapped > 0) wrapped -= p;
              currentX.current = wrapped;
              gsap.set(row, { x: wrapped });
              velocity.current *= 0.92; // Smooth friction decay
              if (drift.current) {
                // Keep drift sync'd with position
                drift.current.progress((Math.abs(wrapped) % p) / p);
              }
            }
            layout();
            return;
          }

          if (want !== active) {
            active = want;
            if (want) drift.current?.play();
            else drift.current?.pause();
          }

          if (active) layout();
        };

        gsap.ticker.add(tick);

        const io = new IntersectionObserver(
          ([e]) => {
            onScreen = e.isIntersecting;
          },
          { threshold: 0 }
        );
        io.observe(rootEl);

        return () => {
          gsap.ticker.remove(tick);
          io.disconnect();
          ro.disconnect();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        scroller.style.overflowX = "auto";
        layout();
      });
    }, rootEl);

    let cancelled = false;
    const preDecode = async () => {
      for (const img of Array.from(rootEl.querySelectorAll("img"))) {
        if (cancelled) return;
        await img.decode().catch(() => {});
      }
    };
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

  // Pointer drag control handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!rowRef.current) return;
    isDragging.current = true;
    setIsGrabbed(true);
    startX.current = e.clientX;
    lastPointerX.current = e.clientX;
    lastTime.current = performance.now();
    velocity.current = 0;

    const currentGSAPX = (gsap.getProperty(rowRef.current, "x") as number) || 0;
    startRowX.current = currentGSAPX;
    currentX.current = currentGSAPX;

    if (drift.current) drift.current.pause();

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !rowRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTime.current);
    const dx = e.clientX - lastPointerX.current;

    velocity.current = (dx / dt) * 16;
    lastPointerX.current = e.clientX;
    lastTime.current = now;

    const deltaTotal = e.clientX - startX.current;
    let nextX = startRowX.current + deltaTotal;

    const p = pitchRef.current;
    if (p) {
      let wrapped = nextX % p;
      if (wrapped > 0) wrapped -= p;
      currentX.current = wrapped;
      gsap.set(rowRef.current, { x: wrapped });
      if (drift.current) {
        drift.current.progress((Math.abs(wrapped) % p) / p);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsGrabbed(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const loop = [...ITEMS, ...ITEMS];

  return (
    <div
      ref={rootRef}
      aria-label="Our works"
      className="flex w-full flex-col items-center text-center select-none"
    >
      <span className="pm-label inline-flex items-center rounded-full bg-cream/60 py-2 pl-4 pr-[calc(1rem-0.16em)] font-display text-maroon ring-1 ring-olive/20 backdrop-blur-sm">
        <span className="inline-block leading-none translate-y-[1.5px]">Selected Works · Since 1968</span>
      </span>
      <h2 className="pm-display-lg font-display mt-6 text-heading-brown">
        Our Works
      </h2>
      <p className="pm-body mx-auto mt-5 max-w-xl font-body text-maroon/80">
        Three generations of engineering and artistry, each piece handcrafted
        for Jain derasars and Hindu temples.
      </p>

      {/* Draggable endless arc ribbon */}
      <div
        ref={scrollRef}
        className={cn(
          "relative mt-[clamp(1.5rem,4vh,3rem)] w-screen overflow-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden touch-none",
          isGrabbed ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, #000 7%, #000 93%, transparent 100%)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          ref={rowRef}
          className="flex w-max items-center gap-4 px-[14vw] pt-8 pb-24 sm:gap-5"
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
                draggable={false}
                className={cn(
                  "group relative block h-[clamp(11rem,30vh,22rem)] shrink-0 overflow-hidden rounded-[22px] bg-cream-deep shadow-[0_16px_36px_-16px_rgba(46,35,19,0.22)] ring-1 ring-olive/15 will-change-transform select-none",
                  "hover:ring-olive/35 hover:shadow-[0_22px_44px_-16px_rgba(46,35,19,0.32)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
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
                  draggable={false}
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 30vw, 45vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100 pointer-events-none select-none"
                />
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

      <div className="mt-4 flex justify-center">
        <Button variant="solid" size="lg" href="/products">
          View all collections
        </Button>
      </div>
    </div>
  );
}
