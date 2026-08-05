import SemicircleField from "@/components/ui/SemicircleField";
import ScrollReveal from "@/components/animations/ScrollReveal";

/**
 * QuoteInterlude — the deck's serene p30 spread: on a cream ground, the quote
 * sits left — rendered in the brand's Storica font (`font-display`).
 */
export default function QuoteInterlude() {
  return (
    <section
      aria-label="Shaped by devotion, destined to inspire generations"
      className="relative overflow-hidden bg-cream"
    >
      <div className="grid items-center lg:min-h-[32rem] lg:grid-cols-2">
        {/* The quote — brand display font in heading-brown */}
        <div className="px-6 py-20 text-center sm:px-12 lg:py-28 lg:pl-[max(3rem,calc((100vw-72rem)/2))] lg:text-left">
          <ScrollReveal>
            <blockquote className="mx-auto max-w-xl lg:mx-0">
              <p className="font-display text-2xl sm:text-3xl lg:text-[2.45rem] font-light leading-[1.2] text-heading-brown">
                Shaped by devotion,
              </p>
              <p className="font-display text-2xl sm:text-3xl lg:text-[2.45rem] font-light leading-[1.2] text-heading-brown mt-3">
                Destined to inspire generations.
              </p>
            </blockquote>
          </ScrollReveal>
        </div>

        {/* The big olive disc bleeding off the right edge, faint brand damask
            inside — clipped by the section so the curve runs past top/bottom. */}
        <SemicircleField
          side="right"
          damask
          className="hidden h-full min-h-[32rem] lg:block"
        />
      </div>
    </section>
  );
}
