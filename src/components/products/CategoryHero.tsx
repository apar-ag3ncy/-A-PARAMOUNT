import SplitTextReveal from "@/components/animations/SplitTextReveal";

interface Props {
  title: string;
  subtitle?: string;
  count: number;
}

/** Category landing hero with a SplitText title reveal. */
export default function CategoryHero({ title, subtitle, count }: Props) {
  return (
    <header className="mx-auto max-w-4xl px-6 pt-28 pb-12 text-center">
      <p className="mb-5 font-display text-[11px] tracking-[0.28em] text-olive uppercase">
        {count} {count === 1 ? "piece" : "pieces"}
      </p>
      <SplitTextReveal
        as="h1"
        by="chars"
        stagger={0.02}
        className="font-display text-5xl leading-[1.05] font-light text-olive-deep sm:text-7xl"
      >
        {title}
      </SplitTextReveal>
      {subtitle && (
        <p className="mx-auto mt-6 max-w-xl font-body text-base text-espresso/75">
          {subtitle}
        </p>
      )}
    </header>
  );
}
