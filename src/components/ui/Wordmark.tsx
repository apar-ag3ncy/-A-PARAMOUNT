import { cn } from "@/lib/utils";

/**
 * The "PARAMOUNT · ENGINEERING WORKS" wordmark, set as LIVE TEXT in the real
 * brand fonts, Storica (display) for PARAMOUNT, Inter (tracked caps) for the
 * subline. Replaces the baked `paramount-word-*.png` art so the logotype is the
 * actual font, crisp at every size, and themes by text colour.
 *
 * Colour is inherited (`currentColor`): the caller sets `text-olive`,
 * `text-cream`, etc. Size is driven by font-size on the root, everything inside
 * is in `em`, so PARAMOUNT, the subline and their spacing scale together. Pass a
 * `text-*`/`text-[..]` size via `className`.
 *
 * The arch-"A" monogram (`a-mark-*.png`) is a separate logo GLYPH, not text, and
 * stays an image alongside this.
 */
export default function Wordmark({
  className,
  tagline = true,
  ariaLabel = "A Paramount, Engineering Works",
}: {
  className?: string;
  tagline?: boolean;
  ariaLabel?: string;
}) {
  return (
    <span
      role="img"
      aria-label={ariaLabel}
      className={cn("inline-flex flex-col items-center leading-none", className)}
    >
      <span
        className="font-display font-medium whitespace-nowrap"
        style={{ fontSize: "1em", letterSpacing: "0.015em", lineHeight: 1 }}
      >
        A&nbsp;PARAMOUNT
      </span>
      {tagline && (
        <span
          aria-hidden
          className="font-body"
          style={{
            fontSize: "0.235em",
            letterSpacing: "0.42em",
            // trailing letter-spacing pushes the block right; pull it back to
            // keep the subline optically centred under PARAMOUNT.
            marginRight: "-0.42em",
            marginTop: "0.62em",
            fontWeight: 500,
          }}
        >
          ENGINEERING WORKS
        </span>
      )}
    </span>
  );
}
