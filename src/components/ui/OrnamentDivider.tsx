interface Props {
  className?: string;
}

/*
 * One wing of the ornament (drawn pointing left, mirrored for the right side):
 * a hairline that tapers toward the edge, a small terminal diamond, a scrollwork
 * curl that spirals in toward the centre, and a bead beside the lotus bud.
 */
const wing = (
  <>
    {/* tapering hairline (two segments: fainter + thinner as it runs out) */}
    <path d="M28 12 H49.5" opacity={0.6} />
    <path d="M9 12 H28" strokeWidth={0.8} opacity={0.3} />
    {/* terminal diamond */}
    <path d="M4.6 12 L6.4 10.2 L8.2 12 L6.4 13.8 Z" strokeWidth={1} opacity={0.5} />
    {/* scrollwork curl, spiralling inward */}
    <path d="M66 12 C61.5 12 58.8 9.7 55.6 9.3 C52.8 9 51 10.7 51.8 12.4 C52.5 13.9 54.7 13.7 55.1 12.2 C55.4 11.1 54.4 10.3 53.5 10.7" />
    {/* soft counter-curve beneath the curl */}
    <path d="M64 12.3 C60.5 13 58.2 13.9 56.2 14.9" strokeWidth={1} opacity={0.45} />
    {/* bead beside the central bud */}
    <circle cx={69.6} cy={12} r={1} fill="currentColor" stroke="none" opacity={0.75} />
  </>
);

/**
 * Ornamental divider in the brand deck's style — a central lotus-bud diamond
 * flanked by scrollwork curls and tapering hairlines. Stroke-based and drawn in
 * `currentColor`, so tint it with a text-* utility (e.g. `text-[#E2CA82]/65`).
 * Defaults to ~w-40 h-6; pass `className` to size/space it.
 */
export default function OrnamentDivider({ className }: Props) {
  return (
    <svg
      viewBox="0 0 160 24"
      className={`h-6 w-40 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* left wing */}
      <g>{wing}</g>
      {/* right wing (mirrored about the centre) */}
      <g transform="matrix(-1 0 0 1 160 0)">{wing}</g>

      {/* central lotus-bud diamond */}
      <path d="M80 5.6 L85.6 12 L80 18.4 L74.4 12 Z" />
      <path d="M80 8.8 L82.8 12 L80 15.2 L77.2 12 Z" opacity={0.55} />
      {/* bud tips above and below the diamond */}
      <path d="M80 5.4 C78.7 4.1 78.7 2.9 80 1.9 C81.3 2.9 81.3 4.1 80 5.4 Z" strokeWidth={1} opacity={0.7} />
      <path d="M80 18.6 C78.7 19.9 78.7 21.1 80 22.1 C81.3 21.1 81.3 19.9 80 18.6 Z" strokeWidth={1} opacity={0.7} />
    </svg>
  );
}
