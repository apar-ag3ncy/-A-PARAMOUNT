import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FAMILIES } from "@/lib/constants";
import { getProductsByFamily } from "@/lib/data";
import CategoryHero from "@/components/products/CategoryHero";
import CategoryGrid from "@/components/products/CategoryGrid";

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
      {/* The family as a disciplined, ALIGNED editorial grid (client reference:
          the real-estate post templates) — one uniform card module per piece, on
          a shared column rhythm. */}
      <section className="bg-cream px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl">
          {/* editorial section header — title left, count right, on a hairline */}
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-olive/20 pb-6">
            <div>
              <p className="pm-eyebrow font-body text-olive">The Collection</p>
              <h2 className="pm-h2 mt-2 font-display text-heading-brown">
                {family.title}
              </h2>
            </div>
            <p className="pm-small font-body text-maroon/70">
              {products.length} pieces · handcrafted to order
            </p>
          </div>

          <CategoryGrid familySlug={family.slug} products={products} />
        </div>
      </section>
    </>
  );
}
