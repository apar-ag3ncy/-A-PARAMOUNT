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
  // GEOMETRY — the disc must *contain* its content, or the arc shears the stats.
  //
  // The old anchor (`left-1/2 -translate-x-[8%]`, h-[130%]) put the disc's centre
  // at ~the field's RIGHT EDGE while the content stayed near the field's centre,
  // so the stack straddled the arc. Measured on /about (624x560 field, r=364):
  // "Generation" fell 150px outside the circle, "240+" 35px, "Temples served"
  // 70px. It never *looked* broken because the overflow is cream type spilling
  // onto the cream page — the stats were silently being cut off.
  //
  // Now: diameter D = 1.65 x field height H (r = 0.825H), centre at 86% of the
  // field width. The left arc stays inside the field (the half-circle read) and
  // the right half bleeds off the edge, as before. Content is centred at 70% of
  // the field width and capped at max-w-xs.
  //
  // Containment scales: r grows with H while the content's half-height grows with
  // H/2, so the margin only widens as content is added. Verified in-browser: zero
  // content corners outside the circle. Re-run that check if you touch these.
  //
  // NOTE: complete, literal class strings only — Tailwind scans source text, so a
  // computed `"left-" + x` would never be emitted.
  const discAnchor = side === "right" ? "sm:left-[86%]" : "sm:left-[14%]";
  // Under `sm` the field is narrow and the page stacks: centre the disc and the
  // content on the same axis, which is trivially containing.
  const contentOffset =
    side === "right" ? "sm:pl-[40%] sm:pr-[6%]" : "sm:pr-[40%] sm:pl-[6%]";

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* The olive disc — square aspect, rounded to a full circle, bleeding off-edge */}
      <div
        aria-hidden
        className={`pointer-events-none absolute top-1/2 left-1/2 aspect-square h-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-olive sm:h-[165%] ${discAnchor}`}
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

      {/* Foreground content, cream by default so it reads on the olive. Vertical
          padding keeps the stack clear of the arc's narrow top and bottom. */}
      <div
        className={`relative z-10 flex h-full min-h-[24rem] flex-col items-center justify-center px-[14%] py-12 text-center text-cream ${contentOffset}`}
      >
        <div className="w-full max-w-xs">{children}</div>
      </div>
    </div>
  );
}
