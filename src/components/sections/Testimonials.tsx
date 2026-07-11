import MarqueeRow from "@/components/animations/MarqueeRow";
import SectionHeading from "@/components/ui/SectionHeading";

// A sample of the 242-institution roster (PARAMOUNT_CONTENT.md §8).
const CLIENTS = [
  "Seth Anandji Kalyanji Pedhi · Palitana",
  "Shree Godiji Maharaj Jain Temple · Mumbai",
  "Shatrunjay Tirth Dham · Shahapur",
  "Shree Simandharswami Jain Derasar · Mehsana",
  "Las Vegas Jain Temple · USA",
  "Jain Culture Centre · Antwerp",
  "Shree Mahavir Jain · Kathmandu",
  "Shree Kesariyaji Jain Derasar · Palitana",
];

/** Trust / clients section — the international roster since 1968. */
export default function Testimonials() {
  return (
    <section className="border-y border-olive/15 py-20 text-center">
      <SectionHeading
        eyebrow="Trusted across the world"
        title="242 temples & trusts served since 1968"
        className="mx-auto max-w-2xl px-6"
      />
      <p className="mt-4 px-6 font-body text-espresso/70">
        Across India — and Nepal, the USA, Japan and Belgium.
      </p>
      <div className="mt-12">
        <MarqueeRow items={CLIENTS} pxPerSecond={34} />
      </div>
    </section>
  );
}
