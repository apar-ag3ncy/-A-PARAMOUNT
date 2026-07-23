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
  /** A faint 4-petal lotus watermark. Centred in the disc by default; on the
   *  "deck" variant it straddles the arc's leading edge, as in the deck page. */
  flourish?: boolean;
  /**
   * "default" is the original composition (used by the home QuoteInterlude).
   *
   * "deck" reproduces the client's ABOUT US spread exactly: a bigger disc whose
   * centre sits off the page so only a shallow arc shows, the copy pushed out
   * to the far side of it, and the lotus straddling the arc's edge. Measured off
   * the PDF — there the arc's leading edge falls at 59% of the page width and the
   * stats centre at 87%, against 49% and 80% on the default geometry.
   */
  variant?: "default" | "deck";
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
  variant = "default",
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
  //
  // The "deck" numbers come from solving the circle through two points read off
  // the client's PDF (its leftmost point, and where the arc crosses the top of
  // the page): centre at ~105% of the page width, radius ~46% of it. Mapped onto
  // this field that is a disc of 190% its height anchored at 118% of its width,
  // which lands the arc's leading edge at ~57% of the page against the deck's 59%.
  const isDeck = variant === "deck";
  const discAnchor = isDeck
    ? side === "right"
      ? "sm:left-[118%]"
      : "sm:left-[-18%]"
    : side === "right"
      ? "sm:left-[86%]"
      : "sm:left-[14%]";
  const discSize = isDeck ? "h-[130%] sm:h-[190%]" : "h-[130%] sm:h-[165%]";
  // Under `sm` the field is narrow and the page stacks: centre the disc and the
  // content on the same axis, which is trivially containing.
  const contentOffset = isDeck
    ? side === "right"
      ? "sm:pl-[62%] sm:pr-[2%]"
      : "sm:pr-[62%] sm:pl-[2%]"
    : side === "right"
      ? "sm:pl-[40%] sm:pr-[6%]"
      : "sm:pr-[40%] sm:pl-[6%]";

  // The disc's own box, reused verbatim by the under-layer below so the two stay
  // locked together. Literal classes only — Tailwind scans source text.
  const discBox = `pointer-events-none absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 ${discSize} ${discAnchor}`;
  // Centred on the arc's leading edge and a shade inboard of it, so roughly a
  // third of the floret sits out on the cream. 7%/23% of the disc box put its
  // centre at 63% of the page at 21% of the page wide; the deck's are 65% and 21%.
  const lotusAt =
    "absolute top-1/2 left-[7%] w-[23%] -translate-x-1/2 -translate-y-1/2";

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {/* THE UNDER-LAYER, and why the lotus is drawn twice.
          On the deck page the floret reads LIGHTER than the olive inside the
          circle and DARKER than the cream outside it — it is one shape crossing
          a hard colour boundary. A single element cannot do that: cream-on-cream
          vanishes and olive-on-olive vanishes. So the olive copy is painted
          first, BENEATH the disc (the disc hides all of it except the petal that
          reaches out onto the cream), and the cream copy is painted inside the
          disc, where only the part over the olive registers. Each shows exactly
          the half the other cannot. */}
      {flourish && isDeck ? (
        <div aria-hidden className={discBox}>
          <span className={`${lotusAt} text-olive`} style={{ opacity: 0.22 }}>
            <LotusFlourish className="h-auto w-full" />
          </span>
        </div>
      ) : null}

      {/* The olive disc — square aspect, rounded to a full circle, bleeding off-edge */}
      <div aria-hidden className={`${discBox} rounded-full bg-olive`}>
        {damask ? <BrandDamask className="rounded-full text-cream" opacity={0.14} /> : null}
        {flourish && isDeck ? (
          <span className={`${lotusAt} text-cream`} style={{ opacity: 0.13 }}>
            <LotusFlourish className="h-auto w-full" />
          </span>
        ) : null}
        {flourish && !isDeck ? (
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
