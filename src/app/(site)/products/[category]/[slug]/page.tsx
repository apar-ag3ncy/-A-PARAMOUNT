import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getProductsByFamily, productParams } from "@/lib/data";
import { FAMILIES } from "@/lib/constants";
import { galleryFor } from "@/lib/galleries";
import { getProductInfo } from "@/lib/productInfo";
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
      <article className="mx-auto max-w-5xl px-6 pt-32 pb-28">
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
            <p className="pm-lead mx-auto mt-6 max-w-xl font-body text-maroon/80">
              {info.overview}
            </p>
          )}
        </header>

        {/* the piece — framed imagery */}
        <div className="mt-14">
          {gallery ? (
            <CategoryGallery
              title={product.title}
              gallery={gallery}
              variants={product.variants}
            />
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

        {/* spec — the reference's numbered columns, on olive hairlines */}
        <Reveal className="mt-16">
          <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.4rem] border border-olive/15 bg-olive/12 sm:grid-cols-3">
            {info.spec.map((s, idx) => (
              <div
                key={s.label}
                className="px-6 py-8 text-center"
                style={{ background: "#FBF0D6" }}
              >
                <span className="pm-micro font-body tabular-nums tracking-[0.2em] text-olive/45">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <dt className="pm-label mt-4 font-body tracking-[0.16em] text-olive/60 uppercase">
                  {s.label}
                </dt>
                <dd className="pm-body mt-2 font-display text-heading-brown">
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

        {/* the written description + placement + craft — centred */}
        <Reveal className="mx-auto mt-16 max-w-3xl text-center">
          {info.description && (
            <p className="pm-lead mx-auto max-w-2xl font-body text-maroon/85">
              {info.description}
            </p>
          )}
          <div className="mt-10 grid gap-8 border-t border-olive/15 pt-10 text-center sm:grid-cols-2 sm:gap-12">
            <div>
              <h3 className="pm-label font-display tracking-[0.16em] text-olive/70 uppercase">
                Placement
              </h3>
              <p className="pm-body mx-auto mt-2.5 max-w-sm font-body text-maroon/80">
                {info.placement}
              </p>
            </div>
            <div>
              <h3 className="pm-label font-display tracking-[0.16em] text-olive/70 uppercase">
                Craft
              </h3>
              <p className="pm-body mx-auto mt-2.5 max-w-sm font-body text-maroon/80">
                {info.craft}
              </p>
            </div>
          </div>
        </Reveal>

        {/* commission */}
        <Reveal className="mt-16 text-center">
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

        <RelatedProducts items={related} familySlug={product.family} />
      </article>
    </div>
  );
}
