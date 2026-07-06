import CinematicHero from "@/components/sections/CinematicHero";
import DoorIntro from "@/components/sections/DoorIntro";
import FeaturedFamilies from "@/components/sections/FeaturedFamilies";
import DevotionStatement from "@/components/sections/DevotionStatement";
import CraftStory from "@/components/sections/CraftStory";
import HeritageStrip from "@/components/sections/HeritageStrip";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import Showcase3D from "@/components/products/Showcase3D";
import ScrollReveal from "@/components/animations/ScrollReveal";

export default function Home() {
  return (
    <>
      {/* Once-per-session temple-door opening. Portals itself onto <body> so
          position:fixed escapes the transformed #smooth-content wrapper. */}
      <DoorIntro />
      <CinematicHero />
      <FeaturedFamilies />
      <DevotionStatement />
      <CraftStory />
      <HeritageStrip />

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <ScrollReveal className="mb-12">
          <p className="mb-4 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
            Interactive
          </p>
          <h2 className="font-display text-4xl leading-tight font-light text-olive-deep sm:text-5xl">
            Turn it in your hands
          </h2>
        </ScrollReveal>
        <Showcase3D label="Brass Kalash" />
      </section>

      <EnquiryCTA />
    </>
  );
}
