import type { CSSProperties, ReactNode } from "react";
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
  // ── THE DECK VARIANT IS SIZED IN vw, NOT IN % OF THIS FIELD ──────────────
  //
  // The sheet's circle is proportional to the PAGE WIDTH: solving it through two
  // points read off the PDF (its leftmost point, and where the arc crosses the
  // top of the sheet) gives centre 105.2% of the page width and radius 46.2% of
  // it — so, directly, w-[92.4vw] centred at left-[105.2vw].
  //
  // Every earlier attempt expressed this as a % of the FIELD instead, and each
  // one drifted, because the field's height is set by the copy — which stops
  // growing once its container hits max-width. So as the viewport widened the
  // disc stayed the same size while the page kept getting wider: measured at
  // 1920 the arc's leading edge had slid from the deck's 59% out to ~68%, the
  // olive read as a thin sliver instead of the sheet's broad field, and the
  // floret slid right along with it. vw is the only unit that holds the deck's
  // proportion at every width. Do NOT re-express these against the field.
  //
  // The default variant keeps its height-relative geometry — QuoteInterlude is
  // a decorative band with no width-proportional target to hit.
  const isDeck = variant === "deck";
  const contentOffset =
    side === "right"
      ? "sm:pl-[40%] sm:pr-[6%]"
      : "sm:pr-[40%] sm:pl-[6%]";

  // The disc's own box, reused verbatim by the under-layer below so the two stay
  // locked together. Literal classes only — Tailwind scans source text.
  const discBox = isDeck
    ? "pointer-events-none absolute top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2"
    : `pointer-events-none absolute top-1/2 left-1/2 aspect-square h-[130%] -translate-x-1/2 -translate-y-1/2 sm:h-[165%] ${
        side === "right" ? "sm:left-[86%]" : "sm:left-[14%]"
      }`;

  // DECK DISC — sized in a style object, not a class, because it is a live calc
  // against both axes and Tailwind would need the whole thing escaped.
  //
  // The spread has to FIT THE SCREEN, so the band it is drawn in is the viewport
  // height less the header rather than the sheet's own 63.25vw (1215px at 1920,
  // which ran off the bottom). A shorter band showing the SAME circle would
  // flatten the arc to a near-straight edge, so the diameter is tied to the
  // band's height at the sheet's own ratio instead — 1265 : 1847.6, i.e.
  // diameter = 1.46 x height — which keeps the arc's CURVATURE identical at any
  // height. The leading edge stays pinned to the sheet's 59vw, so the circle
  // grows rightward from there and still bleeds off the right.
  //
  // The max() floor stops the disc shrinking so far on a short viewport that its
  // right edge would stop reaching the page edge (it needs a diameter of at
  // least 41vw to span 59vw -> 100vw; 48vw leaves margin).
  const deckDiscStyle = {
    "--pm-disc":
      "max(calc(1.46 * (100svh - var(--pm-bar-bottom, 4rem))), 48vw)",
    width: "var(--pm-disc)",
    left:
      side === "right"
        ? "calc(59vw + var(--pm-disc) / 2)"
        : "calc(41vw - var(--pm-disc) / 2)",
  } as CSSProperties;

  // The floret is pinned to the PAGE, not to the disc: centre 65vw (6vw inboard
  // of the arc's leading edge) at 21.5vw across, the sheet's own figures. It is
  // offset from the disc box's left edge, which is itself pinned at 59vw, so it
  // holds those figures even as the disc resizes with the viewport.
  const lotusAt = isDeck
    ? "absolute top-1/2 left-[6vw] w-[21.5vw] -translate-x-1/2 -translate-y-1/2"
    : "absolute top-1/2 left-[7%] w-[23%] -translate-x-1/2 -translate-y-1/2";
  // The stats column centres on the sheet's 86.8% of page width.
  const contentBox = isDeck
    ? `absolute top-1/2 z-10 w-[22vw] max-w-[22rem] min-w-[12rem] -translate-x-1/2 -translate-y-1/2 text-center text-cream ${
        side === "right" ? "left-[86.8vw]" : "left-[13.2vw]"
      }`
    : `relative z-10 flex h-full min-h-[24rem] flex-col items-center justify-center px-[14%] py-12 text-center text-cream ${contentOffset}`;

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
        <div
          aria-hidden
          className={discBox}
          style={isDeck ? deckDiscStyle : undefined}
        >
          <span className={`${lotusAt} text-olive`} style={{ opacity: 0.22 }}>
            <LotusFlourish className="h-auto w-full" />
          </span>
        </div>
      ) : null}

      {/* The olive disc — square aspect, rounded to a full circle, bleeding off-edge */}
      <div
        aria-hidden
        className={`${discBox} rounded-full bg-olive`}
        style={isDeck ? deckDiscStyle : undefined}
      >
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

      {/* Foreground content, cream by default so it reads on the olive. On the
          deck variant it is pinned to the sheet's own column axis; otherwise it
          is padded off-centre, and the vertical padding keeps the stack clear of
          the arc's narrow top and bottom. */}
      <div className={contentBox}>
        <div className={isDeck ? "w-full" : "w-full max-w-xs"}>{children}</div>
      </div>
    </div>
  );
}
