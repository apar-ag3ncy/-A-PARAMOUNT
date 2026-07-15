import type { Family } from "@/types/sanity";

/**
 * Static, per-piece information for the product detail pages. The catalog
 * (`catalog.ts`) carries the marketing blurb, the material variants and the
 * photo; this adds the INFORMATIONAL layer a visitor wants when they open a
 * single piece: what it actually is, where in the temple it belongs, and how it
 * is made.
 *
 * Everything here is deliberately TRUTHFUL and generic-where-unsure — these are
 * real Jain/Hindu temple artifacts, so the `overview` states the piece's known
 * role, and the placement/craft come from the FAMILY (never invented dimensions,
 * weights, prices or lead times). Resolved by `getProductInfo`, which falls back
 * to the catalog blurb + family context for any slug without a hand-written line.
 */

interface FamilyInfo {
  label: string;
  /** Where these pieces live in the temple / how they are used. */
  placement: string;
  /** How the family is made. */
  craft: string;
}

const FAMILY: Record<Family, FamilyInfo> = {
  architecture: {
    label: "Temple Architecture",
    placement:
      "Built into the fabric of the derasar — the shikhar above, the sanctum within, and the threshold you cross to enter.",
    craft:
      "Carved first in premium wood, then clad in silver, german silver, brass or copper — polished and lacquered to endure, from normal to extra-deep carving.",
  },
  symbols: {
    label: "Sacred Symbols",
    placement:
      "The auspicious symbols and adornments that crown the deity and dress the sanctum on days of worship.",
    craft:
      "Worked in silver, gold and copper with minakari enamel, jadtar stone-setting and two-tone polish.",
  },
  ceremonial: {
    label: "Ceremonial",
    placement:
      "The centrepieces of ritual and procession — the throne, the assembly, the chariot and the discourse seat.",
    craft:
      "Carved and clad in two- and three-tone metal, each piece sized and balanced for ceremonial use.",
  },
  devotional: {
    label: "Puja & Devotional",
    placement:
      "The vessels and ware of daily worship — from the aarti lamp raised at dusk to the table the puja is laid upon.",
    craft:
      "Hand-raised in silver and brass, engraved where needed with yantra and name, and mirror-polished.",
  },
};

