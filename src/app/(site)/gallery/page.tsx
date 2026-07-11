import type { Metadata } from "next";
import GalleryCoverflow from "@/components/gallery/GalleryCoverflow";
import { getCoverflowCategories } from "@/lib/galleryCoverflow";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Installations and portfolio — carved ceilings, silver doors, samovasaran and shrines across derasars and temples served since 1968, shown as a Cover Flow of the work.",
};

export default function GalleryPage() {
  const categories = getCoverflowCategories();

  return (
    <div className="pt-28 pb-24">
      <PageHeader
        eyebrow="Gallery"
        title="Installations & Photography"
        subtitle="The work in place — carved, clad and polished for derasars and temples. Choose a collection to leaf through it."
        className="pb-14"
      />

      <GalleryCoverflow categories={categories} />
    </div>
  );
}
