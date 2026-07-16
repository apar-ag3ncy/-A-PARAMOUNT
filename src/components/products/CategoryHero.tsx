import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

interface Props {
  title: string;
  subtitle?: string;
  count: number;
}

/**
 * CategoryHero — the family page's EDITORIAL header (client reference: the
 * real-estate post templates), centred, on the brand's beige ground: a top
 * metadata rule, an olive eyebrow, the family name in Storica, an ornament
 * divider and the blurb — all centre-aligned above the collection grid.
 */
export default function CategoryHero({ title, subtitle, count }: Props) {
  return (
    <header className="px-6 pt-32 pb-6 text-center">
      {/* editorial metadata rule */}
      <div className="flex items-center justify-center gap-4 pm-micro font-body tracking-[0.28em] text-olive/50 uppercase">
        <span>A Paramount</span>
        <span className="h-px w-8 bg-olive/30" aria-hidden />
        <span>Est. 1968</span>
      </div>

      <p className="pm-eyebrow mt-10 font-body text-olive/80">
        Collection · {count} {count === 1 ? "piece" : "pieces"}
      </p>
      <SplitTextReveal
        as="h1"
        by="words"
        className="pm-display-lg mt-4 font-display font-light text-balance text-heading-brown"
      >
        {title}
      </SplitTextReveal>
      <OrnamentDivider className="mx-auto mt-7 text-olive/50" />
      {subtitle && (
        <p className="pm-body mx-auto mt-6 max-w-xl font-body text-maroon/75">
          {subtitle}
        </p>
      )}
    </header>
  );
}
