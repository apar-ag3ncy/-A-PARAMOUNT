import type { Metadata } from "next";
import AssetFrame from "@/components/ui/AssetFrame";
import SlideReveal from "@/components/animations/SlideReveal";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import PageHeader from "@/components/ui/PageHeader";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "From shastra to sanctum — the Paramount process: design, carving, cladding, polishing and installation of Jain and Hindu temple artifacts.",
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
    body: 'Premium quality wood is carved to depth — from roughly 0.25" normal carving to 1.5" extra-deep — each cut deepening the intricacy of the design.',
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
    body: "Each surface is polished and lacquered for a shine and durability that endures — engraved, where needed, with yantra and name.",
    img: "/products/kalash.webp",
  },
  {
    n: "05",
    title: "Installation",
    body: "Delivered on time and installed at your derasar — sized to the space, with the transparency and care of a fifty-year relationship.",
    img: "/products/mandir.webp",
  },
];

export default function CraftsmanshipPage() {
  return (
    <div className="pt-28">
      <PageHeader
        eyebrow="The Process"
        title="From shastra to sanctum"
        subtitle="A rare combination of engineering expertise and artistic skill — every temple need under one roof."
      />

      {/* Deck p11–12 — the "WHY CHOOSE US" pill card on an olive band */}
      <div className="mt-16">
        <WhyChooseUs />
      </div>

      {/* The process, restored to the alternating left/right editorial — but now
          it ASSEMBLES on scroll: the text rolls in from one side, the image from
          the other (SlideReveal), so each step arrives with motion. */}
      <div className="mx-auto max-w-7xl overflow-x-hidden px-6 py-12 sm:py-16">
        <SectionHeading
          eyebrow="The Making"
          title="Five stages, one sanctum"
          className="mx-auto mb-6 max-w-2xl sm:mb-10"
        />
        {STEPS.map((s, i) => {
          const textLeft = i % 2 === 0;
          return (
            <section
              key={s.n}
              className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-20 lg:py-16"
            >
              <SlideReveal
                from={textLeft ? "left" : "right"}
                className={textLeft ? "" : "lg:order-2"}
              >
                <p className="pm-display font-display not-italic text-olive/25">
                  {s.n}
                </p>
                <h2 className="pm-h2 mt-1 font-display text-[color:var(--color-heading-brown)]">
                  {s.title}
                </h2>
                <OrnamentDivider className="mt-4 text-olive/45" />
                <p className="pm-body mt-5 max-w-md font-body text-espresso/80">
                  {s.body}
                </p>
              </SlideReveal>
              <SlideReveal
                from={textLeft ? "right" : "left"}
                className="overflow-hidden rounded-card"
              >
                {/* Tall artifacts: show the whole piece uncropped (client
                    mandate). The frame adopts the photo's real ratio. */}
                <AssetFrame
                  src={s.img}
                  image={null}
                  ratio="3/4"
                  fit="contain"
                  showLabel={false}
                  sizes="(min-width:1024px) 46vw, 100vw"
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
