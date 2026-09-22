import type { Metadata } from "next";
import Image from "next/image";
import ScrollReveal from "@/components/animations/ScrollReveal";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import PageHeader from "@/components/ui/PageHeader";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "From shastra to sanctum, the Paramount process: design, carving, cladding, polishing and installation of Jain and Hindu temple artifacts.",
};

// The client's four stages, in their words. Each photo is an in-situ GALLERY
// shot chosen to READ AS its stage — a designed ceiling, the carving itself, a
// polished finish, an installed sanctum. Gallery photography may be cropped to
// the 4:5 card; the white-ground studio cut-outs must not be (client mandate).
const STEPS: { n: string; title: string; body: string; img: string; alt: string }[] = [
  {
    n: "01",
    title: "Design Development",
    body: "Every piece begins with detailed designing as per size requirement that focuses on combining traditional craftsmanship with modern manufacturing. The company develops designs with emphasis on aesthetic detailing, precision, customization and functionality ensuring that each piece reflects the spiritual and architectural significance of the space.",
    img: "/gallery/wooden-ceiling/all/00.webp",
    alt: "Carved wooden ceiling of a derasar, seen from below",
  },
  {
    n: "02",
    title: "Execution & Manufacturing",
    body: "The company follows a meticulous execution process to transform designs into finely crafted products using high quality raw materials. Skilled craftsmen carry out precision wood working, carving, joinery and metal works. Each process is carefully monitored to ensure strength, durability and flawless detailing resulting in products that uphold the highest standards of craftsmanship and quality.",
    img: "/gallery/doors/extra-deep-carving/00.webp",
    alt: "Extra-deep carved wooden temple door",
  },
  {
    n: "03",
    title: "Final Touch",
    body: "This stage focusses on bringing out the fine detailing and richness of each product by carrying out polishing, finishing and detailing processes to achieve a smooth, refined and premium appearance ready for installation and long lasting use.",
    img: "/gallery/kalash/all/00.webp",
    alt: "Polished silver kalash",
  },
  {
    n: "04",
    title: "Installation",
    body: "Sized to the space and properly assembled, each piece is carefully aligned and securely installed while maintaining the aesthetics of sacred spaces. Attention is given to every finishing touch, ensuring a seamless, elegant and perfectly finished installation that meets the highest standards of quality, built to last.",
    img: "/gallery/pichwadi/all/03.webp",
    alt: "Installed sanctum with a silver pichwadi behind the idol",
  },
];

export default function CraftsmanshipPage() {
  return (
    <div className="pt-12">
      <PageHeader
        eyebrow="The Process"
        title="From shastra to sanctum"
        subtitle="A rare combination of engineering expertise and artistic skill, every temple need under one roof."
      />

      {/* Deck p11–12, the "WHY CHOOSE US" pill card on an olive band */}
      <div className="mt-10">
        <WhyChooseUs />
      </div>

      {/* The four stages as ONE row of cards (2×2 on tablet, stacked on phones):
          a 4:5 photograph in the /products collections frame, then the stage
          name and the client's paragraph on the cream beneath it. It used to be
          four alternating two-column screens, each one photo beside one short
          paragraph — at 46vh a card, the section was mostly empty cream and the
          client asked for it to be tighter. Cards reveal in a short stagger. */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <SectionHeading
          eyebrow="The Making"
          title="Four stages of sanctum"
          align="left"
          className="mb-8 max-w-2xl sm:mb-10"
        />
        <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-7">
          {STEPS.map((s, i) => (
            <li key={s.n} className="group/card">
              <ScrollReveal delay={i * 0.12}>
                <div
                  className="rounded-[1.25rem] p-px shadow-[0_24px_54px_-40px_rgba(46,35,19,0.5)] transition-shadow duration-500 group-hover/card:shadow-[0_34px_70px_-36px_rgba(46,35,19,0.66)]"
                  style={{
                    background:
                      "linear-gradient(150deg, #897E49 0%, rgba(137,126,73,0.35) 38%, rgba(124,113,68,0.55) 72%, #7C7144 100%)",
                  }}
                >
                  <div
                    className="relative aspect-[4/5] overflow-hidden rounded-[calc(1.25rem-1px)]"
                    style={{ background: "#2A2416" }}
                  >
                    <Image
                      src={s.img}
                      alt={s.alt}
                      fill
                      sizes="(min-width:1024px) 23vw, (min-width:640px) 46vw, 100vw"
                      className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06] motion-reduce:group-hover/card:scale-100"
                    />
                    {/* a top scrim, or the index vanishes into the pale marble */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-24"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(38,33,18,0.58) 0%, rgba(44,38,20,0.24) 50%, transparent 100%)",
                      }}
                    />
                    <span className="pm-micro absolute top-5 left-5 font-body tabular-nums tracking-[0.24em] text-gold">
                      {s.n}
                    </span>
                    <span className="pm-micro absolute top-5 right-5 font-body text-cream/85">
                      Stage {i + 1} of {STEPS.length}
                    </span>
                  </div>
                </div>

                {/* the stage name heads its own paragraph, as in the client's brief */}
                <div className="mt-5 border-t border-olive/20 pt-4">
                  <h3 className="pm-h3 font-display text-heading-brown">{s.title}</h3>
                  <p className="pm-small mt-3 font-body text-maroon/80">{s.body}</p>
                </div>
              </ScrollReveal>
            </li>
          ))}
        </ol>
      </div>
      <EnquiryCTA />
    </div>
  );
}
