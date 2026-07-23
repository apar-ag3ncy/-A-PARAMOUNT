import type { Metadata } from "next";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SlideReveal from "@/components/animations/SlideReveal";
import Testimonials from "@/components/sections/Testimonials";
import SectionHeading from "@/components/ui/SectionHeading";
import SemicircleField from "@/components/ui/SemicircleField";
import StatBlock from "@/components/ui/StatBlock";
import PageHeader from "@/components/ui/PageHeader";
import EnquiryCTA from "@/components/sections/EnquiryCTA";

export const metadata: Metadata = {
  title: "About",
  description:
    "Established in 1968, A Paramount Engineering Works is a Mumbai manufacturer of Jain Derasar and Hindu temple accessories, three generations of engineering and artistry.",
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
    body: "We create with faith, respect and devotion, not just manufacture.",
    icon: (
      <path d="M3 13c3 0 4-2 6-2s2 2 5 2M20 8.5a3 3 0 00-5.2-2A3 3 0 009.6 8.5c0 2.2 2.8 4 5.2 6 2.4-2 5.2-3.8 5.2-6z" />
    ),
  },
];

export default function AboutPage() {
  return (
    <div className="pt-12">
      <PageHeader
        eyebrow="Since 1968 · Mumbai"
        title="A Paramount Engineering Works"
        tagline="Makers of Temple Accessories"
      />

      {/* ABOUT US body beside the olive GENERATION semicircle — the client's deck
          page, replicated: no eyebrow over the heading, the full five-paragraph
          company statement set JUSTIFIED (both edges flush, as in the PDF), and
          the disc bleeding off the right carrying "Generation" + the stats.

          `items-stretch` (the grid default), NOT `items-start`. That was pinned to
          start when this column held a condensed three-paragraph rewrite and was
          SHORTER than the disc, so it floated mid-arc. With the real copy restored
          the column is the taller of the two, and stretching lets the disc grow to
          match it — which is how the deck page reads, one full-height circle. The
          field's geometry is safe under that: its radius is 0.825 x height while
          the content's half-height grows with height/2, so a taller field only
          widens the containment margin. */}
      <section className="mx-auto mt-14 grid max-w-7xl gap-12 overflow-x-clip px-6 lg:grid-cols-2 lg:gap-12">
        <SlideReveal from="left">
          <SectionHeading title="ABOUT US" align="left" />
          {/* Justified from `sm` up ONLY, and left-aligned below it. The deck page
              is justified, but it is a wide desktop spread; at 375px the column is
              327px and justifying it stretched the widest word gap to 23.8px
              against a 4.4px natural space — a 5.4x pull, i.e. visible rivers of
              white down the paragraph. Measured, not assumed. hyphens-auto rides
              along wherever justification is on, so the browser breaks long words
              rather than stretching the spaces to reach the margin. */}
          <div className="pm-body mt-8 max-w-xl space-y-5 font-body text-maroon/85 hyphens-auto text-left sm:text-justify">
            <p>
              Established in 1968, A Paramount Engineering Works is a manufacturing
              company based in Mumbai, India which deals in all kinds of Jain Derasar
              and Hindu Temple accessories.
            </p>
            <p>
              Backed by rich experience and extensive knowledge, we pride ourselves
              on being the only company that provides all kinds of temple needs under
              one roof, with a rare combination of engineering expertise and artistic
              skills.
            </p>
            <p>
              We are one of the major suppliers of temple accessories and handicrafts
              in the country. We provide a wide variety of products and services to
              meet customer requirements and provide a one-stop solution to all the
              temple needs. The knowledge that we possess about our shastra gives us
              an upper hand compared to our competitors.
            </p>
            <p>
              With three generations in the business, the company is driven by passion
              and commitment to craftsmanship, customer satisfaction and innovation.
            </p>
            <p>
              The company enjoys a reliable image in the industry through its
              commitment to quality, on-time delivery and maintaining transparency and
              fairness in its relationships with the customers.
            </p>
          </div>
        </SlideReveal>

        {/* min-h, not h: the stack needs ~742px at the sm/md widths, and a hard
            560px box with overflow-hidden was clipping 182px of it (the last
            StatBlock). */}
        <SemicircleField
          side="right"
          flourish
          className="min-h-[560px] lg:-mr-6"
        >
          <div className="flex h-full min-h-[560px] flex-col items-center justify-center gap-10 px-6 py-14 text-center">
            <p className="pm-h2 font-display tracking-[0.12em] text-cream uppercase">
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

      <section className="mx-auto max-w-7xl overflow-x-clip px-6 pt-16 pb-20">
        <ScrollReveal className="mb-12">
          <SectionHeading eyebrow="Our Purpose" title="Mission & Vision" align="left" />
        </ScrollReveal>
        <div className="grid gap-6 lg:grid-cols-2">
          <SlideReveal
            from="left"
            className="rounded-card border border-olive/15 bg-cream-deep/50 p-8 transition-colors duration-300 hover:border-olive/30"
          >
            <h2 className="pm-h3 font-display text-heading-brown">Our Mission</h2>
            <p className="pm-body mt-3 font-body text-maroon/85">
              To uphold the sanctity of these products by ensuring unparalleled
              quality, timeless design and utmost respect for religious traditions,
              exceeding expectations through continuous improvement, ethical practices
              and devotion to serving religious communities globally.
            </p>
          </SlideReveal>
          <SlideReveal
            from="right"
            className="rounded-card border border-olive/15 bg-cream-deep/50 p-8 transition-colors duration-300 hover:border-olive/30"
          >
            <h2 className="pm-h3 font-display text-heading-brown">Our Vision</h2>
            <p className="pm-body mt-3 font-body text-maroon/85">
              As a leading manufacturer of temple products, we envision expanding our
              legacy of excellence and integrity, setting new benchmarks in quality
              and design, and enhancing the sacredness of temples across the world.
            </p>
          </SlideReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <ScrollReveal className="mb-12">
          <SectionHeading eyebrow="Our Promise" title="Why choose us" align="left" />
        </ScrollReveal>
        <div className="grid items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-card border border-olive/15 bg-cream p-8 transition-colors duration-300 hover:border-olive/30 hover:bg-cream-deep/40"
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
              {/* 2.6em = exactly two lines at pm-h3's 1.3 line-height, so every card
                  title in a row reserves the same height and the body copy beneath
                  them aligns. In EM, not rem, deliberately: this was hard-coded at
                  3.25rem (52px = two lines at the old 20px h3) and silently broke
                  when h3 moved to 24px — two lines then needed 62px, overshot the
                  cap, and the row went ragged. Tied to the font size it cannot
                  drift again. */}
              <h3 className="pm-h3 font-display text-heading-brown sm:min-h-[2.6em]">
                {p.title}
              </h3>
              <p className="pm-small mt-3 font-body text-maroon/70">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
      <EnquiryCTA />
    </div>
  );
}
