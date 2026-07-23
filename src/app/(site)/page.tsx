import HomeFilm from "@/components/sections/HomeFilm";
import CraftStory from "@/components/sections/CraftStory";
import QuoteInterlude from "@/components/sections/QuoteInterlude";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import Showcase3D from "@/components/products/Showcase3D";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Home() {
  return (
    <>
      {/* The ENTIRE opening as ONE pinned scroll — the temple doors part (with
          live god-rays spilling out), the cream flood becomes the mandir interior,
          the brand resolves on the carved dome, then "Our Works" lands on that same
          dome. One film, no seam (it used to be two stacked pinned sections, which
          read as "breaky / three different animations"). "Our Works" lives INSIDE
          this stage — its own backdrop once rendered the dome twice. */}
      <HomeFilm />
      <CraftStory />

      {/* Deck p30 interlude — "Shaped by devotion," + olive damask circle */}
      <QuoteInterlude />

      {/* Bottom padding is trimmed (it was a symmetric `py-16 sm:py-24`) because
          the enquiry CTA below opens with its own top padding, and the two used
          to stack into 224px of empty cream under the kalash. */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-8 text-center sm:pt-24 sm:pb-10">
        <ScrollReveal className="mb-12 flex justify-center">
          <SectionHeading eyebrow="Interactive" title="Turn it in your hands" />
        </ScrollReveal>
        <Showcase3D label="Silver Kalash" />
      </section>

      <EnquiryCTA />
    </>
  );
}
