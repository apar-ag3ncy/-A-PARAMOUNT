import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByFamily, productParams } from "@/lib/data";
import { FAMILIES } from "@/lib/constants";
import { galleryFor } from "@/lib/galleries";
import CategoryGallery from "@/components/products/CategoryGallery";
import ProductGalleryTabs from "@/components/products/ProductGalleryTabs";
import RelatedProducts from "@/components/products/RelatedProducts";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import MagneticButton from "@/components/animations/MagneticButton";

export function generateStaticParams() {
  return productParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.title ?? "Product", description: product?.blurb };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.family !== category) notFound();

  const family = FAMILIES.find((f) => f.slug === product.family);
  const materials = product.variants.length ? product.variants : ["Standard"];
  const gallery = galleryFor(slug);
  const related = (await getProductsByFamily(product.family))
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.blurb,
    brand: { "@type": "Brand", name: "A Paramount Engineering Works" },
    category: family?.title,
    ...(product.variants.length
      ? { material: product.variants.join(", ") }
      : {}),
  };

  // `showVariants` prints the finish text-pills. The gallery branch hides them
  // because the coin buttons already present every finish; the non-photographed
  // branch shows them (its layout has no coins).
  const renderIntro = (showVariants: boolean) => (
    <>
      <p className="font-display text-[11px] tracking-[0.24em] text-olive uppercase">
        {family?.title}
      </p>
      <SplitTextReveal
        as="h1"
        by="words"
        className="mt-3 font-display text-4xl leading-[1.08] font-light text-olive-deep sm:text-6xl"
      >
        {product.title}
      </SplitTextReveal>
      {product.blurb && (
        <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-espresso/80">
          {product.blurb}
        </p>
      )}
      {showVariants && product.variants.length > 0 && (
        <div className="mt-8">
          <p className="font-display text-[11px] tracking-[0.2em] text-olive uppercase">
            Available in
          </p>
          <ul className="mt-3 flex flex-wrap gap-2.5">
            {product.variants.map((v) => (
              <li
                key={v}
                className="inline-flex items-center gap-2 rounded-full border border-olive/25 bg-cream-deep/40 px-3.5 py-1.5 font-body text-[13px] text-olive-deep/90 transition-colors duration-300 hover:border-olive/60 hover:bg-cream-deep/70"
              >
                <span className="size-1.5 rounded-full bg-gold" />
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );

  return (
    <article className="mx-auto max-w-7xl px-6 pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-10 font-display text-[11px] tracking-[0.16em] text-olive/70 uppercase">
        <Link href="/products" className="hover:text-olive">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${product.family}`} className="hover:text-olive">
          {family?.title}
        </Link>
      </nav>

      {gallery ? (
        // Gallery-forward: compact intro, then the full material-filtered grid
        // with a fullscreen viewer (the client's per-category photo folders).
        <>
          <header className="mb-14 max-w-3xl">{renderIntro(false)}</header>
          <CategoryGallery
            title={product.title}
            gallery={gallery}
            variants={product.variants}
          />
          <div className="mt-14">
            <MagneticButton href="/contact">
              Enquire about {product.title}
            </MagneticButton>
            <p className="mt-6 max-w-md font-body text-sm text-espresso/60">
              Every piece is handcrafted to order — sized to your derasar and to
              religious norms.
            </p>
          </div>
        </>
      ) : (
        // No photography yet: keep the two-column layout with the empty frame.
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ProductGalleryTabs
            title={product.title}
            materials={materials}
            ratio={product.ratio}
            image={product.heroImage}
            src={product.image}
          />
          <div className="lg:pt-6">
            {renderIntro(true)}
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
      )}

      <RelatedProducts items={related} familySlug={product.family} />
    </article>
  );
}
