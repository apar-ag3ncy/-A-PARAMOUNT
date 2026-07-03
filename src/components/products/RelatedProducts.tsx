import Link from "next/link";
import AssetFrame from "@/components/ui/AssetFrame";
import type { CatalogCategory } from "@/lib/catalog";

interface Props {
  items: CatalogCategory[];
  familySlug: string;
}

/** Related pieces from the same family (PARAMOUNT_SCROLL_UI_PROMPT.md §3). */
export default function RelatedProducts({ items, familySlug }: Props) {
  if (!items.length) return null;
  return (
    <section className="mt-28 border-t border-olive/15 pt-16">
      <h2 className="mb-10 text-center font-display text-2xl font-light text-olive-deep">
        More from this collection
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {items.map((p) => (
          <Link key={p.slug} href={`/products/${familySlug}/${p.slug}`} className="group">
            <AssetFrame
              image={p.heroImage}
              ratio="3/4"
              caption={p.title}
              frameClassName="transition-colors duration-[400ms] group-hover:border-olive"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
