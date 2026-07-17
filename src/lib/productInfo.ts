import type { Family } from "@/types/sanity";

/**
 * Static, per-piece information for the product detail pages. The catalog
 * (`catalog.ts`) carries the marketing blurb, the material variants and the
 * photo; this adds the INFORMATIONAL layer a visitor wants when they open a
 * single piece: what it actually is, where in the temple it belongs, and how it
 * is made.
 *
 * Everything here is deliberately TRUTHFUL and generic-where-unsure, these are
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
      "Built into the fabric of the derasar, the shikhar above, the sanctum within, and the threshold you cross to enter.",
    craft:
      "Carved first in premium wood, then clad in silver, german silver, brass or copper, polished and lacquered to endure, from normal to extra deep carving.",
  },
  symbols: {
    label: "Sacred Symbols",
    placement:
      "The auspicious symbols and adornments that crown the deity and dress the sanctum on days of worship.",
    craft:
      "Worked in silver, gold and copper with minakari enamel, jadtar stone setting and two tone polish.",
  },
  ceremonial: {
    label: "Ceremonial",
    placement:
      "The centrepieces of ritual and procession, the throne, the assembly, the chariot and the discourse seat.",
    craft:
      "Carved and clad in two and three tone metal, each piece sized and balanced for ceremonial use.",
  },
  devotional: {
    label: "Puja & Devotional",
    placement:
      "The vessels and ware of daily worship, from the aarti lamp raised at dusk to the table the puja is laid upon.",
    craft:
      "Hand raised in silver and brass, engraved where needed with yantra and name, and mirror polished.",
  },
};

/** One truthful line per piece: what it is + where it belongs. */
const OVERVIEW: Record<string, string> = {
  // -- architecture --
  dhwajadand:
    "The flag mast finial that crowns the shikhar and flies the temple dhaja, shaped by religious calculation in pure brass or copper.",
  kalash:
    "The sacred pinnacle vessel at the apex of the spire; the metal cover is made to fit over the marble kalash on the shikhar.",
  doors:
    "The carved doors of the sanctum and the derasar, premium wood, clad, polished and lacquered, from normal to extra deep carving.",
  bhandar:
    "The temple offering safe, carved wood clad in metal, wall mounted or free standing, with a tijori like locking mechanism.",
  mandir:
    "A carved shrine for the home or the derasar, in wood or clad metal, made to any size.",
  "deri-window-and-door":
    "The window and door of the deri, the small shrine niche, carved in wood or worked in metal with brass pipes and jali.",
  "door-step":
    "The threshold of the sanctum, in carved wood, glass and brass, or acrylic.",
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
    "The crown (mugat) and adornment (angi) for the deity, in gold, silver and jadtar, with minakari enamel and moti detailing.",
  "14-swapna-and-parna":
    "The fourteen auspicious dreams seen by the Tirthankara's mother, with the parna, rendered in silver, minakari and two tone polish.",
  ashtamangal:
    "The eight auspicious symbols (ashtamangal), worked in silver, copper and minakari.",
  chattar:
    "The ceremonial parasol raised over the idol, intricately carved, single or two tone, in varied sizes.",
  pichwadi:
    "The ornamental backdrop set behind the deity, in silver and copper with minakari and two tone finishes.",
  toran:
    "The decorative arch hung over the doorway, painted or clad in silver, german silver or brass.",
  "manekstambh-toran":
    "The manekstambh toran, exclusively handcrafted in premium wood.",
  indradhaja:
    "The Indra banner (indradhaja), exclusively handcrafted for the temple.",
  "cloth-dhaja": "Cloth banners flown from the shikhar.",

  // -- ceremonial --
  "samovasaran-trigadu":
    "The samavasarana, the divine three tiered preaching assembly of the Tirthankara, a centrepiece in two or three tones, supplied with a sized brass thali.",
  divistand:
    "The lamp stand made to complement the samovasaran and trigadu, in various sizes and finishes.",
  sinhasan:
    "The lion throne (sinhasan) on which the idol is seated, exquisitely carved.",
  "vyaakhyan-paat":
    "The discourse seat from which the sermon is given, carved with steps and a central trigadu.",
  rath:
    "The processional chariot, clad in silver, german silver or brass, sturdy and movable.",
  palkhi: "The ceremonial palanquin carried in procession.",
  "kumbh-kalash": "The ceremonial kumbh kalash.",
  "pakshal-kalash":
    "The pakshal (ablution) kalash and kundi used in the abhishek.",
  "vyaakhyan-kamal": "The lotus discourse piece, the vyaakhyan kamal.",
  "kalpavruksh-naan":
    "The wish fulfilling tree, the kalpavruksha, rendered for the temple.",
  "wooden-carved-murti": "Hand carved wooden murtis.",

  // -- devotional --
  "brass-tijori": "A secure brass safe, polished and lacquered.",
  "brass-bell":
    "The temple bell, engraved with yantra and name and hung with a brass chain or wall bracket.",
  "brass-bracket-and-chain":
    "Brass mounting brackets and chains for the temple bell.",
  "puja-table":
    "The worship table, carved wood and brass, plain or with delicate inlay.",
  patla: "The low seat (patla) for the ritual, in silver, german silver and inlay work.",
  table: "Wood or clad metal tables for the puja.",
  "ashtaprakari-puja-bajot":
    "The low table (bajot) for the eight fold ashtaprakari puja, supplied with a sized brass tray with a drainage pipe.",
  "shatrunjay-pat":
    "The pilgrimage tableau of Shatrunjaya, in silver, copper, two tone or painting.",
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

/**
 * A fuller written description per piece, the static content shown in the
 * "About the piece" section of the dedicated product page. Two sentences: its
 * role/significance, then its making/finishes. Truthful; falls back to the
 * overview for any slug without one.
 */
const DESCRIPTION: Record<string, string> = {
  // -- architecture --
  dhwajadand:
    "Raised at the very summit of the temple, the dhwajadand carries the dhaja that announces the derasar from afar and is honoured at every flag hoisting ceremony. Paramount shapes it in pure brass or copper to the proportions religious calculation prescribes, then polishes and lacquers it to weather the years on the shikhar.",
  kalash:
    "The kalash is the crowning vessel of the spire, a mark of auspiciousness and completion set at the highest point of the temple. The metal cover is raised to fit precisely over the marble kalash of the shikhar, offered in brass or copper and in a range of sizes and polishes.",
  doors:
    "The doors of the sanctum are the threshold between the world and the deity, and are carved to be worthy of that passage. Premium wood is worked from normal to extra deep relief, then clad, polished and lacquered, in wood, silver, german silver, brass, copper, inlay, jali or diamond finishes.",
  bhandar:
    "The bhandar receives the offerings of the faithful, and so is built to be both beautiful and secure. Carved wood is clad in metal over a tijori like locking mechanism, wall mounted or free standing, its intricacy heightened by two and three tone cladding.",
  mandir:
    "A carved shrine for the home or the derasar, the mandir gives the deity a dwelling scaled to its setting. It is made in premium wood or clad metal, to any size, with the same depth of carving as the temple itself.",
  "deri-window-and-door":
    "The deri is the small shrine niche within the temple, and its window and door frame the view of the enshrined image. They are carved in wood or worked in metal, with brass pipes and jali where the design calls for it.",
  "door-step":
    "The threshold step is crossed at every entry to the sanctum and is finished to honour that act. Paramount makes it in carved wood, in glass and brass, or in acrylic.",
  "wooden-ceiling":
    "A carved wooden ceiling completes the derasar interior overhead, echoing the carving of the walls and doors below. It is worked to depth in premium wood.",
  "brass-hardware-and-door-fittings":
    "The handles, hinges and fittings of the sanctum are made to match its doors rather than bought off the shelf. Each is cast and finished in polished brass.",
  "brass-gate":
    "Brass gates guard the temple approach and are made in a range of designs to suit the setting. Each is cast and welded, then polished.",
  "brass-grill-jali":
    "Pierced grill and jali screens filter light and air into the temple while carrying the ornament of the building. Paramount offers a variety of designs for windows and doors.",
  "aluminium-platform-railing-and-ladder":
    "Beyond the ornament, a temple needs sound practical fittings for access and safety. Paramount fabricates aluminium platforms, railings and ladders sized to the building.",

  // -- symbols --
  "angi-mugat":
    "The mugat crowns the deity and the angi adorns it, the finery worn on days of celebration. They are worked in gold, silver and copper, with jadtar stone setting, minakari enamel, wirework and moti.",
  "14-swapna-and-parna":
    "The fourteen auspicious dreams foretold the birth of the Tirthankara and are displayed together during the festival that recalls them. Paramount renders the set, with the parna, in silver, minakari and two tone polish.",
  ashtamangal:
    "The eight auspicious symbols are set before the deity as a mark of blessing. They are worked in silver, copper and minakari.",
  chattar:
    "The chattar is the honorific parasol held above the idol, a sign of sovereignty and reverence. It is intricately carved, offered single or two tone in silver, gold, copper, brass or german silver, and in varied sizes.",
  pichwadi:
    "The pichwadi is the ornamental backdrop that frames the enshrined image. It is made in silver and copper with minakari and two tone finishes.",
  toran:
    "The toran is hung across the doorway as a welcome and a blessing on the threshold. It is painted or clad in silver, german silver or brass.",
  "manekstambh-toran":
    "The manekstambh toran takes its name from the jewel pillar of the samavasarana and is among the most ornate of the hangings. It is exclusively handcrafted in premium wood.",
  indradhaja:
    "The indradhaja is the banner of Indra, raised on the great occasions of the temple. It is exclusively handcrafted.",
  "cloth-dhaja":
    "The cloth dhaja flies from the shikhar and is changed at the appointed times. Paramount supplies it in varied designs.",

  // -- ceremonial --
  "samovasaran-trigadu":
    "The samavasarana is the divine assembly in which the Tirthankara delivers the sermon, its tiers rising in three concentric levels, the trigadu. As a centrepiece it is made in two or three tones and supplied with a brass thali sized to it.",
  divistand:
    "The divistand holds the lamps that light the samovasaran and trigadu, and is made to complement them. It is offered in various sizes and finishes.",
  sinhasan:
    "The sinhasan is the lion throne on which the idol is seated, the seat of the deity within the sanctum. It is exquisitely carved and finished to match the shrine.",
  "vyaakhyan-paat":
    "From the vyaakhyan paat the guru delivers the discourse, raised on steps above the assembly. It is intricately carved, with a central trigadu.",
  rath:
    "The rath is the chariot that carries the deity in procession through the streets. Paramount builds it sturdy and movable, clad in silver, german silver or brass.",
  palkhi:
    "The palkhi is the palanquin borne on shoulders in procession. It is handcrafted for the ceremony.",
  "kumbh-kalash":
    "The kumbh kalash is the ceremonial pot used in the rites of the temple. It is handcrafted for the occasion.",
  "pakshal-kalash":
    "The pakshal kalash and its kundi carry the water for the abhishek, the ritual bathing of the deity. They are made together for the ablution.",
  "vyaakhyan-kamal":
    "The vyaakhyan kamal is the lotus form used in the discourse setting. It is handcrafted for the temple.",
  "kalpavruksh-naan":
    "The kalpavruksha is the wish fulfilling tree of legend, rendered in metal for the temple. Paramount handcrafts it as a ceremonial piece.",
  "wooden-carved-murti":
    "Hand carved wooden murtis are shaped by artisans versed in the proportions of the tradition. Each is carved to order.",

  // -- devotional --
  "brass-tijori":
    "The brass tijori keeps the temple's valuables secure without breaking from its material palette. It is polished and lacquered.",
  "brass-bell":
    "The temple bell is rung at worship to announce the presence of the divine. It is engraved with yantra and name, and hung with a brass chain or wall bracket.",
  "brass-bracket-and-chain":
    "The bracket and chain mount the bell and are made to bear it. Both are worked in brass.",
  "puja-table":
    "The puja table holds the articles of worship through the ritual. It is made in carved wood and brass, plain or with delicate inlay.",
  patla:
    "The patla is the low seat used in the ritual. It is offered in silver, german silver and inlay work.",
  table:
    "A table for the puja, made in wood or clad metal, and sized to the setting.",
  "ashtaprakari-puja-bajot":
    "The bajot is the low table on which the eight substances of the ashtaprakari puja are offered. It is supplied with a sized brass tray fitted with a drainage pipe.",
  "shatrunjay-pat":
    "The Shatrunjay pat depicts the great pilgrimage tirth of Palitana, its temples and paths laid out for veneration. It is made in silver, copper, two tone or as a painting.",
  "navkar-pat":
    "The Navkar pat sets the foremost mantra of the tradition before the worshipper. It is framed for the temple or the home.",
  "fibre-pat":
    "Lightweight fibre pats carry the same imagery at a lower weight. They are offered in varied designs.",
  "silver-darpan":
    "The darpan is the mirror shown to the deity during the aarti, so that it may see its own reflected form. It is made in silver.",
  "silver-pankho":
    "The pankho is the ceremonial fan waved before the deity. It is made in silver.",
  "silver-chaamar":
    "The chaamar is the whisk waved in service before the deity, a gesture of attendance. It is made in silver.",
  "silver-aarti-mangal-divo":
    "The mangal divo is the auspicious lamp raised at the close of the aarti. It is made in silver.",
  "108-diva-aarti":
    "The grand aarti is offered on one hundred and eight lamps at once, and this stand holds them all. It is made for the occasion.",
  "silver-kothi":
    "Silver kothi are the storage vessels of the temple. They are raised and polished in silver.",
  "silver-frames":
    "Silver frames hold the images and photographs of the tradition. They are made in a range of sizes.",
  "photo-frame":
    "Framed devotional imagery for the temple and the home. Each is made to the picture it holds.",
};

export interface ProductInfo {
  familyLabel: string;
  /** What it is + where it belongs (falls back to the catalog blurb). */
  overview: string;
  /** The fuller static description shown on the dedicated page. */
  description: string;
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
  const overview = OVERVIEW[p.slug] ?? p.blurb ?? "";
  return {
    familyLabel: fam.label,
    overview,
    description: DESCRIPTION[p.slug] ?? overview,
    placement: fam.placement,
    craft: fam.craft,
    spec: [
      { label: "Collection", value: fam.label },
      { label: "Materials & finish", value: materials },
      { label: "Made to order", value: "Sized to your derasar" },
    ],
  };
}
