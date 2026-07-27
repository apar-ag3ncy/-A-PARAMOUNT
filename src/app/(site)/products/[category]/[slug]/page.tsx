import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByFamily, productParams } from "@/lib/data";
import { FAMILIES } from "@/lib/constants";
import { galleryFor } from "@/lib/galleries";
import { getProductInfo } from "@/lib/productInfo";
import { PRODUCT_IMAGE_DIMS, productAspect } from "@/lib/productImageDims";
import CategoryGallery from "@/components/products/CategoryGallery";
import RelatedProducts from "@/components/products/RelatedProducts";
import ArchMark from "@/components/ui/ArchMark";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import Reveal from "@/components/animations/Reveal";
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
    // EDITORIAL product "post" (client reference layout), centred, on brand beige.
    <div style={{ background: "#FEF1DA" }}>
      <article className="mx-auto max-w-5xl px-6 pt-12 pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* No breadcrumb. It read as clutter above every piece (client) and it
            was saying nothing the page does not already say louder: the family
            is the eyebrow directly beneath it and the piece name is the H1. The
            header nav and the related-pieces rail carry the way back out. */}

        {/* header — centred editorial */}
        <header className="text-center">
          <p className="pm-eyebrow font-body text-olive/80">
            {info.familyLabel}
          </p>
          <SplitTextReveal
            as="h1"
            by="words"
            className="pm-display mt-4 font-display font-light text-balance text-heading-brown"
          >
            {product.title}
          </SplitTextReveal>
          <OrnamentDivider className="mx-auto mt-6 text-olive/50" />
          {info.overview && (
            <p className="pm-lead mx-auto mt-6 max-w-3xl font-body text-maroon/80">
              {info.overview}
            </p>
          )}
        </header>

        {/* the piece — framed imagery.
            mt-12, not mt-10. Every other section on this page steps at 48px
            (spec, description, commission, related); the gallery alone sat at
            40 and broke the rhythm. */}
        <div className="mt-12">
          {gallery ? (
            <CategoryGallery
              title={product.title}
              gallery={gallery}
              variants={product.variants}
            />
          ) : product.image ? (
            // A piece can have the client's studio cut-out without having a
            // per-material photo FOLDER — three do. This branch used to be
            // missing, so those three showed the "no photography yet" plate
            // while their photograph sat unused in /public/products.
            //
            // The frame adopts the photo's own aspect ratio (see the catalogue
            // grid, same reasoning): these cut-outs run from 0.23 to 5.17, so a
            // fixed frame either crops — forbidden — or letterboxes badly.
            <div
              className="mx-auto max-w-sm overflow-hidden rounded-[1.4rem] border border-olive/15"
              style={{
                aspectRatio: productAspect(product.image) ?? 4 / 5,
                background: "linear-gradient(180deg, #F3E4C8 0%, #E9DBBE 100%)",
              }}
            >
              <Image
                src={product.image}
                alt={product.title}
                width={PRODUCT_IMAGE_DIMS[product.image]?.w ?? 1200}
                height={PRODUCT_IMAGE_DIMS[product.image]?.h ?? 1500}
                className="h-full w-full object-contain"
                priority
              />
            </div>
          ) : (
            <div
              className="mx-auto grid aspect-[4/5] max-w-sm place-items-center rounded-[1.4rem] border border-olive/15"
              style={{
                background: "linear-gradient(180deg, #F3E4C8 0%, #E9DBBE 100%)",
              }}
            >
              <ArchMark className="h-24 w-auto text-olive/20" />
            </div>
          )}
        </div>

        {/* spec — single continuous frame in brand color #7C7144 gradient background */}
        <Reveal className="mt-12">
          <dl
            className="grid grid-cols-1 divide-y divide-gold/25 overflow-hidden rounded-2xl sm:rounded-3xl border border-gold/35 shadow-[0_20px_50px_-20px_rgba(23,18,8,0.4)] text-cream sm:grid-cols-3 sm:divide-y-0 sm:divide-x"
            style={{
              background:
                "linear-gradient(145deg, #7C7144 0%, #6E643B 48%, #574F2E 100%)",
            }}
          >
            {info.spec.map((s, idx) => (
              <div
                key={s.label}
                className="relative flex flex-col items-center justify-center p-7 sm:p-8 text-center"
              >
                <span className="font-display tabular-nums tracking-[0.22em] text-gold/85 text-xs sm:text-sm text-center block mb-2 font-medium">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <dt className="font-display tracking-[0.2em] text-gold text-xs sm:text-sm uppercase text-center font-medium">
                  {s.label}
                </dt>
                <dd className="font-display text-base sm:text-lg md:text-xl font-medium text-cream mt-2.5 tracking-tight text-center">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* finishes — chips, when there is no photo gallery to carry them */}
        {!gallery && product.variants.length > 0 && (
          <div className="mt-12 text-center">
            <p className="pm-label font-display tracking-[0.16em] text-olive/70 uppercase">
              Available in
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
              {product.variants.map((v) => (
                <li
                  key={v}
                  className="pm-small inline-flex items-center gap-2 rounded-full border border-olive/25 bg-cream-deep/40 px-3.5 py-1.5 font-body text-maroon/90 transition-colors duration-300 hover:border-olive/60"
                >
                  <span className="size-1.5 rounded-full bg-gold" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* the written description — centred */}
        {info.description && (
          <Reveal className="mx-auto mt-12 max-w-3xl text-center">
            <p className="pm-lead mx-auto max-w-2xl font-body text-maroon/85">
              {info.description}
            </p>
          </Reveal>
        )}

        {/* commission */}
        <Reveal className="mt-12 text-center">
          <p className="pm-eyebrow font-body text-olive/80">Commission this piece</p>
          <div className="mt-5 flex justify-center">
            <MagneticButton href="/contact">
              Enquire about {product.title}
            </MagneticButton>
          </div>
          <p className="pm-small mx-auto mt-6 max-w-md font-body text-maroon/60">
            Every piece is handcrafted to order, sized to your derasar and to
            religious norms.
          </p>
        </Reveal>
      </article>
    </div>
  );
}
