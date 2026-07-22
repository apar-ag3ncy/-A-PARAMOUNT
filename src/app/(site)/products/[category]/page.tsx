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

  return (
    // EDITORIAL collection page (client reference layout) on the brand's beige.
    <div style={{ background: "#FEF1DA" }}>
      <CategoryHero
        title={family.title}
        subtitle={family.blurb}
        count={products.length}
      />

      <section className="px-6 pt-6 pb-20">
        <div className="mx-auto max-w-7xl">
          <CategoryGrid familySlug={family.slug} products={products} />
        </div>
      </section>
    </div>
  );
}
