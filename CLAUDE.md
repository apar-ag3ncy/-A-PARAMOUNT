@AGENTS.md

# Paramount — project guide

Premium catalog site for **A Paramount Engineering Works** (Jain/Hindu temple artifacts, est. 1968). View-only, cinematic scroll. Planning docs live one level up: `../PARAMOUNT_BUILD_PLAN.md`, `../PARAMOUNT_CONTENT.md` (locked content + design tokens = source of truth), `../PARAMOUNT_SCROLL_UI_PROMPT.md` (animation layer).

## Conventions
- **Design tokens** live in `src/app/globals.css` `@theme` (Tailwind v4, CSS-first) — palette is olive-brass `#8A7F4A` on cream `#FEF4DA`. Edit tokens there, not in `tailwind.config.ts`. Utilities: `bg-cream`, `text-olive-deep`, `font-display` (Poppins), `font-serif` (Playfair, use italic), `font-body` (Inter), `rounded-card`.
- **Every image renders through `AssetFrame`** (`src/components/ui/AssetFrame.tsx`). 30 of 50 products carry the client's real photos (`catalog.ts` `image` → `/public/products/*.webp`, shown UNCROPPED via `fit="contain"` — client mandate: never crop product shots). The rest show the empty frame until Sanity/`urlFor()` fills them.
- **Cinematic intros**: `DoorIntro` (home, once per session — temple doors push inward, layers in `/public/door/`, coordination via `pm:doors-open`; a server-rendered `#pm-precover` masks boot, and `#smooth-wrapper` is hidden during the show) and `CinematicHero` (self-drawing logo; first scroll intent hurries the intro so it never overlaps the scrub timeline).
- **Kalash showcase is a BAKED 48-frame sprite spin** (`/public/kalash/kalash-spin.webp`, drag-to-rotate, no three.js on home). Client-approved after three failed WebGL photo-projection attempts — do NOT go back to runtime 3D for single-photo products; re-render frames offline instead (simulator technique in git history `778c82a`). GLB products still use the lazy R3F path.
- **NO maroon/oxblood anywhere** — client rejected it. Velvet sections use the deep-olive family (#4A4428→#2E2313) with pista #DCCF95 / gold #E2CA82 accents.
- **GSAP**: import only from `@/lib/gsap` (plugins registered once). Wrap every scroll animation in `gsap.context` + `gsap.matchMedia`, respect `prefers-reduced-motion`, and clean up on unmount. Use `useIsomorphicLayoutEffect`.
- **ScrollSmoother gotcha**: CSS `position: sticky` does NOT work for elements *inside* `#smooth-content` — use a `ScrollTrigger` pin instead (see `CategoryBrowser` filter rail, `ProductGalleryTabs`). Sticky is fine for the Header (it's outside the smooth-wrapper).
- Local catalog data: `src/lib/catalog.ts` (50 products, families, variants) — the fallback/seed until Sanity.

## Build state (code-complete)
The whole build plan is implemented and `next build` is green (66 pages):
- Scroll-UI §0–§9: ScrollSmoother, AssetFrame, masonry (batch reveal + FLIP filter), full product IA (`/products` pinned horizontal → family page → detail w/ material tabs), home (pinned/scrub hero, mask reveals, velocity marquee, magnetic CTA), content pages, polish (cursor, loading, page transitions).
- **Sanity (Prompt B)**: schemas + `lib/sanity/*` + `lib/data.ts` (async, Sanity→catalog fallback); embedded Studio at `/studio`. NOTE the layout split — `app/(site)/layout.tsx` carries the chrome so `/studio` renders clean on the minimal root layout. The Studio page is a **client** component (sanity's `import useSWR from "swr"` breaks under Turbopack's react-server condition otherwise).
- **3D (Prompt G)**: `ProductViewer3D` — R3F, lazy in-view, procedural brass kalash or GLB from `product.model3d`.
- **Resend (Prompt H)**: `/api/contact` (zod-validated, env-gated) + RHF/zod `ContactForm`.

Everything is env-gated with a catalog/mailto fallback, so it runs today with zero credentials.

## To go live (credentials + content only — no code)
- Set env (see `.env.example`): `NEXT_PUBLIC_SANITY_PROJECT_ID` (+ dataset) turns on live content + `/studio`; `RESEND_API_KEY` turns on contact-form email.
- Enter products + upload `heroImage`/galleries in Sanity — frames fill in automatically (`resolveSanityUrl` → `urlFor`).
- Upload `.glb` to `product.model3d` for real 3D (procedural kalash until then).
- Logo SVG from client (deck monogram can be traced as a fallback).
