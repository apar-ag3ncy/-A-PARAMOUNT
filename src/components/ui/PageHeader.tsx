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
  /**
   * Header axis. "center" (default) is the content-page hero; "left" aligns the
   * whole stack to the same left rail the page's content uses — for catalogue
   * pages whose sections below are left-aligned, so the page reads on one spine
   * instead of a centred hero over left content.
   */
  align?: "center" | "left";
  /** Container max-width — match the page's content container for a shared spine. */
  width?: "4xl" | "7xl";
  className?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  tagline,
  divider = true,
  size = "md",
  align = "center",
  width = "4xl",
  className,
}: Props) {
  const left = align === "left";
  return (
    <header
      className={cn(
        "mx-auto px-6",
        width === "7xl" ? "max-w-7xl" : "max-w-4xl",
        left ? "text-left" : "text-center",
        className,
      )}
    >
      <p className="pm-eyebrow font-display mb-5 text-maroon">{eyebrow}</p>
      <SplitTextReveal
        as="h1"
        by="words"
        className={cn(
          "font-display text-heading-brown",
          size === "lg" ? "pm-display-lg" : "pm-display",
        )}
      >
        {title}
      </SplitTextReveal>
      {divider && (
        <OrnamentDivider className={cn("mt-6 text-olive/50", left ? "ml-0" : "mx-auto")} />
      )}
      {tagline && (
        <p className="pm-lead font-body mt-5 text-maroon italic">{tagline}</p>
      )}
      {subtitle && (
        <p
          className={cn(
            "pm-body font-body mt-6 max-w-xl text-maroon/75",
            left ? "" : "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </header>
  );
}
