interface Props {
  /** The variant name, rendered in tracked caps (e.g. "BRASS DHWAJADAND"). */
  label: string;
}

// Coin tint tracks the material named in the label (deck p13: gold coin for
// brass, copper coin for copper, pale coin for silver). Gold is the default.
type Ramp = { disc: string; rim: string; ring: string; mark: string };
const GOLD: Ramp = { disc: "#E2CA82", rim: "#C9A85E", ring: "#B8933F", mark: "#8A6A2A" };
const COPPER: Ramp = { disc: "#C88A5B", rim: "#A9663B", ring: "#8A4B2A", mark: "#5E2F18" };
const SILVER: Ramp = { disc: "#D9D6CC", rim: "#B4B0A4", ring: "#9A968A", mark: "#6E6B62" };
function rampFor(label: string): Ramp {
  const l = label.toLowerCase();
  if (l.includes("copper")) return COPPER;
  if (l.includes("silver")) return SILVER; // incl. "german silver"
  return GOLD; // brass / gold / everything else
}

/**
 * VariantChip — a struck-metal coin icon followed by a tracked-caps label.
 * Traced to the deck's "◉ BRASS DHWAJADAND" variant markers (p13): a filled disc
 * with a subtle inner ring and a tiny arch-A monogram struck into the center.
 * The coin's metal tint tracks the material named in the label.
 */
export default function VariantChip({ label }: Props) {
  const c = rampFor(label);
  return (
    <span className="inline-flex items-center gap-2.5">
      {/* Struck-metal coin */}
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7 shrink-0"
        aria-hidden
      >
        {/* disc */}
        <circle cx={16} cy={16} r={15} fill={c.disc} />
        {/* rim shade */}
        <circle
          cx={16}
          cy={16}
          r={15}
          fill="none"
          stroke={c.rim}
          strokeWidth={1}
        />
        {/* inner ring */}
        <circle
          cx={16}
          cy={16}
          r={11.5}
          fill="none"
          stroke={c.ring}
          strokeWidth={0.9}
          opacity={0.7}
        />
        {/* tiny struck arch-A monogram */}
        <g
          fill="none"
          stroke={c.mark}
          strokeWidth={1.1}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 23 L11 16 C11 12.7 12.5 10.6 16 8.8 C19.5 10.6 21 12.7 21 16 L21 23" />
          <path d="M13.4 22 L16 13.4 L18.6 22" strokeWidth={1} />
          <path d="M14.3 18.4 L17.7 18.4" strokeWidth={0.9} />
        </g>
      </svg>

      <span className="font-body pm-label text-maroon">
        {label}
      </span>
    </span>
  );
}
