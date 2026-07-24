import type { CSSProperties, ReactNode } from "react";
import BrandDamask from "./BrandDamask";
import LotusFlourish from "./LotusFlourish";

interface Props {
  /** Which edge the half-circle bleeds off. Defaults to "right". */
  side?: "left" | "right";
  /** Content rendered on top of the field (e.g. "GENERATION" + the names). */
  children?: ReactNode;
  /** Paint a faint damask texture inside the olive field. */
  damask?: boolean;
  /** A faint 4-petal lotus watermark. Centred in the disc by default; on the
   *  "deck" variant it is CENTRED ON THE ARC and clipped to it, as on the sheet. */
  flourish?: boolean;
  /**
   * "default" is the original composition (used by the home QuoteInterlude).
   *
   * "deck" reproduces the client's ABOUT US spread. Every number is read out of
   * the PDF's vector layer, not estimated off a screenshot — see the geometry
   * note below.
   */
  variant?: "default" | "deck";
  className?: string;
}

/* ── THE SHEET'S GEOMETRY, MEASURED ──────────────────────────────────────────
 *
 * Source: "20July.pdf" page index 6 (the ABOUT US spread), 900 x 648 pt, read
 * with PyMuPDF straight off the vector layer. Do NOT re-derive these by eye off
 * a screenshot; every previous attempt did that, and every one of them drifted.
 *
 * THE OLIVE FIELD is one path (drawing #2): two Bézier arcs plus three straight
 * lines. Solving the arcs gives a PERFECT CIRCLE, centre (792, 324), r = 324 —
 * and the straight lines carry its flat side out to the page's right edge.
 * Three facts fall out of that, and they are the whole composition:
 *
 *   1. r = 324 = EXACTLY HALF THE PAGE HEIGHT. The arc kisses the top edge and
 *      the bottom edge, at the circle's own centre-x. So the field is a TRUE
 *      half-disc spanning the full height — a full 180 degrees of arc shows.
 *   2. Its leftmost point is at x = 468 = 52.0% of the page width.
 *   3. Right of the circle's centre the olive is a plain RECTANGLE out to the
 *      page edge, and that is what fills the top-right and bottom-right
 *      corners. A bare circle cannot fill them: the distance from the centre to
 *      a corner is always greater than r. That rectangle is why the sheet reads
 *      as a *field* rather than as a ball.
 *
 * The old code had all three wrong — leading edge 59%, diameter 1.46x the
 * height (so only a shallow ~86-degree slice of arc showed, and the olive
 * "spread" much further left at the top and bottom than the sheet's does), and
 * no rectangle at all, so on a short viewport the corners went cream.
 *
 * THE FLORET is Form XObject Fm0, bbox (298.671,154.671)-(637.329,493.329):
 * a perfect square, 338.658 pt on a side, centred at (468.000, 324.000).
 * That is the arc's leftmost point to ZERO error — the floret sits exactly ON
 * the boundary, half over the cream and half over the olive.
 *
 * And it is POWER-CLIPPED to the olive. Probing the render at 4x across
 * x in [436,467] at y = 200/250/300/324/350/400/440 returns the untouched cream
 * #FEF4DA every single time: the cream-side half does not paint at all. Only
 * the olive-side half shows, as a faint DARKENING of the olive — ground #8A7F4A
 * reads #847946 to #817745 under it, i.e. black at 4.5%-7.7%, dominant ~7%.
 *
 * Expressed against the field, free of the sheet's own aspect ratio:
 *   disc diameter = field height          (fact 1)
 *   disc left edge = 52vw                 (fact 2)
 *   floret centre  = the disc's left edge, at half its height
 *   floret size    = 338.658 / 648 = 52.262% of the disc's diameter
 * ────────────────────────────────────────────────────────────────────────── */
const DECK_LEADING_EDGE = "52vw";
/** floret side ÷ disc diameter = 338.658 / 648, from the two measured bboxes */
const DECK_FLOURISH_RATIO = 338.658 / 648;

/* THE POWER CLIP, in the floret's own box.
 *
 * The sheet does this literally — its content stream is
 *
 *     468 145.059 613.059 0 792 0 c   … 900 648 l  h
 *     W n                              <- clip to the half-disc
 *     q 0 g /GS1 gs /Fm0 Do Q          <- floret painted INSIDE that clip
 *
 * so "the cream half does not paint" is an operator in the file, not something
 * inferred from pixels.
 *
 * WHY THE CLIP RIDES THE FLORET AND NOT THE DISC. `overflow-hidden` on the
 * `rounded-full` disc would clip just as well — but it turns the disc into a
 * CLIPPING CONTAINER, which is the same shape as the bug that put a visible
 * hairline under "Our Works": a rounded clip on a composited/transformed layer
 * can leak a line of the colour beneath along its edge. Clipping the floret
 * instead leaves the disc a single un-clipped opaque surface, so no new edge is
 * created for anything to bleed through.
 *
 * THE ARITHMETIC. The floret's centre sits exactly on the disc's leftmost
 * point, so in the floret's own border box the disc's centre is half a diameter
 * to the right and its radius is half a diameter:
 *
 *     R = (D/2) / floretWidth = 0.5 / DECK_FLOURISH_RATIO   (of the floret box)
 *     clip = circle(R at 50% + R, 50%)
 *
 * Both numbers come off the SAME ratio as the width, so the clip circle and the
 * painted arc cannot drift apart. A percentage radius only resolves against the
 * box's side while the box is SQUARE (otherwise it is the diagonal ÷ √2) —
 * hence `aspect-square` on the span AND `block` on the svg below, without which
 * the inline svg's baseline descender makes the span ~4px taller than wide and
 * the radius comes out ~1.9px too large, painting a crescent of floret on the
 * cream. */
