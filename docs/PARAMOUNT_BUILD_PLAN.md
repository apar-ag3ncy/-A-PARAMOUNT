# Paramount — Website Build Plan
A premium catalog website for a Jain temple artifacts company. View-only (no cart), heavy on cinematic scroll animations and 3D product presentation. This document is structured so each section can be pasted into Claude Code as a discrete build task.

> ✅ **Colors, typography, brand copy, taxonomy, and contact are now LOCKED** from the three source PDFs — the full extracted spec lives in [`PARAMOUNT_CONTENT.md`](PARAMOUNT_CONTENT.md) (companion doc; source of truth for all content/design tokens). Still pending: product **photography** + **logo SVG** (to extract from the 114-page deck) and per-product **"significance" long-copy** (to author). Sections patched from the original placeholders: §4 (colors + typography), §9/§12 (hero), §13.
>
> 🎬 **Animation/scroll layer:** the smooth-scroll + animation approach in §5, §9, §10, and §12 (Prompts C/D) is **superseded by [`PARAMOUNT_SCROLL_UI_PROMPT.md`](PARAMOUNT_SCROLL_UI_PROMPT.md)** — it swaps Lenis + SplitType for the GSAP ScrollSmoother/SplitText ecosystem and adds the AssetFrame placeholder system, Pinterest masonry, and pinned/scrub cinematics. Apply that doc *after* Prompt A. Where the two conflict on motion, the scroll-UI doc wins.

---

## 1. Project brief
- **Client:** Paramount — *A Paramount Engineering Works (APEW)*, est. **1968**, Mumbai. Manufacturer of Jain temple artifacts (dhwajadand, kalash, doors, mandirs, palkhis, murtis, etc.). Three generations; "Makers of Temple Accessories."
- **Tagline:** **Crafting Divine Elegance** — *"Exquisite craftsmanship that blends devotion, tradition and timeless beauty."*
- **Purpose:** Premium digital showcase / catalog. Not e-commerce. Users browse and preview; enquiry goes through contact form.
- **Emotional register:** Reverent, editorial, luxurious. Think *Aesop* meets *Loro Piana* meets a temple sanctum. Restraint over excess.
- **Animation ambition:** "Godly" — cinematic scroll sequences, 3D product viewers, silky page transitions. But motion serves the products; it never competes with them.
- **Deliverables:** Fully responsive site + Sanity CMS for client to manage products.
- **Contact (locked):** Two Mumbai workshops — K-11 & F-107, Ansa Industrial Estate, Saki Vihar Road, Sakinaka, Andheri East, Mumbai 400072 · aparamount1968@gmail.com · Facebook/Instagram: *A Paramount Engineering Works* · Suresh Zaveri +91 93242 45830 · Harshal Zaveri +91 98210 44024 · Nehal Zaveri +91 98211 89666 · Yesha Zaveri Shah +91 98707 41412.

---

## 2. Site map
```
/                          Home
/about                     About / heritage story
/craftsmanship             The artisan process (deep-dive editorial)
/products                  All categories (grid overview)
/products/[category]       Category page — all material variants shown together
/products/[category]/[slug] Individual product detail with 3D viewer
/gallery                   Photography portfolio / installation shots
/contact                   Enquiry form + showroom locations
/studio                    Sanity Studio (admin, hidden from nav)
```

---

## 3. Product taxonomy
Products are grouped into **4 top-level families** in the mega-menu. Each product has multiple **material variants** displayed as tabs on a single page (never as separate URLs — per client brief "SHOW ALL ON SAME PAGE"). Canonical product order follows the client's "order of importance" (see `PARAMOUNT_CONTENT.md` §6).

### Family 1 — Temple Architecture
Structural / built-in items.
| Product | Material variants |
|---|---|
| Dhwajadand | Brass, Copper |
| Kalash | Brass, Copper |
| Doors | Wooden (Normal / Deep / Extra-deep carving), Silver, German Silver, Brass, GS+Brass, Copper+Brass, Inlay/Embossed, Brass Jali, Diamond |
| Bhandar | Wooden, Silver, German Silver, Brass, GS+Brass, Copper+Brass, Inlay/Embossed, No-wood metal |
| Mandir | Wooden, Silver, Brass, German Silver, GS+Brass |
| Deri window & door | Wooden, Silver, Brass, German Silver, GS+Brass, Brass Jali |
| Door step | Wooden, Brass, Acrylic |
| Wooden ceiling | — |
| Brass hardware & door fittings | — |
| Brass gate, grill / jali | — |
| Aluminium platform, railing, ladder | — |

