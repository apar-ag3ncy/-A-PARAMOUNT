import type { ProductInfo } from "@/lib/productInfo";

/**
 * ProductSpec — key facts formatted in the light brand color gradient palette.
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
      className={`divide-y divide-[#C8B88A]/30 overflow-hidden rounded-2xl border border-[#C8B88A]/40 text-[#3D341C] shadow-md ${className ?? ""}`}
      style={{
        background:
          "linear-gradient(165deg, rgba(254, 246, 230, 0.95) 0%, rgba(243, 230, 204, 0.90) 50%, rgba(230, 214, 182, 0.85) 100%)",
      }}
    >
      {spec.map((s) => (
        <div key={s.label} className="px-5 py-4">
          <dt className="pm-micro font-display tracking-[0.18em] text-[#6E643B] uppercase font-medium">
            {s.label}
          </dt>
          <dd className="pm-small mt-1 font-display text-[#3D341C] font-semibold">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * ProductAbout — written description formatted in the light brand color gradient container.
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
  ].filter((r) => r.value);

  return (
    <section
      className="mt-14 rounded-3xl border border-[#C8B88A]/40 shadow-[0_15px_40px_-15px_rgba(124,113,68,0.18)] p-8 sm:p-10 text-[#3D341C]"
      style={{
        background:
          "linear-gradient(165deg, rgba(254, 246, 230, 0.95) 0%, rgba(243, 230, 204, 0.90) 50%, rgba(230, 214, 182, 0.85) 100%)",
      }}
    >
      <dl className="grid gap-x-14 gap-y-9 sm:grid-cols-[minmax(140px,200px)_minmax(0,1fr)]">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="pm-label font-display tracking-[0.18em] text-[#6E643B] uppercase font-medium">
              {r.label}
            </dt>
            <dd
              className={`max-w-[62ch] font-body text-[#3D341C]/90 ${r.lead ? "pm-lead" : "pm-body"}`}
            >
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
