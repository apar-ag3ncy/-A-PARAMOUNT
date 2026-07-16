import type { Metadata } from "next";
import Link from "next/link";
import { FAMILIES } from "@/lib/constants";
import { getProductsByFamily } from "@/lib/data";
import CategoryGrid from "@/components/products/CategoryGrid";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

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
    // The catalogue overview in the same EDITORIAL beige style as each collection
    // page: every family gets a header + the 3-per-line grid of its pieces.
    <div style={{ background: "#FEF1DA" }}>
      {/* editorial page header, centred */}
      <header className="px-6 pt-32 pb-4 text-center">
        <div className="flex items-center justify-center gap-4 pm-micro font-body tracking-[0.28em] text-olive/50 uppercase">
          <span>A Paramount</span>
          <span className="h-px w-8 bg-olive/30" aria-hidden />
          <span>Est. 1968</span>
        </div>
        <p className="pm-eyebrow mt-10 font-body text-olive/80">The Catalogue</p>
        <SplitTextReveal
          as="h1"
          by="words"
          className="pm-display-lg mt-4 font-display font-light text-balance text-heading-brown"
        >
          Our Collections
        </SplitTextReveal>
        <OrnamentDivider className="mx-auto mt-7 text-olive/50" />
        <p className="pm-body mx-auto mt-6 max-w-xl font-body text-maroon/75">
          Four families of temple artifacts — every piece handcrafted to order in
          your choice of material.
        </p>
      </header>

      {families.map((f, i) => (
        <section key={f.slug} className="px-6 py-10 sm:py-14">
          <div className="mx-auto max-w-7xl">
            {/* family section header — title left, view-all right, on a hairline */}
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-olive/20 pb-5">
              <div>
                <p className="pm-eyebrow font-body text-olive/70">
                  Collection {String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="pm-h2 mt-2 font-display text-heading-brown">
                  {f.title}
                </h2>
              </div>
              <Link
                href={`/products/${f.slug}`}
                className="pm-label font-display tracking-[0.16em] text-olive uppercase transition-colors hover:text-maroon"
              >
                View all {f.products.length} —
              </Link>
            </div>

            <CategoryGrid
              familySlug={f.slug}
              familyLabel={f.title}
              products={f.products}
            />
          </div>
        </section>
      ))}
    </div>
  );
}
