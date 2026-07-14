import Link from "next/link";
import Image from "next/image";
import { SITE, CONTACT, FAMILIES } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import ArchMark from "@/components/ui/ArchMark";
import Wordmark from "@/components/ui/Wordmark";

/**
 * Footer — the deck's closing spread, reimagined, and the last room of the temple.
 *
 * The site opens by scrolling a pair of marble doors open and walking INSIDE a
 * mandir; it now CLOSES in the same colonnade. The carved pillars (the very plate
 * the hero's camera drifts down) are sunk deep into the velvet — a heavy scrim
 * over a low-opacity photo — so they read as ghosted architecture, a hall you are
 * standing in, never a photograph pasted behind text. The vanishing point of that
 * corridor sits dead centre, so the brand lockup lands exactly in its light, with
 * the pillars flanking it like a colonnade.
 *
 * The brand's own elements are layered over that, all deliberately DILUTED so they
 * fuse rather than compete: the deck's back-page damask (from 27June.pdf p118 →
 * /brand/deck-damask.webp), a warm gold bloom falling from the top edge (the same
 * light the doors opened onto), and a vast, ghosted arch-"A" monogram — so the
 * site ends on the same reverent back-cover the printed profile does.
 *
 * The emotional centre is the deck's own closing line (p30). Contact is pared to
 * the essentials — the full directory lives on /contact — so the panel reads as a
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
      {/* ---- the carved colonnade, sunk into the velvet ---- */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/interior/corridor-2560.webp"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-[0.34]"
        />
        {/* Velvet drowns the marble. Lightest at top-centre — where the gold bloom
            falls and the corridor's own vanishing point glows — and deepening to
            near-black at the edges and the base, so the pillars emerge out of the
            dark and the colophon rows below stay clean. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(115% 85% at 50% 6%, rgba(74,68,40,0.62) 0%, rgba(46,35,19,0.82) 38%, rgba(35,27,14,0.92) 70%, rgba(30,23,12,0.96) 100%)",
          }}
        />
        {/* and a straight fade to the deepest velvet at the very bottom, so the
            baseline rule and copyright never sit on a busy carving */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(to bottom, rgba(30,23,12,0) 0%, rgba(30,23,12,0.72) 55%, rgba(30,23,12,0.94) 100%)",
          }}
        />
      </div>

      {/* the deck's own back-page damask, full-bleed and faint — pulled back now
          that the pillars carry the texture, so the two never fight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.07] mix-blend-screen"
        style={{ backgroundImage: "url(/brand/deck-damask.webp)" }}
      />
      {/* warm gold bloom from the top edge — the light the doors opened onto,
          falling INTO the colonnade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, rgb(var(--gold-rgb) / 0.26) 0%, rgb(var(--gold-rgb) / 0.08) 42%, transparent 74%)",
        }}
      />
      {/* a vast, ghosted arch-A monogram — the printed back cover's grandeur,
          hanging in the corridor's light */}
      <ArchMark
        className="pointer-events-none absolute top-[42%] left-1/2 h-[520px] w-auto -translate-x-1/2 -translate-y-1/2 text-gold opacity-[0.06]"
      />
      {/* fine gold top rule */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--color-gold) 53%, transparent), transparent)" }}
      />

      {/* ---- centre: the closing line + brand lockup ---- */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center px-6 pt-24 pb-16 text-center sm:pt-28">
        <p className="pm-eyebrow mb-9 font-display text-pista">
          {SITE.name} · Est. {SITE.since}
        </p>

        {/* deck p30 — the emotional centre. Set in Inter (the brand's only
            lowercase face; Storica is caps-only), light italic, so it reads as a
            soft sentence-case murmur rather than a shout. */}
        <p className="pm-h2 max-w-3xl font-body font-light text-cream/95 italic">
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
            className="pm-h3 mt-5 text-cream opacity-95"
          />
          <p className="pm-body mt-4 font-body text-cream/75 italic">
            {SITE.tagline}
          </p>
        </div>
      </div>

      {/* ---- slim colophon: collections · contact ---- */}
      <div className="relative z-10 border-t border-cream/10 px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 lg:flex-row lg:items-start">
          {/* collections */}
          <nav aria-label="Collections" className="text-center lg:text-left">
            <h3 className="pm-label mb-3 font-display text-gold">
              Collections
            </h3>
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
            <h3 className="pm-label mb-3 font-display text-gold">
              Enquiries
            </h3>
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
      <div className="relative z-10 border-t border-cream/10 px-6 py-5">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-1.5 text-center sm:flex-row">
          <p className="pm-micro font-display text-cream/45">
            © {year} {SITE.name}
          </p>
          <p
            className="pm-micro font-display"
            style={{ color: "color-mix(in srgb, var(--color-pista) 60%, transparent)" }}
          >
            Crafted in Mumbai · Since {SITE.since}
          </p>
        </div>
      </div>
    </footer>
  );
}
