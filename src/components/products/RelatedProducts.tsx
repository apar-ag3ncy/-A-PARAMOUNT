import Link from "next/link";
import Image from "next/image";
import ArchMark from "@/components/ui/ArchMark";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import { productAspect } from "@/lib/productImageDims";
import type { CatalogCategory } from "@/lib/catalog";

interface Props {
  items: CatalogCategory[];
  familySlug: string;
}

const clampAr = (ar: number) => Math.min(1.4, Math.max(0.56, ar));

/**
 * Related pieces — editorial mini-cards matching the collection grid: a framed
 * image (piece contained, never cropped; a cream monogram tile when there is no
 * photo) and the name, centred, on the beige product page.
 */
export default function RelatedProducts({ items, familySlug }: Props) {
  if (!items.length) return null;
  return (
    <section className="mt-20 border-t border-olive/15 pt-14 text-center sm:mt-28">
      <p className="pm-eyebrow font-body text-olive/80">More from this collection</p>
      <OrnamentDivider className="mx-auto mt-4 text-olive/45" />
      <div className="mt-10 grid grid-cols-2 items-start gap-5 sm:gap-6 md:grid-cols-4">
        {items.map((p) => {
          const ar = productAspect(p.image);
          const frameAr = ar ? clampAr(ar) : 0.8;
          return (
          <Link
            key={p.slug}
            href={`/products/${familySlug}/${p.slug}`}
            className="group flex flex-col text-center"
          >
            <div
              className="relative overflow-hidden rounded-[1rem] ring-1 ring-olive/12"
              style={{ aspectRatio: String(frameAr), background: "#F3E7CE" }}
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
                    background: "linear-gradient(180deg, #F3E4C8 0%, #E9DBBE 100%)",
                  }}
                >
                  <ArchMark className="h-10 w-auto text-olive/20" />
                </div>
              )}
            </div>
            <h3 className="pm-h3 mt-3.5 font-display text-heading-brown transition-colors duration-300 group-hover:text-olive">
              {p.title}
            </h3>
          </Link>
          );
        })}
      </div>
    </section>
  );
}