### Family 2 — Sacred Symbols
Ornamental sacred objects with rich material/finish options.
| Product | Material variants |
|---|---|
| Angi Mugat | Silver, Gold, Copper, Two-tone polish, Full Jadtar, Half Jadtar, Wire, Minakari, Moti |
| 14 Swapna & Parna | Silver, Copper, Two-tone polish, Diamond, Minakari |
| Ashtamangal | Silver, Copper, Two-tone polish, Minakari |
| Chattar | Silver, Gold, Copper, Brass, German Silver, Two-tone polish, Diamond |
| Pichwadi | Silver, Copper, Two-tone polish, Minakari |
| Toran, Manekstambh Toran | — |
| Indradhaja, Cloth Dhaja | — |

### Family 3 — Ceremonial Pieces
Larger ceremonial and processional items.
| Product | Material variants |
|---|---|
| Samovasaran / Trigadu | Wooden, Silver, German Silver, Brass, GS+Brass, Copper+Brass |
| Divistand | Wooden, Silver, German Silver, Brass, GS+Brass, Copper+Brass |
| Sinhasan | — |
| Vyaakhyan Paat | — |
| Rath | — |
| Palkhi | — |
| Vyaakhyan Kamal | — |
| Kumbh Kalash, Pakshal Kalash | — |
| Kalpavruksh Naan | — |
| Wooden Carved Murti | — |

### Family 4 — Puja & Devotional
Everyday puja items, pats, and silver accessories.
| Product | Material variants |
|---|---|
| Puja Table | Wooden, Brass, Inlay |
| Patla | Silver, German Silver, Two-tone polish, Inlay |
| Table | Wooden, German Silver, GS+Brass |
| Ashtaprakari Puja Bajot | Silver, German Silver, GS+Brass, Inlay |
| Shatrunjay Pat | Silver, Copper, Two-tone polish, Painting |
| Navkar Pat, Fibre Pat | — |
| Silver Darpan, Pankho, Chaamar | — |
| Silver Aarti Mangal Divo, 108 Diva Aarti | — |
| Silver Kothi, Silver Frames | — |
| Brass Tijori, Brass Bell, Brass Bracket & Chain | — |
| Photo Frame | — |

---

## 4. Design system

### Colors — *locked from brand deck*
Antique olive-brass on warm cream — sampled directly from `17 June AP.pdf`. (Replaces the original bright-gold/ivory placeholder.)
```css
/* Verified from the brand deck */
--color-cream:       #FEF4DA;  /* page background (dominant) */
--color-cream-deep:  #F3E4C8;  /* card / secondary surface */
--color-olive:       #8A7F4A;  /* PRIMARY brand — accent, borders, large fills */
--color-olive-deep:  #6F6639;  /* headings, hover, shadow of olive */
--color-olive-muted: #A69A6E;  /* borders, dividers, muted UI */
--color-tan:         #BCAF87;  /* damask pattern lines, light accents */
--color-oxblood:     #4F1A16;  /* deep-maroon accent — icon strokes, badges */
--color-espresso:    #2E2313;  /* body text (a11y-safe on cream) */
--color-taupe:       #A89E8C;  /* neutral grey-brown — icon chips */
```
> a11y: the deck sets body text in low-contrast olive; use `--color-espresso` for anything under 18px to hold Lighthouse a11y ≥ 95. Reserve `--color-olive-deep` for large headings, `--color-oxblood` for emphasis. Cream text on olive fills.

### Typography — *locked from brand deck*
Sans-led with an elegant serif-italic accent — the way the deck sets "Crafting Divine *Elegance*".
- **Display / headings:** Poppins (light 300, regular 400, semibold 600) — hero and section titles.
- **Serif accent:** Playfair Display (italic 500) — one accent word per heading, pull-quotes, numerals (the italic "Elegance").
- **Body / UI:** Inter (regular 400, medium 500) — paragraphs, UI.
- **Devanagari accent:** Noto Serif Devanagari — for product names in original script.
- **Logo wordmark:** supplied SVG (glyphic serif) — do not re-typeset.

