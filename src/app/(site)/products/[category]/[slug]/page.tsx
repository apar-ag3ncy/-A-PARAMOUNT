import type { Metadata } from "next";
import Link from "next/link";
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
    // DARK EDITORIAL product "post" (client reference), centred, brand velvet.
    <div style={{ background: "#17110A" }}>
      <article className="mx-auto max-w-5xl px-6 pt-32 pb-28">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* breadcrumb — centred, small caps */}
        <nav className="pm-micro text-center font-body tracking-[0.2em] text-pista/40 uppercase">
          <Link href="/products" className="transition-colors hover:text-gold">
            Collections
          </Link>
          <span className="mx-2 text-gold/30">/</span>
          <Link
            href={`/products/${product.family}`}
            className="transition-colors hover:text-gold"
          >
            {family?.title}
          </Link>
          <span className="mx-2 text-gold/30">/</span>
          <span className="text-pista/70">{product.title}</span>
        </nav>

        {/* header — centred editorial */}
        <header className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 pm-micro font-body tracking-[0.28em] text-pista/40 uppercase">
            <span>A Paramount</span>
            <span className="h-px w-8 bg-gold/30" aria-hidden />
            <span>Est. 1968</span>
          </div>
          <p className="pm-eyebrow mt-9 font-body text-gold/70">
            {info.familyLabel}
          </p>
          <SplitTextReveal
            as="h1"
            by="words"
            className="pm-display mt-3 font-display font-light text-balance text-cream"
          >
            {product.title}
          </SplitTextReveal>
          <OrnamentDivider className="mx-auto mt-6 text-gold/55" />
          {info.overview && (
            <p className="pm-lead mx-auto mt-6 max-w-2xl font-body text-pista/75">
              {info.overview}
            </p>
          )}
        </header>

        {/* the piece — framed imagery on the dark ground */}
        <div className="mt-14">
          {gallery ? (
            <CategoryGallery
              dark
              title={product.title}
              gallery={gallery}
              variants={product.variants}
            />
          ) : (
            <div
              className="mx-auto grid aspect-[4/5] max-w-sm place-items-center rounded-[1.4rem] border border-gold/12"
              style={{
                background: "linear-gradient(180deg, #2F2716 0%, #201808 100%)",
              }}
            >
              <ArchMark className="h-24 w-auto text-gold/25" />
            </div>
          )}
        </div>

        {/* spec — the reference's numbered columns, dark, on gold hairlines */}
        <dl className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-[1.4rem] border border-gold/12 bg-gold/12 sm:grid-cols-3">
          {info.spec.map((s, idx) => (
            <div
              key={s.label}
              className="px-6 py-8 text-center"
              style={{ background: "#221A0C" }}
            >
              <span className="pm-micro font-body tabular-nums tracking-[0.2em] text-gold/45">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <dt className="pm-label mt-4 font-body tracking-[0.16em] text-pista/45 uppercase">
                {s.label}
              </dt>
              <dd className="pm-body mt-2 font-display text-cream">{s.value}</dd>
            </div>
          ))}
        </dl>

        {/* finishes — chips, when there is no photo gallery to carry them */}
        {!gallery && product.variants.length > 0 && (
          <div className="mt-12 text-center">
            <p className="pm-label font-display tracking-[0.16em] text-gold/60 uppercase">
              Available in
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
              {product.variants.map((v) => (
                <li
                  key={v}
                  className="pm-small inline-flex items-center gap-2 rounded-full border border-gold/25 px-3.5 py-1.5 font-body text-pista/85 transition-colors duration-300 hover:border-gold/60"
                >
                  <span className="size-1.5 rounded-full bg-gold" />
                  {v}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* the written description + placement + craft — centred */}
        <section className="mx-auto mt-16 max-w-3xl text-center">
          <p className="pm-eyebrow font-body text-gold/70">About the piece</p>
          {info.description && (
            <p className="pm-lead mx-auto mt-4 max-w-2xl font-body text-pista/80">
              {info.description}
            </p>
          )}
          <div className="mt-10 grid gap-8 border-t border-gold/12 pt-10 text-center sm:grid-cols-2 sm:gap-12">
            <div>
              <h3 className="pm-label font-display tracking-[0.16em] text-gold/55 uppercase">
                Placement
              </h3>
              <p className="pm-body mx-auto mt-2.5 max-w-sm font-body text-pista/70">
                {info.placement}
              </p>
            </div>
            <div>
              <h3 className="pm-label font-display tracking-[0.16em] text-gold/55 uppercase">
                Craft
              </h3>
              <p className="pm-body mx-auto mt-2.5 max-w-sm font-body text-pista/70">
                {info.craft}
              </p>
            </div>
          </div>
        </section>

        {/* commission */}
        <div className="mt-16 text-center">
          <p className="pm-eyebrow font-body text-gold/70">Commission this piece</p>
          <div className="mt-5 flex justify-center">
            <MagneticButton href="/contact" tone="dark">
              Enquire about {product.title}
            </MagneticButton>
          </div>
          <p className="pm-small mx-auto mt-6 max-w-md font-body text-pista/50">
            Every piece is handcrafted to order — sized to your derasar and to
            religious norms.
          </p>
        </div>

        <RelatedProducts items={related} familySlug={product.family} />
      </article>
    </div>
  );
}
