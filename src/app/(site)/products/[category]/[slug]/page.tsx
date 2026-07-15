import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByFamily, productParams } from "@/lib/data";
import { FAMILIES } from "@/lib/constants";
import { galleryFor } from "@/lib/galleries";
import { getProductInfo } from "@/lib/productInfo";
import CategoryGallery from "@/components/products/CategoryGallery";
import ProductGalleryTabs from "@/components/products/ProductGalleryTabs";
import RelatedProducts from "@/components/products/RelatedProducts";
import { ProductSpec, ProductAbout } from "@/components/products/ProductFacts";
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
  if (!product) return { title: "Product" };
  const info = getProductInfo(product);
  return { title: product.title, description: info.overview || product.blurb };
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
  const info = getProductInfo(product);
  const related = (await getProductsByFamily(product.family))
    .filter((p) => p.slug !== slug)
    .slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: info.overview || product.blurb,
    brand: { "@type": "Brand", name: "A Paramount Engineering Works" },
    category: family?.title,
    ...(product.variants.length
      ? { material: product.variants.join(", ") }
      : {}),
  };

  return (
    <article className="mx-auto max-w-7xl px-6 pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="pm-label mb-8 font-display text-maroon/70">
        <Link href="/products" className="hover:text-maroon">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/products/${product.family}`} className="hover:text-maroon">
          {family?.title}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-maroon/60">{product.title}</span>
      </nav>

      {/* ===== product record: media (left) + sticky details rail (right) ===== */}
      <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        {/* the piece */}
        <div className="min-w-0">
          {gallery ? (
            <CategoryGallery
              title={product.title}
              gallery={gallery}
              variants={product.variants}
            />
          ) : (
            <ProductGalleryTabs
              title={product.title}
              materials={materials}
              ratio={product.ratio}
              image={product.heroImage}
              src={product.image}
            />
          )}
        </div>

        {/* the details — sticky beside the imagery on desktop, so the identity,
            specs and the enquire action stay together */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="pm-eyebrow font-display text-maroon">{info.familyLabel}</p>
          <SplitTextReveal
            as="h1"
            by="words"
            className="pm-display mt-3 font-display font-light text-heading-brown"
          >
            {product.title}
          </SplitTextReveal>
          {info.overview && (
            <p className="pm-lead mt-5 font-body text-maroon/85">{info.overview}</p>
          )}

          <ProductSpec spec={info.spec} className="mt-8" />

          {/* the finishes, as a labelled set (the gallery keeps its own coin
              filter for photographed pieces, so only show chips when there is
              no gallery to carry them) */}
          {!gallery && product.variants.length > 0 && (
            <div className="mt-7">
              <p className="pm-label font-display tracking-[0.16em] text-olive uppercase">
                Available in
              </p>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <li
                    key={v}
                    className="pm-small inline-flex items-center gap-2 rounded-full border border-olive/25 bg-cream-deep/40 px-3.5 py-1.5 font-body text-maroon/90 transition-colors duration-300 hover:border-olive/60 hover:bg-cream-deep/70"
                  >
                    <span className="size-1.5 rounded-full bg-gold" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-9 border-t border-olive/15 pt-8">
            <MagneticButton href="/contact">
              Enquire about {product.title}
            </MagneticButton>
            <p className="pm-small mt-5 max-w-sm font-body text-maroon/60">
              Every piece is handcrafted to order — sized to your derasar and to
              religious norms.
            </p>
          </div>
        </div>
      </div>

      {/* ===== the written description + placement + craft ===== */}
      <ProductAbout
        description={info.description}
        placement={info.placement}
        craft={info.craft}
      />

      <RelatedProducts items={related} familySlug={product.family} />
    </article>
  );
}
