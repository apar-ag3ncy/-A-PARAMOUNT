import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The one button. Before this the site hand-rolled a different pill on every CTA
 * (eight divergent styles); everyday actions now come from here so they read as
 * one considered system. The hero's magnetic fill-wipe CTA stays its own thing
 * (`MagneticButton`) — this is for the many quieter links: "Explore", "View all",
 * "Discover the process", form submits.
 *
 * Renders a `next/link` when given `href`, otherwise a `<button>`. All variants
 * are pills (rounded-full), matching the header and gallery filters, with a gold
 * focus ring and an optional arrow that slides on hover.
 *
 * Variants (brand-token only — no new colours):
 *   solid   — olive-deep ground, cream label (primary action on a light section)
 *   outline — hairline olive that fills olive-deep on hover (secondary)
 *   ghost   — tracked-caps text link with a drawing underline (tertiary / inline)
 */
type Variant = "solid" | "outline" | "ghost" | "cream";
type Size = "sm" | "md" | "lg";
/** Ground the button sits on. "dark" recolours outline/ghost to cream. */
type Tone = "light" | "dark";

const BASE =
  "group relative inline-flex items-center justify-center gap-2 font-display tracking-[0.16em] uppercase leading-none transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50";

const VARIANT: Record<Variant, string> = {
  solid:
    "rounded-full bg-olive-deep text-cream shadow-[0_12px_30px_-14px_rgba(46,35,19,0.6)] hover:bg-olive hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(46,35,19,0.7)]",
  outline:
    "rounded-full border border-olive/35 text-maroon hover:border-olive-deep hover:bg-olive-deep hover:text-cream hover:-translate-y-0.5",
  ghost: "rounded-full text-maroon hover:text-maroon",
  // cream pill for dark grounds (the header/nav on olive) — warms to gold
  cream:
    "rounded-full bg-cream text-maroon hover:bg-gold hover:-translate-y-0.5 shadow-[0_10px_26px_-14px_rgba(46,35,19,0.5)]",
};

/** On a dark ground, outline/ghost recolour to cream so they stay legible. */
const VARIANT_DARK: Partial<Record<Variant, string>> = {
  outline:
    "rounded-full border border-cream/40 text-cream hover:border-gold hover:bg-cream/10 hover:-translate-y-0.5",
  ghost: "rounded-full text-cream/80 hover:text-gold",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 text-[12px]", // 12px is the spec floor for small text
  md: "px-6 py-2.5 text-[12px]",
  lg: "px-8 py-3.5 text-[13px]",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  tone?: Tone;
  /** Show the sliding → arrow. Defaults on for `ghost`, off otherwise. */
  arrow?: boolean;
  className?: string;
}

function variantClass(variant: Variant, tone: Tone): string {
  return (tone === "dark" && VARIANT_DARK[variant]) || VARIANT[variant];
}

function Inner({
  children,
  variant = "solid",
  arrow,
}: Pick<CommonProps, "children" | "variant" | "arrow">) {
  const showArrow = arrow ?? variant === "ghost";
  return (
    <>
      {/* -me-[0.16em] compensates the TRAILING letter-space. BASE sets
          tracking-[0.16em], and the space after the last glyph sits inside this
          span's box while carrying no ink — so with the symmetric px-* padding the
          visible label centred 1.04px left of the pill on a `lg`. Only when there is
          no arrow: with one, the span already ENDS on the arrow's ink, so there is
          no box/ink mismatch to correct and compensating would over-shift it. */}
      <span
        className={cn(
          "relative z-10 inline-flex items-center justify-center gap-2 leading-none translate-y-[1px]",
          !showArrow && "-me-[0.16em]",
        )}
      >
        {children}
        {showArrow && (
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        )}
      </span>
      {variant === "ghost" && (
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100"
        />
      )}
    </>
  );
}

/** The DOM/interaction props a call-site may pass through, explicitly (rather
 *  than spreading arbitrary attributes) so a design-system button stays tidy. */
interface PassThrough {
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  role?: string;
  "aria-label"?: string;
  "aria-selected"?: boolean;
  "aria-pressed"?: boolean;
  "aria-expanded"?: boolean;
}

type LinkProps = CommonProps & PassThrough & { href: string };
type ButtonProps = CommonProps & PassThrough & { href?: undefined };

export default function Button(props: LinkProps | ButtonProps) {
  const {
    children,
    variant = "solid",
    size = "md",
    tone = "light",
    arrow,
    className,
    onClick,
    disabled,
    role,
  } = props;
  const classes = cn(BASE, variantClass(variant, tone), SIZE[size], className);
  const aria = {
    role,
    "aria-label": props["aria-label"],
    "aria-selected": props["aria-selected"],
    "aria-pressed": props["aria-pressed"],
    "aria-expanded": props["aria-expanded"],
  };
  const inner = (
    <Inner variant={variant} arrow={arrow}>
      {children}
    </Inner>
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={classes} onClick={onClick} {...aria}>
        {inner}
      </Link>
    );
  }
  return (
    <button
      type={props.type ?? "button"}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...aria}
    >
      {inner}
    </button>
  );
}
