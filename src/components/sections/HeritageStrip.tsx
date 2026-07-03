import MarqueeRow from "@/components/animations/MarqueeRow";

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
    <section className="border-y border-olive/15 bg-cream-deep/40 py-10">
      <MarqueeRow items={NAMES} pxPerSecond={22} />
    </section>
  );
}
