import type { ProductInfo } from "@/lib/productInfo";

/**
 * ProductSpec — the key-facts strip on a product page: Collection · Materials ·
 * Made to order. Hairline-ruled cells (a gap-px olive ground showing through
 * cream cells) in the brand's olive/gold framing, maroon/heading-brown type.
 */
export function ProductSpec({
  spec,
  className,
}: {
  spec: ProductInfo["spec"];
  className?: string;
}) {
  return (
    <dl
      className={`grid gap-px overflow-hidden rounded-card border border-olive/20 bg-olive/15 sm:grid-cols-3 ${className ?? ""}`}
    >
      {spec.map((s) => (
        <div key={s.label} className="bg-cream px-5 py-4 text-left">
          <dt className="pm-micro font-display tracking-[0.2em] text-olive uppercase">
            {s.label}
          </dt>
          <dd className="pm-body mt-1.5 font-display text-heading-brown">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * ProductAbout — the deeper static note for a piece: where it belongs in the
 * temple, and how it is made. Framed cream-deep panel, two columns on desktop.
 */
export function ProductAbout({
  title,
  placement,
  craft,
}: {
  title: string;
  placement: string;
  craft: string;
}) {
  return (
    <section className="mt-16 rounded-card border border-olive/15 bg-cream-deep/40 p-8 sm:mt-20 sm:p-10">
      <p className="pm-eyebrow font-body text-olive">About the piece</p>
      <h2 className="pm-h3 mt-2 font-display text-heading-brown">
        {title} in the temple
      </h2>
      <div className="mt-7 grid gap-8 sm:grid-cols-2 sm:gap-12">
        <div>
          <h3 className="pm-label font-display tracking-[0.16em] text-olive uppercase">
            Placement
          </h3>
          <p className="pm-body pm-measure mt-2.5 font-body text-maroon/85">
            {placement}
          </p>
        </div>
        <div>
          <h3 className="pm-label font-display tracking-[0.16em] text-olive uppercase">
            Craft
          </h3>
          <p className="pm-body pm-measure mt-2.5 font-body text-maroon/85">
            {craft}
          </p>
        </div>
      </div>
    </section>
  );
}
