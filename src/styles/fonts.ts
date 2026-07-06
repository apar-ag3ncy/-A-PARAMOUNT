import {
  Spectral,
  Cormorant_Garamond,
  Inter,
  Noto_Serif_Devanagari,
} from "next/font/google";

/*
 * NOTE: The deck's real fonts are Storica (display) + Juana (italic accent) —
 * commercial faces present only as incomplete PDF subsets. These next/font/google
 * calls (Spectral / Cormorant_Garamond) are the closest properly-licensed stand-ins.
 * To use the exact brand fonts, drop Storica/Juana `.woff2` into src/fonts and swap
 * these `next/font/google` calls for `next/font/local` — the CSS variables downstream
 * (--font-spectral / --font-cormorant, remapped to --font-display / --font-serif in
 * globals.css) stay identical, so no consumer needs to change.
 */

// Display / headings — warm even-contrast serif (the deck's "Crafting Divine")
export const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-spectral",
  display: "swap",
});

// Elegant serif-italic accent — the italic "Elegance"
export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Body / UI
export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

// Devanagari accent for product names in original script (loaded on demand)
export const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

/** Space-joined CSS-variable class names — apply to <html>. */
export const fontVariables = [
  spectral.variable,
  cormorant.variable,
  inter.variable,
  notoDevanagari.variable,
].join(" ");