### Spacing scale
`4, 8, 12, 16, 24, 32, 48, 64, 96, 128` (Tailwind default).

### Radius
Cards `12px`, buttons `8px`, images `4px`. Never fully rounded.

### Motif vocabulary (from the deck)
Temple-arch (torana) monogram enclosing an "A" · quatrefoil / four-petal ornament · concentric arcs (corner graphic) · arch-and-spark damask (seamless background texture on olive) · line-art shikhar illustration (tonal watermark) · circular photo masks · ornamental hairline dividers. Product photography sits on draped ivory silk; installation shots show real temple interiors.

### Motion principles
1. **Slow crossfades over cuts.** 800–1200ms is normal here.
2. **One hero animation per section** — never three competing.
3. **Ease-out for entrance, ease-in-out for continuous motion.**
4. **Respect `prefers-reduced-motion`** — all scroll-triggered animations must fall back to instant.
5. **60fps or don't ship it.** Profile every scene.

---

## 5. Tech stack
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSG, image optimization, file-based routing matches taxonomy |
| Language | TypeScript | Type-safe Sanity queries |
| Styling | Tailwind CSS v4 | Utility speed, matches component patterns |
| CMS | Sanity.io | Rich schema for products + variants, great image CDN |
| Smooth scroll | Lenis | The single biggest "expensive-feeling" upgrade |
| Scroll animation | GSAP + ScrollTrigger | Industry standard for cinematic timelines |
| Component motion | Framer Motion | Page transitions, hover, layout animations |
| 3D | React Three Fiber + Drei + Three.js | 3D product viewers for hero items |
| Text animation | SplitType | Character/word reveals |
| Micro-animations | Lottie React | AE-exported ornamental animations |
| Forms | React Hook Form + Zod | Contact form validation |
| Email | Resend | Enquiry delivery |
| Image utils | sharp, plaiceholder | Blur placeholders, optimization |
| Icons | lucide-react | Only where a Unicode/text icon won't do |
| Hosting | Vercel | Zero-config Next.js + edge caching |
| Analytics | Vercel Analytics + PostHog | Traffic + interaction insights |

---

## 6. Installation
```bash
# Scaffold
npx create-next-app@latest paramount-website --typescript --tailwind --app --src-dir --import-alias "@/*"
cd paramount-website
# Animation
npm install gsap framer-motion lenis lottie-react split-type
# 3D
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
# CMS
npm install @sanity/client @sanity/image-url next-sanity @sanity/vision sanity styled-components
# Forms
npm install react-hook-form zod @hookform/resolvers resend
# Utils
npm install lucide-react clsx tailwind-merge class-variance-authority sharp plaiceholder next-sitemap
# Dev quality
npm install -D prettier prettier-plugin-tailwindcss eslint-config-prettier
```

---

