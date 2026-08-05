import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { CONTACT } from "@/lib/constants";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Enquire with A Paramount Engineering Works, two Mumbai workshops, since 1968. Makers of Jain Derasar and Hindu temple accessories.",
};

export default function ContactPage() {
  return (
    <div className="pt-12 pb-24">
      <div className="mx-auto max-w-6xl px-6">
        {/* Page Header */}
        <header className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-olive/15 px-4 py-1.5 ring-1 ring-olive/20 backdrop-blur-sm mb-4">
            <span className="font-display text-xs font-semibold tracking-[0.2em] text-maroon uppercase">
              Sacred Architecture · Direct Enquiry
            </span>
          </span>
          <SplitTextReveal
            as="h1"
            by="words"
            className="pm-display-lg font-display text-heading-brown"
          >
            Begin your enquiry
          </SplitTextReveal>
          <OrnamentDivider width="sm" className="mt-4 text-olive/60" />
          <p className="pm-lead mt-5 font-body text-maroon/85">
            Tell us about your temple or sacred sanctuary. Every piece is handcrafted to order by three generations of engineering and artistic mastery.
          </p>
        </header>

        {/* Two Matched Brand Olive Cards (No Internal Patterns) */}
        <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Left Card: Enquiry Form Box in True Brand Olive */}
          <div
            data-dark="true"
            className="relative overflow-hidden rounded-[2rem] border border-gold/40 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(46,35,19,0.35)]"
            style={{
              background:
                "linear-gradient(145deg, #8A7F4A 0%, #766B3B 50%, #5E552E 100%)",
            }}
          >
            <div className="relative z-10">
              <div className="mb-8">
                <span className="pm-label font-display text-gold tracking-[0.2em] block mb-1 opacity-90">
                  SANCTUM ENQUIRY
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-cream font-medium">
                  Tell us about your vision
                </h2>
              </div>
              <ContactForm />
            </div>
          </div>

          {/* Right Card: Workshops & Contacts Box in True Brand Olive */}
          <aside
            data-dark="true"
            className="relative overflow-hidden rounded-[2rem] border border-gold/40 p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(46,35,19,0.35)] divide-y divide-gold/20"
            style={{
              background:
                "linear-gradient(145deg, #8A7F4A 0%, #766B3B 50%, #5E552E 100%)",
            }}
          >
            {/* Workshops Section */}
            <div className="relative z-10 pb-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/15 border border-gold/30 text-gold">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0-4h.01M12 7h.01" />
                  </svg>
                </span>
                <h2 className="pm-label font-display text-gold tracking-[0.18em]">
                  Workshops
                </h2>
              </div>
              <div className="space-y-4 font-body text-cream/95 text-sm leading-relaxed">
                {CONTACT.addresses.map((a) => (
                  <div key={a} className="flex gap-3">
                    <span className="mt-1.5 flex size-2 shrink-0 rounded-full bg-gold" />
                    <p className="text-cream/95">{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Email & Social Section */}
            <div className="relative z-10 py-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/15 border border-gold/30 text-gold">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <h2 className="pm-label font-display text-gold tracking-[0.18em]">
                  Email &amp; Social
                </h2>
              </div>
              <a
                href={`mailto:${CONTACT.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-cream/15 border border-gold/40 px-4 py-2.5 text-sm font-body text-cream hover:bg-cream hover:text-espresso transition-all duration-300 font-medium"
              >
                <span>{CONTACT.email}</span>
                <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <p className="pm-small mt-3 font-body text-gold/85">
                Facebook / Instagram: <span className="text-cream font-medium">{CONTACT.social}</span>
              </p>
            </div>

            {/* Speak With Section */}
            <div className="relative z-10 pt-8">
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/15 border border-gold/30 text-gold">
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <h2 className="pm-label font-display text-gold tracking-[0.18em]">
                  Speak with Us
                </h2>
              </div>
              <ul className="space-y-3 font-body">
                {CONTACT.people.map((p) => (
                  <li key={p.phone} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-cream/95 font-medium">{p.name}</span>
                    <a
                      href={`tel:${p.phone.replace(/\s+/g, "")}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gold/40 bg-cream/15 px-3 py-1 text-xs font-mono text-gold hover:bg-cream hover:text-espresso transition-all duration-300"
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
