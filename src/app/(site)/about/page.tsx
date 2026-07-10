import type { Metadata } from "next";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import Testimonials from "@/components/sections/Testimonials";
import SectionHeading from "@/components/ui/SectionHeading";
import SemicircleField from "@/components/ui/SemicircleField";
import StatBlock from "@/components/ui/StatBlock";

export const metadata: Metadata = {
  title: "About",
  description:
    "Established in 1968, A Paramount Engineering Works is a Mumbai manufacturer of Jain Derasar and Hindu temple accessories — three generations of engineering and artistry.",
};

const STATS: [string, string][] = [
  ["1968", "Established"],
  ["50+", "Years of legacy"],
  ["3", "Generations"],
  ["240+", "Temples served"],
];

const PILLARS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: "Authentic Craftsmanship",
    body: "Skilled artisans with deep knowledge of tradition and shastra.",
    icon: (
      <path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5z M9 12l2 2 4-4" />
    ),
  },
  {
    title: "Premium Quality Materials",
    body: "Only the finest wood and metals for lasting beauty and durability.",
    icon: <path d="M6 3h12l3 5-9 13L3 8z M3 8h18 M9 3l3 5 3-5 M12 8v13" />,
  },
  {
    title: "Customization",
    body: "Tailored designs and finishes to match your vision and temple aesthetics.",
    icon: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
      </>
    ),
  },
  {
    title: "Timely & Reliable",
    body: "Committed to on-time delivery with complete transparency.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
  {
    title: "Devotion in Every Detail",
    body: "We create with faith, respect and devotion — not just manufacture.",
    icon: (
      <path d="M3 13c3 0 4-2 6-2s2 2 5 2M20 8.5a3 3 0 00-5.2-2A3 3 0 009.6 8.5c0 2.2 2.8 4 5.2 6 2.4-2 5.2-3.8 5.2-6z" />
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="pt-28">
      <header className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          Since 1968 · Mumbai
        </p>
        <SplitTextReveal
          as="h1"
          by="words"
          className="font-display text-4xl leading-[1.08] font-light text-olive-deep sm:text-6xl"
        >
          A Paramount Engineering Works
        </SplitTextReveal>
        <p className="mt-5 font-body text-xl text-olive italic">
          Makers of Temple Accessories
        </p>
      </header>

      {/* ABOUT US body beside the olive GENERATION semicircle (deck p07) */}
      <section className="mx-auto mt-20 grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-8">
        <ScrollReveal>
          <SectionHeading eyebrow="Since 1968" title="ABOUT US" align="left" />
          <div className="mt-8 max-w-xl space-y-5 font-body text-espresso/85">
            <p>
              Established in 1968, A Paramount Engineering Works is a manufacturing
              company based in Mumbai, India which deals in all kinds of Jain Derasar
              and Hindu Temple accessories.
            </p>
            <p>
              Backed by rich experience and extensive knowledge, we pride ourselves
              on being the only company that provides all kinds of temple needs under
              one roof — with a rare combination of engineering expertise and artistic
              skill.
            </p>
            <p>
              The knowledge we possess about our shastra gives us an upper hand. With
              three generations in the business, the company is driven by passion and
              a commitment to craftsmanship, customer satisfaction and innovation.
            </p>
          </div>
        </ScrollReveal>

        <SemicircleField
          side="right"
          flourish
          className="h-[560px] lg:-mr-6"
        >
          <div className="flex h-[560px] flex-col items-center justify-center gap-10 px-6 text-center">
            <p className="font-display text-3xl tracking-[0.12em] text-cream uppercase sm:text-4xl">
              Generation
            </p>
            <div className="flex flex-col items-center gap-8">
              {STATS.map(([n, l]) => (
                <StatBlock key={l} value={n} label={l} />
              ))}
            </div>
          </div>
        </SemicircleField>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-24 lg:grid-cols-2">
        <div className="rounded-card border border-olive/15 bg-cream-deep/50 p-10">
          <h2 className="font-display text-sm tracking-[0.16em] text-olive uppercase">
            Our Mission
          </h2>
          <p className="mt-5 font-body text-espresso/85">
            To uphold the sanctity of these products by ensuring unparalleled
            quality, timeless design and utmost respect for religious traditions —
            exceeding expectations through continuous improvement, ethical practices
            and devotion to serving religious communities globally.
          </p>
        </div>
        <div className="rounded-card border border-olive/15 bg-cream-deep/50 p-10">
          <h2 className="font-display text-sm tracking-[0.16em] text-olive uppercase">
            Our Vision
          </h2>
          <p className="mt-5 font-body text-espresso/85">
            As a leading manufacturer of temple products, we envision expanding our
            legacy of excellence and integrity — setting new benchmarks in quality
            and design, and enhancing the sacredness of temples across the world.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <ScrollReveal className="mb-12">
          <SectionHeading eyebrow="Our Promise" title="Why choose us" />
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-card border border-olive/15 bg-cream p-7"
            >
              <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-cream-deep text-olive-deep">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {p.icon}
                </svg>
              </span>
              <h3 className="font-display text-base font-medium text-olive-deep">
                {p.title}
              </h3>
              <p className="mt-2 font-body text-sm text-espresso/70">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </div>
  );
}
