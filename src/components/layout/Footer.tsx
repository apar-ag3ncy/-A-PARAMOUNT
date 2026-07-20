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

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:py-12">
        {/* the mark — centred, as it is on the landing page */}
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

        <p className="pm-label mt-6 font-display text-cream/90">
          {SITE.tagline} · Since {SITE.since}
        </p>

        <span aria-hidden className="mt-6 mb-8 block h-px w-16 bg-cream/25" />

        {/* The full contact block. THREE columns rather than one stacked list:
            this is ~12 lines of detail, and centred in a single column it doubled
            the footer's height and pushed the wordmark off the screen. The address
            column is given the extra width (1.4fr) because those two lines are by
            far the longest and would otherwise wrap to four lines each while the
            others sat half empty. Stacks to one column on a phone. */}
        <div className="grid w-full gap-x-10 gap-y-8 text-center sm:grid-cols-2 lg:grid-cols-[1.2fr_0.85fr_1.35fr] lg:text-left">
          <div>
            <h2 className="pm-label font-display text-cream/60">Address</h2>
            <ul className="mt-3 space-y-2">
              {CONTACT.addresses.map((line) => (
                /* /85 not /60: against the brightest marble under this block the
                   dimmer value measured 4.40:1, just shy of the 4.5:1 bar. */
                <li key={line} className="pm-small font-body text-cream/85">
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="pm-label font-display text-cream/60">Reach us</h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="pm-small font-body text-cream/85 transition-colors hover:text-gold"
                >
                  {CONTACT.email}
                </a>
              </li>
              <li className="pm-small font-body text-cream/85">
                Facebook / Instagram
                <span className="mt-1 block text-cream/70">{CONTACT.social}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="pm-label font-display text-cream/60">Speak to us</h2>
            <ul className="mt-3 space-y-2">
              {CONTACT.people.map((person) => (
                /* nowrap on the WHOLE row, not just the number. The longest line
                   ("Mrs. Yesha Zaveri Shah · +91 98707 41412") needs ~280px and the
                   column was 277px, so that one row alone broke between the name and
                   the number while the other three sat on one line. The column is
                   sized to hold it now; nowrap keeps it that way if the copy grows. */
                <li
                  key={person.phone}
                  className="pm-small font-body whitespace-nowrap text-cream/85"
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

        <Link
          href="/contact"
          className="pm-label mt-10 inline-flex items-center rounded-full border border-cream/35 px-6 py-2.5 font-display text-cream transition-colors hover:border-gold hover:text-gold"
        >
          Let&apos;s Connect Today
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
      <div className="relative px-6 pb-7 sm:px-10 sm:pb-9">
        <p
          aria-hidden
          className="pm-footer-word text-center font-display whitespace-nowrap select-none" /* text-center is REQUIRED now: the word no longer fills its box (it used to, at 96.8% of the viewport), so left-aligned it sat 40px from one edge and 177px from the other. */
          style={{
            // 10.3vw. Storica typesets "A PARAMOUNT" at ~819px of width per 100px of
            // font-size. 18vw once ran 1884px on a 1280px screen — half a viewport of
            // overflow. 11.6vw fixed the overflow but landed the word at 96.8% of the
            // viewport with only 24px of air each side: nothing was actually clipped,
            // but jammed hard against both edges it READ as cut off (client, twice).
            // 10.3vw lands it near 86%, which leaves a visible margin on both sides.
            fontSize: "clamp(2rem, 10.3vw, 16rem)",
            // 1, not 0.8. At 0.8 the line box (124px) was SHORTER than the glyphs
            // (~128px), so the letters spilled ~17px out of their own box and up into
            // the content column above — the word never occupied the space it was
            // given, which is what read as it not fitting vertically. At 1 the box
            // contains the ink, so the gaps above and below are the ones actually set
            // here rather than whatever the overflow happened to leave.
            lineHeight: 1,
            letterSpacing: "-0.005em",
            // ZERO. This used to be +0.04em to push the word down into the base for
            // the "cut into the base" gesture, but combined with `line-height: 0.8`
            // (which already lets the glyphs spill past their own box) it left only
            // ~22px under the baseline. The wrapper's pb now owns that spacing, so
            // the clearance is explicit and cannot be eaten by the line box.
            marginBottom: "0",
            // The fade must never eat the LETTERFORMS (client: the name was reading
            // as cut off). It was not a crop — measured, the glyphs clear the footer
            // edge by 21px — it was this gradient: the old ramp hit 0.16 at 76% and
            // 0 by 96%, and the ink baseline sits at ~89% of the box, so the bottom
            // of every letter was painted at ~6% alpha, i.e. invisible. The downward
            // fade is kept as the deck's "cut into the base" gesture, but it now
            // bottoms out at 0.82 — still a visible gradient, never a disappearance.
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
      </div>
    </footer>
  );
}
