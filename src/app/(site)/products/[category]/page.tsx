import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FAMILIES } from "@/lib/constants";
import { getProductsByFamily } from "@/lib/data";
import CategoryHero from "@/components/products/CategoryHero";
import ProductCoverflow from "@/components/products/ProductCoverflow";
import OrnamentDivider from "@/components/ui/OrnamentDivider";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ category: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const family = FAMILIES.find((f) => f.slug === category);
  return { title: family?.title ?? "Collection", description: family?.blurb };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const family = FAMILIES.find((f) => f.slug === category);
  if (!family) notFound();

  const products = await getProductsByFamily(family.slug);
  // Deck p13 hero circle — the family's leading piece with real photography
  // (products arrive in the client's order of importance).
  const heroImage = products.find((p) => p.image)?.image;

  return (
    <>
      <CategoryHero
        title={family.title}
        subtitle={family.blurb}
        count={products.length}
        image={heroImage}
      />
      {/* Browse the family as a clickable 3D cover flow (reference layout) on a
          velvet showcase panel — drag or arrow through, click to open a piece. */}
      <section className="bg-cream px-4 py-14 sm:px-6 sm:py-20">
        <div
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] px-4 py-16 text-center ring-1 ring-gold/20 shadow-[0_44px_100px_-56px_rgba(46,35,19,0.55)] sm:px-10 sm:py-20"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 0%, var(--color-velvet-200) 0%, var(--color-velvet-300) 55%, var(--color-velvet-500) 100%)",
          }}
        >
          {/* faint gold bloom top-centre, matching the Our Works panel */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 0%, rgb(var(--gold-rgb) / 0.14), transparent 60%)",
            }}
          />
          <div className="relative">
            <p className="pm-eyebrow font-body text-gold">
              {products.length} pieces · handcrafted to order
            </p>
            <h2 className="pm-h2 font-display mt-4 text-cream">
              The {family.title} Collection
            </h2>
            <OrnamentDivider className="mx-auto mt-5 text-gold/60" />
            <div className="mt-14">
              <ProductCoverflow familySlug={family.slug} products={products} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