const DECK_CLIP_R = 0.5 / DECK_FLOURISH_RATIO;
const deckFlourishClip = (side: "left" | "right") =>
  `circle(${(DECK_CLIP_R * 100).toFixed(4)}% at ${(
    (side === "right" ? 0.5 + DECK_CLIP_R : 0.5 - DECK_CLIP_R) * 100
  ).toFixed(4)}% 50%)`;

/** black at 7%: the measured darkening of #8A7F4A under the sheet's floret */
const DECK_FLOURISH_INK: CSSProperties = { color: "#000", opacity: 0.07 };

/**
 * SemicircleField — the deck's big olive half-circle bleeding off one `side`
 * (p04 / p07). Optionally carries a faint `damask` texture and a `flourish`
 * lotus watermark; `children` render on top.
 */
export default function SemicircleField({
  side = "right",
  children,
  damask = false,
  flourish = false,
  variant = "default",
  className,
}: Props) {
  // GEOMETRY (default variant) — the disc must *contain* its content, or the
  // arc shears the stats.
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
  // the right half bleeds off the edge, as before.
  //
  // NOTE: complete, literal class strings only — Tailwind scans source text, so a
  // computed `"left-" + x` would never be emitted.
  const isDeck = variant === "deck";
  const contentOffset =
    side === "right"
      ? "sm:pl-[40%] sm:pr-[6%]"
      : "sm:pr-[40%] sm:pl-[6%]";

  // THE DECK DISC BOX. `h-full aspect-square` is the whole trick: it makes the
  // diameter equal the FIELD'S OWN HEIGHT, which is fact 1 above, and it does so
  // without a single viewport calc — so it stays true even if the copy column
  // grows taller than one screen and drags the section with it. Every earlier
  // version tied the diameter to `100svh` and drifted the moment the section
  // stopped being exactly one screen tall.
  //
  // Positioned by its LEFT EDGE (no x-translate), because that edge IS the arc's
  // leftmost point — the one landmark the sheet actually pins.
  const deckDiscBox: CSSProperties =
    side === "right"
      ? { left: DECK_LEADING_EDGE }
      : { right: DECK_LEADING_EDGE };

  // The names column centres on the sheet's own 81.07% of the page width
  // (measured: every span in that column has centre x = 729.63 of 900). It is
  // `inset-y-0`, so its height IS the field's height — which is what lets the
  // panel place "GENERATION" and the four names at the sheet's own vertical
  // percentages rather than guessing at gaps.
  const contentBox = isDeck
    ? `absolute inset-y-0 z-10 w-[26vw] max-w-[28rem] min-w-[14rem] -translate-x-1/2 text-cream ${
        side === "right" ? "left-[81.07vw]" : "left-[18.93vw]"
      }`
    : `relative z-10 flex h-full min-h-[24rem] flex-col items-center justify-center px-[14%] py-12 text-center text-cream ${contentOffset}`;

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {isDeck ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 aspect-square h-full -translate-y-1/2"
          style={deckDiscBox}
        >
          {/* THE FLAT SIDE — fact 3. A plain rectangle from the circle's centre
              out past the page edge, so the top-right and bottom-right corners
              are olive exactly as they are on the sheet. It OVERLAPS the circle
              (it starts at the centre; the circle reaches centre + r) rather
              than butting against it: two opaque surfaces that abut along a
              shared edge blend into a visible hairline once either is
              composited — that exact bug already cost us the seam under
              "Our Works". */}
          <div
            className={`absolute inset-y-0 w-screen bg-olive ${
              side === "right" ? "left-1/2" : "right-1/2"
            }`}
          />

          {/* THE HALF-DISC. Deliberately NOT a clipping container — see the
              power-clip note above; the floret clips itself.

              There is only ONE floret element now. The old code drew TWO (an
              olive copy beneath the disc to serve the cream side, a cream copy
              inside it to serve the olive side) and, since nothing was clipping
              anything, BOTH painted over the cream at once, which is why the
              petal hanging over the page read as a washed-out smudge instead of
              the sheet's clean cut. */}
          <div className="absolute inset-0 rounded-full bg-olive">
            {damask ? (
              <BrandDamask className="rounded-full text-cream" opacity={0.14} />
            ) : null}
            {flourish ? (
              <span
                className={`absolute top-1/2 block aspect-square -translate-y-1/2 ${
                  side === "right"
                    ? "left-0 -translate-x-1/2"
                    : "right-0 translate-x-1/2"
                }`}
                style={{
                  width: `${(DECK_FLOURISH_RATIO * 100).toFixed(4)}%`,
                  clipPath: deckFlourishClip(side),
                  ...DECK_FLOURISH_INK,
                }}
              >
                {/* `block` is load-bearing: see the clip note. */}
                <LotusFlourish className="block h-full w-full" />
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        /* The default variant's disc — unchanged; QuoteInterlude rides on it. */
        <div
          aria-hidden
          className={`pointer-events-none absolute top-1/2 left-1/2 aspect-square h-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-olive sm:h-[165%] ${
            side === "right" ? "sm:left-[86%]" : "sm:left-[14%]"
          }`}
        >
          {damask ? (
            <BrandDamask className="rounded-full text-cream" opacity={0.14} />
          ) : null}
          {flourish ? (
            <span
              className="absolute inset-0 flex items-center justify-center text-cream"
              style={{ opacity: 0.12 }}
            >
              <LotusFlourish className="h-1/2 w-1/2" />
            </span>
          ) : null}
        </div>
      )}

      {/* Foreground content, cream by default so it reads on the olive. On the
          deck variant the panel positions itself against the field's own height,
          so it is handed through untouched. */}
      <div className={contentBox}>
        {isDeck ? children : <div className="w-full max-w-xs">{children}</div>}
      </div>
    </div>
  );
}
