import Link from "next/link";
import Image from "next/image";
import ArchMark from "@/components/ui/ArchMark";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import type { CatalogCategory } from "@/lib/catalog";

interface Props {
  items: CatalogCategory[];
  familySlug: string;
}

/**
 * Related pieces — dark editorial mini-cards matching the collection grid: a
 * framed image (piece contained, never cropped; dark monogram tile when there is
 * no photo) and the name, centred, on the dark product page.
 */
export default function RelatedProducts({ items, familySlug }: Props) {
  if (!items.length) return null;
  return (
    <section className="mt-20 border-t border-gold/12 pt-14 text-center sm:mt-28">
      <p className="pm-eyebrow font-body text-gold/70">More from this collection</p>
      <OrnamentDivider className="mx-auto mt-4 text-gold/45" />
      <div className="mt-10 grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-4">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/products/${familySlug}/${p.slug}`}
            className="group flex flex-col text-center"
          >
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-[1rem] ring-1 ring-cream/10"
              style={{ background: "#ECE4D3" }}
            >
              {p.image ? (
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(min-width:768px) 22vw, 45vw"
                  className="object-contain"
                />
              ) : (
                <div
                  className="grid h-full place-items-center"
                  style={{
                    background: "linear-gradient(180deg, #2F2716 0%, #201808 100%)",
                  }}
                >
                  <ArchMark className="h-10 w-auto text-gold/25" />
                </div>
              )}
            </div>
            <h3 className="pm-h3 mt-3.5 font-display text-cream transition-colors duration-300 group-hover:text-gold">
              {p.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
