import { GALLERIES } from "@/lib/galleries";
import { getCategory } from "@/lib/catalog";

/**
 * The curated data behind the gallery coverflow. Resolved from the photo
 * manifest (`GALLERIES`) at build time, so there is no second copy of the photo
 * list to keep in sync — change a collection's `slug` here and the flow follows.
 * Runs in the Server Component (`/gallery`), which passes only the chosen photos
 * to the client carousel — never the whole manifest.
 *
 * The gallery is ONE CONTINUOUS FLOW: every collection's photos are flattened,
 * in `PICKS` order, into a single scroll-driven river — when Doors runs out,
 * Kalash carries straight on, and the collection name changes with it. So the
 * flat `photos` array is the source of truth for the carousel, and `collections`
 * only records where each one starts (for the name, the progress rail and the
 * "view all" deep link).
 *
 * Each photo carries its OWN `ratio`, and its card frame adopts it, so the photo
 * fills the frame with nothing cropped even as shapes change between collections.
 * Within a collection we still show a single-shape set (bucket by aspect, largest
 * bucket wins) so each run of cards reads as one consistent row.
 */

/** Collection label → catalog slug. Order is the order of the flow. */
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

const PER_COLLECTION = 6;

interface RawPhoto {
  src: string;
  w: number;
  h: number;
}

/** One card in the continuous flow. */
export interface FlowPhoto {
  src: string;
  w: number;
  h: number;
  /** w / h — the card's width in units of the shared card HEIGHT. Uncropped. */
  ratio: number;
  /** Index into `collections` — which collection this photo belongs to. */
  collection: number;
}

/** A run of consecutive photos in the flow. */
export interface FlowCollection {
  label: string;
  /** Deep-link target for this collection's full set. */
  href: string;
  /** Index of this collection's FIRST photo in the flat `photos` array. */
  start: number;
  /** How many photos this collection contributes to the flow. */
  count: number;
}

export interface CoverflowFlow {
  photos: FlowPhoto[];
  collections: FlowCollection[];
}

/** Largest single-shape set of up to PER_COLLECTION photos (keeps a run consistent). */
function uniformSet(images: RawPhoto[]): RawPhoto[] {
  const buckets = new Map<string, RawPhoto[]>();
  for (const im of images) {
    const key = (Math.round((im.w / im.h) * 8) / 8).toFixed(3); // eighth-buckets
    const arr = buckets.get(key) ?? [];
    arr.push(im);
    buckets.set(key, arr);
  }
  const best = [...buckets.values()].sort((a, b) => b.length - a.length)[0];
  return best ? best.slice(0, PER_COLLECTION) : [];
}

/**
 * Every collection's photos, flattened into one continuous flow. Collections
 * that have no photos in the manifest are skipped entirely (they'd otherwise be
 * a nameless gap in the river).
 */
export function getCoverflowFlow(): CoverflowFlow {
  const photos: FlowPhoto[] = [];
  const collections: FlowCollection[] = [];

  for (const { label, slug } of PICKS) {
    const gallery = GALLERIES[slug];
    const category = getCategory(slug);
    if (!gallery || !category) continue;

    const picked = uniformSet(
      gallery.groups
        .flatMap((g) => g.images)
        .map((im) => ({ src: im.src, w: im.w, h: im.h })),
    );
    if (!picked.length) continue;

    const collection = collections.length;
    collections.push({
      label,
      href: `/products/${category.family}/${slug}`,
      start: photos.length,
      count: picked.length,
    });
    for (const p of picked) {
      photos.push({ ...p, ratio: p.w / p.h, collection });
    }
  }

  return { photos, collections };
}
