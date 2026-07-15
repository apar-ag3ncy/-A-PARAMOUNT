import Image from "next/image";
import SplitTextReveal from "@/components/animations/SplitTextReveal";
import OrnamentDivider from "@/components/ui/OrnamentDivider";

interface Props {
  title: string;
  subtitle?: string;
  count: number;
  /**
   * Family hero photo (catalog `.image`). When present the hero switches to
   * the deck's product-template layout (p13): title + ornament divider + blurb
   * on the left, the photo in a big circle bleeding off the right edge.
   */
  image?: string;
}

/** Category landing hero with a SplitText title reveal. */
export default function CategoryHero({ title, subtitle, count, image }: Props) {
  const eyebrow = (
    <p className="mb-5 pm-eyebrow font-body text-maroon">
      Collection · {count} {count === 1 ? "piece" : "pieces"}
    </p>
  );

  const heading = (
    // by="words", not "chars": at pm-display-lg a single long word like
    // "ARCHITECTURE" was breaking mid-word ("ARCHIT / ECTURE"). Words wrap only
    // on their spaces — "Temple / Architecture" — and the reveal still staggers.
    <SplitTextReveal
      as="h1"
      by="words"
      stagger={0.06}
      className="pm-display-lg font-display font-light text-balance text-heading-brown"
    >
      {title}
    </SplitTextReveal>
  );

  // No photography for this family — keep the original centered layout.
  if (!image) {
    return (
      <header className="mx-auto max-w-4xl px-6 pt-20 pb-10 sm:pt-28 sm:pb-12 text-center">
        {eyebrow}
        {heading}
        <OrnamentDivider className="mx-auto mt-6 text-olive/50" />
        {subtitle && (
          <p className="mx-auto mt-6 max-w-xl pm-body font-body text-maroon/75">
            {subtitle}
          </p>
        )}
      </header>
    );
  }

  // Deck p13 template: a BALANCED two-column hero — text left, the big photo
  // circle right, both filling their halves of one grid. (The circle used to be
  // shoved off-canvas with -mr-40, leaving a 240px dead void down the middle and
  // squeezing the H1 into a column too narrow for its own word.)
  return (
    <header className="relative overflow-x-clip pt-20 pb-12 sm:pt-28 sm:pb-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="text-center lg:text-left">
          {eyebrow}
          {heading}
          <OrnamentDivider className="mx-auto mt-6 text-olive/50 lg:mx-0" />
          {subtitle && (
            <p className="mx-auto mt-6 max-w-md pm-body font-body text-maroon/75 lg:mx-0">
              {subtitle}
            </p>
          )}
        </div>

        {/* Big circular frame — olive hairline ring on cream, photo uncropped
            (object-contain, client mandate). Aligned to the container's right
            edge, no off-canvas bleed. */}
        <div className="justify-self-center lg:justify-self-end">
          <div className="relative aspect-square w-72 overflow-hidden rounded-full border border-olive/40 bg-cream-deep/50 sm:w-96 lg:w-[26rem] xl:w-[30rem]">
            <div
              className="pointer-events-none absolute inset-2.5 rounded-full border border-olive/25"
              aria-hidden
            />
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(min-width: 1280px) 30rem, (min-width: 1024px) 26rem, (min-width: 640px) 24rem, 18rem"
              className="object-contain p-10 sm:p-12 lg:p-14"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
