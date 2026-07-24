import type { Metadata } from "next";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SlideReveal from "@/components/animations/SlideReveal";
import Testimonials from "@/components/sections/Testimonials";
import SectionHeading from "@/components/ui/SectionHeading";
import SemicircleField from "@/components/ui/SemicircleField";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import { CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description:
    "Established in 1968, A Paramount Engineering Works is a Mumbai manufacturer of Jain Derasar and Hindu temple accessories, three generations of engineering and artistry.",
};

/* The sheet's right-hand column is the three GENERATIONS of the family, by name
   — not a stat rack. Measured off "20July.pdf" p6: four Inter-18pt cream spans,
   all centred on x = 729.63 of 900 (81.07% of the page width), at these
   fractions of the page height. The gaps between them are dead even (0.1613
   each), which is the only reason the connectors below sit true.

   Same four people as the contact page, so they come from CONTACT rather than
   being retyped here and drifting. */
const PEOPLE: string[] = CONTACT.people.map((p) => `${p.title} ${p.name}`);

/** y-centre of each name, as a fraction of the field height (measured) */
const NAME_TOPS = [26.15, 42.28, 58.41, 74.54];
/** "GENERATION", and the gold rule under it */
const HEADING_TOP = 15.49;
const HEADING_RULE_TOP = 19.23;
/* The vertical connector between two names spans 73.96pt of the sheet's 648 =
   11.41% of the field height, centred on the midpoint of the pair. On the sheet
   it is the brand rule turned on its side — hairline, dot, floret, medallion,
   floret, dot, hairline, reading top to bottom — so it is the SAME
   OrnamentDivider element, rotated, not a second vertical ornament invented to
   sit here. */
