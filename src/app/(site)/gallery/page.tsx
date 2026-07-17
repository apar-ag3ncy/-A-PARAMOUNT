import type { Metadata } from "next";
import FannedGalleryRail, {
  type ReelCard,
} from "@/components/gallery/FannedGalleryRail";
import { getCoverflowFlow } from "@/lib/galleryCoverflow";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
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
    // One framed hero screen on the brand cream — no footer on this route
    // (ConditionalFooter), the fan IS the page.
    <section className="relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-cream px-4 pt-[calc(var(--pm-bar-bottom,4rem)+1.5rem)] pb-10">
      {/* soft brand glow behind the framed panel (the reference's outer halo) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 8%, rgba(226,202,130,0.22), transparent 60%)",
        }}
      />

      {/* ---------- eyebrow badge ---------- */}
      <span className="inline-flex items-center gap-2 rounded-full border border-olive/20 bg-cream-deep/60 px-4 py-1.5 shadow-[0_10px_30px_-20px_rgba(46,35,19,0.6)]">
        <span className="size-1.5 rounded-full bg-gold" />
        <span className="pm-micro font-body tracking-[0.24em] text-maroon/80 uppercase">
          Handcrafted for derasars since 1968
        </span>
      </span>

      {/* ---------- the two-line display heading (with a corner doodle) ---------- */}
      <div className="relative mt-6 text-center">
        <h1 className="pm-display-lg font-display font-light text-balance text-heading-brown">
          Our Work,
          <br />
          In Its Sacred Place
        </h1>

        {/* hand-drawn flourish, top-right of the heading (reference detail),
            rendered as a brand-olive stroke — no non-brand script face */}
        <div
          aria-hidden
          className="absolute -top-8 -right-2 hidden w-28 text-olive/55 lg:block"
        >
          <span className="pm-micro block translate-x-4 font-body tracking-[0.2em] text-olive/60 uppercase">
            in marble &amp; metal
          </span>
          <svg viewBox="0 0 96 44" fill="none" className="mt-1 w-full">
            <path
              d="M6 4 C 30 2, 62 6, 82 26"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
            <path
              d="M82 26 L 72 20 M82 26 L 78 15"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      <OrnamentDivider className="mx-auto mt-5 text-olive/50" />

      {/* ---------- lede ---------- */}
      <p className="pm-body mx-auto mt-5 max-w-2xl text-center font-body text-maroon/80">
        Carved, clad and polished for derasars and temples across generations.
        Every piece here stands where it was consecrated, in marble, brass and
        silver.
      </p>

      {/* ---------- the fan: swipe left or right ---------- */}
      <div className="mt-7 w-full max-w-[92rem] sm:mt-8">
        <FannedGalleryRail cards={reel} />
      </div>

      {/* ---------- CTA (with the "drag it" doodle to its left) ---------- */}
      <div className="relative mt-7 flex items-center justify-center">
        <div
          aria-hidden
          className="absolute right-full mr-3 hidden w-24 text-olive/55 sm:block"
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

        <Button variant="solid" size="lg" href="/products">
          Explore the catalogue
        </Button>
      </div>
    </section>
  );
}
