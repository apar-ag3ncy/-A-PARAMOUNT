import SemicircleField from "@/components/ui/SemicircleField";
import ScrollReveal from "@/components/animations/ScrollReveal";

/**
 * QuoteInterlude — the deck's serene p30 spread: on a cream ground, the quote
 * sits left — the opening phrase in Inter olive, the continuation upright
 * in heading-brown — while a huge damask-textured olive circle bleeds off the
 * right edge (the p30 composition, via SemicircleField). Both lines are Inter
 * (`font-body`): Storica is caps-only, and this line must read sentence-case.
 *
 * Server component; the only motion is the existing ScrollReveal fade-up the
 * home page already uses.
 */
export default function QuoteInterlude() {
  return (
    <section
      aria-label="Shaped by devotion, destined to inspire generations"
      className="relative overflow-hidden bg-cream"
    >
      <div className="grid items-center lg:min-h-[32rem] lg:grid-cols-2">
        {/* The quote — olive opening, upright heading-brown continuation */}
        <div className="px-6 py-20 text-center sm:px-12 lg:py-28 lg:pl-[max(3rem,calc((100vw-72rem)/2))] lg:text-left">
          <ScrollReveal>
            <blockquote className="mx-auto max-w-xl lg:mx-0">
              {/* Inter, not Storica: Storica is caps-only, and this line must
                  read sentence-case. Light olive opening, upright
                  heading-brown continuation — the deck p30 rhythm. */}
              <p className="pm-display font-body text-heading-brown">
                Shaped by devotion,
              </p>
              <p className="pm-display mt-3 font-body font-medium text-heading-brown">
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
