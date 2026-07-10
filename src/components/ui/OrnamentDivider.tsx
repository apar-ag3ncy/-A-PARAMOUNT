import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  width?: "sm" | "md" | "lg";
}

/*
 * One wing (drawn for the left side, mirrored for the right):
 * a hairline that runs out to the edge, broken by a small 4-point diamond (✦),
 * with the segment nearest the medallion a touch shorter. Stroke-based.
 */
const wing = (
  <>
    {/* hairline: outer segment, then a gap for the diamond, then inner segment */}
    <path d="M2 12 H44" opacity={0.55} />
    <path d="M56 12 H70" opacity={0.9} />
    {/* small 4-point diamond (✦) sitting on the rule */}
    <path
      d="M50 12 L49 9.4 L48 12 L49 14.6 Z M50 12 L52.6 11 L50 10 L47.4 11 Z M50 12 L52.6 13 L50 14 L47.4 13 Z M50 12 L47.4 11 L50 10 L52.6 11 Z"
      fill="currentColor"
      stroke="none"
      opacity={0.9}
    />
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
