import Link from "next/link";
import MasonryGrid from "@/components/products/MasonryGrid";
import MasonryItem from "@/components/products/MasonryItem";
import ScrollReveal from "@/components/animations/ScrollReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import { CATEGORIES } from "@/lib/catalog";
import { productAspect } from "@/lib/productImageDims";

/**
 * "Selected works" — a curated masonry of the client's real product photography
 * on the home page, drawn straight from the catalog so it reads exactly like
 * the collections grid: each frame adopts its photo's ratio and fills it with
 * no crop. Gives the landing journey the images it was missing before the
 * visitor ever reaches a collection.
 */
const SELECTED = [
  "rath",
  "doors",
  "mandir",
  "silver-kothi",
  "chattar",
  "puja-table",
  "dhwajadand",
  "divistand",
  "wooden-carved-murti",
] as const;

export default function FeaturedGallery() {
  const items = SELECTED.map((slug) =>
    CATEGORIES.find((c) => c.slug === slug),
  ).filter((c): c is NonNullable<typeof c> => Boolean(c?.image));

  if (!items.length) return null;

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-16 sm:py-28">
      <ScrollReveal className="mb-14 flex justify-center">
        <SectionHeading eyebrow="Selected works" title="From the workshop floor" />
      </ScrollReveal>

      <MasonryGrid>
        {items.map((c, i) => {
          const aspect = productAspect(c.image);
          const isPortrait = aspect != null ? aspect < 0.82 : false;
          return (
            <MasonryItem
              key={c.slug}
              caption={c.title}
              ratio={c.ratio}
              src={c.image}
              href={`/products/${c.family}/${c.slug}`}
              material={c.variants?.[0]}
              depth={i % 2 ? 1.04 : 0.96}
              arch={i % 3 === 0 && isPortrait}
            />
          );
        })}
      </MasonryGrid>

      <ScrollReveal className="mt-14 flex justify-center">
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 font-display text-[11px] tracking-[0.24em] text-olive-deep uppercase"
        >
          <span className="bg-gradient-to-r from-olive-deep to-olive-deep bg-[length:100%_1px] bg-[position:left_bottom] bg-no-repeat pb-1 transition-[background-size] duration-500 ease-out group-hover:bg-[length:0_1px]">
            View all collections
          </span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </ScrollReveal>
    </section>
  );
}
