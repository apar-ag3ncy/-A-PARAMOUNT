import MagneticButton from "@/components/animations/MagneticButton";
import ScrollReveal from "@/components/animations/ScrollReveal";

/** Closing call-to-action with the magnetic enquiry button (§4.7). */
export default function EnquiryCTA() {
  return (
    <section className="px-6 py-32 text-center">
      <ScrollReveal>
        <p className="font-serif text-lg text-olive-muted italic">
          Begin the conversation
        </p>
        <h2 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight font-light text-olive-deep sm:text-6xl">
          Let us craft something sacred for your temple
        </h2>
        <div className="mt-11 flex justify-center">
          <MagneticButton href="/contact">Begin your enquiry</MagneticButton>
        </div>
      </ScrollReveal>
    </section>
  );
}
