import type { Metadata } from "next";
import { FAMILIES } from "@/lib/constants";
import { getProductsByFamily } from "@/lib/data";
import FamilyShowcase from "@/components/products/FamilyShowcase";
import PageHeader from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Four families of Jain and Hindu temple artifacts — architecture, sacred symbols, ceremonial pieces and puja devotional ware.",
};

export default async function ProductsPage() {
  const families = await Promise.all(
    FAMILIES.map(async (f) => ({
      slug: f.slug,
      title: f.title,
      blurb: f.blurb,
      products: await getProductsByFamily(f.slug),
    })),
  );
  return (
    <div className="pt-24">
      <PageHeader
        eyebrow="The Catalogue"
        title="Our Collections"
        size="lg"
        subtitle="Four families of temple artifacts. Scroll through each — every piece is handcrafted to order in your choice of material."
        className="pb-10"
      />

      {families.map((f, i) => (
        <FamilyShowcase
          key={f.slug}
          family={{ slug: f.slug, title: f.title, blurb: f.blurb }}
          products={f.products}
          first={i === 0}
        />
      ))}
    </div>
  );
}
