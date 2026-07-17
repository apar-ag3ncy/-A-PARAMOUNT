import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FAMILIES } from "@/lib/constants";
import { getProductsByFamily } from "@/lib/data";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import ArchMark from "@/components/ui/ArchMark";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Four families of Jain and Hindu temple artifacts — architecture, sacred symbols, ceremonial pieces and puja devotional ware.",
};

export default async function ProductsPage() {
  // The landing is a structured OVERVIEW of the four collections — one card each,
  // leading into that collection's own page. The full piece grids live on the
  // /products/[category] pages, so nothing is listed twice.
  const families = await Promise.all(
    FAMILIES.map(async (f) => {
      const products = await getProductsByFamily(f.slug);
      return {
        slug: f.slug,
        title: f.title,
        blurb: f.blurb,
        count: products.length,
        // representative piece — the first photographed one in the family
        hero: products.find((p) => p.image)?.image ?? null,
      };
    }),
  );

  return (
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

      {/* the four collections, as cards — each opens its own piece grid */}
      <section className="px-6 pt-10 pb-28">
        <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2">
          {families.map((f, i) => (
            <Link
              key={f.slug}
              href={`/products/${f.slug}`}
              className="group flex flex-col overflow-hidden rounded-[1.6rem] border border-olive/15 shadow-[0_30px_70px_-52px_rgba(46,35,19,0.5)] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-olive/35"
              style={{ background: "linear-gradient(180deg, #FFFDF6 0%, #F6E9CE 100%)" }}
            >
              {/* metadata row — index left, count right, on a hairline */}
              <div className="mx-7 flex items-center justify-between border-b border-olive/12 pt-6 pb-4">
                <span className="pm-micro font-body tabular-nums tracking-[0.22em] text-olive/55">
                  Collection {String(i + 1).padStart(2, "0")}
                </span>
                <span className="pm-micro font-body tracking-[0.22em] text-olive/55 uppercase">
                  {f.count} {f.count === 1 ? "piece" : "pieces"}
                </span>
              </div>

              {/* representative piece — contained on a warm mat (product shots
                  are never cropped), or a cream monogram tile when unphotographed */}
              <div
                className="relative mx-7 mt-6 overflow-hidden rounded-[1.15rem] ring-1 ring-olive/12"
                style={{ background: "#F3E7CE", aspectRatio: "16 / 10" }}
              >
                {f.hero ? (
                  <Image
                    src={f.hero}
                    alt=""
                    fill
                    sizes="(min-width:640px) 45vw, 90vw"
                    className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <ArchMark className="h-16 w-auto text-olive/20" />
                  </div>
                )}
              </div>

              {/* title + blurb + cue */}
              <div className="flex flex-1 flex-col px-7 pt-7 pb-8 text-center">
                <h2 className="pm-h2 font-display text-heading-brown">{f.title}</h2>
                <OrnamentDivider className="mx-auto mt-3 text-olive/45" />
                <p className="pm-small mx-auto mt-4 max-w-sm font-body text-maroon/75">
                  {f.blurb}
                </p>
                <span className="pm-label mt-auto pt-7 font-display tracking-[0.16em] text-olive uppercase transition-colors group-hover:text-maroon">
                  Explore collection —
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
