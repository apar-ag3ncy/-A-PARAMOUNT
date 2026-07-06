# Paramount — Scroll-First UI + Cinematic Animation Build

Paste this into Claude Code AFTER the scaffold (Prompt A) is done. It layers the placeholder-frame system, the Pinterest-style scroll browsing, and the high-end GSAP animation over the existing structure. Read `PARAMOUNT_BUILD_PLAN.md` for taxonomy, tokens, and folder structure — this document **overrides the animation/scroll sections of that plan** (replaces Lenis + SplitType with the GSAP ScrollSmoother ecosystem).

> 🎨 **Reconciled with the locked palette** (see `PARAMOUNT_CONTENT.md` / build-plan §4). The original draft of this doc used the old placeholder token names; they've been mapped to the real tokens:
> `--color-gold → --color-olive` · `--color-parchment → --color-cream-deep` · `--color-brass-deep → --color-olive-deep`.
> **Prerequisite:** the Next.js project must be scaffolded first (build-plan §12 Prompt A). This layer assumes `src/`, the component tree, and the design tokens already exist.

## 0. Stack change — do this first
Replace Lenis + SplitType with the GSAP ecosystem (all free as of 2025):

```bash
npm uninstall lenis split-type
npm install gsap
```

We use: `gsap` core, `ScrollTrigger`, `ScrollSmoother`, `SplitText`. Register them once in `src/lib/gsap.ts`:

```ts
'use client';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
}
export { gsap, ScrollTrigger, ScrollSmoother, SplitText };
```

ScrollSmoother needs a fixed wrapper structure. In the root layout, wrap all page content:

```tsx
<div id="smooth-wrapper">
  <div id="smooth-content">
    {children}
  </div>
</div>
```

Create a `SmoothScrollProvider` client component that initializes ScrollSmoother in a `useLayoutEffect` inside a `gsap.context`, and kills it on unmount:

```ts
ScrollSmoother.create({
  wrapper: '#smooth-wrapper',
  content: '#smooth-content',
  smooth: 1.2,           // seconds of "catch-up" — the butter
  smoothTouch: 0.1,      // light smoothing on touch, keeps it feeling native
  effects: true,         // enables data-speed / data-lag parallax attributes
  normalizeScroll: true, // consistent behavior across mobile browsers
});
```

That's the whole smooth-scroll foundation. Parallax now comes free via `data-speed` and `data-lag` attributes on any element — no per-element ScrollTrigger needed.

## 1. The AssetFrame system — empty now, real photos later
This is the most important component. It renders an elegant, intentional placeholder when no image exists, and seamlessly swaps to the real photo when the client uploads one — with zero code change. The swap is driven purely by whether the Sanity `image` field is null.

Build `src/components/ui/AssetFrame.tsx`:

Props:

```ts
{
  image?: SanityImage | null;   // from Sanity; null = show placeholder
  ratio?: string;               // "3/4" | "4/5" | "1/1" | "4/3" | "2/3" — default "3/4"
  caption?: string;             // product name, shown below frame
  priority?: boolean;           // for above-fold images
  depth?: number;               // optional data-speed for masonry parallax (e.g. 0.9)
  className?: string;
}
```

Empty state (must look like a gallery frame awaiting art, NOT a loading skeleton):

* Container: `aspect-ratio` locked to `ratio`, `border-radius: 4px`, hairline border in `--color-olive` at 40% opacity.
* Background: very subtle vertical gradient from `--color-cream-deep` to a shade 4% darker.
* Centered motif: the brand damask tile (arch-and-spark) or the quatrefoil / arch-monogram line-SVG at 6% opacity, sized ~40% of frame width. This gives the empty frame soul.
* A slow, tasteful shimmer: one soft diagonal light band that sweeps across every ~5s via CSS `@keyframes` (transform + opacity only). This is a breath, not a pulse — nothing that reads as "loading."
* Small centered label in the display font (Poppins) at low opacity: the caption, or "Image coming soon" if no caption.

Filled state:

* `next/image` with `fill`, `sizes` set responsively, and a `blurDataURL` placeholder (generate with plaiceholder in the Sanity query).
* On load, crossfade from the empty state over 600ms ease-out. Remove motif + shimmer.
* `object-fit: cover`, `object-position` from Sanity hotspot.

Caption: sits below the frame, display font, `--color-olive-deep`, letter-spaced, small.

Critical: the component branches on `image ?? placeholder` internally. Every product card, gallery slot, and hero uses AssetFrame. When photos land in Sanity later, the entire site fills in automatically. Do not build separate "placeholder" and "real" components.

Parallax hook-in: the inner image element accepts an optional `data-speed` (e.g. `"0.9"`) so frames can drift at depth inside the masonry on desktop. Wire this as the prop `depth?: number`.

## 2. Pinterest-style masonry — composed even when empty
Build `src/components/products/MasonryGrid.tsx` and `MasonryItem.tsx`.

Layout — pure CSS multi-column for bulletproof responsiveness:

```
columns: 1;              /* mobile */
@sm: columns 2;
@lg: columns 3;
@xl: columns 4;
column-gap: 1.5rem;
```

