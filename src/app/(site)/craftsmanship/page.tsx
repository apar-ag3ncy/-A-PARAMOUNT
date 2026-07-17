import type { Metadata } from "next";
import AssetFrame from "@/components/ui/AssetFrame";
import SlideReveal from "@/components/animations/SlideReveal";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import PageHeader from "@/components/ui/PageHeader";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "From shastra to sanctum, the Paramount process: design, carving, cladding, polishing and installation of Jain and Hindu temple artifacts.",
};

const STEPS: { n: string; title: string; body: string; img: string }[] = [
  {
    n: "01",
    title: "Design & Shastra",
    body: "Every piece begins with the shastra. Sizes and proportions follow religious calculation, so a dhwajadand or kalash is made exactly to the norms of your derasar.",
    img: "/products/dhwajadand.webp",
  },
  {
    n: "02",
    title: "Carving",
    body: 'Premium quality wood is carved to depth, from roughly 0.25" normal carving to 1.5" extra deep, each cut deepening the intricacy of the design.',
    img: "/products/wooden-carved-murti.webp",
  },
  {
    n: "03",
    title: "Cladding",
    body: "Silver, german silver, brass or copper sheets are cladded onto the carved wood, highlighting the work beneath. Two- and three-tone combinations set parts of the design apart.",
    img: "/products/samovasaran-trigadu.webp",
  },
  {
    n: "04",
    title: "Polish & Lacquer",
    body: "Each surface is polished and lacquered for a shine and durability that endures, engraved, where needed, with yantra and name.",
    img: "/products/kalash.webp",
  },
  {
    n: "05",
    title: "Installation",
    body: "Delivered on time and installed at your derasar, sized to the space, with the transparency and care of a fifty year relationship.",
    img: "/products/mandir.webp",
  },
];

export default function CraftsmanshipPage() {
  return (
    <div className="pt-28">
      <PageHeader
        eyebrow="The Process"
        title="From shastra to sanctum"
        subtitle="A rare combination of engineering expertise and artistic skill, every temple need under one roof."
      />

      {/* Deck p11–12, the "WHY CHOOSE US" pill card on an olive band */}
      <div className="mt-16">
        <WhyChooseUs />
      </div>

      {/* The process, restored to the alternating left/right editorial, but now
          it ASSEMBLES on scroll: the text rolls in from one side, the image from
          the other (SlideReveal), so each step arrives with motion. */}
      <div className="mx-auto max-w-7xl overflow-x-hidden px-6 py-12 sm:py-16">
        {/* left-aligned to the step grid's left edge, it was centered over
            left-anchored content, so the heading floated off its own section */}
        <SectionHeading
          eyebrow="The Making"
          title="Five stages, one sanctum"
          align="left"
          className="mb-8 max-w-2xl sm:mb-12"
        />
        {STEPS.map((s, i) => {
          const textLeft = i % 2 === 0;
          return (
            <section
              key={s.n}
              className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14"
            >
              <SlideReveal
                from={textLeft ? "left" : "right"}
                className={textLeft ? "" : "lg:order-2"}
              >
                <p className="pm-display font-display not-italic text-heading-brown/25">
                  {s.n}
                </p>
                <h2 className="pm-h2 mt-1 font-display text-heading-brown">
                  {s.title}
                </h2>
                <OrnamentDivider className="mt-4 text-olive/45" />
                <p className="pm-body mt-5 max-w-md font-body text-maroon/80">
                  {s.body}
                </p>
              </SlideReveal>
              <SlideReveal
                from={textLeft ? "right" : "left"}
                // Cap the image so a step row is a calm ~460px band, not a 775px
                // one with the short text floating in empty cream. Sits on the
                // outer edge of its half, opposite the text.
                className={cn(
                  "w-full max-w-sm overflow-hidden rounded-card lg:max-w-md",
                  // the text SlideReveal carries the order swap; the image only
                  // needs to hug the correct edge of its half
                  textLeft ? "lg:justify-self-end" : "lg:justify-self-start",
                )}
              >
                {/* One uniform 4/5 frame across all five steps (crop forces the
                    ratio; contain keeps the whole piece, client mandate), so the
                    image columns share a height instead of each adopting its
                    photo's ratio and making every row a different height. */}
                <AssetFrame
                  src={s.img}
                  image={null}
                  ratio="4/5"
                  crop
                  fit="contain"
                  showLabel={false}
                  sizes="(min-width:1024px) 28rem, 100vw"
                />
              </SlideReveal>
            </section>
          );
        })}
      </div>
      <EnquiryCTA />
    </div>
  );
}
