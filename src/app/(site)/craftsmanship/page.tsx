import type { Metadata } from "next";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import PageHeader from "@/components/ui/PageHeader";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import SectionHeading from "@/components/ui/SectionHeading";
import StagesScrolly, { type Stage } from "@/components/sections/StagesScrolly";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "From shastra to sanctum, the Paramount process: design, carving, cladding, polishing and installation of Jain and Hindu temple artifacts.",
};

// The client's four stages, in their words. Each photo is an in-situ GALLERY
// shot chosen to READ AS its stage — a designed ceiling, the carving itself, a
// polished finish, an installed sanctum. Gallery photography may be cropped to
// the full-height stage; the white-ground studio cut-outs must not be (client
// mandate).
const STEPS: Stage[] = [
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

      {/* The four stages, one full screen each: the heading scrolls up and
          away, then the sticky stage takes the viewport and the page scrolls
          through the four (StagesScrolly). This replaced a 4-up card grid,
          which had replaced four alternating two-column screens — the client
          wanted one stage per page, scrolled through, with the motion doing
          the storytelling. */}
      <div className="mx-auto max-w-7xl px-6 pt-12 pb-10 sm:pt-16 sm:pb-12">
        <SectionHeading
          eyebrow="The Making"
          title="Four stages of sanctum"
          align="left"
          className="max-w-2xl"
        />
      </div>
      <StagesScrolly stages={STEPS} />

      <EnquiryCTA />
    </div>
  );
}
