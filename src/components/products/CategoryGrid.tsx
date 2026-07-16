import Link from "next/link";
import Image from "next/image";
import ArchMark from "@/components/ui/ArchMark";
import type { CatalogCategory } from "@/lib/catalog";

/**
 * CategoryGrid — the family's pieces as an aligned grid of editorial cards
 * (client reference: the real-estate post templates), on the brand's BEIGE
 * ground. Every card is one centred module: a hairline metadata row (index ·
 * finishes), an olive eyebrow, the piece name, a framed image, and a "view piece"
 * cue — all centre-aligned on one column rhythm.
 *
 * Images: the piece is CONTAINED (never cropped — client mandate) and fills the
 * frame edge-to-edge with no passe-partout padding, on a soft warm mat. Un-
 * photographed pieces get a cream tile with a ghosted arch monogram.
 */
export default function CategoryGrid({
  products,
  familySlug,
  familyLabel,
}: {
  products: CatalogCategory[];
  familySlug: string;
  familyLabel: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {products.map((p, i) => {
        const finishes = p.variants.length;
        return (
          <Link
            key={p.slug}
            href={`/products/${familySlug}/${p.slug}`}
            className="group flex flex-col rounded-[1.4rem] border border-olive/15 p-5 text-center shadow-[0_26px_60px_-46px_rgba(46,35,19,0.4)] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-olive/40 sm:p-6"
            style={{
              background: "linear-gradient(180deg, #FFFDF6 0%, #F6E9CE 100%)",
            }}
          >
            {/* metadata row — index left, finishes right, on the card's top rule */}
            <div className="flex items-center justify-between border-b border-olive/12 pb-3">
              <span className="pm-micro font-body tabular-nums tracking-[0.2em] text-olive/50">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="pm-micro font-body tracking-[0.2em] text-olive/50 uppercase">
                {finishes
                  ? `${finishes} ${finishes === 1 ? "finish" : "finishes"}`
                  : "To order"}
              </span>
            </div>

            {/* eyebrow + the name — the focal point of the card */}
            <p className="pm-eyebrow mt-6 font-body text-olive/75">{familyLabel}</p>
            <h3 className="mt-2 font-display text-[1.55rem] leading-[1.1] text-heading-brown">
              {p.title}
            </h3>

            {/* framed image — contained (uncropped) to the frame edge; a cream
                monogram tile when there is no photo yet */}
            <div className="relative mt-6 aspect-[4/5] overflow-hidden rounded-[1rem] ring-1 ring-olive/12">
              {p.image ? (
                <>
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{ background: "#F3E7CE" }}
                  />
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 30vw, 45vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </>
              ) : (
                <div
                  className="grid h-full place-items-center"
                  style={{
                    background: "linear-gradient(180deg, #F3E4C8 0%, #E9DBBE 100%)",
                  }}
                >
                  <ArchMark className="h-16 w-auto text-olive/20" />
                </div>
              )}
            </div>

            <span className="pm-micro mt-6 font-body tracking-[0.26em] text-maroon/60 uppercase transition-colors duration-300 group-hover:text-olive">
              View piece —
            </span>
          </Link>
        );
      })}
    </div>
  );
}