Each item: `margin-bottom: 1.5rem; break-inside: avoid;`

The empty-grid trick: assign every product a default aspect ratio from a rotating, seeded set — `["3/4", "4/5", "1/1", "4/3", "2/3"]` cycled by index (store on the product in Sanity as `defaultRatio`, fall back to index-cycling). This means the masonry has organic Pinterest height variation before any photos exist — the empty frames alone look like a composed gallery, not a uniform grid of boxes.

Each MasonryItem contains: an AssetFrame (image from Sanity or null) + caption + material tag. On hover (desktop): frame lifts 6px, olive border brightens to 100%, caption underline draws in — all 400ms ease-out.

Reveal animation (this is where it feels expensive): Use `ScrollTrigger.batch` for performance with many items — never one trigger per card:

```ts
ScrollTrigger.batch('.masonry-item', {
  start: 'top 88%',
  onEnter: (batch) =>
    gsap.to(batch, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 1.1,
      ease: 'power3.out',
      stagger: 0.08,
      overwrite: true,
    }),
  once: true, // play once, stays crisp — no scrubbing lag
});
```

Set items' initial state in CSS: `opacity: 0; transform: translateY(60px) scale(0.96);`. They rise, fade, and settle in staggered waves as you scroll. Slow, smooth, cinematic.

## 3. Scroll-first information architecture (less clicky)
The client wants browsing, not navigating. Restructure so customers scroll through products instead of drilling through pages.

Category page = one long scroll, sticky filter rail:

