import Link from "next/link";
import Image from "next/image";
import FooterHeaderHold from "@/components/layout/FooterHeaderHold";
import { SITE, CONTACT } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";

/**
 * Footer — a full-VIEWPORT architectural plate with the wordmark cut into the base.
 * LHS column anchored to extreme left, MID column in exact center, RHS column anchored to extreme right.
 */
export default function Footer() {
  return (
    <footer className="pm-footer relative isolate flex min-h-svh flex-col overflow-hidden bg-[#171208] text-cream">
      <FooterHeaderHold />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-[url('/footer/derasar-1280.webp')] lg:bg-[url('/footer/derasar-2400.webp')]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,11,5,0.88) 0%, rgba(17,13,6,0.76) 34%, rgba(18,14,7,0.84) 62%, rgba(12,9,4,0.95) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:px-10 md:px-14 sm:py-14">
        {/* the mark — centred */}
        <Link href="/" aria-label={SITE.name}>
          <Image
            src="/brand/a-mark-white.png"
            alt=""
            aria-hidden
            width={269}
            height={234}
            className="h-14 w-auto opacity-95 sm:h-16"
          />
        </Link>

        {/* Tagline */}
        <p className="mt-6 font-display text-[13.5px] sm:text-[14px] tracking-[0.2em] uppercase text-cream/90 text-center">
          {SITE.tagline} · Since {SITE.since}
        </p>

        <OrnamentDivider width="sm" className="mt-6 mb-10 text-cream/45" />

        {/* Contact Block: LHS to extreme left, MID to mid center, RHS to extreme right */}
        <div className="grid w-full gap-x-8 sm:gap-x-12 gap-y-10 grid-cols-1 md:grid-cols-3 items-start justify-between">
          {/* Column 1: Extreme Left */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="font-display text-[13px] sm:text-[13.5px] tracking-[0.22em] uppercase text-cream/70">
              Address
            </h2>
            <ul className="mt-4 space-y-2.5">
              {CONTACT.addresses.map((line) => (
                <li key={line} className="font-body text-[14.5px] sm:text-[15px] leading-relaxed text-cream/90">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Exact Mid Center */}
          <div className="flex flex-col items-center text-center">
            <h2 className="font-display text-[13px] sm:text-[13.5px] tracking-[0.22em] uppercase text-cream/70 text-center">
              Reach us
            </h2>
            <ul className="mt-4 space-y-2.5 text-center">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="font-body text-[14.5px] sm:text-[15px] text-cream/90 transition-colors hover:text-gold text-center block"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="font-body text-[14.5px] sm:text-[15px] text-cream/90 text-center">
                Facebook / Instagram
                <span className="mt-1 block text-cream/75 text-[13.5px] text-center">{CONTACT.social}</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Extreme Right */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <h2 className="font-display text-[13px] sm:text-[13.5px] tracking-[0.22em] uppercase text-cream/70">
              Speak to us
            </h2>
            <ul className="mt-4 space-y-2.5">
              {CONTACT.people.map((person) => (
                <li
                  key={person.phone}
                  className="font-body text-[14.5px] sm:text-[15px] whitespace-nowrap text-cream/90"
                >
                  {person.title} {person.name}
                  {" · "}
                  <a
                    href={`tel:${person.phone.replace(/\s/g, "")}`}
                    className="tabular-nums transition-colors hover:text-gold"
                  >
                    {person.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Link */}
        <Link
          href="/contact"
          className="mt-12 inline-flex items-center justify-center font-display text-[13.5px] sm:text-[14px] tracking-[0.22em] uppercase text-cream transition-colors hover:text-gold text-center"
          style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.6)" }}
        >
          Let&apos;s Connect Today
        </Link>
      </div>

      {/* Wordmark cut into the base */}
      <div className="relative flex flex-col items-center px-6 pb-7 sm:px-10 sm:pb-9 text-center">
        <p
          aria-hidden
          className="pm-footer-word text-center font-display whitespace-nowrap select-none"
          style={{
            fontSize: "clamp(2rem, 10.3vw, 16rem)",
            lineHeight: 1,
            letterSpacing: "-0.005em",
            marginBottom: "0",
            backgroundImage:
              "linear-gradient(180deg, rgba(254,244,218,1) 0%, rgba(254,244,218,0.95) 45%, rgba(254,244,218,0.87) 75%, rgba(254,244,218,0.82) 100%)",
            backgroundRepeat: "no-repeat",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          A PARAMOUNT
        </p>
        <p
          aria-hidden
          className="mt-2 sm:mt-3 font-display uppercase tracking-[0.38em] text-center select-none"
          style={{
            fontSize: "clamp(0.85rem, 2.5vw, 3.2rem)",
            lineHeight: 1.1,
            backgroundImage:
              "linear-gradient(180deg, rgba(254,244,218,0.92) 0%, rgba(254,244,218,0.75) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          ENGINEERING WORKS
        </p>
      </div>
    </footer>
  );
}
