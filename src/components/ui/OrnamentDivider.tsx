import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  width?: "sm" | "md" | "lg";
}

/*
 * One wing (drawn for the left side, mirrored for the right): a single hairline
 * running from the edge in toward the medallion, fading a touch toward the tip.
 * Stroke-based. (The old 4-point diamond flourishes were dropped — they were not
 * part of the brand ornament; only the arch-A monogram is.)
 */
const wing = (
  <>
    <path d="M2 12 H62" opacity={0.5} />
    <path d="M62 12 H70" opacity={0.85} />
  </>
);

/**
 * OrnamentDivider — the deck's universal rule: a thin hairline running left and
 * right from a centered composition of `· ✦ · (arch-A medallion) · ✦ ·`. Traced to
 * the rule under "Elegance" (p04) and under "ABOUT US" / between the stat blocks
 * (p07).
 *
 * Stroke-based and drawn in `currentColor`, so the parent sets the tint via a
 * text-* utility (e.g. `text-gold/70` gold, `text-olive/50`). Pass `width`
 * to scale the overall length: "sm" (~w-32) · "md" (~w-48, default) · "lg" (~w-64).
 * `className` still overrides sizing/spacing as before (drop-in compatible).
 */
export default function OrnamentDivider({ className, width = "md" }: Props) {
  const widthClass =
    width === "sm" ? "w-32" : width === "lg" ? "w-64" : "w-48";

  return (
    <svg
      viewBox="0 0 172 24"
      className={cn("h-6", widthClass, className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* left wing */}
      <g>{wing}</g>
      {/* right wing (mirrored about the centre, 172) */}
      <g transform="matrix(-1 0 0 1 172 0)">{wing}</g>

      {/* central arch-A medallion — a small ogee arch enclosing a crossbarred A,
          inlined so it inherits currentColor and scales with the rule */}
      <g strokeWidth={0.9}>
        <path d="M80 20 L80 12 C80 8.4 81.6 6 86 3.6 C90.4 6 92 8.4 92 12 L92 20" />
        <path d="M83.4 20 L86 8.8 L88.6 20" strokeWidth={0.8} />
        <path d="M84.4 15.6 L87.6 15.6" strokeWidth={0.75} />
      </g>
    </svg>
  );
}