## 7. Folder structure
```
paramount-website/
├── src/
│   ├── app/
│   │   ├── layout.tsx                       # Root layout: fonts, Lenis, Header, Footer
│   │   ├── page.tsx                         # Home
│   │   ├── globals.css                      # Tailwind + design tokens
│   │   ├── about/page.tsx
│   │   ├── craftsmanship/page.tsx
│   │   ├── gallery/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx                     # All categories
│   │   │   ├── layout.tsx                   # Breadcrumb + category rail
│   │   │   └── [category]/
│   │   │       ├── page.tsx                 # All variants on one page
│   │   │       └── [slug]/page.tsx          # Individual product detail
│   │   ├── studio/[[...tool]]/page.tsx      # Embedded Sanity Studio
│   │   ├── api/contact/route.ts             # Resend handler
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MegaMenu.tsx
│   │   │   └── SmoothScrollProvider.tsx    # Lenis wrapper
│   │   │
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── Tabs.tsx
│   │   │   ├── Dialog.tsx
│   │   │   ├── CustomCursor.tsx
│   │   │   └── LoadingScreen.tsx
│   │   │
│   │   ├── sections/
│   │   │   ├── HomeHero.tsx                 # Full-viewport hero
│   │   │   ├── FeaturedFamilies.tsx         # 4 product families showcase
│   │   │   ├── CraftStory.tsx               # Parallax editorial section
│   │   │   ├── HeritageStrip.tsx            # Devanagari + English marquee
│   │   │   ├── Testimonials.tsx
│   │   │   └── EnquiryCTA.tsx
│   │   │
│   │   ├── products/
│   │   │   ├── CategoryHero.tsx             # Category landing hero
│   │   │   ├── ProductGrid.tsx              # Masonry / grid layout
│   │   │   ├── ProductCard.tsx              # With hover reveal
│   │   │   ├── ProductGallery.tsx           # Zoom + slideshow
│   │   │   ├── MaterialTabs.tsx             # Silver / Brass / Copper switcher
│   │   │   ├── ProductViewer3D.tsx          # R3F canvas for hero products
│   │   │   └── RelatedProducts.tsx
│   │   │
│   │   └── animations/
│   │       ├── SplitTextReveal.tsx          # SplitType + GSAP
│   │       ├── ScrollReveal.tsx             # IntersectionObserver fade-up
│   │       ├── MagneticButton.tsx           # Cursor-attracted button
│   │       ├── ParallaxImage.tsx            # Scroll-linked Y transform
│   │       ├── PageTransition.tsx           # Framer Motion layout wrap
│   │       ├── MarqueeRow.tsx               # Infinite scroll text
│   │       └── ImageMaskReveal.tsx          # Clip-path reveal on scroll
│   │
│   ├── lib/
│   │   ├── sanity/
│   │   │   ├── client.ts
│   │   │   ├── image.ts                     # urlFor() helper
│   │   │   └── queries.ts                   # GROQ queries
│   │   ├── gsap.ts                          # ScrollTrigger registration
│   │   ├── constants.ts                     # Site constants, nav items
│   │   └── utils.ts                         # cn(), formatters
│   │
│   ├── hooks/
│   │   ├── useLenis.ts
│   │   ├── useGsapContext.ts
│   │   ├── useInView.ts
│   │   ├── useMediaQuery.ts
│   │   └── useMousePosition.ts
│   │
│   ├── styles/
│   │   └── fonts.ts                         # next/font declarations (Poppins, Playfair Display, Inter, Noto Serif Devanagari)
│   │
│   └── types/
│       └── sanity.ts                        # Product, Category, Variant types
│
├── sanity/
│   ├── schemas/
│   │   ├── index.ts
│   │   ├── category.ts
│   │   ├── product.ts
│   │   ├── materialVariant.ts
│   │   ├── artisan.ts
│   │   └── testimonial.ts
│   └── sanity.config.ts
│
├── public/
│   ├── models/                              # .glb 3D files (5–10 hero products)
│   ├── videos/                              # Hero background loops
│   ├── lottie/                              # .json Lottie files
│   └── images/
│
├── .env.local                               # SANITY_PROJECT_ID, RESEND_API_KEY, etc.
├── next.config.js
├── tailwind.config.ts
├── sanity.config.ts
└── package.json
```

---

## 8. Sanity schemas
Actual TypeScript schemas — paste directly into `sanity/schemas/`.

### `category.ts`
```ts
import { defineType, defineField } from 'sanity';
export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({
      name: 'family',
      type: 'string',
      options: {
        list: [
          { title: 'Temple Architecture', value: 'architecture' },
          { title: 'Sacred Symbols', value: 'symbols' },
          { title: 'Ceremonial Pieces', value: 'ceremonial' },
          { title: 'Puja & Devotional', value: 'devotional' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', type: 'number', description: 'Display order within family' }),
    defineField({ name: 'description', type: 'text', rows: 3 }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [
        { name: 'title', type: 'string' },
        { name: 'description', type: 'text', rows: 2 },
      ],
    }),
  ],
});
```

### `product.ts`
```ts
import { defineType, defineField } from 'sanity';
export default defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'titleDevanagari', type: 'string', description: 'Product name in original script' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'category', type: 'reference', to: [{ type: 'category' }] }),
    defineField({ name: 'shortDescription', type: 'text', rows: 3 }),
    defineField({ name: 'longDescription', type: 'array', of: [{ type: 'block' }] }),
    defineField({ name: 'significance', type: 'text', rows: 4, description: 'Religious / cultural significance' }),
    defineField({
      name: 'variants',
      type: 'array',
      of: [{ type: 'materialVariant' }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: 'heroImage', type: 'image', options: { hotspot: true } }),
    defineField({ name: 'model3d', type: 'file', options: { accept: '.glb,.gltf' }, description: 'Optional 3D model' }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', type: 'number' }),
  ],
  preview: {
    select: { title: 'title', media: 'heroImage', subtitle: 'category.title' },
  },
});
```

