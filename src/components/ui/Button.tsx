import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
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
type Variant = "solid" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const BASE =
  "group relative inline-flex items-center justify-center gap-2 font-display tracking-[0.16em] uppercase transition-[color,background-color,border-color,box-shadow,transform] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:pointer-events-none disabled:opacity-50";

const VARIANT: Record<Variant, string> = {
  solid:
    "rounded-full bg-olive-deep text-cream shadow-[0_12px_30px_-14px_rgba(46,35,19,0.6)] hover:bg-olive hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(46,35,19,0.7)]",
  outline:
    "rounded-full border border-olive/35 text-olive-deep hover:border-olive-deep hover:bg-olive-deep hover:text-cream hover:-translate-y-0.5",
  ghost: "rounded-full text-olive-deep hover:text-olive",
};

const SIZE: Record<Size, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-2.5 text-[12px]",
  lg: "px-8 py-3.5 text-[13px]",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  /** Show the sliding → arrow. Defaults on for `ghost`, off otherwise. */
  arrow?: boolean;
  className?: string;
}

function Inner({
  children,
  variant = "solid",
  arrow,
}: Pick<CommonProps, "children" | "variant" | "arrow">) {
  const showArrow = arrow ?? variant === "ghost";
  return (
    <>
      <span className="relative z-10 inline-flex items-center gap-2">
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

type LinkProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >;
type ButtonProps = CommonProps & { href?: undefined } & Omit<
    ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export default function Button(props: LinkProps | ButtonProps) {
  const { children, variant = "solid", size = "md", arrow, className } = props;
  const classes = cn(BASE, VARIANT[variant], SIZE[size], className);

  if (props.href !== undefined) {
    const { href, ...rest } = props as LinkProps;
    return (
      <Link href={href} className={classes} {...rest}>
        <Inner variant={variant} arrow={arrow}>
          {children}
        </Inner>
      </Link>
    );
  }

  const { type = "button", ...rest } = props as ButtonProps;
  return (
    <button type={type} className={classes} {...rest}>
      <Inner variant={variant} arrow={arrow}>
        {children}
      </Inner>
    </button>
  );
}
