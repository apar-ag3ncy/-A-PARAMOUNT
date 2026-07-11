import type { Metadata } from "next";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import GalleryCoverflow from "@/components/gallery/GalleryCoverflow";
import { getCoverflowCategories } from "@/lib/galleryCoverflow";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Installations and portfolio — carved ceilings, silver doors, samovasaran and shrines across derasars and temples served since 1968, shown as a Cover Flow of the work.",
};

export default function GalleryPage() {
  const categories = getCoverflowCategories();

  return (
    <div className="pt-28 pb-24">
      <header className="mx-auto max-w-4xl px-6 pb-14 text-center">
        <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          Gallery
        </p>
        <SplitTextReveal
          as="h1"
          by="words"
          className="font-display text-4xl leading-[1.08] font-light text-[color:var(--color-heading-brown)] sm:text-6xl"
        >
          Installations & Photography
        </SplitTextReveal>
        <OrnamentDivider className="mx-auto mt-6 text-olive/50" />
        <p className="mx-auto mt-6 max-w-xl font-body text-espresso/75">
          The work in place — carved, clad and polished for derasars and temples.
          Choose a collection to leaf through it.
        </p>
      </header>

      <GalleryCoverflow categories={categories} />
    </div>
  );
}