### `materialVariant.ts`
```ts
import { defineType, defineField } from 'sanity';
export default defineType({
  name: 'materialVariant',
  title: 'Material Variant',
  type: 'object',
  fields: [
    defineField({
      name: 'material',
      type: 'string',
      options: {
        list: [
          'Silver', 'Gold', 'Brass', 'Copper', 'German Silver',
          'GS + Brass', 'Copper + Brass', 'Wooden',
          'Two-tone Polish', 'Inlay / Embossed', 'Diamond',
          'Minakari', 'Jadtar (Full)', 'Jadtar (Half)', 'Moti', 'Wire',
          'Painting', 'Acrylic', 'Fibre',
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'carvingLevel', type: 'string', options: { list: ['Normal', 'Deep', 'Extra Deep'] }, description: 'For wooden items only' }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: 'notes', type: 'text', rows: 2, description: 'Anything specific about this variant' }),
  ],
  preview: {
    select: { title: 'material', media: 'gallery.0' },
  },
});
```

---

## 9. Animation strategy per page
### Home page — the show-stopper
1. **Loading screen** (1.5s) — Devanagari mantra fades in → out. Sets sacred tone.
2. **Hero** — Full-viewport slow-pan video of a temple sanctum with a hero product in center. Heading **"Crafting Divine"** (Poppins) with **"Elegance"** in Playfair Display italic splits in over 1.2s; subtitle *"Exquisite craftsmanship that blends devotion, tradition and timeless beauty."*
3. **Product families section** — Four large cards. As user scrolls, each pins briefly, image parallaxes, then releases.
4. **Craft story** — Editorial split-layout. Text on left slides up as image on right scales from 90% → 100%.
5. **Heritage marquee** — Infinite scroll strip of product names in Devanagari + English at ~20px/sec.
6. **3D showcase** — One hero product (e.g. a brass Kalash) in a 3D canvas with orbit controls. Auto-rotates until user interacts.
7. **Enquiry CTA** — Magnetic button. Cursor attracts to it within 100px radius.

### Category page (e.g. `/products/doors`)
1. Category hero with product name in large display type.
2. Filter chips for material variants (all-on-one-page as briefed).
3. Masonry grid with ImageMaskReveal on scroll — each card's image reveals via clip-path.
4. Hover: card image scales 1.05, overlay fades in with product name.

### Product detail page
1. Left column: sticky product gallery with material tabs. Switching tabs crossfades images (400ms).
2. Right column: title (SplitType word reveal), significance text, dimensions table.
3. Below fold: 3D viewer if `model3d` exists.
4. Related products carousel at bottom.

---

## 10. Component priorities
**Build in this order** — each is a discrete Claude Code task:
1. `SmoothScrollProvider` (Lenis) — foundation, must be first
2. `Header` + `MegaMenu` — global nav
3. `Footer`
4. `ScrollReveal` + `SplitTextReveal` — reusable animation primitives
5. `HomeHero` — the emotional anchor of the site
6. `FeaturedFamilies` — home page's core content
7. `ProductGrid` + `ProductCard` — the category workhorse
8. `MaterialTabs` + `ProductGallery` — the product page core
9. `ProductViewer3D` — the flagship interactive
10. `CraftStory` + `HeritageStrip` + `MarqueeRow` — editorial sections
11. `MagneticButton` + `CustomCursor` — polish layer
12. `ContactForm` — enquiry handling
13. `PageTransition` — final polish, applied at layout level

---

## 11. 9-week roadmap
| Week | Phase | Deliverable |
|---|---|---|
| 1 | Discovery | Content audit, client interview, product photography plan |
| 2 | Design | Figma mockups for 5 key pages, moodboard, motion references |
| 3 | Foundation | Next.js scaffold, Tailwind tokens, Sanity schemas, layout shell |
| 4 | Content pages | About, Craftsmanship, Gallery, Contact — real Sanity content |
| 5 | Product system | Category page + Product detail + MaterialTabs, wired to CMS |
| 6 | Animation core | Lenis, GSAP ScrollTrigger, SplitText, all reveal primitives |
| 7 | 3D + showcase | R3F viewer, home hero, featured families, marquee |
| 8 | Polish | Performance (Lighthouse 90+), a11y, cross-browser, SEO |
| 9 | Launch | Vercel deploy, DNS, client training, handoff docs |

