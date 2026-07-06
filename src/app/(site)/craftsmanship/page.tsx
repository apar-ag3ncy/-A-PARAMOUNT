import type { Metadata } from "next";
import AssetFrame from "@/components/ui/AssetFrame";
import ImageMaskReveal from "@/components/animations/ImageMaskReveal";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "From shastra to sanctum — the Paramount process: design, carving, cladding, polishing and installation of Jain and Hindu temple artifacts.",
};

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Design & Shastra",
    body: "Every piece begins with the shastra. Sizes and proportions follow religious calculation, so a dhwajadand or kalash is made exactly to the norms of your derasar.",
  },
  {
    n: "02",
    title: "Carving",
    body: 'Premium quality wood is carved to depth — from roughly 0.25" normal carving to 1.5" extra-deep — each cut deepening the intricacy of the design.',
  },
  {
    n: "03",
    title: "Cladding",
    body: "Silver, german silver, brass or copper sheets are cladded onto the carved wood, highlighting the work beneath. Two- and three-tone combinations set parts of the design apart.",
  },
  {
    n: "04",
    title: "Polish & Lacquer",
    body: "Each surface is polished and lacquered for a shine and durability that endures — engraved, where needed, with yantra and name.",
  },
  {
    n: "05",
    title: "Installation",
    body: "Delivered on time and installed at your derasar — sized to the space, with the transparency and care of a fifty-year relationship.",
  },
];

export default function CraftsmanshipPage() {
  return (
    <div className="pt-28">
      <header className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          The Process
        </p>
        <SplitTextReveal
          as="h1"
          by="words"
          className="font-display text-4xl leading-[1.08] font-light text-olive-deep sm:text-6xl"
        >
          From shastra to sanctum
        </SplitTextReveal>
        <p className="mx-auto mt-6 max-w-xl font-body text-espresso/75">
          A rare combination of engineering expertise and artistic skill — every
          temple need under one roof.
        </p>
        <OrnamentDivider className="mx-auto mt-6 text-olive/50" />
      </header>

      {/* Deck p11–12 — the "WHY CHOOSE US" pill card on an olive band */}
      <div className="mt-16">
        <WhyChooseUs />
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16">
        {STEPS.map((s, i) => (
          <section
            key={s.n}
            className="grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:gap-20"
          >
            <div className={cn(i % 2 === 1 && "lg:order-2")}>
              <p className="font-serif text-3xl text-olive-muted italic">{s.n}</p>
              <SplitTextReveal
                as="h2"
                by="words"
                className="mt-2 font-display text-3xl font-light text-olive-deep sm:text-4xl"
              >
                {s.title}
              </SplitTextReveal>
              <p className="mt-5 max-w-md font-body text-espresso/80">{s.body}</p>
            </div>
            <ImageMaskReveal className="rounded-card">
              <AssetFrame image={null} ratio="4/3" showLabel={false} />
            </ImageMaskReveal>
          </section>
        ))}
      </div>
    </div>
  );
}
