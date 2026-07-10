import Link from "next/link";
import Image from "next/image";
import { SITE, CONTACT, FAMILIES } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import ArchMark from "@/components/ui/ArchMark";
import Wordmark from "@/components/ui/Wordmark";

/**
 * Footer — the deck's closing spread, reimagined. A full-height velvet-olive
 * panel carrying the brand's own back-page damask (extracted from 27June.pdf
 * p118 → /brand/deck-damask.webp) and a vast, ghosted arch-"A" monogram, so the
 * site ends on the same reverent back-cover the printed profile does. The
 * emotional centre is the deck's own closing line (p30). Contact is pared to the
 * essentials — the full directory lives on /contact — so the panel reads as a
 * considered colophon, not a link dump.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="pm-footer relative overflow-hidden text-cream"
      style={{
        background:
          "radial-gradient(125% 90% at 50% 0%, var(--color-velvet-100) 0%, var(--color-velvet-200) 42%, var(--color-velvet-300) 78%, var(--color-velvet-400) 100%)",
      }}
    >
      {/* the deck's own back-page damask, full-bleed and faint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.12] mix-blend-screen"
        style={{ backgroundImage: "url(/brand/deck-damask.webp)" }}
      />
      {/* warm gold bloom from the top edge — the light the doors opened onto */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, rgb(var(--gold-rgb) / 0.22) 0%, rgb(var(--gold-rgb) / 0.06) 42%, transparent 74%)",
        }}
      />
      {/* a vast, ghosted arch-A monogram — the printed back cover's grandeur */}
      <ArchMark
        className="pointer-events-none absolute top-[42%] left-1/2 h-[520px] w-auto -translate-x-1/2 -translate-y-1/2 text-gold opacity-[0.05]"
      />
      {/* fine gold top rule */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-gold) 53%, transparent), transparent)" }}
      />

      {/* ---- centre: the closing line + brand lockup ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-24 pb-16 text-center sm:pt-28">
        <p className="mb-9 font-display text-[11px] tracking-[0.4em] text-pista uppercase">
          {SITE.name} · Est. {SITE.since}
        </p>

        {/* deck p30 — the emotional centre. Set in Inter (the brand's only
            lowercase face; Storica is caps-only), light italic, so it reads as a
            soft sentence-case murmur rather than a shout. */}
        <p className="max-w-3xl font-body text-[clamp(1.6rem,4vw,2.9rem)] leading-[1.28] font-light text-cream/95 italic">
          Shaped by devotion, destined to inspire generations.
        </p>

        <OrnamentDivider width="lg" className="mt-11 text-gold" />

        {/* brand lockup */}
        <div className="mt-11 flex flex-col items-center">
          <Image
            src="/brand/a-mark-white.png"
            alt=""
            aria-hidden
            width={269}
            height={234}
            className="h-12 w-auto opacity-90 sm:h-14"
          />
          <Wordmark
            ariaLabel={SITE.name}
            className="mt-5 text-[clamp(24px,4.5vw,36px)] text-cream opacity-95"
          />
          <p className="mt-4 font-body text-base text-cream/75 italic">
            {SITE.tagline}
          </p>
        </div>
      </div>

      {/* ---- slim colophon: collections · contact ---- */}
      <div className="relative z-10 border-t border-cream/10 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 lg:flex-row lg:items-start">
          {/* collections */}
          <nav aria-label="Collections" className="text-center lg:text-left">
            <h3 className="mb-3 font-display text-[10px] tracking-[0.3em] text-gold uppercase">
              Collections
            </h3>
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {FAMILIES.map((f) => (
                <li key={f.slug}>
                  <Link
                    href={`/products/${f.slug}`}
                    className="font-body text-[13px] text-cream/70 transition-colors hover:text-gold"
                  >
                    {f.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact essentials — full directory on /contact */}
          <div className="text-center lg:text-right">
            <h3 className="mb-3 font-display text-[10px] tracking-[0.3em] text-gold uppercase">
              Enquiries
            </h3>
            <div className="space-y-1.5 font-body text-[13px] text-cream/70">
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
      <div className="relative z-10 border-t border-cream/10 px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-1.5 text-center sm:flex-row">
          <p className="font-display text-[10px] tracking-[0.24em] text-cream/45 uppercase">
            © {year} {SITE.name}
          </p>
          <p
            className="font-display text-[10px] tracking-[0.24em] uppercase"
            style={{ color: "color-mix(in srgb, var(--color-pista) 60%, transparent)" }}
          >
            Crafted in Mumbai · Since {SITE.since}
          </p>
        </div>
      </div>
    </footer>
  );
}