---

## 12. Claude Code prompts — copy-paste to build each piece
### Prompt A — Initial scaffold
```
Scaffold a Next.js 15 project called "paramount-website" using App Router, TypeScript, Tailwind CSS v4, src/ directory, and @/* import alias. Then install all dependencies from section 6 of PARAMOUNT_BUILD_PLAN.md. Set up the folder structure exactly as shown in section 7. Configure Tailwind with the LOCKED design tokens from section 4 (olive-brass on cream palette; Poppins + Playfair Display + Inter + Noto Serif Devanagari fonts via next/font). Create empty stub files for every component listed in section 7 so imports don't break.
```

### Prompt B — Sanity setup
```
Set up Sanity.io in this project. Create the three schemas from section 8 of PARAMOUNT_BUILD_PLAN.md (category, product, materialVariant). Configure the embedded Studio at /studio route. Create the client + urlFor helper in src/lib/sanity/. Write GROQ queries for: (1) all categories grouped by family, (2) products by category slug, (3) single product by slug with all variants populated. Type everything with TypeScript. Seed content from PARAMOUNT_CONTENT.md (taxonomy §6, descriptions §7).
```

### Prompt C — Smooth scroll + layout shell
```
Build SmoothScrollProvider using Lenis. It should wrap the app in layout.tsx and expose the Lenis instance via context so GSAP ScrollTrigger can proxy scroll events. Then build the Header component with the MegaMenu — mega-menu opens on hover, shows all 4 product families with their categories as columns, uses Framer Motion for the open/close animation (200ms ease-out). Build the Footer with 3 columns: contact (from PARAMOUNT_CONTENT.md §5.7), product families quick-links, and the arch-monogram brand mark.
```

### Prompt D — Animation primitives
```
Build these reusable animation components:
1. ScrollReveal — accepts children and an optional `delay` prop. Uses IntersectionObserver to trigger a fade-up (opacity 0→1, translateY 40px→0) over 800ms ease-out when 20% visible.
2. SplitTextReveal — accepts text and a `by` prop ("word" | "char" | "line"). Uses SplitType to split, then GSAP timeline to stagger each part in (opacity 0→1, translateY 100%→0) with 40ms stagger.
3. MagneticButton — button that translates toward the cursor when cursor is within 100px, with a soft spring easing. Falls back to normal button on touch devices.
4. ParallaxImage — image that translates Y based on scroll progress within its container. Speed configurable via `speed` prop (default 0.3).
All must respect prefers-reduced-motion by short-circuiting to instant.
```

### Prompt E — Home page
```
Build the Home page (src/app/page.tsx) with these sections in order, each as its own component from src/components/sections/:
1. HomeHero — full-viewport height. Background: slow-panning video (public/videos/temple-sanctum.mp4). Center: heading "Crafting Divine" in Poppins (light) with "Elegance" in Playfair Display italic (olive) using SplitTextReveal by char. Below: the tagline line "Exquisite craftsmanship that blends devotion, tradition and timeless beauty." Fade in on mount over 1.2s.
2. FeaturedFamilies — 4 large cards in a 2x2 grid (stacked on mobile). Each card: hero image with ParallaxImage, family name, one-line description. On hover: image scales 1.05 over 600ms, dark overlay fades in with "Explore" link.
3. CraftStory — split layout, text left, image right. Text uses SplitTextReveal by word. Image uses ImageMaskReveal (clip-path inset from 100% to 0% on scroll).
4. HeritageStrip — MarqueeRow scrolling right-to-left at 20px/sec. Alternates between Devanagari product names and English translations.
5. EnquiryCTA — centered MagneticButton "Begin your enquiry" linking to /contact.
Wire all Sanity content via server components. Use next/image everywhere.
```

