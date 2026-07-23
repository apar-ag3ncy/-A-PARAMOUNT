import type { Family, SanityImage } from "@/types/sanity";

/**
 * Local placeholder catalog — derived verbatim from PARAMOUNT_CONTENT.md §6
 * (the client's "order of importance"). Drives the whole product browsing flow
 * with AssetFrame empty states until Sanity is wired (Prompt B), at which point
 * this becomes the fallback / seed and GROQ takes over.
 */

export interface CatalogCategory {
  slug: string;
  title: string;
  family: Family;
  order: number;
  /** Material-variant names, shown all-on-one-page per the brief. */
  variants: string[];
  blurb?: string;
  /** Seeded aspect ratio for composed masonry height variation. */
  ratio: string;
  /** Populated from Sanity; null on the local catalog (shows the empty frame). */
  heroImage?: SanityImage | null;
  /** Local hero photo under /public — filled from the client's photography. */
  image?: string;
}

/** Masonry aspect ratios, cycled by index so a grid never repeats a shape twice
 *  in a row. Exported because the Sanity path (lib/data.ts) must cycle the SAME
 *  list in the SAME order, or a product changes shape when Sanity comes online. */
export const RATIOS = ["3/4", "4/5", "1/1", "4/3", "2/3"] as const;

// [order, title, family, variants, blurb?]
type Row = [number, string, Family, string[], string?];

