import type { ProductInfo } from "@/lib/productInfo";

/**
 * ProductSpec — the key facts as a compact stacked table for the product page's
 * sticky details rail: Collection / Materials & finish / Made to order, each a
 * hairline-ruled row (label above, value below) in the brand's olive framing.
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
      className={`divide-y divide-olive/15 overflow-hidden rounded-card border border-olive/20 bg-cream ${className ?? ""}`}
    >
      {spec.map((s) => (
        <div key={s.label} className="px-4 py-3.5">
          <dt className="pm-micro font-display tracking-[0.18em] text-olive uppercase">
            {s.label}
          </dt>
          <dd className="pm-small mt-1 font-display text-heading-brown">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * ProductAbout — the written description of the piece laid out as a structured
 * definition grid: a fixed label column beside a measured text column, so
 * Description / Placement / Craft read as aligned spec entries, not a loose
 * text stack. Constrained measure (~62ch) for comfortable reading.
 */
export function ProductAbout({
  description,
  placement,
  craft,
}: {
  description: string;
  placement: string;
  craft: string;
}) {
  const rows = [
    { label: "About the piece", value: description, lead: true },
    { label: "Placement", value: placement },
    { label: "Craft", value: craft },
  ].filter((r) => r.value);

  return (
    <section className="mt-20 rounded-card border border-olive/15 bg-cream-deep/40 p-8 sm:p-10">
      <dl className="grid gap-x-14 gap-y-9 sm:grid-cols-[minmax(140px,200px)_minmax(0,1fr)]">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="pm-label font-display tracking-[0.16em] text-olive uppercase">
              {r.label}
            </dt>
            <dd
              className={`max-w-[62ch] font-body text-maroon/85 ${r.lead ? "pm-lead" : "pm-body"}`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
