import CinematicHero from "@/components/sections/CinematicHero";
import DoorScroll from "@/components/sections/DoorScroll";
import CraftStory from "@/components/sections/CraftStory";
import QuoteInterlude from "@/components/sections/QuoteInterlude";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import Showcase3D from "@/components/products/Showcase3D";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Home() {
  return (
    <>
      {/* The temple doors, opened by the visitor's own scroll: a pinned,
          scrubbed frame-sequence film that ends on the hero's exact cream. */}
      <DoorScroll />
      {/* "Our Works" is ACT 4 and lives INSIDE CinematicHero's pinned stage — it
          lands on the very same mandir dome the camera lifted onto, as the brand
          fades away. It is deliberately NOT a section here: giving it its own
          backdrop rendered the dome twice ("it feels like duplicated bg in both").
          (The old "Four families, one sanctum" arch cards were removed; the
          families still live on /products.) */}
      <CinematicHero />
      <CraftStory />

      {/* Deck p30 interlude — "Shaped by devotion," + olive damask circle */}
      <QuoteInterlude />

      <section className="mx-auto max-w-6xl px-6 py-16 text-center sm:py-24">
        <ScrollReveal className="mb-12 flex justify-center">
          <SectionHeading eyebrow="Interactive" title="Turn it in your hands" />
        </ScrollReveal>
        <Showcase3D label="Silver Kalash" />
      </section>

      <EnquiryCTA />
    </>
  );
}