### Prompt F — Product system
```
Build the product browsing flow:
1. /products (page.tsx) — landing page showing all 4 families as sections, each with a horizontal scroll of category cards.
2. /products/[category]/page.tsx — category page. Fetches the category and all its products from Sanity. Renders CategoryHero with SplitTextReveal title, then ProductGrid.
3. ProductGrid — CSS masonry (grid-template-rows: masonry with fallback). Each ProductCard uses ImageMaskReveal on scroll.
4. /products/[category]/[slug]/page.tsx — product detail. Two-column layout:
   - Left (sticky): ProductGallery with MaterialTabs above it. Switching a tab crossfades the gallery images over 400ms.
   - Right: title (SplitTextReveal by word), significance text, description (Portable Text from Sanity).
   - Below fold: ProductViewer3D if product.model3d exists.
   - Bottom: RelatedProducts (4 products from same category).
Handle loading states with skeleton screens, not spinners.
```

### Prompt G — 3D viewer
```
Build ProductViewer3D using React Three Fiber. It should:
- Load a GLB from a Sanity file URL.
- Center and auto-scale the model to fit the canvas.
- Studio lighting: 3-point setup (key, fill, rim) with subtle shadows.
- Auto-rotate slowly (0.5 rad/s) until user interacts, then stop.
- OrbitControls with damping, restricted vertical rotation.
- Environment map for realistic metal reflections (use Drei's <Environment preset="studio" />).
- Loading state: elegant progress indicator, not a spinner.
- Fallback: if WebGL unsupported, show static hero image instead.
- Lazy load — only mount the canvas when the section enters viewport.
```

### Prompt H — Contact + polish
```
Build:
1. /contact page — enquiry form using react-hook-form + zod validation. Fields: name, email, phone, product of interest (dropdown from Sanity), message. Submit via /api/contact route that uses Resend. Show the two Mumbai workshop addresses + named contacts from PARAMOUNT_CONTENT.md §5.7.
2. CustomCursor — replaces default cursor on desktop only. Small dot follows cursor 1:1, larger ring follows with lag. Scales up on hoverable elements.
3. LoadingScreen — shown only on first visit. Fades in a Devanagari mantra, holds 1.5s, fades out revealing the site.
4. PageTransition — wraps routes in AnimatePresence. Exit: fade out + slight scale down. Enter: fade in + slight scale up. 400ms each.
5. next-sitemap config + robots.txt + Product structured data on detail pages.
```

---

## 13. Content status (was: "still needed from the 114-page PDF")
Extracted and **locked** in `PARAMOUNT_CONTENT.md`:
- ✅ Exact hex color palette (§4 above)
- ✅ Confirmed type pairing (§4 above)
- ✅ Copy: home hero/tagline, about, mission, vision, why-choose-us, per-product descriptions
- ✅ Client testimonials source (242-institution roster)
- ✅ Contact details, showroom addresses, named contacts
- ✅ Product taxonomy + canonical order + variants
- ✅ Brand motifs / ornamental patterns (documented; recreate as SVG)

**Still to produce:**
- ⏳ Product **photography** — extract the draped-silk product shots + installation photos from the deck (or re-shoot), upload to Sanity
- ⏳ **Logo files** (SVG + PNG) — request originals from client; deck monogram can be traced as fallback
- ⏳ Per-product **`significance`** long-copy — author in reverent editorial tone (not present in source PDFs)
- ⏳ 3D models (`.glb`) for 5–10 hero products

---

## 14. Performance targets
Non-negotiable before launch:
| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 90 (mobile) |
| Lighthouse Accessibility | ≥ 95 |
| First Contentful Paint | < 1.8s |
| Largest Contentful Paint | < 2.5s |
| Cumulative Layout Shift | < 0.1 |
| Total Blocking Time | < 200ms |
Techniques: lazy-load 3D canvases, `next/image` for every raster, WebP with AVIF fallback, code-split GSAP per-page, subset fonts, defer non-critical scripts.

---

## 15. Reference sites — steal inspiration from
Study these before starting the animation layer:
- **Studio Yorktown** — restraint + typography
- **Locomotive.ca** — scroll craft, gold standard
- **Igloo Inc** — 3D + editorial hybrid
- **Rauno.me** — micro-interactions
- **Aesop** — commerce-adjacent editorial calm
- **Loro Piana** — luxury pacing, whitespace
- **Cartier heritage pages** — how to show craft reverently

The register you're aiming for: a site that feels like walking into a temple gallery, not a shopping mall.
