"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

const STATS: { to: number; suffix: string; label: string }[] = [
  { to: 1968, suffix: "", label: "Established" },
  { to: 242, suffix: "+", label: "Temples served" },
  { to: 3, suffix: "", label: "Generations" },
];

/** Gold corner flourish for the velvet panel. */
function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 56"
      className={`absolute h-10 w-10 text-[#E2CA82]/70 sm:h-14 sm:w-14 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      aria-hidden
    >
      <path d="M2,38 L2,14 Q2,2 14,2 L38,2" />
      <path d="M8,30 L8,16 Q8,8 16,8 L30,8" opacity={0.65} />
      <path d="M14,22 Q14,14 22,14" opacity={0.4} />
      <path d="M2,46 l3,3.6 -3,3.6 -3,-3.6 z" fill="currentColor" stroke="none" opacity={0.8} />
    </svg>
  );
}

/**
 * The velvet interlude — a deep-oxblood devotional statement (inspo: ornamental
 * gold-cornered cards). Numbers count up as the panel enters; the statement line
 * reveals word by word.
 */
export default function DevotionStatement() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const nums = gsap.utils.toArray<HTMLElement>(".dv-num");
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        nums.forEach((n) => (n.textContent = n.dataset.to ?? ""));
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          once: true,
          onEnter: () =>
            nums.forEach((n) => {
              const to = Number(n.dataset.to ?? 0);
              const obj = { v: to > 100 ? to - 90 : 0 };
              gsap.to(obj, {
                v: to,
                duration: 2.2,
                ease: "power2.out",
                onUpdate: () => {
                  n.textContent = String(Math.round(obj.v));
                },
              });
            }),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="px-4 py-24 sm:px-8">
      <div
        className="relative mx-auto max-w-6xl overflow-hidden rounded-card px-6 py-20 text-center sm:px-16 sm:py-28"
        style={{
          background:
            "radial-gradient(circle at 20% 10%, rgba(226,202,130,0.10), transparent 45%), radial-gradient(circle at 80% 90%, rgba(226,202,130,0.08), transparent 45%), linear-gradient(160deg, #4F1A16 0%, #3A120F 55%, #2C0D0B 100%)",
        }}
      >
        {/* hairline inner frame + gold corners */}
        <div className="pointer-events-none absolute inset-4 rounded-[2px] border border-[#E2CA82]/25 sm:inset-6" />
        <Corner className="top-3 left-3 sm:top-5 sm:left-5" />
        <Corner className="top-3 right-3 -scale-x-100 sm:top-5 sm:right-5" />
        <Corner className="bottom-3 left-3 -scale-y-100 sm:bottom-5 sm:left-5" />
        <Corner className="right-3 bottom-3 -scale-100 sm:right-5 sm:bottom-5" />

        <Image
          src="/brand/a-mark-white.png"
          alt=""
          width={269}
          height={234}
          className="mx-auto h-14 w-auto opacity-80"
        />

        <p className="mt-8 font-display text-[10px] tracking-[0.34em] text-[#E2CA82]/80 uppercase">
          Three generations of shastra &amp; craft
        </p>

        <SplitTextReveal
          as="h2"
          by="words"
          className="mx-auto mt-6 max-w-3xl font-serif text-3xl leading-snug text-cream italic sm:text-5xl"
        >
          Fifty years of devotion, cast in silver, brass and prayer.
        </SplitTextReveal>

        <div className="mx-auto mt-8 flex items-center justify-center gap-3 text-[#E2CA82]/60" aria-hidden>
          <span className="h-px w-14 bg-current" />
          <span className="text-[12px]">✦</span>
          <span className="h-px w-14 bg-current" />
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl text-[#E2CA82] tabular-nums sm:text-5xl">
                <span className="dv-num" data-to={s.to}>
                  0
                </span>
                {s.suffix}
              </p>
              <p className="mt-2 font-display text-[9px] tracking-[0.24em] text-cream/60 uppercase sm:text-[10px]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
