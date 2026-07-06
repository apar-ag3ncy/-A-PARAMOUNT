interface Props {
  className?: string;
  /** Pattern opacity (0–1). Defaults to a faint 0.12. */
  opacity?: number;
}

/*
 * The signature tone-on-tone damask (deck p118): columns of dotted vertical lines,
 * each column alternating an arch-A monogram and a 4-petal lotus down its length,
 * with small bead dots strung along the dotted rule between motifs. Adjacent columns
 * are half-drop offset (an arch in one column sits level with a lotus in the next).
 *
 * Built as a single seamlessly-tiling SVG tile: 2 columns × 1 vertical repeat
 * (120 × 240). Painted via CSS `mask-image` over `background-color: currentColor`,
 * so the whole pattern tints to the parent's text color (darker-cream on cream
 * grounds, lighter-olive on olive grounds) — the spec's currentColor requirement.
 */
const TILE = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='240' viewBox='0 0 120 240'>
<g fill='#000' stroke='#000'>
<!-- dotted verticals for both columns -->
<line x1='30' y1='0' x2='30' y2='240' stroke-width='1' stroke-dasharray='1.5 7' fill='none'/>
<line x1='90' y1='0' x2='90' y2='240' stroke-width='1' stroke-dasharray='1.5 7' fill='none'/>
<!-- bead dots along the rules, at the mid points between motifs -->
<circle cx='30' cy='60' r='1.4'/><circle cx='30' cy='180' r='1.4'/>
<circle cx='90' cy='60' r='1.4'/><circle cx='90' cy='180' r='1.4'/>
<!-- COLUMN A (x=30): arch at y=0/240, lotus at y=120 -->
<g fill='none' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' transform='translate(18 -12) scale(0.4)'>
<path d='M4 58 L4 30 C4 18 9 10 22 3 C35 10 40 18 40 30 L40 58'/>
<path d='M11 58 L11 31 C11 22 15 16 22 11 C29 16 33 22 33 31 L33 58' stroke-width='2'/>
<path d='M16.5 50 L22 33 L27.5 50' stroke-width='2.1'/>
<path d='M18.7 43.2 L25.3 43.2' stroke-width='1.9'/>
</g>
<g fill='none' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' transform='translate(18 228) scale(0.4)'>
<path d='M4 58 L4 30 C4 18 9 10 22 3 C35 10 40 18 40 30 L40 58'/>
<path d='M11 58 L11 31 C11 22 15 16 22 11 C29 16 33 22 33 31 L33 58' stroke-width='2'/>
<path d='M16.5 50 L22 33 L27.5 50' stroke-width='2.1'/>
<path d='M18.7 43.2 L25.3 43.2' stroke-width='1.9'/>
</g>
<g transform='translate(14 104) scale(0.4)'>
<path d='M32 31 C25.5 27 21.5 16 32 2 C42.5 16 38.5 27 32 31 Z'/>
<path d='M32 33 C25.5 37 21.5 48 32 62 C42.5 48 38.5 37 32 33 Z'/>
<path d='M31 32 C27 26 17 22.5 4 32 C17 41.5 27 38 31 32 Z'/>
<path d='M33 32 C37 26 47 22.5 60 32 C47 41.5 37 38 33 32 Z'/>
<path fill-rule='evenodd' d='M32 25 L39 32 L32 39 L25 32 Z M32 29.2 L34.8 32 L32 34.8 L29.2 32 Z'/>
</g>
<!-- COLUMN B (x=90): half-drop — lotus at y=0/240, arch at y=120 -->
<g transform='translate(74 -16) scale(0.4)'>
<path d='M32 31 C25.5 27 21.5 16 32 2 C42.5 16 38.5 27 32 31 Z'/>
<path d='M32 33 C25.5 37 21.5 48 32 62 C42.5 48 38.5 37 32 33 Z'/>
<path d='M31 32 C27 26 17 22.5 4 32 C17 41.5 27 38 31 32 Z'/>
<path d='M33 32 C37 26 47 22.5 60 32 C47 41.5 37 38 33 32 Z'/>
<path fill-rule='evenodd' d='M32 25 L39 32 L32 39 L25 32 Z M32 29.2 L34.8 32 L32 34.8 L29.2 32 Z'/>
</g>
<g transform='translate(74 224) scale(0.4)'>
<path d='M32 31 C25.5 27 21.5 16 32 2 C42.5 16 38.5 27 32 31 Z'/>
<path d='M32 33 C25.5 37 21.5 48 32 62 C42.5 48 38.5 37 32 33 Z'/>
<path d='M31 32 C27 26 17 22.5 4 32 C17 41.5 27 38 31 32 Z'/>
<path d='M33 32 C37 26 47 22.5 60 32 C47 41.5 37 38 33 32 Z'/>
<path fill-rule='evenodd' d='M32 25 L39 32 L32 39 L25 32 Z M32 29.2 L34.8 32 L32 34.8 L29.2 32 Z'/>
</g>
<g fill='none' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' transform='translate(78 108) scale(0.4)'>
<path d='M4 58 L4 30 C4 18 9 10 22 3 C35 10 40 18 40 30 L40 58'/>
<path d='M11 58 L11 31 C11 22 15 16 22 11 C29 16 33 22 33 31 L33 58' stroke-width='2'/>
<path d='M16.5 50 L22 33 L27.5 50' stroke-width='2.1'/>
<path d='M18.7 43.2 L25.3 43.2' stroke-width='1.9'/>
</g>
</g>
</svg>`;

const MASK_URI = `url("data:image/svg+xml,${encodeURIComponent(TILE)}")`;

/**
 * BrandDamask — a positioned layer that paints the signature brand damask as a
 * tiling background, tinted via `currentColor` for faint section texture. Match
 * deck p118. Absolutely positioned and non-interactive by default; drop it inside
 * a `relative` parent and set the tint with a text-* utility on this element or a
 * wrapper (e.g. `text-olive`, `text-cream`).
 */
export default function BrandDamask({ className, opacity = 0.12 }: Props) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{
        opacity,
        backgroundColor: "currentColor",
        WebkitMaskImage: MASK_URI,
        maskImage: MASK_URI,
        WebkitMaskRepeat: "repeat",
        maskRepeat: "repeat",
        WebkitMaskSize: "120px 240px",
        maskSize: "120px 240px",
      }}
    />
  );
}
