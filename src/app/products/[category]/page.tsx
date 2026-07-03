import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FAMILIES } from "@/lib/constants";
import { categoriesByFamily } from "@/lib/catalog";
import CategoryHero from "@/components/products/CategoryHero";
import CategoryBrowser from "@/components/products/CategoryBrowser";

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

  const products = categoriesByFamily(family.slug);

  return (
    <>
      <CategoryHero
        title={family.title}
        subtitle={family.blurb}
        count={products.length}
      />
      <div className="mx-auto max-w-7xl px-6 pb-32">
        <CategoryBrowser familySlug={family.slug} products={products} />
      </div>
    </>
  );
}
