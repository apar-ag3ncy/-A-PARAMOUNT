import Link from "next/link";
import Image from "next/image";
import { SITE, CONTACT, FAMILIES } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import BrandDamask from "@/components/ui/BrandDamask";
import Wordmark from "@/components/ui/Wordmark";

const GOLD = "#E2CA82";
const PISTA = "#DCCF95";

/**
 * Footer — the deck's closing pages, reimagined as a full-screen "velvet"
 * finale: a deep-olive panel (the deck's p118–120 back pages) that covers the
 * viewport when the visitor reaches it, so the site closes on the same
 * cinematic, full-bleed rhythm as the door intro and the landing hero. The
 * brand lockup sits in warm light over a gold damask; contact + collections
 * are laid out as a considered contact page, not a cramped strip.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="pm-footer relative flex min-h-svh flex-col overflow-hidden text-cream"
      style={{
        background:
          "radial-gradient(125% 90% at 50% 0%, #57502F 0%, #4A4428 42%, #332815 78%, #2A2011 100%)",
      }}
    >
      {/* warm gold bloom from the top edge — the light the doors opened onto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, rgba(226,202,130,0.22) 0%, rgba(226,202,130,0.06) 40%, transparent 72%)",
        }}
      />
      {/* gold damask texture across the whole panel (deck back pages) */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ color: GOLD }}>
        <BrandDamask opacity={0.06} />
      </div>
      {/* fine gold top rule */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(to right, transparent, ${GOLD}88, transparent)`,
        }}
      />

      {/* ---- main block, vertically centered in the viewport ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p
          className="mb-8 font-display text-[11px] tracking-[0.34em] uppercase"
          style={{ color: PISTA }}
        >
          Visit the Sanctum
        </p>

        <Image
          src="/brand/a-mark-white.png"
          alt=""
          aria-hidden
          width={269}
          height={234}
          className="h-16 w-auto opacity-95 sm:h-20"
        />
        <Wordmark
          ariaLabel={SITE.name}
          className="mt-6 text-[clamp(30px,7vw,52px)] text-cream opacity-95"
        />

        <p className="mt-6 font-serif text-xl text-cream/90 italic sm:text-2xl">
          {SITE.tagline} — {SITE.descriptor.toLowerCase()} since {SITE.since}.
        </p>

        <OrnamentDivider width="md" className="mt-8 text-[#E2CA82]" />

        {/* ---- contact: workshop | enquiries | family ---- */}
        <div className="mt-12 grid w-full gap-10 text-left sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <section>
            <h3
              className="mb-3 font-display text-[10px] tracking-[0.28em] uppercase"
              style={{ color: GOLD }}
            >
              The Workshop
            </h3>
            <address className="space-y-3 font-body text-[13px] leading-relaxed text-cream/75 not-italic">
              {CONTACT.addresses.map((addr) => (
                <p key={addr}>{addr}</p>
              ))}
            </address>
          </section>

          <section>
            <h3
              className="mb-3 font-display text-[10px] tracking-[0.28em] uppercase"
              style={{ color: GOLD }}
            >
              Enquiries
            </h3>
            <div className="space-y-1.5 font-body text-[13px] text-cream/75">
              <p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="underline-offset-4 transition-colors hover:text-[#E2CA82] hover:underline"
                >
                  {CONTACT.email}
                </a>
              </p>
              {CONTACT.people.map((person) => (
                <p key={person.phone} className="flex flex-wrap gap-x-2">
                  <span className="text-cream/90">{person.name}</span>
                  <a
                    href={`tel:${person.phone.replace(/\s/g, "")}`}
                    className="text-cream/60 transition-colors hover:text-[#E2CA82]"
                  >
                    {person.phone}
                  </a>
                </p>
              ))}
            </div>
          </section>

          <section className="sm:col-span-2 lg:col-span-1">
            <h3
              className="mb-3 font-display text-[10px] tracking-[0.28em] uppercase"
              style={{ color: GOLD }}
            >
              Collections
            </h3>
            <ul className="space-y-2 font-body text-[13px]">
              {FAMILIES.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/products/${f.slug}`}
                    className="group inline-flex items-center gap-2 text-cream/75 transition-colors hover:text-[#E2CA82]"
                  >
                    <span
                      className="inline-block h-px w-4 transition-all duration-300 group-hover:w-7"
                      style={{ background: GOLD }}
                    />
                    {f.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* ---- bottom bar ---- */}
      <div className="relative z-10 border-t border-cream/10 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p className="font-display text-[10px] tracking-[0.22em] text-cream/50 uppercase">
            © {year} {SITE.name}
          </p>
          <p
            className="font-display text-[10px] tracking-[0.22em] uppercase"
            style={{ color: `${PISTA}99` }}
          >
            Crafted in Mumbai · Since {SITE.since}
          </p>
        </div>
      </div>
    </footer>
  );
}
