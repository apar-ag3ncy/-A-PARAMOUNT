import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

interface Props {
  title: string;
  subtitle?: string;
  count: number;
}

/**
 * CategoryHero — the family page's EDITORIAL header (client reference: the
 * real-estate post templates), centred, on the brand's beige ground: an olive
 * eyebrow, the family name in Storica, an ornament divider and the blurb — all
 * centre-aligned above the collection grid.
 */
export default function CategoryHero({ title, subtitle, count }: Props) {
  return (
    <header className="px-6 pt-12 pb-6 text-center">
      <p className="pm-eyebrow font-body text-olive/80">
        Collection · {count} {count === 1 ? "piece" : "pieces"}
      </p>
      <SplitTextReveal
        as="h1"
        by="words"
        className="pm-display-lg mt-4 font-display font-light text-balance text-heading-brown"
      >
        {title}
      </SplitTextReveal>
      <OrnamentDivider className="mx-auto mt-6 text-olive/50" />
      {subtitle && (
        <p className="pm-body mx-auto mt-6 max-w-md font-body text-maroon/75">
          {subtitle}
        </p>
      )}
    </header>
  );
}
