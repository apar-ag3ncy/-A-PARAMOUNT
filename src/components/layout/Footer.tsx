import Link from "next/link";
import { SITE, CONTACT, FAMILIES } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mt-24 bg-olive px-6 py-16 text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg tracking-[0.15em]">{SITE.shortName}</p>
          <p className="mt-3 max-w-xs font-serif text-cream/80 italic">{SITE.tagline}</p>
          <p className="mt-2 text-sm text-cream/60">
            Since {SITE.since} · Mumbai
          </p>
        </div>
        <div>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.18em] text-cream/70">
            Collections
          </p>
          <ul className="space-y-1.5 text-sm text-cream/85">
            {FAMILIES.map((f) => (
              <li key={f.slug}>
                <Link href={`/products/${f.slug}`} className="hover:text-cream">
                  {f.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 font-display text-xs uppercase tracking-[0.18em] text-cream/70">
            Enquiries
          </p>
          <a
            href={`mailto:${CONTACT.email}`}
            className="text-sm text-cream/85 hover:text-cream"
          >
            {CONTACT.email}
          </a>
          <p className="mt-2 text-sm text-cream/60">{CONTACT.addresses[0]}</p>
        </div>
      </div>
    </footer>
  );
}
