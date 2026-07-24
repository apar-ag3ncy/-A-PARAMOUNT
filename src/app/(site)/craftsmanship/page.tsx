import type { Metadata } from "next";
import Image from "next/image";
import FadeThrough from "@/components/animations/FadeThrough";
import { galleryFor } from "@/lib/galleries";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import PageHeader from "@/components/ui/PageHeader";
import EnquiryCTA from "@/components/sections/EnquiryCTA";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Craftsmanship",
  description:
    "From shastra to sanctum, the Paramount process: design, carving, cladding, polishing and installation of Jain and Hindu temple artifacts.",
};

const STEPS: { n: string; title: string; body: string; slug: string; img: string }[] = [
  {
    n: "01",
    title: "Design & Shastra",
    body: "Every piece begins with the shastra. Sizes and proportions follow religious calculation, so a dhwajadand or kalash is made exactly to the norms of your derasar.",
    slug: "dhwajadand",
    img: "/products/dhwajadand.webp",
  },
  {
    n: "02",
    title: "Carving",
    body: 'Premium quality wood is carved to depth, from roughly 0.25" normal carving to 1.5" extra deep, each cut deepening the intricacy of the design.',
    slug: "wooden-carved-murti",
    img: "/products/wooden-carved-murti.webp",
  },
  {
    n: "03",
    title: "Cladding",
    body: "Silver, german silver, brass or copper sheets are cladded onto the carved wood, highlighting the work beneath. Two- and three-tone combinations set parts of the design apart.",
    slug: "samovasaran-trigadu",
    img: "/products/samovasaran-trigadu.webp",
  },
  {
    n: "04",
    title: "Polish & Lacquer",
    body: "Each surface is polished and lacquered for a shine and durability that endures, engraved, where needed, with yantra and name.",
    slug: "kalash",
    img: "/products/kalash.webp",
  },
  {
    n: "05",
    title: "Installation",
    body: "Delivered on time and installed at your derasar, sized to the space, with the transparency and care of a fifty year relationship.",
    slug: "mandir",
    img: "/products/mandir.webp",
  },
];

