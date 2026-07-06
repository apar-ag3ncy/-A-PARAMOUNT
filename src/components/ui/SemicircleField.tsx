import type { ReactNode } from "react";
import BrandDamask from "./BrandDamask";
import LotusFlourish from "./LotusFlourish";

interface Props {
  /** Which edge the half-circle bleeds off. Defaults to "right". */
  side?: "left" | "right";
  /** Content rendered on top of the field (e.g. "GENERATION" + stats). */
  children?: ReactNode;
  /** Paint a faint damask texture inside the olive field. */
  damask?: boolean;
  /** Center a large faint 4-petal lotus watermark behind the children. */
  flourish?: boolean;
  className?: string;
}

/**
 * SemicircleField — the deck's big olive half-circle bleeding off one `side`
 * (p04 / p07). Optionally carries a faint `damask` texture and a centered
 * `flourish` lotus watermark; `children` render on top (e.g. "GENERATION" and the
 * stat blocks).
 *
 * The disc is olive and over-sized so its straight diameter sits flush with the
 * chosen edge and the curve bleeds past the top and bottom. Everything inside is
 * cream-toned by default so text/stats read on the olive.
 */
export default function SemicircleField({
  side = "right",
  children,
  damask = false,
  flourish = false,
  className,
}: Props) {
  // Anchor the disc to the chosen edge; a diameter-wide disc, offset by half its
  // width past the edge, leaves a clean half-circle bleeding off-screen.
  const edgeAnchor =
    side === "right"
      ? "left-1/2 -translate-x-[8%]"
      : "right-1/2 translate-x-[8%]";

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* The olive disc — square aspect, rounded to a full circle, bleeding off-edge */}
      <div
        aria-hidden
        className={`pointer-events-none absolute top-1/2 aspect-square h-[130%] -translate-y-1/2 rounded-full bg-olive ${edgeAnchor}`}
      >
        {damask ? <BrandDamask className="rounded-full text-cream" opacity={0.14} /> : null}
        {flourish ? (
          <span
            className="absolute inset-0 flex items-center justify-center text-cream"
            style={{ opacity: 0.12 }}
          >
            <LotusFlourish className="h-1/2 w-1/2" />
          </span>
        ) : null}
      </div>

      {/* Foreground content, cream by default so it reads on the olive. Centered
          in the circle's wide middle with horizontal safe-padding so stacked
          stats never run past the curving arc near the top/bottom. */}
      <div
        className={`relative z-10 flex h-full min-h-[24rem] flex-col items-center justify-center px-[14%] text-center text-cream ${
          side === "right" ? "sm:pr-[6%] sm:pl-[18%]" : "sm:pr-[18%] sm:pl-[6%]"
        }`}
      >
        <div className="w-full max-w-xs">{children}</div>
      </div>
    </div>
  );
}
