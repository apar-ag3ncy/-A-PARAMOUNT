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

        <aside className="space-y-9">
          <div>
            <h2 className="font-display text-[11px] tracking-[0.18em] text-olive uppercase">
              Workshops
            </h2>
            <div className="mt-3 space-y-3 font-body text-espresso/80">
              {CONTACT.addresses.map((a) => (
                <p key={a}>{a}</p>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-[11px] tracking-[0.18em] text-olive uppercase">
              Email &amp; Social
            </h2>
            <a
              href={`mailto:${CONTACT.email}`}
              className="mt-3 block font-body text-espresso/80 hover:text-olive"
            >
              {CONTACT.email}
            </a>
            <p className="mt-1 font-body text-espresso/60">
              Facebook / Instagram — {CONTACT.social}
            </p>
          </div>

          <div>
            <h2 className="font-display text-[11px] tracking-[0.18em] text-olive uppercase">
              Speak with
            </h2>
            <ul className="mt-3 space-y-1.5 font-body text-espresso/80">
              {CONTACT.people.map((p) => (
                <li key={p.phone}>
                  {p.name} ·{" "}
                  <a
                    href={`tel:${p.phone.replace(/\s+/g, "")}`}
                    className="tabular-nums hover:text-olive"
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
