import type { Config } from "tailwindcss";

/**
 * Paramount — Tailwind v4 config.
 *
 * Tailwind v4 is CSS-first: the design tokens (palette, fonts, radii) live in
 * `src/app/globals.css` inside the `@theme` block and are the single source of
 * truth. This file is loaded FROM that CSS via `@config "../../tailwind.config.ts"`
 * and holds only content globs, dark-mode strategy, and plugin slots.
 *
 * To adjust a colour or font, edit `@theme` in globals.css — not here.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}", "./sanity/**/*.{ts,tsx}"],
  darkMode: "class", // brand is light-only; class strategy avoids OS dark-mode flips
  theme: { extend: {} },
  plugins: [],
};

export default config;
