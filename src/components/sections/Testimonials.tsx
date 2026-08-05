import ScrollReveal from "@/components/animations/ScrollReveal";
import ArchMark from "@/components/ui/ArchMark";
import LotusFlourish from "@/components/ui/LotusFlourish";

interface TestimonialItem {
  id: string;
  initials: string;
  author: string;
  role: string;
  location: string;
  quote: string;
  icon: "arch" | "lotus" | "crest";
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: "palitana",
    initials: "SAK",
    author: "Seth Anandji Kalyanji Pedhi",
    role: "Trustee, Palitana Tirth",
    location: "Palitana, Gujarat",
    quote:
      "The intricate brass gate and silver clad doors for our Derasar were executed with profound devotion and flawless engineering. Three generations of mastery show in every carving.",
    icon: "arch",
  },
  {
    id: "mumbai",
    initials: "SGM",
    author: "Shree Godiji Maharaj Derasar",
    role: "Managing Committee",
    location: "Mumbai, Maharashtra",
    quote:
      "Paramount completed our grand Samovasaran and intricate Kalash with complete adherence to Shastra proportions and on-time delivery. Their reverence for sacred craftsmanship is unmatched.",
    icon: "lotus",
  },
  {
    id: "antwerp",
    initials: "JCC",
    author: "Jain Cultural Centre",
    role: "Board of Directors",
    location: "Antwerp, Belgium",
    quote:
      "Bringing traditional Indian temple architecture to overseas shrines requires exceptional precision. Paramount delivered magnificent brass jali panels and sanctum doors for our center.",
    icon: "crest",
  },
];

/**
 * Testimonials Panel featuring Pure Dark Olive Velvet Matte Cards
 * 100% dark brand olive gradient (#2E2713 -> #7C7144 -> #261F0E) with zero white/pale tones,
 * seamless borderless edges, and cream/gold typography.
 */
export default function Testimonials() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Main Dark Panel Container with MOTIK Silky Smoky Brand Gradient */}
        <div
          data-dark="true"
          className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-12 md:p-16 border border-gold/20"
          style={{
            background:
              "radial-gradient(130% 110% at 25% 20%, rgba(138, 127, 74, 0.38) 0%, rgba(111, 102, 57, 0.18) 40%, transparent 75%), radial-gradient(120% 90% at 75% 75%, rgba(124, 113, 68, 0.32) 0%, rgba(79, 71, 40, 0.15) 50%, transparent 80%), radial-gradient(90% 70% at 70% 15%, rgba(226, 202, 130, 0.18) 0%, transparent 60%), linear-gradient(145deg, #241D10 0%, #1A140A 45%, #120D05 100%)",
          }}
        >
          {/* Ambient Orbs */}
          <div
            className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-olive/30 blur-[100px]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-olive-deep/40 blur-[110px]"
            aria-hidden
          />

          {/* Grid mesh pattern */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(226,202,130,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,202,130,0.15) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
            aria-hidden
          />

          {/* Header Block: "What patrons say" */}
          <ScrollReveal className="relative z-10 text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="pm-eyebrow font-display text-gold tracking-[0.28em] block mb-3 opacity-90">
              TESTIMONIALS
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream tracking-tight font-medium">
              What patrons say
            </h2>
            <p className="pm-body mt-4 font-body text-cream/75 leading-relaxed">
              Discover what reverence and trust sacred Derasars and temple committees have to say about our architectural craftsmanship.
            </p>
          </ScrollReveal>

          {/* 3 Pure Dark Olive Velvet Matte Cards (Zero White) */}
          <div className="relative z-10 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <ScrollReveal key={t.id} className="h-full">
                <div
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-7 transition-all duration-500 hover:-translate-y-1.5 shadow-[0_22px_60px_-15px_rgba(0,0,0,0.85)] hover:shadow-[0_30px_75px_-12px_rgba(0,0,0,0.95)]"
                  style={{
                    background:
                      "linear-gradient(180deg, #2E2713 0%, #4D4424 25%, #7C7144 60%, #59502B 82%, #3A321A 94%, #261F0E 100%)",
                  }}
                >
                  {/* Top Avatar Crest */}
                  <div>
                    <div className="flex items-center">
                      <div
                        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold/25"
                        style={{
                          background:
                            "linear-gradient(135deg, #7C7144 0%, #2E2713 100%)",
                        }}
                      >
                        {t.icon === "arch" && (
                          <ArchMark className="h-7 w-7 text-cream opacity-95" />
                        )}
                        {t.icon === "lotus" && (
                          <LotusFlourish className="h-7 w-7 text-cream opacity-95" />
                        )}
                        {t.icon === "crest" && (
                          <span className="font-display text-sm font-bold text-cream tracking-wider">
                            {t.initials}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Author Name & Role */}
                    <div className="mt-5">
                      <h3 className="font-display text-lg sm:text-xl font-medium text-cream group-hover:text-gold transition-colors">
                        {t.author}
                      </h3>
                      <p className="pm-small mt-1 font-body text-gold/90 font-medium">
                        {t.role} · <span className="text-cream/85">{t.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quote Body on Pure Dark Olive Velvet Ground */}
                  <p className="pm-body mt-6 font-body text-cream/95 text-sm sm:text-base leading-relaxed italic font-normal">
                    “{t.quote}”
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
