import Link from "next/link";
import Image from "next/image";
import FooterHeaderHold from "@/components/layout/FooterHeaderHold";
import { SITE, CONTACT } from "@/lib/constants";

/**
 * Footer — a full-VIEWPORT architectural plate with the wordmark cut into the base.
 *
 * The plate is the client's own Derasar entrance (their brass-studded door in
 * carved Makrana marble) — an existing asset, not a new render. It is heavily
 * scrimmed: white marble is far too bright to carry cream type, so a top-down
 * ramp plus a base pool sink it to a dark ground.
 *
 * Everything above the wordmark is CENTRED on one axis, and the arch-"A" is
 * centred to match how the lockup sits on the landing page (`.hv-brand` is
 * `flex-col items-center text-center` there) rather than tucked into a corner.
 *
 * Content is deliberately thin: the mark, one caps line, the three things a
 * visitor actually needs to reach us, and the CTA. The Menu and Collections
 * columns were removed — the header already carries that navigation, and
 * repeating it here made the panel read as a link dump.
 *
 * Type is brand-only: Storica (font-display) for the wordmark, the caps line and
 * the CTA; Inter (font-body) for the contact lines. No third face.
 *
 * It stands a FULL SCREEN tall (`min-h-svh`, not a fixed `h-screen` — content must
 * never be cut on a short phone) and the header is lifted away while it is on
 * screen (`FooterHeaderHold`), so the closing plate is the whole frame with no
 * chrome parked over it. The column above the wordmark therefore centres itself
 * in whatever height is left rather than hanging off a fixed top padding.
 */
export default function Footer() {
  return (
    <footer className="pm-footer relative isolate flex min-h-svh flex-col overflow-hidden bg-[#171208] text-cream">
      <FooterHeaderHold />
      {/* ---- the plate ----
          A CSS background, not next/image, on purpose: it is purely decorative
          (aria-hidden), the two tiers are already baked to the exact sizes we
          need, so the optimizer adds nothing — and a background paints with the
          element instead of arriving late behind a lazy observer, which for the
          footer's defining visual would read as a broken pop-in. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat bg-[url('/footer/derasar-1280.webp')] lg:bg-[url('/footer/derasar-2400.webp')]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(15,11,5,0.86) 0%, rgba(17,13,6,0.72) 34%, rgba(18,14,7,0.80) 62%, rgba(12,9,4,0.94) 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-14 text-center sm:py-16">
        {/* the mark — centred, as it is on the landing page */}
        <Link href="/" aria-label={SITE.name}>
          <Image
            src="/brand/a-mark-white.png"
            alt=""
            aria-hidden
            width={269}
            height={234}
            className="h-16 w-auto opacity-95 sm:h-20"
          />
        </Link>

        <p className="pm-label mt-7 font-display text-cream/90">
          {SITE.tagline} · Since {SITE.since}
        </p>

        <span aria-hidden className="mt-8 mb-8 block h-px w-16 bg-cream/25" />

        <ul className="space-y-2.5">
          <li>
            <a
              href={`mailto:${CONTACT.email}`}
              className="pm-small font-body text-cream/85 transition-colors hover:text-gold"
            >
              {CONTACT.email}
            </a>
          </li>
          <li>
            <a
              href={`tel:${CONTACT.people[0].phone.replace(/\s/g, "")}`}
              className="pm-small font-body text-cream/85 transition-colors hover:text-gold"
            >
              {CONTACT.people[0].phone}
            </a>
          </li>
          {/* /75 not /60: against the brightest marble under this row the dimmer
              value measured 4.40:1, just shy of the 4.5:1 bar. */}
          <li className="pm-small font-body text-cream/75">Sakinaka, Mumbai</li>
        </ul>

        <Link
          href="/contact"
          className="pm-label mt-9 inline-flex items-center rounded-full border border-cream/35 px-6 py-2.5 font-display text-cream transition-colors hover:border-gold hover:text-gold"
        >
          Send a message
        </Link>
      </div>

      {/* ---- the name, cut into the base ----
          Deliberately OUTSIDE the max-w container so it spans the plate edge to
          edge; inside it, it only reached ~85% of the width. Set in Storica and
          sized off the VIEWPORT so it always fills the span. `background-clip:
          text` fades it downward into the scrim, and the negative bottom margin
          lets the footer's overflow crop the baseline. */}
      {/* No top margin: the column above is `flex-1`, so it already owns every
          pixel down to this line. */}
      <div className="relative px-4 sm:px-6">
        <p
          aria-hidden
          className="pm-footer-word font-display whitespace-nowrap select-none"
          style={{
            // 11.6vw, NOT 18vw. Storica typesets "A PARAMOUNT" at ~819px of width
            // per 100px of font-size, so 18vw ran 1884px wide on a 1280px screen —
            // half a viewport of overflow, clipped off the right edge. 11.6vw lands
            // the word at ~95% of the viewport at every width.
            fontSize: "clamp(2.4rem, 11.6vw, 18rem)",
            lineHeight: 0.8,
            letterSpacing: "-0.005em",
            // POSITIVE, deliberately. `line-height: 0.8` makes the line box
            // shorter than the glyphs, so the letters already spill ~0.085em past
            // their own box before any margin. At -0.05em that compounded and
            // buried 16% of the letter height below the fold. +0.04em lifts it so
            // only ~5% is cropped — the reference's "cut into the base" feel
            // without the name looking like it fell off the page.
            marginBottom: "0.04em",
            backgroundImage:
              "linear-gradient(180deg, rgba(254,244,218,0.97) 0%, rgba(254,244,218,0.66) 46%, rgba(254,244,218,0.16) 76%, rgba(254,244,218,0) 96%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          A PARAMOUNT
        </p>
      </div>
    </footer>
  );
}