/** One truthful line per piece: what it is + where it belongs. */
const OVERVIEW: Record<string, string> = {
  // -- architecture --
  dhwajadand:
    "The flag-mast finial that crowns the shikhar and flies the temple dhaja — shaped by religious calculation in pure brass or copper.",
  kalash:
    "The sacred pinnacle vessel at the apex of the spire; the metal cover is made to fit over the marble kalash on the shikhar.",
  doors:
    "The carved doors of the sanctum and the derasar — premium wood, clad, polished and lacquered, from normal to extra-deep carving.",
  bhandar:
    "The temple offering safe — carved wood clad in metal, wall-mounted or free-standing, with a tijori-like locking mechanism.",
  mandir:
    "A carved shrine for the home or the derasar, in wood or clad metal, made to any size.",
  "deri-window-and-door":
    "The window and door of the deri, the small shrine niche — carved in wood or worked in metal with brass pipes and jali.",
  "door-step":
    "The threshold of the sanctum — in carved wood, glass-and-brass, or acrylic.",
  "wooden-ceiling":
    "A carved wooden ceiling for the derasar interior, worked to depth.",
  "brass-hardware-and-door-fittings":
    "Handles, hinges and door fittings in polished brass, made to match the sanctum.",
  "brass-gate": "Cast and welded brass gates in a variety of designs for the temple.",
  "brass-grill-jali": "Pierced brass grill and jali screens for windows and doors.",
  "aluminium-platform-railing-and-ladder":
    "Practical aluminium platforms, railings and ladders for the temple.",

  // -- symbols --
  "angi-mugat":
    "The crown (mugat) and adornment (angi) for the deity — in gold, silver and jadtar, with minakari enamel and moti detailing.",
  "14-swapna-and-parna":
    "The fourteen auspicious dreams seen by the Tirthankara's mother, with the parna — rendered in silver, minakari and two-tone polish.",
  ashtamangal:
    "The eight auspicious symbols (ashtamangal), worked in silver, copper and minakari.",
  chattar:
    "The ceremonial parasol raised over the idol — intricately carved, single or two-tone, in varied sizes.",
  pichwadi:
    "The ornamental backdrop set behind the deity — in silver and copper with minakari and two-tone finishes.",
  toran:
    "The decorative arch hung over the doorway — painted or clad in silver, german silver or brass.",
  "manekstambh-toran":
    "The manekstambh toran, exclusively handcrafted in premium wood.",
  indradhaja:
    "The Indra banner (indradhaja), exclusively handcrafted for the temple.",
  "cloth-dhaja": "Cloth banners flown from the shikhar.",

  // -- ceremonial --
  "samovasaran-trigadu":
    "The samavasarana — the divine three-tiered preaching assembly of the Tirthankara — a centrepiece in two or three tones, supplied with a sized brass thali.",
  divistand:
    "The lamp stand made to complement the samovasaran and trigadu, in various sizes and finishes.",
  sinhasan:
    "The lion-throne (sinhasan) on which the idol is seated, exquisitely carved.",
  "vyaakhyan-paat":
    "The discourse seat from which the sermon is given — carved with steps and a central trigadu.",
  rath:
    "The processional chariot — clad in silver, german silver or brass, sturdy and movable.",
  palkhi: "The ceremonial palanquin carried in procession.",
  "kumbh-kalash": "The ceremonial kumbh kalash.",
  "pakshal-kalash":
    "The pakshal (ablution) kalash and kundi used in the abhishek.",
  "vyaakhyan-kamal": "The lotus discourse piece, the vyaakhyan kamal.",
  "kalpavruksh-naan":
    "The wish-fulfilling tree, the kalpavruksha, rendered for the temple.",
  "wooden-carved-murti": "Hand-carved wooden murtis.",

  // -- devotional --
  "brass-tijori": "A secure brass safe, polished and lacquered.",
  "brass-bell":
    "The temple bell, engraved with yantra and name and hung with a brass chain or wall bracket.",
  "brass-bracket-and-chain":
    "Brass mounting brackets and chains for the temple bell.",
  "puja-table":
    "The worship table — carved wood and brass, plain or with delicate inlay.",
  patla: "The low seat (patla) for the ritual — in silver, german silver and inlay work.",
  table: "Wood or clad-metal tables for the puja.",
  "ashtaprakari-puja-bajot":
    "The low table (bajot) for the eight-fold ashtaprakari puja — supplied with a sized brass tray with a drainage pipe.",
  "shatrunjay-pat":
    "The pilgrimage tableau of Shatrunjaya — in silver, copper, two-tone or painting.",
  "navkar-pat": "The Navkar mantra tableau, framed.",
  "fibre-pat": "Lightweight fibre pats in varied designs.",
  "silver-darpan": "The silver mirror (darpan) shown to the deity in the aarti.",
  "silver-pankho": "The silver ceremonial fan (pankho).",
  "silver-chaamar": "The silver whisk (chaamar) waved before the deity.",
  "silver-aarti-mangal-divo": "The silver aarti lamp, the mangal divo.",
  "108-diva-aarti": "The 108-lamp aarti stand, for the grand aarti.",
  "silver-kothi": "Silver storage vessels (kothi).",
  "silver-frames": "Silver photo and image frames.",
  "photo-frame": "Framed devotional imagery.",
};

export interface ProductInfo {
  familyLabel: string;
  /** What it is + where it belongs (falls back to the catalog blurb). */
  overview: string;
  placement: string;
  craft: string;
  /** Key facts for the spec strip. */
  spec: { label: string; value: string }[];
}

/** Resolve the static info for one piece. Truthful, catalog-and-family-derived. */
export function getProductInfo(p: {
  slug: string;
  family: Family;
  variants: string[];
  blurb?: string;
}): ProductInfo {
  const fam = FAMILY[p.family] ?? FAMILY.devotional;
  const materials = p.variants.length
    ? p.variants.join(" · ")
    : "Silver, brass & carved wood";
  return {
    familyLabel: fam.label,
    overview: OVERVIEW[p.slug] ?? p.blurb ?? "",
    placement: fam.placement,
    craft: fam.craft,
    spec: [
      { label: "Collection", value: fam.label },
      { label: "Materials & finish", value: materials },
      { label: "Made to order", value: "Sized to your derasar" },
    ],
  };
}
