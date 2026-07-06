# Design-Sync Spec — align the site with the client brand deck (27June.pdf)

Source of truth: the client's official 120-page brand deck. Goal: make the website's
**typography and ornamental design language match the deck exactly** — no invented/random
motifs. The site's existing structure, sections, animations, cinematic door intro, kalash
spin and copy are already approved: **only typography + ornament/frame styling change.**
Do NOT redesign layouts, remove sections, or touch the door-intro / kalash-spin / cinematic
mechanics beyond letting them inherit the new fonts.

High-res deck references (read these images directly):
- Hero "Crafting Divine Elegance": `/private/tmp/claude-501/-Users-apar-Desktop-A-PARAMOUNT/f2df3501-ec83-4494-947f-0865a13d035b/scratchpad/hires/p04_hero.png`
- About / Generation stats + semicircle: `…/scratchpad/hires/p07_gen.png`
- Corner arch-A watermark: `…/scratchpad/hires/p06_about.png`
- Product template (chips/circle): `…/scratchpad/hires/p13_dhwaj.png`
- "Shaped by devotion" quote: `…/scratchpad/hires/p30_quote.png`
- 4-petal flourish on olive: `…/scratchpad/hires/p64_flourish.png`
- Contact/back page: `…/scratchpad/hires/p117_contact.png`
- Damask full page: `…/scratchpad/hires/p118_damask_full.png`
- Contact-sheet overview of all pages: `…/scratchpad/pdfpages/sheet_1.png` … `sheet_5.png`

## 1. Palette (sampled from the deck — EXACT)
| token | hex | role in deck |
|---|---|---|
| cream | `#FEF4DA` | primary ground |
| cream-deep | `#F3E4C8` | soft panel tint |
| olive | `#8A7F4A` | the brand olive — semicircles, headings, damask |
| olive-deep | `#7C7244` | darker olive shade |
| espresso | `#2E2313` | near-black brown |
| heading-brown | `#431716` | the dark warm brown of "Crafting Divine" display text |
| gold | `#E2CA82` | coin chips, dividers, stat numerals |
| tan | `#BCAF87` | muted accents |

**NO maroon/oxblood anywhere.** `#431716` is a dark *brown* used only as heading text color
(as in the deck) — it is NOT a maroon panel fill. Keep velvet/interlude panels olive.

## 2. Typography — the deck's fonts

The deck's real fonts are **Storica** (display) + **Juana** (italic accent), both commercial
and only present as incomplete PDF subsets — they cannot be legally/completely reproduced.
Use the closest properly-licensed Google fonts (verified by specimen against the deck):

- **Display / headings / section titles / product names → `Spectral`** (serif). Replaces
  Poppins. Weights 400/500/600, plus italic available. Warm even-contrast serif matching
  the deck's "Crafting Divine".
- **Italic editorial accent → `Cormorant_Garamond`** (use *italic*). Replaces Playfair.
  Weights 500/600. Flowing calligraphic italic matching the deck's "*Elegance*".
