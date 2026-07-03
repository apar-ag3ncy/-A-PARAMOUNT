import HomeHero from "@/components/sections/HomeHero";
import FeaturedFamilies from "@/components/sections/FeaturedFamilies";
import CraftStory from "@/components/sections/CraftStory";
import HeritageStrip from "@/components/sections/HeritageStrip";
import EnquiryCTA from "@/components/sections/EnquiryCTA";

export default function Home() {
  return (
    <>
      <HomeHero />
      <FeaturedFamilies />
      <CraftStory />
      <HeritageStrip />
      <EnquiryCTA />
    </>
  );
}
