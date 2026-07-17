import type { Metadata } from "next";
import GalleryCoverflow from "@/components/gallery/GalleryCoverflow";
import { getCoverflowFlow } from "@/lib/galleryCoverflow";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Installations and portfolio, carved ceilings, silver doors, samovasaran and shrines across derasars and temples served since 1968, shown as one continuous Cover Flow of the work.",
};

export default function GalleryPage() {
  const flow = getCoverflowFlow();

  return (
    // No footer on this route (see ConditionalFooter), the flow IS the page,
    // and it should end on the work, not on a sitemap.
    <div className="pt-28">
      <PageHeader
        eyebrow="Gallery"
        title="Installations & Photography"
        subtitle="The work in place, carved, clad and polished for derasars and temples. Keep scrolling: one collection flows straight into the next."
        className="pb-12"
      />

      <GalleryCoverflow flow={flow} />
    </div>
  );
}
