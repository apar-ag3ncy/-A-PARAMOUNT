import { GALLERIES } from "@/lib/galleries";
import { getCategory } from "@/lib/catalog";

/**
 * The curated data behind the gallery coverflow. Resolved from the photo
 * manifest (`GALLERIES`) at build time, so there is no second copy of the photo
 * list to keep in sync — change a category's `slug` here and the coverflow
 * follows. Runs in the Server Component (`/gallery`), which passes only the
 * chosen photos to the client carousel — never the whole manifest.
 *
 * Each category exposes ONE `ratio`, and the card frame adopts it, so the photo
 * fills the frame with nothing cropped. To make that hold, a category shows only
 * photos of a single shape: the images are bucketed by aspect ratio and the
 * largest bucket wins (temple photos cluster tightly — a category is usually all
 * portrait, all square or all landscape anyway).
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
  /** Frame aspect ratio (w / h) — matches the photos so nothing is cropped. */
  ratio: number;
  photos: CoverflowPhoto[];
}

/** Largest single-shape set of up to PER_CATEGORY photos, + its mean ratio. */
function uniformSet(images: CoverflowPhoto[]): {
  photos: CoverflowPhoto[];
  ratio: number;
} {
  const buckets = new Map<string, CoverflowPhoto[]>();
  for (const im of images) {
    const key = (Math.round((im.w / im.h) * 8) / 8).toFixed(3); // eighth-buckets
    const arr = buckets.get(key) ?? [];
    arr.push(im);
    buckets.set(key, arr);
  }
  const best = [...buckets.values()].sort((a, b) => b.length - a.length)[0];
  const photos = best.slice(0, PER_CATEGORY);
  const ratio = photos.reduce((s, p) => s + p.w / p.h, 0) / photos.length;
  return { photos, ratio };
}

export function getCoverflowCategories(): CoverflowCategory[] {
  const out: CoverflowCategory[] = [];
  for (const { label, slug } of PICKS) {
    const gallery = GALLERIES[slug];
    const category = getCategory(slug);
    if (!gallery || !category) continue;

    const images = gallery.groups
      .flatMap((g) => g.images)
      .map((im) => ({ src: im.src, w: im.w, h: im.h }));
    const { photos, ratio } = uniformSet(images);

    if (photos.length) {
      out.push({
        label,
        href: `/products/${category.family}/${slug}`,
        ratio,
        photos,
      });
    }
  }
  return out;
}