const CONNECTOR_SIZE = "11.41%";

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
  // THE DECK PANEL. Laid out by the sheet's own vertical percentages rather than
  // by a flex column with guessed gaps: the container is `inset-y-0` inside the
  // field, so its height IS the field's height and `top: 26.15%` lands exactly
  // where the sheet puts that name. A centred flex stack cannot reproduce this —
  // the sheet's block is not vertically centred (it runs 15.5% to 74.5%, whose
  // midpoint is 45%, not 50%).
  const deckPanel = (
    <div className="relative h-full text-center">
      <p
        className="pm-h2 absolute inset-x-0 -translate-y-1/2 font-display tracking-[0.12em] text-cream uppercase"
        style={{ top: `${HEADING_TOP}%` }}
      >
        Generation
      </p>
      {/* 18.49% of the page width on the sheet; the column is 26vw, so 71.1% of
          it. Gold, like the sheet's (a lit pixel reads #EFC48F). */}
      <div
        className="absolute inset-x-0 flex -translate-y-1/2 justify-center"
        style={{ top: `${HEADING_RULE_TOP}%` }}
      >
        <OrnamentDivider className="w-[71.1%] text-gold/85" />
      </div>

      {PEOPLE.map((name, i) => (
        <p
          key={name}
          className="pm-h3 absolute inset-x-0 -translate-y-1/2 font-body text-cream"
          style={{ top: `${NAME_TOPS[i]}%` }}
        >
          {name}
        </p>
      ))}

      {/* One connector per GAP, hence length - 1. `aspect-square` on a box whose
          HEIGHT is a percentage makes its width match that height, which is the
          only way to give the rotated rule a length measured against the field's
          height — a width percentage would resolve against the column instead. */}
      {PEOPLE.slice(0, -1).map((name, i) => (
        <div
          key={`rule-${name}`}
          className="absolute left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2"
          style={{
            height: CONNECTOR_SIZE,
            top: `${(NAME_TOPS[i] + NAME_TOPS[i + 1]) / 2}%`,
          }}
        >
          <OrnamentDivider className="absolute top-1/2 left-0 w-full -translate-y-1/2 rotate-90 text-gold/85" />
        </div>
      ))}
    </div>
  );

  // Below `lg` the sheet's proportions do not exist, so the same content runs as
  // an ordinary centred stack.
  const stackedPanel = (
    <div className="flex h-full min-h-[560px] flex-col items-center justify-center px-6 py-14 text-center">
      <p className="pm-h2 font-display tracking-[0.12em] text-cream uppercase">
        Generation
      </p>
      <OrnamentDivider className="mt-4 w-56 text-gold/85" />
      {PEOPLE.map((name, i) => (
        <div key={name} className="contents">
          {i > 0 ? (
            <div className="relative h-20 w-20">
              <OrnamentDivider className="absolute top-1/2 left-0 w-full -translate-y-1/2 rotate-90 text-gold/85" />
            </div>
          ) : (
            <div className="h-10" />
          )}
          <p className="pm-h3 font-body text-cream">{name}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div>

      {/* ===== the client's ABOUT US spread, replicated =====

          The deck page is FULL-BLEED: its olive runs off the top, right and bottom
          of the sheet, and nothing sits above "ABOUT US". So this section owns the
          top of the route (the shared PageHeader was removed here — it put a
          centred title block above the spread that the deck page does not have,
          and pushed the olive down off the top edge), and the field is pinned to
          the section's edges rather than sitting inside the padded grid cell it
          used to, which had capped the disc at the row's height and left cream
          above and below it.

          "ABOUT US" is the route's H1 now that the PageHeader is gone. */}
      <section className="relative overflow-hidden">
        {/* From `lg` up: full height, flush to the right edge, so the disc bleeds
            off three sides exactly as it does on the sheet.

            The absolute positioning lives on a WRAPPER, not on the field itself.
            SemicircleField hardcodes `relative` on its own root, so passing
            `absolute` in via className only produced two competing position
            utilities of equal specificity — and `relative` won, which put the
            field back in flow and stretched this section to 1485px. */}
        <div className="absolute inset-0 hidden lg:block">
          <SemicircleField side="right" flourish variant="deck" className="h-full">
            {deckPanel}
          </SemicircleField>
        </div>

        {/* The copy sits on the sheet's own left rail — 6.7vw in, running to its
            52.4vw — NOT centred inside a max-w-7xl. That container is capped at
            1280px, so past ~1400px viewport it stopped growing and started
            centring instead: measured at 1920 the copy began at 18% of the page
            where the sheet starts it at 6.7%.

            The spread is ONE SCREEN TALL. It used to take the sheet's own
            63.25vw aspect, which is 1215px at 1920 — taller than the viewport,
            so the copy and the last stat ran off the bottom and had to be
            scrolled to. min-h (not h) so it still grows rather than clipping if
            the copy ever outruns the screen; padding drops to py-12 to buy that
            headroom back. The disc reads its own size off the same band, so the
            arc keeps the sheet's curvature at this height. */}
        <div className="relative flex items-center px-6 py-16 lg:min-h-[calc(100svh-var(--pm-bar-bottom))] lg:py-8 lg:pr-0 lg:pl-[6.7vw]">
          {/* THE SHEET'S OWN COLUMN, re-measured off the vector layer: the body
              copy runs 59.83 -> 418.14 of 900, i.e. 6.65% -> 46.46%, a measure
              of 39.81vw.

              It was 45.7vw, which ran the copy out to 52.4% — and 52.0% is
              exactly where the arc's leading edge now sits, so the last words of
              the wide lines were being overprinted by the olive. That was
              invisible while the arc was (wrongly) parked at 59%. The sheet
              leaves a deliberate 5.54% gutter between the end of the measure and
              the arc, and 39.81vw restores it.

              The 78rem ceiling only engages past a ~3100px viewport; it just
              stops the measure running away on an ultrawide. */}
          <SlideReveal
            from="left"
            className="w-full lg:max-w-[min(39.81vw,78rem)]"
          >
            {/* pm-display, not pm-h2. This is the route's H1 now, and the locked
                type ramp brackets an H1 at 32-48px — pm-h2 tops out at 30 and would
                sit outside it. The divider steps up to "lg" (w-64) to match: on the
                deck sheet the rule and the word are near enough the same width
                (287 vs 297 units, 0.97), and at pm-display that ratio comes back to
                0.97 where the default w-48 rule would have left it at 1.29. */}
            <h1 className="pm-display font-display text-heading-brown">ABOUT US</h1>
            <OrnamentDivider width="lg" className="mt-4 text-olive/50" />
            {/* Justified from `lg` up ONLY, and NOT hyphenated — both to match the
                sheet, and both measured rather than assumed.

                No hyphenation: the deck breaks only on whole words. Hyphenating
                held the worst word gap to 1.92x the natural space against 2.52x
                without, but 2.52x is ordinary for justified setting (the sheet's
                own gaps are visibly wide), and it cost visible "com-bination" /
                "coun-try" breaks the deck does not have.

                Justified only at `lg`: that is where the two-column spread exists.
                Below it the copy runs full-width-ish and at 375px the column is
                327px, where justifying stretched the worst gap to 5.36x — rivers
                of white down the paragraph. */}
            {/* pm-body (16px), not pm-lead's 18. The spread has to fit one
                screen, and 18px overruns a 1366x768 viewport by 29px even with
                the padding cut to the bone — measured across 18/17/16px against
                three paddings. 16px clears every common size with room. Both
                sit inside the client's locked 16-18 body bracket. */}
            <div className="pm-body mt-8 space-y-5 font-body text-maroon/85 text-left lg:text-justify">
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
        </div>

        {/* Below `lg` the sheet's side-by-side reading is impossible, so the panel
            stacks under the copy on the default centred geometry. */}
        <SemicircleField
          side="right"
          flourish
          className="min-h-[560px] lg:hidden"
        >
          {stackedPanel}
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
