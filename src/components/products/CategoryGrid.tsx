import Link from "next/link";
import Image from "next/image";
import ArchMark from "@/components/ui/ArchMark";
import { productAspect } from "@/lib/productImageDims";
import type { CatalogCategory } from "@/lib/catalog";

/**
 * CategoryGrid — the family's pieces as an editorial grid of light cream cards
 * (client reference layout) on the brand's beige ground.
 *
 * LAYOUT: a centred flex-wrap of fixed-width cards, so a PARTIAL last row (a
 * family whose count isn't a multiple of the columns, e.g. Ceremonial's 11) sits
 * SYMMETRICALLY in the middle rather than stranded left.
 *
 * IMAGES: the client's photos span aspect ratios from 0.23 (a tall cloth dhaja)
 * to 5.17 (a panoramic toran) — no single frame can fill them all without
 * cropping. So each card's frame ADOPTS its own photo's ratio (clamped to a sane
 * card range), and the photo fills that frame edge-to-edge with `object-contain`:
 * because frame ratio == photo ratio the piece FILLS the frame with NO letterbox
 * and NO crop (proportionate). Only the two extreme panorama/pillar shapes fall
 * back to a light letterbox rather than be cut. Un-photographed pieces get a cream
 * monogram tile at the card's default shape.
 */

// Keep cards from becoming absurdly tall/wide while still filling the common
// shapes (0.56 pillars … 1.34 landscapes) exactly.
const MIN_AR = 0.56;
const MAX_AR = 1.4;
const clampAr = (ar: number) => Math.min(MAX_AR, Math.max(MIN_AR, ar));

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
    <div className="flex flex-wrap justify-center gap-6">
      {products.map((p, i) => {
        const finishes = p.variants.length;
        const ar = productAspect(p.image);
        const frameAr = ar ? clampAr(ar) : 0.8; // no photo → default portrait tile
        return (
          <Link
            key={p.slug}
            href={`/products/${familySlug}/${p.slug}`}
            className="group flex w-full flex-col rounded-[1.4rem] border border-olive/15 p-5 text-center shadow-[0_26px_60px_-46px_rgba(46,35,19,0.4)] transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-olive/40 sm:w-[calc((100%-1.5rem)/2)] sm:p-6 lg:w-[calc((100%-3rem)/3)]"
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

            {/* framed image — the frame takes the photo's OWN ratio, so the piece
                fills it edge-to-edge, uncropped and proportionate. Centred so it
                sits symmetrically whatever its shape. */}
            <div className="mt-6 flex flex-1 items-center justify-center">
              <div
                className="relative w-full overflow-hidden rounded-[1rem] ring-1 ring-olive/12"
                style={{ aspectRatio: String(frameAr), background: "#F3E7CE" }}
              >
                {p.image ? (
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 90vw"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div
                    className="grid h-full place-items-center"
                    style={{
                      background:
                        "linear-gradient(180deg, #F3E4C8 0%, #E9DBBE 100%)",
                    }}
                  >
                    <ArchMark className="h-16 w-auto text-olive/20" />
                  </div>
                )}
              </div>
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
