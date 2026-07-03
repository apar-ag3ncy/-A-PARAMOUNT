import type { Metadata } from "next";
import MasonryGrid from "@/components/products/MasonryGrid";
import MasonryItem from "@/components/products/MasonryItem";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Installations and portfolio — carved ceilings, silver doors, samovasaran and shrines across derasars and temples served since 1968.",
};

const SHOTS: { caption: string; ratio: string }[] = [
  { caption: "Jinmandir Gabhara · Dharampur", ratio: "3/4" },
  { caption: "Carved Wooden Ceiling", ratio: "4/3" },
  { caption: "Silver Doors · Rangmandap", ratio: "2/3" },
  { caption: "Brass Kalash · Shikhar", ratio: "1/1" },
  { caption: "Samovasaran", ratio: "3/4" },
  { caption: "Deep-Carved Wooden Doors", ratio: "4/5" },
  { caption: "Mandir · Sanctum", ratio: "4/3" },
  { caption: "Angi Mugat", ratio: "1/1" },
  { caption: "Chattar", ratio: "2/3" },
  { caption: "Palkhi", ratio: "3/4" },
  { caption: "Manekstambh Toran", ratio: "4/5" },
  { caption: "Vyaakhyan Paat", ratio: "1/1" },
];

export default function GalleryPage() {
  return (
    <div className="pt-28">
      <header className="mx-auto max-w-4xl px-6 pb-12 text-center">
        <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          Portfolio
        </p>
        <SplitTextReveal
          as="h1"
          by="words"
          className="font-display text-4xl leading-[1.08] font-light text-olive-deep sm:text-6xl"
        >
          Installations & Photography
        </SplitTextReveal>
        <p className="mx-auto mt-6 max-w-xl font-body text-espresso/75">
          A portfolio of pieces in place — filling in as photography arrives.
        </p>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <MasonryGrid>
          {SHOTS.map((s, i) => (
            <MasonryItem
              key={i}
              caption={s.caption}
              ratio={s.ratio}
              depth={i % 2 ? 1.04 : 0.96}
              arch={i % 3 === 0 && ["3/4", "4/5", "2/3"].includes(s.ratio)}
            />
          ))}
        </MasonryGrid>
      </div>
    </div>
  );
}
