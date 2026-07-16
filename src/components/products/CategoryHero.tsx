import OrnamentDivider from "@/components/ui/OrnamentDivider";
import SplitTextReveal from "@/components/animations/SplitTextReveal";

interface Props {
  title: string;
  subtitle?: string;
  count: number;
}

/**
 * CategoryHero — the family page's DARK EDITORIAL header (client reference: the
 * real-estate post templates), centred, in the brand's velvet/gold/cream. A top
 * metadata rule, a gold eyebrow, the family name in Storica, an ornament divider
 * and the blurb — everything centre-aligned over the dark ground the grid sits on.
 */
export default function CategoryHero({ title, subtitle, count }: Props) {
  return (
    <header className="px-6 pt-32 pb-6 text-center">
      {/* editorial metadata rule */}
      <div className="flex items-center justify-center gap-4 pm-micro font-body tracking-[0.28em] text-pista/40 uppercase">
        <span>A Paramount</span>
        <span className="h-px w-8 bg-gold/30" aria-hidden />
        <span>Est. 1968</span>
      </div>

      <p className="pm-eyebrow mt-10 font-body text-gold/70">
        Collection · {count} {count === 1 ? "piece" : "pieces"}
      </p>
      <SplitTextReveal
        as="h1"
        by="words"
        className="pm-display-lg mt-4 font-display font-light text-balance text-cream"
      >
        {title}
      </SplitTextReveal>
      <OrnamentDivider className="mx-auto mt-7 text-gold/55" />
      {subtitle && (
        <p className="pm-body mx-auto mt-6 max-w-xl font-body text-pista/70">
          {subtitle}
        </p>
      )}
    </header>
  );
}
