import MagneticButton from "@/components/animations/MagneticButton";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";

/** Closing call-to-action with the magnetic enquiry button (§4.7). */
export default function EnquiryCTA() {
  return (
    <section className="px-6 py-20 text-center sm:py-32">
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
