import type { Metadata } from "next";
import { FAMILIES } from "@/lib/constants";
import { getProductsByFamily } from "@/lib/data";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import CollectionsRail, {
  type CollectionCard,
} from "@/components/products/CollectionsRail";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Four families of Jain and Hindu temple artifacts, architecture, sacred symbols, ceremonial pieces and puja devotional ware.",
};

/**
 * The hero photograph for each family, chosen by eye from the GALLERY set — real
 * in-situ photography, not the white-ground catalogue cut-outs (those are the
 * never-crop ones, and these cards are full-bleed; see CollectionsRail).
 *
 * Picked for TONAL RANGE as much as subject, so four tall cards in a row read as
 * a composed set rather than four stock photos: gold-on-marble doors, the pale
 * carved crown, a warm kalash on cream silk, and the deep maroon-and-gold bajot.
 */
const HERO: Record<string, string> = {
  architecture: "/gallery/doors/brass-emboss/00.webp",
  symbols: "/gallery/angi-mugat/all/00.webp",
  ceremonial: "/gallery/kumbh-kalash/all/01.webp",
  devotional: "/gallery/ashtaprakari-puja-bajot/all/02.webp",
};

export default async function ProductsPage() {
  // A structured OVERVIEW of the four collections, one card each, leading into
  // that collection's own page. The full piece grids live on /products/[category],
  // so nothing is ever listed twice.
  const items: CollectionCard[] = await Promise.all(
    FAMILIES.map(async (f) => {
      const products = await getProductsByFamily(f.slug);
      return {
        slug: f.slug,
        title: f.title,
        blurb: f.blurb,
        count: products.length,
        hero: HERO[f.slug],
      };
    }),
  );

  return (
    <div className="relative overflow-hidden" style={{ background: "#FEF1DA" }}>
      {/* Two soft olive fields behind the page. The site reads uniformly beige,
          so the brand olives are brought in as LIGHT rather than as blocks — a
          warm one under the header and a deeper one under the rail, both far
          below the type's contrast threshold so nothing gets harder to read. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 34% at 50% 0%, rgba(137,126,73,0.16), transparent 70%), radial-gradient(72% 40% at 50% 72%, rgba(124,113,68,0.13), transparent 72%)",
        }}
      />

      {/* editorial page header, centred */}
      <header className="relative px-6 pt-28 pb-4 text-center">
        <p className="pm-eyebrow font-body text-olive/80">The Catalogue</p>
        <SplitTextReveal
          as="h1"
          by="words"
          className="pm-display-lg mt-5 font-display font-light text-balance text-heading-brown"
        >
          Our Collections
        </SplitTextReveal>
        <OrnamentDivider className="mx-auto mt-7 text-olive/50" />
        <p className="pm-body mx-auto mt-6 max-w-md font-body text-maroon/75">
          Four families of temple artifacts, every piece handcrafted to order in
          your choice of material.
        </p>
      </header>

      {/* the four collections, as full-bleed image cards */}
      <section className="relative pt-12 pb-28 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <CollectionsRail items={items} />
        </div>
      </section>
    </div>
  );
}
