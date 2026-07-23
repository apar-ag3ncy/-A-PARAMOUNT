import MagneticButton from "@/components/animations/MagneticButton";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

/** Closing call-to-action with the magnetic enquiry button (§4.7). */
export default function EnquiryCTA() {
  return (
    // Asymmetric padding on purpose. This section used to be `py-20 sm:py-32`,
    // and the showcase above it closes on `sm:py-24`, so the two paddings stacked
    // into 224px of empty cream between the kalash card and this eyebrow — by far
    // the largest gap on the page (every other transition here overlaps by ~70px).
    // The top is trimmed hardest because that stack is doubled; the bottom keeps
    // more, since what follows is the full-viewport dark footer plate and it wants
    // a breath before it.
    <section className="px-6 pt-12 pb-16 text-center sm:pt-16 sm:pb-24">
      <ScrollReveal className="flex flex-col items-center">
        <SectionHeading
          eyebrow="Begin the conversation"
          title="Let us craft something sacred for your temple"
          className="mx-auto max-w-2xl"
        />
        <div className="mt-10 flex justify-center">
          <MagneticButton href="/contact">Begin your enquiry</MagneticButton>
        </div>
      </ScrollReveal>
    </section>
  );
}
