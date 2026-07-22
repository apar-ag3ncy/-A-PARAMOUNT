import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FAMILIES } from "@/lib/constants";
import { getProductsByFamily } from "@/lib/data";
import { galleryFor } from "@/lib/galleries";
import CategoryHero from "@/components/products/CategoryHero";
import CategoryCards, {
  type PieceCard,
} from "@/components/products/CategoryCards";

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

  // Resolve each piece's best available image HERE, on the server, so the card
  // never has to reach into the photo manifest itself.
  //
  // `photo` is an in-situ gallery shot and may be cropped edge to edge; `studio`
  // is the white-ground catalogue cut-out and may NOT be (client mandate), so it
  // is passed under its own key and the card contains it instead. Only 30 of the
  // 50 pieces have gallery photography, so both paths are live on every family.
  const items: PieceCard[] = products.map((p) => {
    const photo = galleryFor(p.slug)?.groups.flatMap((g) => g.images)[0]?.src;
    return {
      slug: p.slug,
      title: p.title,
      photo,
      studio: photo ? undefined : (p.image ?? undefined),
      finishes: p.variants.length,
    };
  });

  return (
    // The family's pieces, in the same full-bleed card language as the /products
    // collections rail, on the brand's beige.
    <div className="relative overflow-hidden" style={{ background: "#FEF1DA" }}>
      {/* the same soft olive fields the collections landing uses, so moving from
          one to the other does not change the room the work sits in */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 30% at 50% 0%, rgba(137,126,73,0.16), transparent 70%), radial-gradient(72% 38% at 50% 76%, rgba(124,113,68,0.12), transparent 72%)",
        }}
      />

      <div className="relative">
        <CategoryHero
          title={family.title}
          subtitle={family.blurb}
          count={products.length}
        />

        <section className="px-6 pt-6 pb-20">
          <div className="mx-auto max-w-7xl">
            <CategoryCards items={items} familySlug={family.slug} />
          </div>
        </section>
      </div>
    </div>
  );
}
