import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { CONTACT } from "@/lib/constants";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Enquire with A Paramount Engineering Works — two Mumbai workshops, since 1968. Makers of Jain Derasar and Hindu temple accessories.",
};

export default function ContactPage() {
  return (
    <div className="pt-28 pb-32">
      <PageHeader
        eyebrow="Enquiries"
        title="Begin your enquiry"
        subtitle="Tell us about your temple. Every piece is handcrafted to order."
      />

      <div className="mx-auto mt-14 grid max-w-6xl gap-14 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ContactForm />

        <aside className="divide-y divide-olive/12 rounded-card border border-olive/20 bg-cream-deep/40 p-8 lg:p-10">
          <div className="pb-8">
            <h2 className="pm-label font-display text-maroon">
              Workshops
            </h2>
            <div className="pm-body mt-3 space-y-3 font-body text-maroon/80">
              {CONTACT.addresses.map((a) => (
                <p key={a}>{a}</p>
              ))}
            </div>
          </div>

          <div className="py-8">
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
              Facebook / Instagram — {CONTACT.social}
            </p>
          </div>

          <div className="pt-8">
            <h2 className="pm-label font-display text-maroon">
              Speak with
            </h2>
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
  );
}
