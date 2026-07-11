import type { Metadata } from "next";
import AssetFrame from "@/components/ui/AssetFrame";
import ImageMaskReveal from "@/components/animations/ImageMaskReveal";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import PageHeader from "@/components/ui/PageHeader";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import OrnamentDivider from "@/components/ui/OrnamentDivider";

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

      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {STEPS.map((s) => (
          <section
            key={s.n}
            className="flex flex-col items-center py-12 text-center sm:py-16"
          >
            <p className="font-body text-3xl text-olive-muted italic">{s.n}</p>
            <SplitTextReveal
              as="h2"
              by="words"
              className="mt-2 font-display text-3xl leading-tight font-light text-[color:var(--color-heading-brown)] sm:text-4xl"
            >
              {s.title}
            </SplitTextReveal>
            <OrnamentDivider className="mx-auto mt-4 text-olive/45" />
            <p className="mx-auto mt-5 max-w-xl font-body text-espresso/80">
              {s.body}
            </p>
            <ImageMaskReveal className="mt-9 w-full overflow-hidden rounded-card">
              <AssetFrame
                src={s.img}
                image={null}
                ratio="16/10"
                fit="cover"
                crop
                showLabel={false}
                sizes="(min-width:768px) 48rem, 100vw"
              />
            </ImageMaskReveal>
          </section>
        ))}
      </div>
      <EnquiryCTA />
    </div>
  );
}
