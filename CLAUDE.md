@AGENTS.md

# Paramount — project guide

Premium catalog site for **A Paramount Engineering Works** (Jain/Hindu temple artifacts, est. 1968). View-only, cinematic scroll. Planning docs live one level up: `../PARAMOUNT_BUILD_PLAN.md`, `../PARAMOUNT_CONTENT.md` (locked content + design tokens = source of truth), `../PARAMOUNT_SCROLL_UI_PROMPT.md` (animation layer).

## Conventions
- **Design tokens** live in `src/app/globals.css` `@theme` (Tailwind v4, CSS-first) — palette is olive-brass `#8A7F4A` on cream `#FEF4DA`. Edit tokens there, not in `tailwind.config.ts`. Utilities: `bg-cream`, `text-olive-deep`, `font-display` (Poppins), `font-serif` (Playfair, use italic), `font-body` (Inter), `rounded-card`.
- **Every image renders through `AssetFrame`** (`src/components/ui/AssetFrame.tsx`). Today `resolveSanityUrl` returns `null`, so all frames show the elegant empty state; wiring `urlFor()` (Prompt B) fills the whole site automatically.
- **GSAP**: import only from `@/lib/gsap` (plugins registered once). Wrap every scroll animation in `gsap.context` + `gsap.matchMedia`, respect `prefers-reduced-motion`, and clean up on unmount. Use `useIsomorphicLayoutEffect`.
- **ScrollSmoother gotcha**: CSS `position: sticky` does NOT work for elements *inside* `#smooth-content` — use a `ScrollTrigger` pin instead (see `CategoryBrowser` filter rail, `ProductGalleryTabs`). Sticky is fine for the Header (it's outside the smooth-wrapper).
- Local catalog data: `src/lib/catalog.ts` (50 products, families, variants) — the fallback/seed until Sanity.

## Build state (done)
Scroll-UI §0–§9: ScrollSmoother foundation, AssetFrame, masonry (batch reveal + FLIP material filter), full product IA (`/products` pinned horizontal → family page → detail with material tabs), home (pinned/scrub hero, mask reveals, velocity marquee, magnetic CTA), content pages (about/craftsmanship/gallery/contact), polish (custom cursor, loading screen, page transitions). `next build` is green (66 pages).

## Not yet wired (next)
- **Sanity** (Prompt B): schemas in `../PARAMOUNT_BUILD_PLAN.md §8`; replace `resolveSanityUrl` + `src/lib/sanity/*` stubs; Studio at `/studio`.
- **Resend** (Prompt H): `/api/contact` returns 501 — the contact form falls back to a mailto prompt until wired.
- **Product photography + logo SVG**: extract from the deck / client.
- **3D viewer** (Prompt G): `ProductViewer3D` still a stub (needs `.glb` models + R3F).
