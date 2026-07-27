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

const PEOPLE: string[] = CONTACT.people.map((p) => `${p.title} ${p.name}`);

/** y-centre of each name, as a fraction of the field height (measured) */
const NAME_TOPS = [26.15, 42.28, 58.41, 74.54];
/** "GENERATIONS", and the gold rule under it */
const HEADING_TOP = 15.49;
const HEADING_RULE_TOP = 19.23;
const CONNECTOR_SIZE = "11.41%";

const PILLARS: { title: string; body: string; icon: React.ReactNode }[] = [
  {
    title: "Authentic Craftsmanship",
    body: "Skilled artisans with deep knowledge of tradition and shastra.",
    icon: (
      <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M12 4v16M4 12h16M12 4h6M20 12v6M12 20H6M4 12V6" />
        <circle cx="8" cy="8" r="0.9" fill="currentColor" />
        <circle cx="16" cy="8" r="0.9" fill="currentColor" />
        <circle cx="8" cy="16" r="0.9" fill="currentColor" />
        <circle cx="16" cy="16" r="0.9" fill="currentColor" />
      </g>
    ),
  },
  {
    title: "Premium Quality Materials",
    body: "Only the finest wood and metals for lasting beauty and durability.",
    icon: (
      <g stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M8 9.5h8M7 9.5l-1.5 5c0 3.3 2.5 5.5 6.5 5.5s6.5-2.2 6.5-5.5L17 9.5" />
        <path d="M9.5 9.5V7.5a2.5 2.5 0 015 0V9.5" />
        <path d="M12 3.5c1.5 2 2.5 4 2.5 4s-2.5-1-2.5-4z" />
        <path d="M12 3.5c-1.5 2-2.5 4-2.5 4s2.5-1 2.5-4z" />
        <path d="M9 20h6" />
      </g>
    ),
  },
  {
    title: "Customization",
    body: "Tailored designs and finishes to match your vision and temple aesthetics.",
    icon: (
      <g stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="4" y="4" width="16" height="16" rx="1" />
        <path d="M4 9.5h11.5v7H9.5v-4" />
        <path d="M20 14.5H8.5v-7h6v4" />
      </g>
    ),
  },
  {
    title: "Timely & Reliable",
    body: "Committed to on-time delivery with complete transparency.",
    icon: (
      <g stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <rect x="5" y="5" width="14" height="14" rx="2" transform="rotate(45 12 12)" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5v4M12 15v4M5 12h4M15 12h4" />
      </g>
    ),
  },
  {
    title: "Devotion in Every Detail",
    body: "We create with faith, respect and devotion, not just manufacture.",
    icon: (
      <g stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="12" cy="9.5" r="5" />
        <path d="M12 14.5V20.5" />
        <path d="M9.5 20.5h5" />
        <path d="M12 4.5l.5-1.5.5 1.5" />
        <path d="M17 9.5l1.5.5-1.5.5" />
        <path d="M7 9.5l-1.5.5 1.5.5" />
      </g>
    ),
  },
];

export default function AboutPage() {
  const deckPanel = (
    <div className="relative h-full text-center">
      <p
        className="pm-h2 absolute inset-x-0 -translate-y-1/2 font-display tracking-[0.12em] text-cream uppercase"
        style={{ top: `${HEADING_TOP}%` }}
      >
        Generations
      </p>
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

  const stackedPanel = (
    <div className="flex h-full min-h-[560px] flex-col items-center justify-center px-6 py-14 text-center">
      <p className="pm-h2 font-display tracking-[0.12em] text-cream uppercase">
        Generations
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hidden lg:block">
          <SemicircleField side="right" flourish variant="deck" className="h-full">
            {deckPanel}
          </SemicircleField>
        </div>

        <div className="relative flex items-center px-6 py-16 lg:min-h-[calc(100svh-var(--pm-bar-bottom))] lg:py-8 lg:pr-0 lg:pl-[6.7vw]">
          <SlideReveal
            from="left"
            className="w-full lg:max-w-[min(39.81vw,78rem)]"
          >
            <h1 className="pm-display font-display text-heading-brown">ABOUT US</h1>
            <OrnamentDivider width="lg" className="mt-4 text-olive/50" />
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
          <SectionHeading eyebrow="Our Purpose" title="Mission & Vision" align="center" />
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
          <SectionHeading eyebrow="Our Promise" title="Why choose us" align="center" />
        </ScrollReveal>
        <div className="flex flex-wrap items-stretch justify-center gap-6">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              data-dark="true"
              className="relative flex w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] flex-col rounded-3xl border border-gold/35 p-8 text-cream shadow-xl"
              style={{
                background:
                  "linear-gradient(145deg, #7C7144 0%, #6E643B 48%, #574F2E 100%)",
                boxShadow:
                  "0 20px 45px -15px rgba(23, 18, 8, 0.45), inset 0 1px 1.5px rgba(255, 255, 255, 0.25)",
              }}
            >
              <span
                className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-gold/45 text-cream shadow-inner"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(226, 202, 130, 0.25) 0%, rgba(87, 79, 46, 0.8) 100%)",
                }}
              >
                <svg
                  width="22"
                  height="22"
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
              <h3 className="pm-h3 font-display text-cream sm:min-h-[2.6em] font-medium">
                {p.title}
              </h3>
              <p className="pm-small mt-3 font-body text-cream/90 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
      <EnquiryCTA />
    </div>
  );
}
