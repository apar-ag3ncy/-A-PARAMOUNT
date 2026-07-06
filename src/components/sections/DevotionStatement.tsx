"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SectionHeading from "@/components/ui/SectionHeading";
import BrandDamask from "@/components/ui/BrandDamask";
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
 * The velvet interlude — a full-screen deep-olive devotional statement (inspo:
 * ornamental gold-cornered cards from the brand deck). Numbers count up as the
 * panel enters; the statement line reveals word by word.
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
              let last = -1; // only touch the DOM when the rounded value changes
              gsap.to(obj, {
                v: to,
                duration: 2.2,
                ease: "power2.out",
                snap: { v: 1 },
                onUpdate: () => {
                  const rounded = Math.round(obj.v);
                  if (rounded !== last) {
                    last = rounded;
                    n.textContent = String(rounded);
                  }
                },
              });
            }),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="flex min-h-svh flex-col bg-cream p-6 sm:p-8">
      <div
        className="relative flex w-full flex-1 flex-col items-center justify-center overflow-hidden rounded-card px-6 py-20 text-center sm:px-16"
        style={{
          // Velvet olive: soft gold sheens over a centre-lit olive vignette that
          // deepens to espresso at the edges, plus a whisper of woven grain.
          background: [
            "repeating-linear-gradient(115deg, rgba(226,202,130,0.028) 0px, rgba(226,202,130,0.028) 1px, transparent 1px, transparent 8px)",
            "radial-gradient(ellipse at 50% 35%, rgba(226,202,130,0.13), transparent 58%)",
            "radial-gradient(circle at 15% 8%, rgba(220,207,149,0.10), transparent 42%)",
            "radial-gradient(circle at 85% 92%, rgba(226,202,130,0.08), transparent 45%)",
            "radial-gradient(ellipse at 50% 50%, #4A4428 0%, #3D3823 55%, #2E2313 100%)",
          ].join(", "),
        }}
      >
        {/* faint brand damask texture over the olive ground (deck p118) */}
        <BrandDamask className="text-cream" opacity={0.06} />

        {/* hairline inner frame + gold corners */}
        <div className="pointer-events-none absolute inset-4 rounded-[2px] border border-[#E2CA82]/25 sm:inset-6" />
        <Corner className="top-3 left-3 sm:top-5 sm:left-5" />
        <Corner className="top-3 right-3 -scale-x-100 sm:top-5 sm:right-5" />
        <Corner className="bottom-3 left-3 -scale-y-100 sm:bottom-5 sm:left-5" />
        <Corner className="right-3 bottom-3 -scale-100 sm:right-5 sm:bottom-5" />

        <div className="relative z-10 flex flex-col items-center">
          <Image
            src="/brand/a-mark-white.png"
            alt=""
            width={269}
            height={234}
            className="mx-auto h-14 w-auto opacity-80 sm:h-16"
          />

          <SectionHeading
            tone="cream"
            eyebrow="Three generations of shastra & craft"
            title="Shaped by devotion"
            className="mt-8"
          />

          <SplitTextReveal
            as="p"
            by="words"
            className="mx-auto mt-6 max-w-3xl font-serif text-3xl leading-snug text-cream italic sm:text-5xl lg:max-w-4xl lg:text-6xl"
          >
            Fifty years of devotion, cast in silver, brass and prayer.
          </SplitTextReveal>

          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6 sm:mt-14">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <p className="font-display text-3xl font-light text-[#E2CA82] tabular-nums sm:text-5xl">
                  <span className="dv-num" data-to={s.to}>
                    0
                  </span>
                  {s.suffix}
                </p>
                <p className="mt-2 font-display text-[9px] tracking-[0.24em] text-cream/60 uppercase sm:text-[10px]">
                  {s.label}
                </p>
                <OrnamentDivider width="sm" className="mt-3 text-[#E2CA82]/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