* `/products/[category]` shows all products in that category in the masonry, all material variants inline (per the brief's "SHOW ALL ON SAME PAGE").
* A sticky material-filter bar pins to the top as you scroll. Tapping a material (Silver / Brass / Copper…) filters in place with a GSAP FLIP animation — items animate to new positions, non-matches fade out. It does NOT navigate to a new URL. Use `gsap.registerPlugin(Flip)` + `Flip.getState()` / `Flip.from()`.
* No pagination. Everything loads and reveals on scroll (lazy-load images via next/image, but the DOM is one continuous grid).

Products landing = scroll-through of all 4 families:

* `/products` is a single scroll journey. Each family is a full section the user scrolls through, its products previewed in a horizontal scroll strip (see §4.4). No clicking into a family to see it — it unfolds as you scroll down.

Product detail = minimal, scroll-driven:

* Sticky gallery on the left, content scrolls on the right. Material tabs crossfade the gallery in place. Related products at the bottom continue the scroll rather than sending the user back.

Global principle: every "next step" is downward scroll, not a click that reloads. Reserve clicks for material filters and the final enquiry.

## 4. Signature cinematic animations (the Higgsfield feel)
All of these go through `gsap.matchMedia()` so mobile gets lighter versions, and all respect `prefers-reduced-motion`. Wrap every animation setup in a `gsap.context()` tied to the component for clean teardown.

### 4.1 Hero — pinned, scrub-driven zoom
The home hero pins for ~150vh. As the user scrolls through it:

* Background AssetFrame scales `1 → 1.15` (scrubbed).
* A dark overlay fades `0 → 0.45` opacity.
* The headline (SplitText by chars) rises and fades word-group by word-group.
* A scroll-cue at the bottom fades out after the first 10% of scroll.

```ts
gsap.timeline({
  scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=150%', pin: true, scrub: 1 },
})
  .to('.hero-bg', { scale: 1.15, ease: 'none' }, 0)
  .to('.hero-overlay', { opacity: 0.45, ease: 'none' }, 0);
```

### 4.2 Editorial text reveals — SplitText line-by-line
Section headings and craft-story paragraphs split into lines/words and rise:

```ts
const split = new SplitText('.reveal-text', { type: 'lines,words', linesClass: 'line' });
gsap.from(split.words, {
  yPercent: 100, opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.03,
  scrollTrigger: { trigger: '.reveal-text', start: 'top 80%' },
});
```

Wrap lines in `overflow: hidden` so words rise from behind a mask — that clean editorial reveal.

### 4.3 Feature images — clip-path mask reveal
Big feature shots (About, Craftsmanship) reveal via a clip-path wipe as they enter, while the image inside scales down slightly — a depth reveal:

```ts
gsap.fromTo('.mask-reveal',
  { clipPath: 'inset(100% 0 0 0)' },
  { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'power4.inOut',
    scrollTrigger: { trigger: '.mask-reveal', start: 'top 75%' } });
gsap.fromTo('.mask-reveal img', { scale: 1.3 }, { scale: 1, duration: 1.4, ease: 'power4.inOut',
  scrollTrigger: { trigger: '.mask-reveal', start: 'top 75%' } });
```

### 4.4 Horizontal family showcase — pinned, scroll-driven sideways
On `/products` and the home page, each family's product strip scrolls horizontally as the user scrolls vertically (classic premium GSAP move):

```ts
const track = document.querySelector('.h-track');
gsap.to(track, {
  x: () => -(track.scrollWidth - innerWidth),
  ease: 'none',
  scrollTrigger: {
    trigger: '.h-section', start: 'top top', end: () => `+=${track.scrollWidth}`,
    pin: true, scrub: 1, invalidateOnRefresh: true,
  },
});
```

Mobile: disable the pin entirely inside matchMedia — the strip becomes a native horizontal swipe (`overflow-x: auto; scroll-snap-type: x mandatory`) so it stays touch-friendly.

### 4.5 Depth parallax inside masonry (desktop only)
Via ScrollSmoother's `data-speed` — no code, just attributes. Give alternating masonry frames `data-speed="0.92"` and `data-speed="1.05"` so the grid breathes with subtle depth as it scrolls. Turn off in the mobile matchMedia branch (`ScrollSmoother` respects removal).

### 4.6 Velocity-reactive heritage marquee
The Devanagari/English product-name marquee reacts to scroll velocity for that high-end touch — it speeds up and skews slightly when you scroll fast, settles when you stop:

```ts
const smoother = ScrollSmoother.get();
gsap.ticker.add(() => {
  const v = smoother.getVelocity();
  gsap.set('.marquee-track', { skewX: gsap.utils.clamp(-8, 8, v * -0.004) });
  marqueeSpeed = base + Math.abs(v) * 0.0002;
});
```

### 4.7 Magnetic enquiry button
The final CTA attracts to the cursor within 100px, soft spring. Touch devices skip it. (Keep the MagneticButton from the plan.)

## 5. Responsiveness — matchMedia breakpoints
Wrap ALL scroll animations in:

```ts
const mm = gsap.matchMedia();
mm.add('(min-width: 1024px)', () => { /* full parallax, pinned horizontal, depth */ });
mm.add('(max-width: 1023px)', () => { /* reveals only, no pin, no parallax, shorter distances */ });
mm.add('(prefers-reduced-motion: reduce)', () => { /* everything instant, no scrub */ });
```

Layout responsiveness:

* Masonry: 4 → 3 → 2 → 1 columns down the breakpoints (already handled by CSS columns).
* Horizontal pinned sections → native swipe carousels on mobile.
* Hero: 150vh pin on desktop, shorter 100vh non-pinned fade on mobile (pinning tall sections on mobile hurts).
* Sticky filter rail: full width bar on mobile that collapses to a horizontal scroll of chips.
* Touch targets ≥ 44px. Test scroll feel on a real phone — `smoothTouch: 0.1` keeps momentum native; if it feels laggy, drop to `smoothTouch: 0`.

Every layout must work phone → tablet → laptop → ultrawide. Test at 375px, 768px, 1440px, 1920px.

## 6. Performance guardrails (butter requires discipline)

* Animate only `transform` and `opacity` and `clip-path`. Never animate width/height/top/left.
* Add `will-change: transform` only to actively-animating elements; remove after.
* `ScrollTrigger.batch` for the masonry — never N individual triggers.
* Lazy-mount the 3D viewer and any video only when in viewport.
* `next/image` for every raster, AVIF + WebP, responsive `sizes`.
* Call `ScrollTrigger.refresh()` after images/fonts load and after any dynamic content change.
* Subset fonts (Poppins/Playfair) to used weights only.
* Target 60fps on a mid-range phone. Profile the masonry reveal and the horizontal pin specifically — those are the two most likely to jank.

## 7. Build order for this layer

1. Stack swap + `gsap.ts` registration + `SmoothScrollProvider` in root layout.
2. `AssetFrame` — get the empty state looking gorgeous first; test with `image={null}` everywhere.
3. `MasonryGrid` + `MasonryItem` with the seeded aspect-ratio variation and `ScrollTrigger.batch` reveal.
4. Category page: sticky filter rail + FLIP in-place filtering.
5. `/products` landing: the scroll-through of 4 families with horizontal strips.
6. Hero pinned scrub + SplitText reveals.
7. Mask-reveal feature sections + velocity marquee.
8. matchMedia responsive pass + reduced-motion pass.
9. Performance profiling + `ScrollTrigger.refresh()` wiring.

## What to hand Claude Code
Read `PARAMOUNT_BUILD_PLAN.md`, then implement `PARAMOUNT_SCROLL_UI_PROMPT.md`. Start with §0 (swap Lenis/SplitType for GSAP ScrollSmoother/SplitText, set up the smooth-wrapper and SmoothScrollProvider), then §1 (AssetFrame — make the empty placeholder state beautiful, it's what the whole site shows until photos arrive). Commit after each numbered build-order step. Every product image everywhere must render through AssetFrame so the site fills in automatically when Sanity images are added later. All animations go through `gsap.matchMedia` and respect `prefers-reduced-motion`.

> ⚠️ **Licensing note:** ScrollSmoother, SplitText, and Flip became free in the GSAP/Webflow bundle in 2025 — confirm they install from the public `gsap` package in your environment. If a plugin resolves to the members-only registry, either (a) use the Club GSAP token, or (b) substitute: ScrollSmoother → Lenis-driven ScrollTrigger proxy, SplitText → manual char/word wrapping, Flip → CSS `view-transition` or manual FLIP. The rest of this spec is unaffected.
