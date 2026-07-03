import type { Metadata } from "next";
import { FAMILIES } from "@/lib/constants";
import { categoriesByFamily } from "@/lib/catalog";
import FamilyShowcase from "@/components/products/FamilyShowcase";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Four families of Jain and Hindu temple artifacts — architecture, sacred symbols, ceremonial pieces and puja devotional ware.",
};

export default function ProductsPage() {
  return (
    <div className="pt-24">
      <header className="mx-auto max-w-4xl px-6 pb-10 text-center">
        <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
          The Catalogue
        </p>
        <SplitTextReveal
          as="h1"
          by="words"
          className="font-display text-5xl leading-[1.05] font-light text-olive-deep sm:text-7xl"
        >
          Our Collections
        </SplitTextReveal>
        <p className="mx-auto mt-6 max-w-xl font-body text-base text-espresso/75">
          Four families of temple artifacts. Scroll through each — every piece is
          handcrafted to order in your choice of material.
        </p>
      </header>

      {FAMILIES.map((f) => (
        <FamilyShowcase
          key={f.slug}
          family={{ slug: f.slug, title: f.title, blurb: f.blurb }}
          products={categoriesByFamily(f.slug)}
        />
      ))}
    </div>
  );
}
