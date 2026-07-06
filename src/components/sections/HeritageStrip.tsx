import MarqueeRow from "@/components/animations/MarqueeRow";
import BrandDamask from "@/components/ui/BrandDamask";

// Product names in Devanagari + English — the marquee reacts to scroll velocity.
const NAMES = [
  "ध्वजादंड · Dhwajadand",
  "कलश · Kalash",
  "अंगी मुगट · Angi Mugat",
  "समवसरण · Samovasaran",
  "छत्र · Chattar",
  "तोरण · Toran",
  "पालखी · Palkhi",
  "सिंहासन · Sinhasan",
  "अष्टमंगल · Ashtamangal",
  "पिछवाई · Pichwadi",
];

export default function HeritageStrip() {
  return (
    <section className="relative overflow-hidden border-y border-olive/15 bg-cream-deep/40 py-10">
      {/* faint brand damask texture on the cream interlude (deck p118) */}
      <BrandDamask className="text-olive" opacity={0.05} />
      <div className="relative">
        <MarqueeRow items={NAMES} pxPerSecond={22} />
      </div>
    </section>
  );
}
