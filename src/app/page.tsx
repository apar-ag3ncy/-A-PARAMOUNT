import { SITE } from "@/lib/constants";

// Placeholder home — a static hero that exercises the locked tokens & fonts.
// The full pinned/scrub HomeHero lands in PARAMOUNT_SCROLL_UI_PROMPT.md §4.1.
export default function Home() {
  return (
    <section className="relative flex min-h-[82vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-6 font-display text-[11px] font-medium uppercase tracking-[0.28em] text-olive">
        {SITE.name} · Since {SITE.since}
      </p>
      <h1 className="font-display text-5xl leading-[1.04] font-light text-olive-deep sm:text-7xl">
        Crafting Divine{" "}
        <span className="font-serif font-medium text-olive italic">Elegance</span>
      </h1>
      <p className="mt-7 max-w-md font-body text-base leading-relaxed text-espresso/80">
        {SITE.subtitle}
      </p>
      <div className="mt-9 flex items-center gap-3 text-olive/70" aria-hidden>
        <span className="h-px w-14 bg-current" />
        <span>✦</span>
        <span className="h-px w-14 bg-current" />
      </div>
    </section>
  );
}
