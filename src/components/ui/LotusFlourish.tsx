interface Props {
  className?: string;
}

/**
 * LotusFlourish — the brand's 4-petal lotus diamond: four pointed teardrop petals
 * (N / E / S / W) radiating from a tiny center diamond, the vertical petals a touch
 * longer than the horizontal ones. Filled in `currentColor`, so tint it with a
 * text-* utility on the parent (e.g. `text-olive`, `text-cream/80`).
 *
 * Traced to the deck flourish (p64) + damask lotus mark (p118): each petal is a
 * teardrop, pointed at its outer tip and swelling toward the center where the four
 * meet around a small open diamond eye.
 */
export default function LotusFlourish({ className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={`h-16 w-16 ${className ?? ""}`}
      fill="currentColor"
      aria-hidden
    >
      {/* North petal — plump pointed teardrop, longer than the horizontal pair. */}
      <path d="M32 31 C25.5 27 21.5 16 32 2 C42.5 16 38.5 27 32 31 Z" />
      {/* South petal (mirror of North). */}
      <path d="M32 33 C25.5 37 21.5 48 32 62 C42.5 48 38.5 37 32 33 Z" />
      {/* West petal — plump teardrop, a touch shorter. */}
      <path d="M31 32 C27 26 17 22.5 4 32 C17 41.5 27 38 31 32 Z" />
      {/* East petal (mirror of West). */}
      <path d="M33 32 C37 26 47 22.5 60 32 C47 41.5 37 38 33 32 Z" />
      {/* Center diamond with an open eye (even-odd hole). */}
      <path
        fillRule="evenodd"
        d="M32 25 L39 32 L32 39 L25 32 Z M32 29.2 L34.8 32 L32 34.8 L29.2 32 Z"
      />
    </svg>
  );
}
