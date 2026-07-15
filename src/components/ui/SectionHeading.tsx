import OrnamentDivider from "./OrnamentDivider";

interface Props {
  /** Optional tracked-caps kicker above the title (e.g. "OUR STORY"). */
  eyebrow?: string;
  /** The heading text — rendered in font-display (Storica). */
  title: string;
  /** Horizontal alignment of the block. Defaults to "center". */
  align?: "left" | "center";
  /** Color context: "olive" for cream grounds (default), "cream" for olive grounds. */
  tone?: "olive" | "cream";
  className?: string;
}

/**
 * SectionHeading — the deck's universal section-header pattern (p07): an optional
 * tracked-caps eyebrow, the `title` in `font-display` (Storica), and an
 * `OrnamentDivider` beneath. Use tracked caps for short section labels ("ABOUT US")
 * or title-case for headings.
 *
 * `tone` sets the palette: "olive" (default, for cream grounds) tints the title
 * heading-brown with an olive eyebrow + divider; "cream" (for olive grounds) tints
 * everything cream with a gold divider. Reuse everywhere a section opens.
 */
export default function SectionHeading({
  eyebrow,
  title,
  align = "center",
  tone = "olive",
  className,
}: Props) {
  const isCenter = align === "center";
  const alignBox = isCenter ? "items-center text-center" : "items-start text-left";

  const eyebrowColor = tone === "cream" ? "text-cream/70" : "text-maroon/80";
  const titleColor =
    tone === "cream" ? "text-cream" : "text-heading-brown";
  const dividerColor = tone === "cream" ? "text-gold/70" : "text-olive/50";

  return (
    <div className={`flex flex-col ${alignBox} ${className ?? ""}`}>
      {eyebrow ? (
        <span className={`pm-eyebrow font-body ${eyebrowColor}`}>{eyebrow}</span>
      ) : null}

      <h2
        className={`pm-h2 font-display ${titleColor} ${eyebrow ? "mt-3" : ""}`}
      >
        {title}
      </h2>

      <OrnamentDivider
        className={`mt-4 ${dividerColor} ${isCenter ? "" : "self-start"}`}
      />
    </div>
  );
}
