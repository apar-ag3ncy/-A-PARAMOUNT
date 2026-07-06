# Paramount — Locked Content & Design Spec
> Extracted from the three source PDFs (company profile deck `17 June AP.pdf` — 114pp, `APEW CATALOG NEW 2024` — 48pp, `PARAMOUNT PRODUCT LIST` — 4pp).
> This document **replaces every `[FROM CONTENT PDF]` placeholder** in `PARAMOUNT_BUILD_PLAN.md`. Design tokens, typography, and copy here are the source of truth. Goal: *maintain aesthetics & structure.*

---

## 0. Source of truth & confidence

| Item | Source | Confidence |
|---|---|---|
| Color palette (hex) | Sampled directly from deck flat-color fields | **Exact** |
| Typography | Visual analysis of deck (fonts not named in PDF) | Characterized → web-font equivalents |
| Brand copy (hero/about/mission/vision/why-us) | Transcribed from deck pages 3, 6, 7, 10, 11 | **Verbatim** |
| Contact details | Deck page 108 | **Verbatim** |
| Product taxonomy + order | `PARAMOUNT PRODUCT LIST.pdf` ("order of importance") | **Verbatim** |
| Per-product descriptions | `APEW CATALOG` text layer | **Verbatim** |
| Client roster (242) | `APEW CATALOG` pp. 43–45 | **Verbatim** |

---

## 1. Brand identity

- **Legal / full name:** A Paramount Engineering Works (APEW)
- **Established:** 1968 · **Mumbai, India** · three generations · 50+ years
- **Descriptor:** *Makers of Temple Accessories* — manufacturer of Jain Derasar and Hindu Temple accessories
- **Associated houses / sub-brands:** Adinath Enterprises · Shashwat Enterprises · Arihant Art
- **Logo:** wordmark **"A PARAMOUNT / ENGINEERING WORKS"** (glyphic serif) beneath a **temple-arch (torana) monogram enclosing an "A"**. Header lockup style: `A PARAMOUNT · ENGINEERING WORKS` in spaced serif caps.
- **Tagline / hero line:** **"Crafting Divine Elegance"** ("Elegance" set in serif italic, olive)
- **Hero subtitle:** *"Exquisite craftsmanship that blends devotion, tradition and timeless beauty."*

### Reference images (in `paramount-extract/reference-images/`)
- `hero-tagline.png` — the "Crafting Divine Elegance" hero (type + layout reference)
- `logo-lockup.png` — the arch monogram + wordmark on olive
- `pattern-damask.png` — the repeating arch-and-spark background pattern
- `big_sheet00–03.png` — contact sheets of all 114 deck pages

---

## 2. Color palette  *(replaces BUILD_PLAN §4 colors)*

Sampled directly from the brand deck. The identity is **antique olive-brass on warm cream** — NOT the bright gold/ivory placeholder in the original plan.

```css
/* ---- Paramount palette (verified from brand deck) ---- */
--color-cream:        #FEF4DA;  /* page background (dominant) */
--color-cream-deep:   #F3E4C8;  /* card / secondary surface  */
--color-olive:        #8A7F4A;  /* PRIMARY brand / accent / large fills */
--color-olive-deep:   #6F6639;  /* hover, darker headings, shadow of olive */
--color-olive-muted:  #A69A6E;  /* borders, dividers, muted UI */
--color-tan:          #BCAF87;  /* damask pattern lines, light accents */
--color-oxblood:      #4F1A16;  /* deep maroon — icon strokes, badges, key headings */
--color-espresso:     #2E2313;  /* body text (warm near-black) — a11y-safe on cream */
--color-taupe:        #A89E8C;  /* icon-chip circles, neutral grey-brown */
```

