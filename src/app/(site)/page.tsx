import CinematicHero from "@/components/sections/CinematicHero";
import DoorScroll from "@/components/sections/DoorScroll";
import FeaturedFamilies from "@/components/sections/FeaturedFamilies";
import FeaturedGallery from "@/components/sections/FeaturedGallery";
import DevotionStatement from "@/components/sections/DevotionStatement";
import CraftStory from "@/components/sections/CraftStory";
import HeritageStrip from "@/components/sections/HeritageStrip";
import QuoteInterlude from "@/components/sections/QuoteInterlude";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import Showcase3D from "@/components/products/Showcase3D";
import ScrollReveal from "@/components/animations/ScrollReveal";

export default function Home() {
  return (
    <>
      {/* The temple doors, opened by the visitor's own scroll: a pinned,
          scrubbed frame-sequence film that ends on the hero's exact cream. */}
      <DoorScroll />
      <CinematicHero />
      <FeaturedFamilies />
      <FeaturedGallery />
      <DevotionStatement />
      <CraftStory />
      <HeritageStrip />

      {/* Deck p30 interlude — "Shaped by devotion," + olive damask circle */}
      <QuoteInterlude />

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <ScrollReveal className="mb-12">
          <p className="mb-4 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
            Interactive
          </p>
          <h2 className="font-display text-4xl leading-tight font-light text-olive-deep sm:text-5xl">
            Turn it in your hands
          </h2>
        </ScrollReveal>
        <Showcase3D label="Silver Kalash" />
      </section>

      <EnquiryCTA />
    </>
  );
}