const ROWS: Row[] = [
  [1, "Dhwajadand", "architecture", ["Brass", "Copper"], "Handcrafted in pure brass or copper, sized by religious calculation, for Jain derasar and Hindu mandir."],
  [2, "Kalash", "architecture", ["Brass", "Copper"], "Pure brass or copper, in varied sizes and polish; kalash covers fit the marble kalash on the shikhar."],
  [3, "Doors", "architecture", ["Wooden", "Silver", "German Silver", "Brass", "GS + Brass", "Copper + Brass", "Inlay / Embossed", "Brass Jali", "Diamond"], "Exclusively handcrafted in premium wood, then clad, polished and lacquered — from normal to extra-deep carving."],
  [4, "Bhandar", "architecture", ["Wooden", "Silver", "German Silver", "Brass", "GS + Brass", "Copper + Brass", "Inlay / Embossed", "No-wood Metal"], "Metal sheets clad on carved wood, enhancing the intricacy; wall-mounted or free-standing, with tijori-like mechanisms."],
  [5, "Samovasaran / Trigadu", "ceremonial", ["Wooden", "Silver", "German Silver", "Brass", "GS + Brass", "Copper + Brass"], "A divine centrepiece, in two or three tones, supplied with a sized brass thali."],
  [6, "Divistand", "ceremonial", ["Wooden", "Silver", "German Silver", "Brass", "GS + Brass", "Copper + Brass"], "Made to complement the samovasaran and trigadu, in various sizes and finishes."],
  [7, "Angi Mugat", "symbols", ["Silver", "Gold", "Copper", "Two-tone Polish", "Jadtar (Full)", "Jadtar (Half)", "Wire", "Minakari", "Moti"], "Ornamental crowns in gold, silver and jadtar, with minakari and moti detailing."],
  [8, "14 Swapna & Parna", "symbols", ["Silver", "Copper", "Two-tone Polish", "Diamond", "Minakari"], "The fourteen auspicious dreams, rendered in silver, minakari and two-tone polish."],
  [9, "Ashtamangal", "symbols", ["Silver", "Copper", "Two-tone Polish", "Minakari"], "The eight auspicious symbols, in silver, copper and minakari."],
  [10, "Chattar", "symbols", ["Silver", "Gold", "Copper", "Brass", "German Silver", "Two-tone Polish", "Diamond"], "Intricately carved parasols, single or two-tone, in varied sizes."],
  [11, "Pichwadi", "symbols", ["Silver", "Copper", "Two-tone Polish", "Minakari"], "Silver and copper backdrops with minakari and two-tone finishes."],
  [12, "Mandir", "architecture", ["Wooden", "Silver", "Brass", "German Silver", "GS + Brass"], "Serene carved shrines for home and derasar, in wood or clad metal, at any size."],
  [13, "Deri Window & Door", "architecture", ["Wooden", "Silver", "Brass", "German Silver", "GS + Brass", "Brass Jali"], "Handcrafted in wood or metal, with intricate carving or brass pipes and jali."],
  [14, "Door Step", "architecture", ["Wooden", "Brass", "Acrylic"], "Carved wood, glass-and-brass, or acrylic framing."],
  [15, "Wooden Ceiling", "architecture", [], "Carved wooden ceilings for the derasar interior."],
  [16, "Brass Tijori", "devotional", [], "Secure brass safes, polished and lacquered."],
  [17, "Brass Bell", "devotional", [], "Engraved with yantra and name; installed with a brass chain or wall bracket."],
  [18, "Brass Bracket & Chain", "devotional", [], "Brass mounting brackets and chains for bells."],
  // 19 was "Brass Hardware & Door Fittings" — removed at the client's
  // instruction, there is no photography for it and it was the last piece
  // still rendering an empty frame on /products/architecture. The ORDER
  // NUMBER IS LEFT VACANT deliberately: `ratio` is RATIOS[(order-1) % 5], so
  // renumbering the rows below it would silently reshape 31 other products.
  [20, "Brass Gate", "architecture", [], "Cast and welded brass gates in varied designs."],
  [21, "Brass Grill / Jali", "architecture", [], "A variety of grill designs for windows and doors."],
  [22, "Aluminium Platform, Railing & Ladder", "architecture", [], "Practical platforms, railings and ladders for the temple."],
  [23, "Puja Table", "devotional", ["Wooden", "Brass", "Inlay"], "Handcrafted in wood and brass, carved or with delicate inlay."],
  [24, "Patla", "devotional", ["Silver", "German Silver", "Two-tone Polish", "Inlay"], "Low seats in silver, german silver and inlay work."],
  [25, "Table", "devotional", ["Wooden", "German Silver", "GS + Brass"], "Wood or clad-metal tables for the puja."],
  [26, "Ashtaprakari Puja Bajot", "devotional", ["Silver", "German Silver", "Brass", "GS + Brass", "Inlay"], "Supplied with a sized brass tray with a drainage pipe."],
  [27, "Sinhasan", "ceremonial", [], "The throne seat, exquisitely carved."],
  [28, "Vyaakhyan Paat", "ceremonial", [], "Intricately carved discourse seat with steps and a central trigadu."],
  [29, "Toran", "symbols", [], "Decorative arch hangings, painted or clad in silver, german silver or brass."],
  [30, "Manekstambh Toran", "symbols", [], "The manekstambh toran, handcrafted in premium wood."],
  [31, "Rath", "ceremonial", [], "Processional chariots, clad in silver, german silver or brass; sturdy and movable."],
  [32, "Indradhaja", "symbols", [], "The Indra banner, exclusively handcrafted."],
  [33, "Palkhi", "ceremonial", [], "Ceremonial palanquins for processions."],
  [34, "Cloth Dhaja", "symbols", [], "Cloth banners for the shikhar."],
  [35, "Shatrunjay Pat", "devotional", ["Silver", "Copper", "Two-tone Polish", "Painting"], "The pilgrimage tableau in silver, copper, two-tone or painting."],
  [36, "Navkar Pat", "devotional", [], "The Navkar mantra tableau, framed."],
  [37, "Fibre Pat", "devotional", [], "Lightweight fibre pats in varied designs."],
  [38, "Kumbh Kalash", "ceremonial", [], "Ceremonial kumbh kalash."],
  [39, "Pakshal Kalash", "ceremonial", [], "The pakshal kalash and kundi."],
  [40, "Vyaakhyan Kamal", "ceremonial", [], "The lotus discourse piece."],
  [41, "Kalpavruksh Naan", "ceremonial", [], "The wish-fulfilling kalpavruksh."],
  [42, "Wooden Carved Murti", "ceremonial", [], "Hand-carved wooden murtis."],
  [43, "Silver Darpan", "devotional", [], "Silver mirrors for the ritual."],
  [44, "Silver Pankho", "devotional", [], "Silver ceremonial fans."],
  [45, "Silver Chaamar", "devotional", [], "Silver whisks for the deity."],
  [46, "Silver Aarti Mangal Divo", "devotional", [], "Silver aarti lamps."],
  [47, "108 Diva Aarti", "devotional", [], "The 108-lamp aarti stand."],
  [48, "Silver Kothi", "devotional", [], "Silver storage vessels."],
  [49, "Silver Frames", "devotional", [], "Silver photo and image frames."],
  [50, "Photo Frame", "devotional", [], "Framed devotional imagery."],
];

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/\+/g, "plus")
    .replace(/[/,]/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Client photography (hero shot per category), converted to WEBP under
 * /public/products/<slug>.webp. Rows without an entry keep the empty frame.
 */
const IMAGES: Record<string, string> = {
  "dhwajadand": "/products/dhwajadand.webp",
  "kalash": "/products/kalash.webp",
  "doors": "/products/doors.webp",
  "bhandar": "/products/bhandar.webp",
  "samovasaran-trigadu": "/products/samovasaran-trigadu.webp",
  "divistand": "/products/divistand.webp",
  "angi-mugat": "/products/angi-mugat.webp",
  "14-swapna-and-parna": "/products/14-swapna-and-parna.webp",
  "chattar": "/products/chattar.webp",
  "mandir": "/products/mandir.webp",
  "door-step": "/products/door-step.webp",
  "brass-tijori": "/products/brass-tijori.webp",
  "brass-bell": "/products/brass-bell.webp",
  "brass-gate": "/products/brass-gate.webp",
  "brass-grill-jali": "/products/brass-grill-jali.webp",
  "puja-table": "/products/puja-table.webp",
  "patla": "/products/patla.webp",
  "ashtaprakari-puja-bajot": "/products/ashtaprakari-puja-bajot.webp",
  "vyaakhyan-paat": "/products/vyaakhyan-paat.webp",
  "toran": "/products/toran.webp",
  "manekstambh-toran": "/products/manekstambh-toran.webp",
  "rath": "/products/rath.webp",
  "cloth-dhaja": "/products/cloth-dhaja.webp",
  "shatrunjay-pat": "/products/shatrunjay-pat.webp",
  "vyaakhyan-kamal": "/products/vyaakhyan-kamal.webp",
  "kalpavruksh-naan": "/products/kalpavruksh-naan.webp",
  "wooden-carved-murti": "/products/wooden-carved-murti.webp",
  "silver-aarti-mangal-divo": "/products/silver-aarti-mangal-divo.webp",
  "108-diva-aarti": "/products/108-diva-aarti.webp",
  "silver-kothi": "/products/silver-kothi.webp",
};

export const CATEGORIES: CatalogCategory[] = ROWS.map(
  ([order, title, family, variants, blurb]) => {
    const slug = slugify(title);
    return {
      order,
      title,
      family,
      variants,
      blurb,
      slug,
      ratio: RATIOS[(order - 1) % RATIOS.length],
      image: IMAGES[slug],
    };
  },
);

export function getCategory(slug: string): CatalogCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function categoriesByFamily(family: Family): CatalogCategory[] {
  return CATEGORIES.filter((c) => c.family === family).sort(
    (a, b) => a.order - b.order,
  );
}

export function variantSlug(material: string): string {
  return slugify(material);
}
