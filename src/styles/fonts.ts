import localFont from "next/font/local";
import { Noto_Serif_Devanagari } from "next/font/google";

/*
 * BRAND FONTS — the real client-supplied faces (../../FONTS), wired via
 * next/font/local. Storica-Medium is the display/logo face; Inter is the body
 * face. These are the ONLY two families the brand uses. The previous Google
 * stand-ins (Spectral for Storica, Cormorant Garamond for the italic accent)
 * are gone.
 *
 * Noto Serif Devanagari stays: it is NOT a brand face but the only way to draw
 * the Devanagari mantra/product names (LoadingScreen, marquee) — neither Storica
 * nor Inter contains Devanagari glyphs, so dropping it would render those as
 * tofu. It never touches Latin text.
 */

// Display / headings / the "PARAMOUNT" wordmark — Storica Medium (single weight,
// exactly the logo art). Requests for other weights resolve to this one face.
export const storica = localFont({
  src: "../fonts/Storica-Medium.ttf",
  weight: "500",
  style: "normal",
  variable: "--font-storica",
  display: "swap",
});

// Body / UI — Inter, the real variable font (one file covers every weight; the
// italic axis is a second file). Replaces the Google Inter import.
export const inter = localFont({
  src: [
    { path: "../fonts/Inter-Variable.ttf", weight: "100 900", style: "normal" },
    { path: "../fonts/Inter-Italic-Variable.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-inter",
  display: "swap",
});

// Devanagari script support only (see note above) — loaded on demand.
export const notoDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

/** Space-joined CSS-variable class names — apply to <html>. */
export const fontVariables = [
  storica.variable,
  inter.variable,
  notoDevanagari.variable,
].join(" ");
