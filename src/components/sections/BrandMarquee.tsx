import MarqueeRow from "@/components/animations/MarqueeRow";
import { cn } from "@/lib/utils";

const ITEMS = [
  "Since 1968",
  "Jain Derasar",
  "Hindu Mandir",
  "Three Generations",
  "Shastra-true Proportions",
  "Handcrafted to Order",
  "Every Temple Need Under One Roof",
];

/**
 * BrandMarquee — a hairline-bound band of the brand's claims gliding right to
 * left, quickening with the scroll and settling when the page does
 * (MarqueeRow reads Lenis velocity). A breath between sections.
 */
export default function BrandMarquee({ className }: { className?: string }) {
  return (
    <section
      aria-hidden
      className={cn("border-y border-olive/15 bg-cream-deep/40 py-5 sm:py-6", className)}
    >
      <MarqueeRow items={ITEMS} pxPerSecond={36} />
    </section>
  );
}
