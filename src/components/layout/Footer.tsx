import Link from "next/link";
import Image from "next/image";
import { SITE, CONTACT, FAMILIES } from "@/lib/constants";
import Wordmark from "@/components/ui/Wordmark";

/**
 * Footer — a plain, compact colophon on flat brand velvet.
 *
 * This deliberately carries NO background art. It used to stack seven decorative
 * layers (the mandir corridor photo under a velvet scrim, a bottom fade, the
 * deck's back-page damask, a gold bloom, a 520px ghosted arch-"A", and a gradient
 * hairline) and stood 949px tall — taller than a laptop viewport, so it ran off
 * the screen. Client asked for it plain in the brand colour and sized to fit, so
 * the ground is now ONE flat velvet fill and the content is pared to what a
 * colophon actually needs: the closing line, the lockup, collections, enquiries,
 * copyright.
 *
 * Removed with it: the "· Est. 1968" eyebrow (the wordmark already says the name
 * and the baseline already says the year), the ornament divider, and the
 * "Crafted in Mumbai · Since 1968" baseline note (the address line and the
 * copyright covered it twice over).
 *
 * Text stays cream/gold/pista — the house rule for type on dark velvet.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="pm-footer relative text-cream"
      style={{ background: "var(--color-velvet-400)" }}
    >
      {/* ---- centre: the closing line + brand lockup ---- */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-12 text-center sm:py-14">
        {/* deck p30 — the emotional centre. Set in Inter (the brand's only
            lowercase face; Storica is caps-only), light, so it reads as a soft
            sentence-case murmur rather than a shout. */}
        <p className="pm-h3 max-w-2xl font-body font-light text-cream/95">
          Shaped by devotion, destined to inspire generations.
        </p>

        {/* brand lockup */}
        <div className="mt-8 flex flex-col items-center">
          <Image
            src="/brand/a-mark-white.png"
            alt=""
            aria-hidden
            width={269}
            height={234}
            className="h-11 w-auto opacity-90 sm:h-12"
          />
          <Wordmark ariaLabel={SITE.name} className="pm-h3 mt-4 text-cream opacity-95" />
          <p className="pm-small mt-3 font-body text-cream/75">{SITE.tagline}</p>
        </div>
      </div>

      {/* ---- slim colophon: collections · enquiries ---- */}
      <div className="border-t border-cream/10 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-7 lg:flex-row lg:items-start">
          {/* collections */}
          <nav aria-label="Collections" className="text-center lg:text-left">
            <h3 className="pm-label mb-2.5 font-display text-gold">Collections</h3>
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {FAMILIES.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/products/${f.slug}`}
                    className="pm-small font-body text-cream/70 transition-colors hover:text-gold"
                  >
                    {f.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact essentials — full directory on /contact */}
          <div className="text-center lg:text-right">
            <h3 className="pm-label mb-2.5 font-display text-gold">Enquiries</h3>
            <div className="pm-small space-y-1.5 font-body text-cream/70">
              <p>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="underline-offset-4 transition-colors hover:text-gold hover:underline"
                >
                  {CONTACT.email}
                </a>
              </p>
              <p>
                <a
                  href={`tel:${CONTACT.people[0].phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-gold"
                >
                  {CONTACT.people[0].phone}
                </a>
                <span className="mx-2 text-cream/30">·</span>
                <Link href="/contact" className="transition-colors hover:text-gold">
                  Full directory
                </Link>
              </p>
              <p className="text-cream/50">Sakinaka, Andheri East · Mumbai, India</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- baseline ---- */}
      <div className="border-t border-cream/10 px-6 py-4 text-center">
        <p className="pm-micro font-display text-cream/45">
          © {year} {SITE.name}
        </p>
      </div>
    </footer>
  );
}
