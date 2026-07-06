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
    <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
      {count} {count === 1 ? "piece" : "pieces"}
    </p>
  );

  const heading = (
    <SplitTextReveal
      as="h1"
      by="chars"
      stagger={0.02}
      className="font-display text-5xl leading-[1.05] font-light text-[color:var(--color-heading-brown)] sm:text-7xl"
    >
      {title}
    </SplitTextReveal>
  );

  // No photography for this family — keep the original centered layout.
  if (!image) {
    return (
      <header className="mx-auto max-w-4xl px-6 pt-28 pb-12 text-center">
        {eyebrow}
        {heading}
        <OrnamentDivider className="mx-auto mt-6 text-olive/50" />
        {subtitle && (
          <p className="mx-auto mt-6 max-w-xl font-body text-base text-espresso/75">
            {subtitle}
          </p>
        )}
      </header>
    );
  }

  // Deck p13 template: text block left, big photo circle bleeding off the right.
  return (
    <header className="relative overflow-x-clip pt-28 pb-12">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-6">
        <div className="text-center lg:max-w-xl lg:text-left">
          {eyebrow}
          {heading}
          <OrnamentDivider className="mx-auto mt-6 text-olive/50 lg:mx-0" />
          {subtitle && (
            <p className="mx-auto mt-6 max-w-xl font-body text-base text-espresso/75 lg:mx-0">
              {subtitle}
            </p>
          )}
        </div>

        {/* Big circular frame — olive hairline ring on cream, photo uncropped
            (object-contain, client mandate), bleeding off the page edge on
            desktop like the deck's product circle. */}
        <div className="justify-self-center lg:-mr-28 lg:justify-self-end xl:-mr-40">
          <div className="relative aspect-square w-72 overflow-hidden rounded-full border border-olive/40 bg-cream-deep/50 sm:w-96 lg:w-[30rem] xl:w-[36rem]">
            {/* inset hairline ring, echoing the deck's double-rule frames */}
            <div
              className="pointer-events-none absolute inset-2.5 rounded-full border border-olive/25"
              aria-hidden
            />
            <Image
              src={image}
              alt={title}
              fill
              priority
              sizes="(min-width: 1280px) 36rem, (min-width: 1024px) 30rem, (min-width: 640px) 24rem, 18rem"
              className="object-contain p-10 sm:p-12 lg:p-16"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
