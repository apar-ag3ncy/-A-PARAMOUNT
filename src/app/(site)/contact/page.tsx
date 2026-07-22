import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { CONTACT } from "@/lib/constants";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Enquire with A Paramount Engineering Works, two Mumbai workshops, since 1968. Makers of Jain Derasar and Hindu temple accessories.",
};

export default function ContactPage() {
  return (
    <div className="pt-12 pb-24">
      {/* ONE container for the whole page, the intro and the two columns share
          the same max-width and left rail, so nothing floats over an unrelated
          grid. Left-aligned to that rail (the page was a centered intro stranded
          above a wider left-aligned form grid). */}
      <div className="mx-auto max-w-6xl px-6">
        <header className="max-w-2xl">
          <p className="pm-eyebrow font-display text-maroon">Enquiries</p>
          <SplitTextReveal
            as="h1"
            by="words"
            className="pm-display-lg mt-4 font-display font-light text-heading-brown"
          >
            Begin your enquiry
          </SplitTextReveal>
          <p className="pm-lead mt-5 font-body text-maroon/80">
            Tell us about your temple. Every piece is handcrafted to order.
          </p>
        </header>

        {/* Two MATCHED panels, the form was bare fields floating beside a framed
            info card; both now share the same surface. */}
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-card border border-olive/20 bg-cream-deep/40 p-7 sm:p-9">
            <ContactForm />
          </div>

          <aside className="divide-y divide-olive/12 rounded-card border border-olive/20 bg-cream-deep/40 p-7 sm:p-9">
            <div className="pb-7">
              <h2 className="pm-label font-display text-maroon">Workshops</h2>
              <div className="pm-body mt-3 space-y-3 font-body text-maroon/80">
                {CONTACT.addresses.map((a) => (
                  <p key={a}>{a}</p>
                ))}
              </div>
            </div>

            <div className="py-7">
              <h2 className="pm-label font-display text-maroon">
                Email &amp; Social
              </h2>
              <a
                href={`mailto:${CONTACT.email}`}
                className="pm-body mt-3 block font-body text-maroon/80 hover:text-maroon"
              >
                {CONTACT.email}
              </a>
              <p className="pm-body mt-1 font-body text-maroon/60">
                Facebook / Instagram, {CONTACT.social}
              </p>
            </div>

            <div className="pt-7">
              <h2 className="pm-label font-display text-maroon">Speak with</h2>
              <ul className="mt-3 space-y-2.5 font-body text-maroon/80">
                {CONTACT.people.map((p) => (
                  <li key={p.phone}>
                    {p.name} ·{" "}
                    <a
                      href={`tel:${p.phone.replace(/\s+/g, "")}`}
                      className="tabular-nums text-maroon hover:text-maroon"
                    >
                      {p.phone}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
