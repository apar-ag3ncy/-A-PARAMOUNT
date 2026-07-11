import SplitTextReveal from "@/components/animations/SplitTextReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import { cn } from "@/lib/utils";

/**
 * The one page-top header. Five routes had pasted the same centred stack —
 * eyebrow · word-split h1 · ornament divider · subtitle — but drifted on title
 * colour (olive-deep vs heading-brown), size, and whether the divider sat before
 * or after the subtitle. This fixes the structure so every page opens the same
 * considered way: centred, heading-brown title, divider, then the line beneath.
 *
 * Server component; the only motion is the h1's existing SplitTextReveal.
 */
interface Props {
  eyebrow: string;
  title: string;
  /** Body line under the divider. */
  subtitle?: string;
  /** Italic accent line instead of a subtitle (e.g. the About tagline). */
  tagline?: string;
  divider?: boolean;
  /** "lg" for the catalogue's larger title. */
  size?: "md" | "lg";
  className?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  tagline,
  divider = true,
  size = "md",
  className,
}: Props) {
  return (
    <header className={cn("mx-auto max-w-4xl px-6 text-center", className)}>
      <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
        {eyebrow}
      </p>
      <SplitTextReveal
        as="h1"
        by="words"
        className={cn(
          "font-display font-light text-[color:var(--color-heading-brown)]",
          size === "lg"
            ? "text-5xl leading-[1.05] sm:text-7xl"
            : "text-4xl leading-[1.08] sm:text-6xl",
        )}
      >
        {title}
      </SplitTextReveal>
      {divider && <OrnamentDivider className="mx-auto mt-6 text-olive/50" />}
      {tagline && (
        <p className="mt-5 font-body text-xl text-olive italic">{tagline}</p>
      )}
      {subtitle && (
        <p className="mx-auto mt-6 max-w-xl font-body text-espresso/75">
          {subtitle}
        </p>
      )}
    </header>
  );
}