**Usage**
- **Background:** `--color-cream`. Large hero/section fills & footers: `--color-olive` (cream text on top).
- **Primary text on cream:** `--color-espresso` (the deck uses a lower-contrast olive-brown; `--color-espresso` is recommended for body to hit the plan's Lighthouse a11y ≥ 95 while reading identically warm). Use `--color-olive-deep` for large headings, `--color-oxblood` for emphasis/accents.
- **Text on olive fills:** `--color-cream`.
- **Accent / CTA:** `--color-oxblood` or `--color-olive`. Borders/hairlines: `--color-olive-muted` at low opacity.

> a11y note: `#6F6639` on `#FEF4DA` ≈ 4.3:1 (OK for large text, borderline for body). Use `--color-espresso` for anything below 18px.

---

## 3. Typography  *(replaces BUILD_PLAN §4 typography)*

The deck is **sans-led with an elegant serif-italic accent** — a refinement of the plan's original Cormorant+Inter idea.

| Role | In the deck | Recommended web font | Weights |
|---|---|---|---|
| **Display / section headings** ("Crafting Divine", "ABOUT US") | geometric-humanist sans, caps | **Poppins** (or Jost) | 300, 400, 500, 600 |
| **Elegant serif accent** (the word "*Elegance*", editorial pull-quotes, big numerals) | high-contrast serif italic w/ swashes | **Playfair Display** (italic) | 400, 500 italic |
| **Logo wordmark** | glyphic serif (Trajan/Optima feel) | supplied logo asset (SVG) — do not re-typeset | — |
| **Body / UI** | humanist sans | **Inter** (or Poppins 400) | 400, 500 |
| **Devanagari accent** (product names in script) | — | **Noto Serif Devanagari** | 400 |

**Pairing rule:** Headings in Poppins (light/regular, generous letter-spacing on caps). Reserve Playfair Display **italic** for one accent word per heading and for numerals/quotes — mirrors the "Crafting Divine *Elegance*" treatment. Body in Inter.

---

## 4. Motifs & visual language

Recreate these as SVG/CSS accents (all present in the deck):

1. **Temple arch (torana) monogram** — pointed trefoil arch enclosing an "A". Primary brand mark & favicon.
2. **Quatrefoil / four-petal flower** — section divider ornament (e.g. deck p58, p69).
3. **Concentric arcs** — large quarter-circle graphic bleeding off a corner (cover, section intros). Great for hero corner treatment.
4. **Arch-and-spark damask** — seamless repeating pattern: small arches + 4-point sparkles joined by dotted vertical rules (`pattern-damask.png`). Use as low-opacity background texture on olive fills.
5. **Line-art temple spire (shikhar)** — fine single-line architectural illustration used as a tonal watermark (deck p7). Use behind About/Craftsmanship.
6. **Circular photo masks** — product/hero photos framed in perfect circles that bleed off the page edge.
7. **Ornamental hairline divider** — `— ✦ · ◠(A) · ✦ —` small centered rule under headings.

### Photography style
- Products shot on **draped ivory/white silk** backdrops (soft folds), warm even lighting, gold/brass hero pieces glowing against cream.
- **Installation shots**: real temple interiors — carved wooden ceilings, silver doors, gabhara/sanctum, mandaps.
- Portrait crops often masked into circles; catalog spreads use 2×3 product grids on the silk-drape background.

---

## 5. Website copy (verbatim, ready to place)

### 5.1 Home hero
- **Heading:** Crafting Divine **Elegance**  *(italic serif on "Elegance")*
- **Sub:** Exquisite craftsmanship that blends devotion, tradition and timeless beauty.
- **Eyebrow / kicker:** A Paramount Engineering Works · Since 1968

### 5.2 Stat strip (from About)
`Since 1968` · `50+ Years of Legacy` · `3 Generations` · `240+ Temples Served` (client roster = 242 entries)

### 5.3 About Us
> Established in 1968, A Paramount Engineering Works is a manufacturing company based in Mumbai, India which deals in all kinds of Jain Derasar and Hindu Temple accessories.
>
> Backed by rich experience and extensive knowledge, we pride ourselves of being the only company that provides all kinds of temple needs under one roof with rare combination of engineering expertise and artistic skills.
>
> We are one of the major suppliers of temple accessories and handicrafts in the country. We provide a wide variety of products and services to meet customer requirements and provide one-stop solution to all the temple needs. The knowledge that we possess about our shastra gives us an upper hand compared to our competitors.
>
> With three generations in the business, the company is driven by passion and commitment to craftsmanship, customer satisfaction and innovation.
>
> The company enjoys a reliable image in the industry through its commitment to quality, on-time delivery and maintaining transparency and fairness in its relationships with the customers.

### 5.4 Our Mission
> For over 50 years, the company has upheld the legacy of crafting superior temple products distinguished by precision, dedication and devotion.
>
> Our mission is to uphold the sanctity of these products by ensuring unparalleled quality, timeless design and utmost respect for religious traditions.
>
> We strive to exceed expectations through continuous improvement, ethical practices and commitment to serving religious communities globally.

### 5.5 Our Vision
> As a leading manufacturer of temple products, we envision expanding our legacy of excellence and integrity.
>
> Guided by our core values and passionate workforce, we aim to set new benchmarks in quality and design. We aspire to enhance the sacredness of temples globally with our products and services.

### 5.6 Why Choose Us (5 pillars — icon + title + line)
1. **Authentic Craftsmanship** — Skilled artisans with deep knowledge of tradition and shastra.  *(icon: shield-check)*
2. **Premium Quality Materials** — Only the finest wood and metals for lasting beauty and durability.  *(icon: diamond)*
3. **Customization as per Requirement** — Tailored designs and finishes to match your vision and temple aesthetics.  *(icon: gear)*
4. **Timely Delivery & Reliability** — Committed to on-time delivery with complete transparency.  *(icon: clock)*
5. **Devotion in Every Detail** — We don't just manufacture, we create with faith, respect and devotion.  *(icon: hand-heart)*

### 5.7 Contact  *(replaces BUILD_PLAN contact placeholders)*
- **Workshops (two units):**
  - K-11, Ansa Industrial Estate, Saki Vihar Road, Sakinaka, Andheri East, Mumbai – 400072
  - F-107, Ansa Industrial Estate, Saki Vihar Road, Sakinaka, Andheri East, Mumbai – 400072
- **Email:** aparamount1968@gmail.com
- **Facebook / Instagram:** A Paramount Engineering Works
- **People:**
  - Mr. Suresh Zaveri — +91 93242 45830
  - Mr. Harshal Zaveri — +91 98210 44024
  - Mr. Nehal Zaveri — +91 98211 89666
  - Mrs. Yesha Zaveri Shah — +91 98707 41412

---

## 6. Product taxonomy — canonical order & variants
Order is the client's **"order of importance"** from the product list (drives the CMS `order` field). Families are the editorial grouping from the build plan (kept). Descriptions in §7.

| # | Product | Family | Material variants |
|---|---|---|---|
| 1 | Dhwajadand | Architecture | Brass, Copper |
| 2 | Kalash | Architecture | Brass, Copper |
| 3 | Doors ⟨all-on-page⟩ | Architecture | Wooden (Normal/Deep/Extra-deep carving), Silver, German Silver, Brass, GS+Brass, Copper+Brass, Inlay/Embossed, Brass Jali, Diamond |
| 4 | Bhandar ⟨all-on-page⟩ | Architecture | Wooden, Silver, German Silver, Brass, GS+Brass, Copper+Brass, Inlay/Embossed, No-wood (Brass/Copper) |
| 5 | Samovasaran / Trigadu ⟨all-on-page⟩ | Ceremonial | Wooden, Silver, German Silver, Brass, GS+Brass, Copper+Brass |
| 6 | Divistand ⟨all-on-page⟩ | Ceremonial | Wooden, Silver, German Silver, Brass, GS+Brass, Copper+Brass |
| 7 | Angi Mugat ⟨all-on-page⟩ | Symbols | Silver, Gold, Copper, Two-tone Polish, Full Jadtar, Half Jadtar, Wire, Minakari, Moti |
| 8 | 14 Swapna & Parna ⟨all-on-page⟩ | Symbols | Silver, Copper, Two-tone Polish, Diamond, Minakari |
| 9 | Ashtamangal ⟨all-on-page⟩ | Symbols | Silver, Copper, Two-tone Polish, Minakari |
| 10 | Chattar ⟨all-on-page⟩ | Symbols | Silver, Gold, Copper, Brass, German Silver, Two-tone Polish, Diamond |
| 11 | Pichwadi ⟨all-on-page⟩ | Symbols | Silver, Copper, Two-tone Polish, Minakari |
| 12 | Mandir ⟨all-on-page⟩ | Architecture | Wooden, Silver, Brass, German Silver, GS+Brass |
| 13 | Deri Window & Door ⟨all-on-page⟩ | Architecture | Wooden, Silver, Brass, German Silver, GS+Brass, Brass Jali |
| 14 | Door Step | Architecture | Wooden, Brass, Acrylic |
| 15 | Wooden Ceiling | Architecture | — |
| 16 | Brass Tijori | Devotional | — |
| 17 | Brass Bell | Devotional | — |
| 18 | Brass Bracket & Chain | Devotional | — |
| 19 | Brass Hardware & Door Fittings | Architecture | — |
| 20 | Brass Gate | Architecture | — |
| 21 | Brass Grill / Jali | Architecture | — |
| 22 | Aluminium Platform, Railing & Ladder | Architecture | — |
| 23 | Puja Table ⟨all-on-page⟩ | Devotional | Wooden, Brass, Inlay |
| 24 | Patla | Devotional | Silver, German Silver, Two-tone Polish, Inlay |
| 25 | Table | Devotional | Wooden, German Silver, GS+Brass |
| 26 | Ashtaprakari Puja Bajot | Devotional | Silver, German Silver, Brass, GS+Brass, Inlay |
| 27 | Sinhasan | Ceremonial | — |
| 28 | Vyaakhyan Paat | Ceremonial | — |
| 29 | Toran | Symbols | — |
| 30 | Manekstambh Toran | Symbols | — |
| 31 | Rath | Ceremonial | — |
| 32 | Indradhaja | Symbols | — |
| 33 | Palkhi | Ceremonial | — |
| 34 | Cloth Dhaja | Symbols | — |
| 35 | Shatrunjay Pat ⟨all-on-page⟩ | Devotional | Silver, Copper, Two-tone Polish, Painting |
| 36 | Navkar Pat | Devotional | — |
| 37 | Fibre Pat | Devotional | — |
| 38 | Kumbh Kalash | Ceremonial | — |
| 39 | Pakshal Kalash / Pakshal Kundi | Ceremonial | — |
| 40 | Vyaakhyan Kamal | Ceremonial | — |
| 41 | Kalpavruksh Naan | Ceremonial | — |
| 42 | Wooden Carved Murti | Ceremonial | — |
| 43 | Silver Darpan | Devotional | — |
| 44 | Silver Pankho | Devotional | — |
| 45 | Silver Chaamar | Devotional | — |
| 46 | Silver Aarti Mangal Divo | Devotional | — |
| 47 | 108 Diva Aarti | Devotional | — |
| 48 | Silver Kothi | Devotional | — |
| 49 | Silver Frames | Devotional | — |
| 50 | Photo Frame | Devotional | — |

> Also seen in catalog (extras to confirm with client): Abhishek Kalash, Brass Urli & Diya, Saraswati Murti, Navkaar Mantra Frame.

---

## 7. Per-product descriptions (verbatim from catalog — CMS `shortDescription` seed)

- **Kalash:** Handcrafted in pure brass or copper, in different sizes, designs and polish as per requirements. Kalash cover can be fitted on the marble kalash on the shikhar of the derasar.
- **Dhwajadand:** Handcrafted in pure brass or copper, in different sizes and polish for both Jain derasar and Hindu mandir. Size follows calculations as per religious norms.
- **Wooden Doors (Deep Carving):** Exclusively handcrafted per chosen design in premium quality wood; carving depth ≈ 0.75"–1.5" for heightened intricacy.
- **Wooden Doors (Normal Carving):** Handcrafted in premium wood; carving depth ≈ 0.25"–0.38", lighter in intricacy than deep carving.
- **Silver / German Silver Doors:** Silver (or German silver) sheet cladded on the wooden door, then polished and lacquered for shine and durability.
- **German Silver–Brass Doors:** Combination of German silver and brass highlighting parts of the design.
- **Brass Doors:** Brass sheet cladded on premium wood, polished and lacquered.
- **Inlay / Embossed Doors:** Fine craftsmanship combining brass knobs, inlay and embossed work in premium wood and brass.
- **Copper–Brass Doors:** Copper and brass sheets cladded to highlight the carving, then polished and lacquered.
- **Diamond Door:** One of its kind — colours, premium stones and diamonds; acrylic framing for protection and durability.
- **Wooden Bhandar:** Exquisitely handcrafted in premium wood; sizes to requirement; polished in any shade; carving depth per design.
- **Silver / GS–Brass Bhandar:** Silver and brass sheets cladded to enhance carving; carving or granite top; various sizes and shapes.
- **Brass–Copper Bhandar:** Copper and brass (optionally with silver/GS) for a two/three-tone effect; tijori-like mechanism; can be wall-mounted.
- **Samovasaran / Trigadu:** Silver, german silver, brass, copper, two/three-tone; comes with a sized brass thali; metal sheets cladded on wood, polished and lacquered.
- **Divistand:** Made to complement the samovasaran/trigadu; silver, german silver, brass, copper, two-tone or wood; various sizes.
- **Angi Mugat:** Gold, Silver, Copper, Two-tone, Full/Half Jadtar, Wire, Minakari, Moti.
- **14 Swapna & Parna:** Silver, Copper, Two-tone, Diamond, Minakari.
- **Ashtamangal:** Silver, Copper, Two-tone, Minakari.
- **Chattar:** Carved handicraft in silver, copper, german silver; single or two-tone polish; various sizes.
- **Pichwadi:** Silver and copper; two-tone; minakari.
- **Mandir:** Intricately handcrafted in premium wood; wood-polish or clad in silver/GS/brass/copper/two-tone; any size; for homes and derasar.
- **Manekstambh & Toran:** Handcrafted in premium wood; painted in bright colours or cladded with silver/GS/brass.
- **Brass Bell:** Different sizes; installed with a brass chain or wall bracket; engraved with yantra and name; polished and lacquered.
- **Vyaakhyan Paat:** Intricately handcrafted premium wood; polished in different shades; steps on one/both sides with a trigadu in the centre.
- **Door Step:** Wood with top carving, glass & brass framing, or acrylic with framing.
- **Deri Window & Door:** Wood, brass, copper, german silver or two-tone; intricate carving or brass pipes/rods.
- **Puja Table:** Wood and brass; carved or delicate inlay; brass version welded from sheets/rods/square pipes for strength.
- **Ashtaprakari Puja Bajot:** Premium wood; inlay/silver/brass/german silver/copper/two-tone; supplied with a sized brass tray with drainage pipe.
- **Rath & Indradhaja:** Premium wood clad with silver/GS/brass; sturdy and movable; various designs.
- **Brass Grill:** Variety of designs for windows and doors.
- **Shatrunjay Pat / Navkar Pat / Fibre Pat:** Devotional pats in silver, copper, two-tone or painting (fibre variants available).

*(Longer editorial `significance` text per product is TBD — see §9.)*

---

## 8. Clients (trust content)
**242 institutions served** — Jain Derasars, temples & trusts across Mumbai, Maharashtra, Gujarat, Rajasthan, MP, Chhattisgarh, Bihar, Jharkhand, West Bengal, Kerala, Tamil Nadu, AP, Karnataka, Delhi/UP — and internationally: **Nepal, USA (Las Vegas, Philadelphia), Japan (Kobe), Belgium (Antwerp)**. Full list in `paramount-extract/catalog.txt` (pp. 43–45). Marquee-worthy names: Seth Anandji Kalyanji Pedhi (Palitana), Shree Godiji Maharaj Jain Temple (Mumbai), Shatrunjay Tirth Dham, Las Vegas Jain Temple.

---

## 9. Open items / next steps
1. **Assets to extract from the deck** for the build: logo SVG (arch monogram + wordmark), damask pattern (as seamless SVG/PNG), quatrefoil & arch icons, line-art shikhar illustration, and the product photography (draped-silk shots). *(Can be pulled from the 3.3 GB deck — offer on request.)*
2. **`significance` long-copy** per product (religious/cultural meaning) — not in source PDFs; to be authored in reverent editorial tone, grounded in Jain/Hindu temple tradition.
3. **Confirm with client:** exact font files (if they own licensed brand fonts), and the extra catalog items in §6 note.
4. **Logo files** (SVG/PNG) — request originals from client; deck renders can be traced as fallback.
