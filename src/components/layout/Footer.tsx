import Link from "next/link";
import Image from "next/image";
import { SITE, CONTACT, FAMILIES } from "@/lib/constants";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import BrandDamask from "@/components/ui/BrandDamask";

/**
 * Footer — the deck's closing/contact pages: a centered cream contact block
 * (p117) with the arch-A mark, tracked-caps wordmark in Spectral, ornament
 * divider and Inter contact lines, over a faint olive damask band along the
 * bottom edge (the p118–120 damask back-page nod). Olive text on cream.
 */
export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-olive/20 bg-cream px-6 pt-16 pb-28 text-olive">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* brand column — mark + tracked-caps wordmark (deck p117) */}
        <Image
          src="/brand/a-mark-olive.png"
          alt=""
          aria-hidden
          width={269}
          height={234}
          className="h-14 w-auto"
        />
        <p className="mt-4 font-display text-sm tracking-[0.3em] text-heading-brown uppercase sm:text-base">
          A Paramount Engineering Works
        </p>
        <p className="mt-2 font-serif text-lg text-olive-deep italic">
          {SITE.tagline}
        </p>
        <OrnamentDivider width="md" className="mt-5 text-olive/60" />

        {/* centered contact block — Inter, like the deck's CONTACT US page */}
        <address className="mt-6 space-y-1.5 font-body text-sm not-italic text-olive-deep/90">
          {CONTACT.addresses.map((addr) => (
            <p key={addr}>{addr}</p>
          ))}
          <p>
            <a
              href={`mailto:${CONTACT.email}`}
              className="transition-colors hover:text-heading-brown"
            >
              {CONTACT.email}
            </a>
          </p>
          {CONTACT.people.map((person) => (
            <p key={person.phone}>
              {person.name} ·{" "}
              <a
                href={`tel:${person.phone.replace(/\s/g, "")}`}
                className="transition-colors hover:text-heading-brown"
              >
                {person.phone}
              </a>
            </p>
          ))}
        </address>

        {/* slim tracked-caps collections row — all existing links preserved */}
        <nav aria-label="Collections" className="mt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {FAMILIES.map((f) => (
              <li key={f.slug}>
                <Link
                  href={`/products/${f.slug}`}
                  className="font-display text-[11px] tracking-[0.18em] uppercase transition-colors hover:text-heading-brown"
                >
                  {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* legal line */}
        <p className="mt-8 font-display text-[10px] tracking-[0.18em] text-olive/70 uppercase">
          © {new Date().getFullYear()} {SITE.name} · Since {SITE.since} · Mumbai
        </p>
      </div>

      {/* faint damask band along the bottom edge — deck back pages (p118) */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-20 text-olive">
        <BrandDamask opacity={0.08} />
      </div>
    </footer>
  );
}
