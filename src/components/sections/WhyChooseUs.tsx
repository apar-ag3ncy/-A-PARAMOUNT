import ArchMark from "@/components/ui/ArchMark";
import LotusFlourish from "@/components/ui/LotusFlourish";
import ScrollReveal from "@/components/animations/ScrollReveal";

interface Item {
  Icon: typeof ArchMark;
  title: string;
  body: string;
}

const ITEMS: Item[] = [
  {
    Icon: ArchMark,
    title: "Authentic Craftsmanship",
    body: "Skilled artisans with deep knowledge of tradition and shastra.",
  },
  {
    Icon: LotusFlourish,
    title: "Premium Quality Materials",
    body: "Only the finest wood and metals for lasting beauty and durability.",
  },
  {
    Icon: ArchMark,
    title: "Customization as per Requirement",
    body: "Tailored designs and finishes to match your vision and temple aesthetics.",
  },
  {
    Icon: LotusFlourish,
    title: "Timely Delivery & Reliability",
    body: "Committed to on-time delivery with complete transparency.",
  },
];

/**
 * WhyChooseUs — the deck's p11–p12 spread: an olive band carrying a giant faint
 * arch-A watermark, with a rounded cream pill card floating on it. Inside the
 * pill: a filled-olive circular badge + "WHY CHOOSE US", then the four promise
 * items — each a small brand mark in a taupe circle ABOVE a centred title and
 * a line of copy, separated by hairline dividers.
 *
 * Server component; the only motion is the existing ScrollReveal fade-up.
 */
export default function WhyChooseUs() {
  return (
    <section
      aria-label="Why choose us"
      className="relative overflow-hidden bg-olive py-20 sm:py-28"
    >
      {/* Giant faint arch-A watermark behind the card, as on the deck band */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[38%] text-olive-deep"
        style={{ opacity: 0.28 }}
      >
        <ArchMark className="h-[36rem] w-[26.5rem]" />
      </span>

      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="rounded-[2.5rem] bg-cream px-8 py-10 sm:px-12 xl:rounded-full xl:px-16 xl:py-12">
            <div className="flex flex-col gap-10 xl:flex-row xl:items-center">
              {/* "WHY CHOOSE US" badge */}
              <div className="flex items-center gap-4 xl:shrink-0 xl:border-r xl:border-olive/20 xl:pr-10">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-olive text-cream">
                  <LotusFlourish className="h-8 w-8" />
                </span>
                <span className="pm-label font-display text-olive">
                  Why
                  <br />
                  Choose
                  <br />
                  Us
                </span>
              </div>

              {/* The four promises, hairline-divided on wide screens */}
              <div className="grid gap-10 sm:grid-cols-2 xl:flex-1 xl:grid-cols-4 xl:gap-0 xl:divide-x xl:divide-olive/20">
                {ITEMS.map(({ Icon, title, body }) => (
                  // Icon ON TOP of the title (not beside it): in a narrow 4-up
                  // band the chip-beside-title layout squeezed the title so
                  // "Authentic Craftsmanship" collided with the next item's chip.
                  // Stacked + centred, each title gets the full column width.
                  <div
                    key={title}
                    className="flex flex-col items-center gap-3 text-center xl:px-6"
                  >
                    {/* Deck p11 fills these chips taupe — the token exists for exactly this. */}
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-taupe/85 text-cream ring-1 ring-taupe">
                      <Icon className="h-6 w-6" />
                    </span>
                    {/* Reserve three lines of title so the tallest one does not
                        push its body below the others' — bodies stay level
                        across the row. Mobile stack is natural, no reserve. */}
                    <h3 className="pm-label font-display text-heading-brown sm:min-h-[3.75rem]">
                      {title}
                    </h3>
                    <p className="pm-small max-w-[24ch] font-body text-espresso/75">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
