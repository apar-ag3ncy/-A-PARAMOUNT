import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import type { CatalogCategory } from "@/lib/catalog";
import SectionHeading from "@/components/ui/SectionHeading";

interface Props {
  items: CatalogCategory[];
  familySlug: string;
}

/** Related pieces from the same family (PARAMOUNT_SCROLL_UI_PROMPT.md §3). */
export default function RelatedProducts({ items, familySlug }: Props) {
  if (!items.length) return null;
  return (
    <section className="mt-16 border-t border-olive/15 pt-10 sm:mt-28 sm:pt-16">
      <SectionHeading title="More from this collection" className="mb-10" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map((p) => (
          <Link key={p.slug} href={`/products/${familySlug}/${p.slug}`} className="group">
            {/* `src` = the local /public photo, `image` = Sanity. Passing only
                `image` showed the empty frame for all 30 photographed products. */}
            <AssetFrame
              image={p.heroImage}
              src={p.image}
              alt={p.title}
              fit={p.image ? "contain" : "cover"}
              ratio="3/4"
              caption={p.title}
              frameClassName="rounded-t-full transition-colors duration-[400ms] group-hover:border-olive"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
