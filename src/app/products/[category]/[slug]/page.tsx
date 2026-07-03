import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES, getCategory, categoriesByFamily } from "@/lib/catalog";
import { FAMILIES } from "@/lib/constants";
import ProductGalleryTabs from "@/components/products/ProductGalleryTabs";
import RelatedProducts from "@/components/products/RelatedProducts";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import MagneticButton from "@/components/animations/MagneticButton";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.family, slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getCategory(slug);
  return { title: product?.title ?? "Product", description: product?.blurb };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = getCategory(slug);
  if (!product || product.family !== category) notFound();

  const family = FAMILIES.find((f) => f.slug === product.family);
  const materials = product.variants.length ? product.variants : ["Standard"];
  const related = categoriesByFamily(product.family)
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  return (
    <article className="mx-auto max-w-7xl px-6 pt-24 pb-24">
      <nav className="mb-10 font-display text-[11px] tracking-[0.16em] text-olive/70 uppercase">
        <Link href="/products" className="hover:text-olive">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${product.family}`} className="hover:text-olive">
          {family?.title}
        </Link>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <ProductGalleryTabs
          title={product.title}
          materials={materials}
          ratio={product.ratio}
        />

        <div className="lg:pt-6">
          <SplitTextReveal
            as="h1"
            by="words"
            className="font-display text-4xl leading-[1.08] font-light text-olive-deep sm:text-6xl"
          >
            {product.title}
          </SplitTextReveal>

          {product.blurb && (
            <p className="mt-6 font-body text-lg leading-relaxed text-espresso/80">
              {product.blurb}
            </p>
          )}

          {product.variants.length > 0 && (
            <div className="mt-10">
              <p className="font-display text-[11px] tracking-[0.2em] text-olive uppercase">
                Available in
              </p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <li
                    key={v}
                    className="rounded-button border border-olive/30 px-3 py-1 font-body text-sm text-olive-deep"
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12">
            <MagneticButton href="/contact">
              Enquire about {product.title}
            </MagneticButton>
          </div>
          <p className="mt-6 max-w-md font-body text-sm text-espresso/60">
            Every piece is handcrafted to order — sized to your derasar and to
            religious norms.
          </p>
        </div>
      </div>

      <RelatedProducts items={related} familySlug={product.family} />
    </article>
  );
}
