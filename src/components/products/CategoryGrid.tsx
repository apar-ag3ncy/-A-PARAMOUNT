import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import { getProductInfo } from "@/lib/productInfo";
import type { CatalogCategory } from "@/lib/catalog";

/**
 * CategoryGrid — the family's pieces as a disciplined, ALIGNED editorial grid
 * (reference: the dark real-estate post templates, adapted to the brand's cream).
 * It replaced the 3D coverflow, which was a decorative carousel with no
 * scannable order. Every card is one module: a top metadata row (index · finish
 * count), a UNIFORM 4/5 image frame (the photo contained, never cropped — client
 * mandate — so it floats centred in an identical frame), then the name and a
 * two-line description clamped so every card's baselines align across the grid.
 * Even gutters, one shared column rhythm — the "aligned pattern" the client asked
 * for.
 */
export default function CategoryGrid({
  products,
  familySlug,
}: {
  products: CatalogCategory[];
  familySlug: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
      {products.map((p, i) => {
        const finishes = p.variants.length;
        const line = getProductInfo(p).overview;
        return (
          <Link
            key={p.slug}
            href={`/products/${familySlug}/${p.slug}`}
            className="group flex flex-col"
          >
            {/* metadata row — index + finishes, on a hairline (editorial catalog) */}
            <div className="flex items-center justify-between border-b border-olive/15 pb-2.5">
              <span className="pm-micro font-display tabular-nums tracking-[0.2em] text-olive/60">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pm-micro font-display tracking-[0.2em] text-olive/60 uppercase">
                {finishes
                  ? `${finishes} ${finishes === 1 ? "finish" : "finishes"}`
                  : "Made to order"}
              </span>
            </div>

            {/* one uniform frame per card — photo contained, never cropped */}
            <AssetFrame
              src={p.image}
              image={p.heroImage}
              ratio="4/5"
              crop
              fit="contain"
              showLabel={false}
              sizes="(min-width:1024px) 30vw, 45vw"
              className="mt-4 w-full"
              frameClassName="transition-[border-color,box-shadow] duration-300 group-hover:border-olive/45 group-hover:shadow-[0_28px_60px_-42px_rgba(46,35,19,0.5)]"
            />

            <h3 className="pm-h3 mt-4 font-display text-heading-brown transition-colors duration-300 group-hover:text-olive">
              {p.title}
            </h3>
            {line && (
              <p className="pm-small mt-1.5 line-clamp-2 font-body text-maroon/70">
                {line}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
