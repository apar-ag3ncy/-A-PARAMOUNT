import { GALLERIES } from "@/lib/galleries";
import { getCategory } from "@/lib/catalog";

/**
 * The curated data behind the gallery coverflow. Resolved from the photo
 * manifest (`GALLERIES`) at build time, so there is no second copy of the photo
 * list to keep in sync — change a category's `slug` here and the coverflow
 * follows. Runs in the Server Component (`/gallery`), which passes only the
 * chosen photos to the client carousel — never the whole manifest.
 *
 * Cards are a uniform 3:4 (0.75) portrait frame, as in the reference, so photos
 * nearest that ratio are chosen first to keep `object-cover` crop minimal.
 */

/** Pill label → catalog slug. Order is the pill order. */
const PICKS: { label: string; slug: string }[] = [
  { label: "Doors", slug: "doors" },
  { label: "Kalash", slug: "kalash" },
  { label: "Samovasaran", slug: "samovasaran-trigadu" },
  { label: "Mandir", slug: "mandir" },
  { label: "Toran", slug: "manekstambh-toran" },
  { label: "Bhandar", slug: "bhandar" },
  { label: "Angi Mugat", slug: "angi-mugat" },
  { label: "Brass Gate", slug: "brass-gate" },
  { label: "Chattar", slug: "chattar" },
  { label: "Dhwajadand", slug: "dhwajadand" },
];

const CARD_RATIO = 3 / 4; // 0.75
const PER_CATEGORY = 6;

export interface CoverflowPhoto {
  src: string;
  w: number;
  h: number;
}
export interface CoverflowCategory {
  label: string;
  /** Deep-link target for this category's full set. */
  href: string;
  photos: CoverflowPhoto[];
}

export function getCoverflowCategories(): CoverflowCategory[] {
  const out: CoverflowCategory[] = [];
  for (const { label, slug } of PICKS) {
    const gallery = GALLERIES[slug];
    const category = getCategory(slug);
    if (!gallery || !category) continue;

    const photos = gallery.groups
      .flatMap((g) => g.images)
      .map((im) => ({ src: im.src, w: im.w, h: im.h }))
      // closest to the card ratio first → least cropping in the frame
      .sort(
        (a, b) =>
          Math.abs(a.w / a.h - CARD_RATIO) - Math.abs(b.w / b.h - CARD_RATIO),
      )
      .slice(0, PER_CATEGORY);

    if (photos.length) {
      out.push({ label, href: `/products/${category.family}/${slug}`, photos });
    }
  }
  return out;
}
