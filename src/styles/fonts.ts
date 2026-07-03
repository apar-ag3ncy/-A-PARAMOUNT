import {
  Poppins,
  Playfair_Display,
  Inter,
  Noto_Serif_Devanagari,
} from "next/font/google";

// Display / headings — geometric-humanist sans (the deck's "Crafting Divine")
export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  variable: "--font-poppins",
  display: "swap",
});

// Elegant serif-italic accent — the italic "Elegance"
export const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
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
  poppins.variable,
  playfair.variable,
  inter.variable,
  notoDevanagari.variable,
].join(" ");
