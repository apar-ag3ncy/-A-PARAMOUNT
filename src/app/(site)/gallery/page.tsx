import type { Metadata } from "next";
import FannedGalleryRail, {
  type ReelCard,
} from "@/components/gallery/FannedGalleryRail";
import { getCoverflowFlow } from "@/lib/galleryCoverflow";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Installations and photography — carved ceilings, silver doors, samovasaran and shrines across the derasars and temples we have served since 1968, shown as one swipeable fan of the work.",
};

/**
 * The gallery is the reference FAN-RAIL hero: a badge, a two-line display line,
 * a short lede, then the whole portfolio as a single swipeable arc of cards, and
 * a CTA into the catalogue. The old pinned Cover Flow was retired for this.
 *
 * The reel reuses the SAME curated photo flow (`getCoverflowFlow`) but ROUND-
 * ROBINS across collections so the fan opens on a varied spread (a door, a
 * kalash, a toran…) rather than six of one kind in a row.
 */
function buildReel(): ReelCard[] {
  const flow = getCoverflowFlow();
  const byCol: (typeof flow.photos)[] = flow.collections.map(() => []);
  for (const p of flow.photos) byCol[p.collection].push(p);

  const reel: ReelCard[] = [];
  const rounds = Math.max(0, ...byCol.map((b) => b.length));
  for (let r = 0; r < rounds; r++) {
    for (let c = 0; c < byCol.length; c++) {
      const p = byCol[c][r];
      if (!p) continue;
      const col = flow.collections[c];
      reel.push({ src: p.src, label: col.label, href: col.href });
    }
  }
  return reel;
}

export default function GalleryPage() {
  const reel = buildReel();

  return (
    // The reference's FRAMED hero: a flat cream card FLOATING on a thick, blurred
    // ambient glow — warm gold at the top fading to a brighter soft-olive band at
    // the bottom (the on-brand echo of the reference's peach → lime-green
    // backlight). No footer on this route (ConditionalFooter); the fan IS the page.
    <section
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pt-[calc(var(--pm-bar-bottom,4rem)+1rem)] pb-[7vh] sm:px-10"
      style={{
        background:
          "linear-gradient(178deg, #F4E9C8 0%, #EFEBCF 46%, #E4E7BE 100%)",
      }}
    >
      {/* the ambient backlight — a big soft glow, brightest across the BOTTOM,
          warm across the top (heavily blurred so it reads as light, not a shape) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 42% at 50% 2%, rgba(226,202,130,0.55), transparent 60%), radial-gradient(120% 55% at 50% 104%, rgba(150,166,86,0.55), transparent 62%)",
          filter: "blur(46px)",
        }}
      />

      {/* the cream card itself — everything clips to its rounded edge */}
      <div className="relative flex w-full max-w-[80rem] flex-col items-center overflow-hidden rounded-[2.2rem] bg-cream px-4 pt-7 pb-7 shadow-[0_46px_110px_-46px_rgba(46,35,19,0.42),inset_0_1px_0_rgba(255,255,255,0.55)] sm:px-12 sm:pt-8 sm:pb-7">
        {/* ---------- eyebrow badge (solid warm pill, sentence case) ---------- */}
        <span className="relative inline-flex items-center rounded-full bg-gold/25 px-4 py-1.5">
          <span className="font-body text-[13px] font-medium tracking-[0.01em] text-maroon/90">
            Handcrafted for derasars since 1968
          </span>
        </span>

        {/* ---------- the two-line display heading (with the corner doodles) ---------- */}
        <div className="relative mt-5 text-center">
          <h1 className="pm-display-lg font-display tracking-[-0.01em] text-balance text-heading-brown">
            Our Work,
            <br />
            In Its Sacred Place
          </h1>

          {/* top-right flourish (the reference's "Elevate your brand" note),
              a brand-olive stroke — no non-brand script face */}
          <div
            aria-hidden
            className="absolute -top-6 right-0 hidden w-32 translate-x-1/2 text-olive/55 lg:block xl:translate-x-2/3"
          >
            <span className="pm-micro block font-body tracking-[0.2em] text-olive/65 uppercase">
              in marble &amp; metal
            </span>
            <svg viewBox="0 0 110 46" fill="none" className="mt-1 w-full">
              <path
                d="M6 6 C 34 2, 74 6, 96 34"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <path
                d="M96 34 L 84 30 M96 34 L 91 22"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* tiny hand-drawn caret to the lower-left of the heading (annotation C) */}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            className="absolute -left-6 bottom-1 hidden w-5 text-olive/45 lg:block"
          >
            <path
              d="M16 4 L 6 12 L 16 20"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ---------- lede (narrow column, like the reference) ---------- */}
        <p className="pm-body mx-auto mt-5 max-w-md text-center font-body text-maroon/80">
          Carved, clad and polished for derasars and temples across generations.
          Every piece here stands where it was consecrated, in marble, brass and
          silver.
        </p>

        {/* ---------- the fan: swipe left or right (breaks the card padding so
             the end cards clip HARD at the card's rounded corner, like the ref) ---------- */}
        <div className="-mx-4 mt-7 w-[calc(100%+2rem)] sm:-mx-12 sm:w-[calc(100%+6rem)]">
          <FannedGalleryRail cards={reel} />
        </div>

        {/* ---------- CTA: solid pill inside a dashed sticker ring (reference detail) ---------- */}
        <div className="relative mt-7 flex items-center justify-center">
          <div
            aria-hidden
            className="absolute right-full mr-5 hidden w-24 text-olive/55 sm:block"
          >
            <svg viewBox="0 0 96 40" fill="none" className="w-full">
              <path
                d="M90 8 C 64 4, 30 10, 10 30"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <path
                d="M10 30 L 20 26 M10 30 L 16 20"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
            <span className="pm-micro block text-right font-body tracking-[0.2em] text-olive/60 uppercase">
              drag to explore
            </span>
          </div>

          {/* dashed offset ring around the pill — the reference's sticker/cut-out look */}
          <span className="relative inline-flex rounded-full p-[7px]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-olive/40"
            />
            <Button variant="solid" size="lg" href="/products">
              Explore the catalogue
            </Button>
          </span>
        </div>
      </div>
    </section>
  );
}
