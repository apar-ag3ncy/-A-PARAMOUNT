import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

/**
 * ArchMark - the brand's logo mark, EXTRACTED from the client's deck.
 *
 * The two paths below are the deck's own vector art, read straight out of
 * "APARAMOUNT 27June.pdf" p02 (the official lockup: monogram over A PARAMOUNT /
 * ENGINEERING WORKS). It is a FILLED mark - a bold arch whose counter forms the
 * "A" - on a 80.99 x 71.89 box, i.e. WIDER than it is tall.
 *
 * It replaces a hand-drawn approximation that was stroke-based, four paths, and
 * 44 x 60 - taller than wide, the opposite proportion to the real mark. Do NOT
 * redraw this by eye; re-extract from the deck if it ever needs to change.
 *
 * Filled in `currentColor`, so tint it from the parent with a text-* utility.
 * Size it by HEIGHT and let the width follow (`h-16 w-auto`) so the deck's
 * proportion is preserved - do not pin both axes.
 */
export default function ArchMark({ className }: Props) {
  return (
    <svg
      viewBox="0 0 80.99 71.89"
      className={cn("h-[60px] w-auto", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="M9.96 52.06C14.19 34.46 25.05 19.05 40.66 9.43C56.08 19.15 67.12 34.47 71.3 52.37C72.86 59.04 73.08 65.26 73.0 71.89L80.99 71.89L80.61 59.23C77.88 34.4 62.79 11.81 40.51 0.0C21.8 10.19 7.96 27.7 2.58 48.31C0.54 56.15 0.0 63.97 0.21 71.89L8.23 71.89C7.98 65.08 8.49 58.64 9.96 52.06Z"/><path d="M40.59 30.96C42.68 32.68 44.14 34.61 45.62 36.67C48.48 40.41 50.93 44.32 52.34 49.0L28.83 49.0C31.21 41.99 35.24 36.14 40.59 30.96M26.13 56.96L63.12 56.96C60.5 42.31 52.55 29.26 40.61 19.96C24.72 32.22 15.74 51.75 17.25 71.89L25.25 71.89C24.8 66.85 25.26 62.06 26.13 56.96Z"/>
    </svg>
  );
}