- **Body / UI → `Inter`** (unchanged — the deck's body font).
- **Devanagari product names → `Noto_Serif_Devanagari`** (unchanged).

### Wiring (edit `src/styles/fonts.ts` + `src/app/globals.css`)
- `fonts.ts`: replace the `Poppins` import/export with `Spectral` (var `--font-spectral`),
  and `Playfair_Display` with `Cormorant_Garamond` (var `--font-cormorant`, styles
  normal+italic). Keep the exported `fontVariables` join updated. Keep Inter + Noto.
- `globals.css`: remap `--font-display: var(--font-spectral)` and
  `--font-serif: var(--font-cormorant)`. Leave `--font-body`/`--font-sans` on Inter.
- Add a one-line comment block in fonts.ts: "To use the exact brand fonts, drop
  Storica/Juana `.woff2` into src/fonts and swap these `next/font/google` calls for
  `next/font/local` — the CSS variables downstream stay identical." (documentation only.)
- The **wordmark/logo stays the real PNG** — do not re-typeset "A PARAMOUNT".

## 3. Motif catalog (rebuild as crisp SVG — tintable via currentColor)

All motifs are built from the two brand primitives — the **arch-A monogram** and the
**4-petal lotus diamond**. Trace shapes to match the deck references above.

1. **ArchMark** — the logo mark: a tall pointed (ogee) gothic arch enclosing a small `A`,
   double-outline stroke. Stroke-based, `currentColor`. (The deck uses it as watermark,
   in dividers, and in the damask.) Match `p06_about.png` corner watermark + `p04` divider.
2. **LotusFlourish** — a 4-petal lotus/diamond: four pointed petals (N/E/S/W) around a
   tiny center diamond, the vertical petals longer. Fill or stroke, `currentColor`. Match
   `p64_flourish.png` and the watermark inside the semicircle on `p07_gen.png`.
3. **OrnamentDivider** (refine the existing one to match the deck EXACTLY): a thin hairline
   running left+right from a centered composition of `· ✦ · (ArchMark medallion) · ✦ ·` —
   small 4-point diamonds flanking a small arch-A. Used under every section title and
   between stat blocks. See the rule under "Elegance" in `p04` and under "ABOUT US" /
   between "Years of Legacy" in `p07`.
4. **BrandDamask** — the signature tone-on-tone pattern: columns alternating ArchMark and
   LotusFlourish, linked by faint **dotted vertical lines**, rows half-drop offset. Build as
   a repeating inline-SVG `background-image` (data URI) using `currentColor` at low opacity
   so it tints per context (darker-cream on cream grounds, lighter-olive on olive grounds).
   Match the olive semicircle fill on `p04` and the full page `p118_damask_full.png`.

## 4. Components to build (in `src/components/ui/` unless noted)

Exact APIs — the application agents depend on these signatures:

- `ArchMark.tsx` — `export default function ArchMark({ className }: { className?: string })`.
  SVG, `currentColor`, viewBox tight to the mark. No fixed color.
- `LotusFlourish.tsx` — `({ className }: { className?: string })`. SVG, `currentColor`.
- `OrnamentDivider.tsx` (REPLACE existing) — `({ className, width }: { className?: string;
  width?: "sm" | "md" | "lg" })`. Hairline + diamonds + ArchMark medallion, `currentColor`;
  color set by parent text color (e.g. `text-[#E2CA82]/70` gold, or `text-olive/50`).
- `SectionHeading.tsx` — `({ eyebrow?, title, align?, tone?, className? })`. Renders an
  optional tracked-caps eyebrow, the `title` in `font-display` (Spectral) — tracked caps for
  short section labels ("ABOUT US") or title-case for headings — and an `OrnamentDivider`
  beneath. `tone`: "olive" (default) | "cream" (for use on olive grounds). This is the
  deck's universal section-header pattern (`p07`). Reuse it everywhere a section opens.
- `VariantChip.tsx` — `({ label }: { label: string })`. A small **gold coin** icon (filled
  circle with a subtle inner ring + tiny ArchMark or dot) followed by the `label` in
  tracked caps. Matches the deck's "◉ BRASS DHWAJADAND" variant chips (`p13`). Replaces the
  current bordered material chips on product pages.
- `SemicircleField.tsx` — `({ side?, children?, damask?, flourish?, className? })`. The big
  olive half-circle bleeding off `side` ("left"|"right"), optional faint `damask` fill and
  centered `flourish` watermark; `children` render on top (e.g. "GENERATION" + stats).
  Match `p04`/`p07`.
- `StatBlock.tsx` — `({ value, label }: { value: string; label: string })`. Big serif value
  (e.g. "1968"/"50+") over a tracked-caps label with an `OrnamentDivider` under it. Deck
  `p07` "50+ / Years of Legacy" style.
- `BrandDamask.tsx` — `({ className, opacity? })`. A positioned layer that paints the
  BrandDamask pattern (via CSS background-image data URI), `currentColor`-tinted, for faint
  section-background texture. Match `p118`.

## 5. Application map (Phase 2) — where each goes, without breaking approved work

- **globals.css / layout**: fonts swapped (§2). Every existing `font-display` heading now
  renders in Spectral serif automatically; every `font-serif italic` accent now Cormorant.
  Sanity-check that nothing set an explicit `font-family` that bypasses the vars.
- **CinematicHero** (`sections/CinematicHero.tsx`): the eyebrow/tagline + "Crafting Divine
  Elegance" wordplay — ensure the italic accent word uses `font-serif` (Cormorant) and the
  divider under it is the refined `OrnamentDivider`. Do NOT touch the logo image, the scroll
  scrub, the door handoff, or the ambient tweens.
- **DevotionStatement** (`sections/DevotionStatement.tsx`): already a full-screen olive
  panel — reskin its header to `SectionHeading`, its "1968 / 242+ / 3" to `StatBlock`s with
  dividers (deck `p07`), and add a faint `BrandDamask` / `LotusFlourish` watermark inside
  the panel. Keep the count-up + SplitText behavior.
- **FeaturedFamilies** / collection headers / `CategoryHero` / gallery / about / contact /
  craftsmanship: replace ad-hoc section headers with `SectionHeading`; add `SemicircleField`
  or `BrandDamask` where the deck uses them (about → semicircle+stats; interludes → damask).
- **Product family + detail pages** (`products/*`, `CategoryBrowser`, `FamilyShowcase`):
  swap material chips → `VariantChip`; where the deck frames a hero product in a circle,
  offer a circular framing option (keep the existing masonry otherwise).
- **Footer / contact**: match the deck's centered contact treatment (`p117`) — Spectral,
  tracked caps, ornament divider, cream ground.

## 6. Guardrails
- gsap only via `@/lib/gsap`; keep all animation perf work intact (no new always-on loops,
  no backdrop-filter, transforms/opacity only).
- Tailwind v4 tokens; put any new color tokens in `globals.css @theme` (e.g.
  `--color-heading-brown: #431716`). Don't hardcode hexes scattered around — use tokens.
- Every changed file: `npx tsc --noEmit` must stay clean; `next build` must stay green.
- Keep the whole thing on the approved palette — cream/olive/gold/espresso, no maroon.
