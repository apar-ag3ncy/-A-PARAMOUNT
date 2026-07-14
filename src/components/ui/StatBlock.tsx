import OrnamentDivider from "./OrnamentDivider";

interface Props {
  /** The headline figure, e.g. "1968" or "50+". */
  value: string;
  /** The tracked-caps caption beneath, e.g. "Years of Legacy". */
  label: string;
}

/**
 * StatBlock — the deck's stat treatment (p07): a big serif `value` over a
 * tracked-caps `label`, closed by an `OrnamentDivider`. Centered and drawn in the
 * ambient text color, so a parent on an olive ground (`text-cream`) or cream ground
 * (`text-olive-deep`) tints it; the divider inherits a gold accent tint.
 */
export default function StatBlock({ value, label }: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <span className="pm-h2 font-display">{value}</span>
      <span className="pm-label mt-2 font-body">{label}</span>
      <OrnamentDivider width="sm" className="mt-3 text-gold/70" />
    </div>
  );
}
