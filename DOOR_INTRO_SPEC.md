# DoorIntro — cinematic temple-door opening (build spec)

Goal: an EXTREMELY luxury, godlike, Higgsfield-grade intro for the home page. The client's
temple-gate render opens toward the visitor's POV: both carved doors **push inward** (away
from the viewer), golden light floods out, the camera dollies **through** the doorway, and
the scene dissolves into the existing CinematicHero. Runs once per browser session.

## Assets (already in `public/door/` — do NOT regenerate)
| file | size (px) | role |
|---|---|---|
| `/door/facade.webp` | 2752×1536, alpha | full temple facade; the doorway rectangle is TRANSPARENT (feathered) |
| `/door/door-left.webp` | 790×1914 (leaf 395×957 @2x) | flat CLOSED left door leaf, hinge = LEFT edge |
| `/door/door-right.webp` | 790×1914 | flat CLOSED right door leaf (mirror), hinge = RIGHT edge |
| `/door/interior.webp` | 790×957 | blurred golden hall seen through the opening |

Brand text assets (existing, REAL logo — never re-typeset): `/brand/a-mark-white.png`,
`/brand/paramount-word-white.png`.

## Scene geometry (percentages of the 2752×1536 scene box)
- Scene box must COVER the viewport keeping ratio. CSS: fixed inset-0 flex items-center
  justify-center overflow-hidden; scene child: `aspect-ratio: 2752/1536; min-width:100vw; min-height:100vh;`
- Doorway rect: `left:35.79%  top:27.21%  width:28.71%  height:62.30%` of scene.
- Doorway center (dolly origin + perspective-origin): `50% 58.36%` of scene.
- Lamp-glow hotspots (flicker overlays): centers at `(20.35%, 80.4%)` and `(79.58%, 80.4%)`,
  each ~12% scene width, radial-gradient(gold `#E2CA82` → transparent).

## Layer stack inside the scene box (back → front)
1. `interior` — img at doorway rect; behind it a larger radial golden bloom div
   (gradient `#FFF6DC → #E2CA82 → transparent`, ~46% scene width, centered on doorway
   center) and 2 static god-ray streak divs (skewed linear-gradient, opacity 0 initially).
2. `doors` — a div exactly at doorway rect with `perspective: 1500px;
   perspective-origin: 50% 50%`. Two leaf imgs, each 50% width 100% height;
   left leaf `transform-origin: left center`, right leaf `transform-origin: right center`.
   Each leaf gets a child "shade" overlay (linear-gradient espresso `#2E2313` → transparent,
   pointing away from hinge) at opacity 0 — it fades IN as the door turns (fake recede-light).
3. `facade` — img, fills scene (transparent doorway shows layers 1-2 through it).
4. `lamp flickers` — the 2 radial-gradient divs, gentle yoyo (opacity .45→.75, scale ±2%,
   ~2.4s sine, staggered) for living diya flames.
5. `text` — centered column at doorway center (y≈52%): mark img (h ≈ 8vh) → wordmark img
   (w ≈ clamp(260px, 30vw, 500px)) → serif italic line (Playfair, cream `#FEF4DA`):
   “The doors have been opening since 1968.” → tracking-caps line (Poppins 11px,
   letter-spacing .28em, gold `#E2CA82`): “TEMPLE ARTEFACTS · CRAFTED IN MUMBAI”.
   Soft gold text-shadow for glow; thin gold rules (✦ divider) allowed. NO maroon/oxblood
   anywhere — palette is strictly cream/gold/olive/espresso/tan.
6. `flash` — full-screen cream wash (`#FEF4DA`), opacity 0, used at entry + exit.
7. Tiny skip hint bottom-right: “tap to enter” (Poppins caps, cream/60).

z-index of the whole component: `z-[250]` (FpsMeter at z-300 must stay visible above it).

## Timeline (GSAP, one master timeline; transforms/opacity ONLY — no filter, no layout props)
- Preload all 4 imgs first (`new Image()`/decode). FAILSAFE: if not decoded in 3.5s → skip
  (set flag, dispatch event, unmount) so a slow dev build never blocks the site.
- 0.0 flash starts at 1 (cream) → 0 over 1.4s power2.out; scene scale 1.05 → 1 over 1.8s.
- 0.9 text in: mark+wordmark rise (y 26→0, opacity 0→1, 1.1s power3.out, stagger .12),
  serif line + caps line follow (stagger .1). Lamp flickers running from 0.
- 2.1 DOORS OPEN (the hero beat): left leaf rotateY 0→84°, right leaf 0→−84°, 2.7s
  power2.inOut (CSS sign convention: with origin-left, POSITIVE rotateY pushes the free edge
  away from viewer; with origin-right, NEGATIVE does). Shade overlays 0→.5 in sync.
  Interior bloom opacity .55→1 and scale 1→1.3; god-rays opacity 0→.45; both scrub with the
  doors. A faint gold edge-glow line may sweep each leaf via a translated gradient child.
- 2.6 text exits: y →−30, opacity →0, 0.9s power2.in (it should be gone before dolly).
- 4.0 DOLLY-THROUGH: scene scale 1 → 3.15 over 2.0s power2.in with transform-origin
  50% 58.36%; at 4.9 flash 0→1 (0.7s); **at 4.6 dispatch `window.dispatchEvent(new
  CustomEvent("pm:doors-open"))`** so the hero intro is already mid-flight at handoff.
- 6.0 done: set `sessionStorage["pm-door-intro"]="1"`, unmount (React state → null; whole
  DOM removed; kill ctx). Flash on the HERO side is unnecessary — hero is beneath, the
  component just fades itself out (opacity →0 0.5s) as it unmounts.

## Interaction / gating
- SKIP: first `pointerdown` / `wheel` / `keydown` → `tl.timeScale(3.2)` (elegant
  fast-forward, no jump cut). Hint text as above.
- Session gate: if `sessionStorage["pm-door-intro"]` set → render null AND
  synchronously dispatch `pm:doors-open` on mount (so the hero never waits).
- Reduced motion (`prefers-reduced-motion`): no 3D, no dolly — static closed-door scene
  fades in (1s), holds 1.2s, fades out; same events/flags.
- Mobile (<1024px): same timeline, doors 2.2s, dolly 1.7s, perspective 1100px.

## Integration contracts (edit these files)
1. `src/app/(site)/page.tsx` — render `<DoorIntro />` above/before the hero.
2. `src/components/ui/LoadingScreen.tsx` — must NOT show on the home page when DoorIntro
   will play (i.e. pathname "/" and no session flag): return null immediately in that case.
   Other pages unchanged.
3. `src/components/sections/CinematicHero.tsx` — its auto-play intro timeline: when
   DoorIntro will play this session (same check), `intro.pause(0)` and play on the ONCE
   `pm:doors-open` event instead (remove listener on cleanup; keep existing
   document.hidden logic intact for the non-door path).

## Conventions (repo CLAUDE.md applies)
- gsap only via `@/lib/gsap`; wrap in `gsap.context` + `gsap.matchMedia`; clean up on
  unmount; `useIsomorphicLayoutEffect` from `@/hooks/useIsomorphicLayoutEffect`.
- Tailwind v4 utilities (`bg-cream`, `font-display`, `font-serif`…); arbitrary values fine.
- "use client" component; zero SSR window access outside effects (except a
  typeof-window-guarded session check for initial state).
- Perf: `will-change: transform` via class on animated layers only; component fully
  unmounts after; no canvas, no filters, no box-shadow animation on large surfaces.