export default function CraftsmanshipPage() {
  return (
    <div className="pt-12">
      <PageHeader
        eyebrow="The Process"
        title="From shastra to sanctum"
        subtitle="A rare combination of engineering expertise and artistic skill, every temple need under one roof."
      />

      {/* Deck p11–12, the "WHY CHOOSE US" pill card on an olive band */}
      <div className="mt-10">
        <WhyChooseUs />
      </div>

      {/* The process, alternating left/right, each stage fronted by a full-bleed
          card in the /products collections language. Both halves rise and resolve
          on the way in and dissolve on the way out (FadeThrough) — it used to
          throw each half in from its own side and leave it there. */}
      <div className="mx-auto max-w-7xl overflow-x-hidden px-6 py-12 sm:py-16">
        {/* left-aligned to the step grid's left edge, it was centered over
            left-anchored content, so the heading floated off its own section */}
        <SectionHeading
          eyebrow="The Making"
          title="Five stages, one sanctum"
          align="left"
          className="mb-8 max-w-2xl sm:mb-12"
        />
        {STEPS.map((s, i) => {
          const textLeft = i % 2 === 0;
          // The GALLERY shot, not the catalogue cut-out. A full-bleed card slices
          // whatever it holds, and the white-ground studio shots must never be
          // cropped (client mandate) — the in-situ gallery photography can be, and
          // is the same source the /products collection cards crop. All five
          // stages have one; the cut-out stays as the fallback, contained.
          const photo = galleryFor(s.slug)?.groups.flatMap((g) => g.images)[0]?.src;
          return (
            <section
              key={s.n}
              className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-16 lg:py-14"
            >
              {/* The stage as a full-bleed card in the /products collections
                  language: gradient hairline frame in the brand's two olives, the
                  photograph filling it, index top-left and the stage name
                  bottom-left on an olive scrim. The number and title live HERE
                  now rather than in the text column — on the collections card
                  they are the card's own furniture, and repeating them a column
                  away read as the same heading printed twice. */}
              <FadeThrough
                className={cn(
                  "group/card w-full",
                  // DOM order is card-then-copy so the stacked column reads
                  // title first; at lg the grid alternates the sides back.
                  textLeft ? "lg:order-2 lg:justify-self-end" : "lg:justify-self-start",
                )}
              >
                <div
                  className="rounded-[1.25rem] p-px shadow-[0_24px_54px_-40px_rgba(46,35,19,0.5)] transition-shadow duration-500 group-hover/card:shadow-[0_34px_70px_-36px_rgba(46,35,19,0.66)]"
                  style={{
                    background:
                      "linear-gradient(150deg, #897E49 0%, rgba(137,126,73,0.35) 38%, rgba(124,113,68,0.55) 72%, #7C7144 100%)",
                  }}
                >
                  <div
                    className="relative h-[clamp(19rem,46vh,27rem)] overflow-hidden rounded-[calc(1.25rem-1px)]"
                    style={{ background: "#2A2416" }}
                  >
                    <Image
                      src={photo ?? s.img}
                      alt={s.title}
                      fill
                      sizes="(min-width:1024px) 44vw, 100vw"
                      className={cn(
                        "transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]",
                        // never crop the cut-out if a gallery shot is missing
                        photo ? "object-cover" : "object-contain p-6 pb-20",
                      )}
                    />

                    {/* the olive scrim the name reads on */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(38,33,18,0.94) 0%, rgba(44,38,20,0.62) 22%, rgba(124,113,68,0.20) 48%, rgba(137,126,73,0.06) 68%, transparent 84%)",
                      }}
                    />
                    {/* and one at the top, or the index disappears into the pale
                        shots — the murti on white silk and the marble-wall
                        dhwajadand are near-white exactly where it sits */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-24"
                      style={{
                        background:
                          "linear-gradient(to bottom, rgba(38,33,18,0.62) 0%, rgba(44,38,20,0.28) 45%, transparent 100%)",
                      }}
                    />

                    <span className="pm-micro absolute top-5 left-5 font-body tabular-nums tracking-[0.24em] text-gold">
                      {s.n}
                    </span>
                    <span className="pm-micro absolute top-5 right-5 font-body tracking-[0.2em] text-cream/85 uppercase">
                      Stage {i + 1} of {STEPS.length}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                      <OrnamentDivider width="sm" className="text-gold/80" />
                      {/* pm-small (14px). The card name is a caption over a photograph, not a
                          section subheading; at pm-h3's 24px, 13 of the 54 names across the site
                          wrapped to two or three lines. Measured against the label's true 257px
                          content width, 16px already put 53 of them on one line and 14px keeps all
                          53 — the only name still over is "Aluminium Platform, Railing & Ladder",
                          which measures 385px against 274px available and needs 11.2px, below the
                          client's 12px floor. No type size rescues that one; it needs a shorter
                          name. 14px is an existing ramp step inside the locked 12-14 small-text
                          bracket, so this stays in the ramp rather than hand-picking a size (the
                          literal 5% ask, 15.2px, falls in the gap between the 12-14 and 16-18
                          brackets and would sit outside the spec). No extra tracking: at 0.06em it
                          would add ~23px to a 23-character name and undo the fit. */}
                      <h2 className="pm-small mt-3 font-display leading-[1.15] text-cream uppercase">
                        {s.title}
                      </h2>
                    </div>
                  </div>
                </div>
              </FadeThrough>

              <FadeThrough className={textLeft ? "lg:order-1" : ""}>
                <OrnamentDivider className="text-olive/45" />
                <p className="pm-body mt-5 max-w-md font-body text-maroon/80">
                  {s.body}
                </p>
              </FadeThrough>
            </section>
          );
        })}
      </div>
      <EnquiryCTA />
    </div>
  );
}
