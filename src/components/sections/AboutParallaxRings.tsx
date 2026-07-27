"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import OrnamentDivider from "@/components/ui/OrnamentDivider";
import { CONTACT } from "@/lib/constants";

const PEOPLE = CONTACT.people.map((p) => `${p.title} ${p.name}`);

/**
 * AboutParallaxRings — Inspired by concentric architectural ring composition.
 * Concentric rings floating along a horizontal brand-gold axis beam with smooth scroll parallax physics.
 */
export default function AboutParallaxRings() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms for concentric rings and horizontal axis
  const ring1Y = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const ring1Rotate = useTransform(scrollYProgress, [0, 1], [-15, 25]);

  const ring2Y = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const ring2Rotate = useTransform(scrollYProgress, [0, 1], [20, -20]);

  const ring3Y = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const ring3Scale = useTransform(scrollYProgress, [0, 1], [0.95, 1.05]);

  const beamScaleX = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1, 0.9]);

  return (
    <div
      ref={containerRef}
      data-dark="true"
      className="relative flex h-full min-h-[580px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#1A150C] p-8 text-cream shadow-2xl border border-gold/20"
      style={{
        background:
          "radial-gradient(130% 110% at 75% 30%, rgba(124, 113, 68, 0.35) 0%, rgba(42, 34, 19, 0.6) 50%, rgba(20, 16, 8, 0.95) 100%)",
      }}
    >
      {/* Ambient Glows */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-olive/25 blur-[100px]"
        aria-hidden
      />

      {/* Horizontal Axis Beam (matching inspiration design) */}
      <motion.div
        aria-hidden
        style={{ scaleX: beamScaleX }}
        className="pointer-events-none absolute top-1/2 inset-x-0 h-[2px] -translate-y-1/2 z-10"
      >
        <div
          className="h-full w-full opacity-80"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(226,202,130,0.15) 15%, rgba(226,202,130,0.85) 50%, rgba(124,113,68,0.7) 85%, transparent 100%)",
            boxShadow: "0 0 12px rgba(226, 202, 130, 0.6)",
          }}
        />
      </motion.div>

      {/* Concentric Parallax Rings System */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Ring 1 (Largest Outer Ring) */}
        <motion.div
          style={{ y: ring1Y, rotate: ring1Rotate }}
          className="absolute h-[460px] w-[460px] sm:h-[540px] sm:w-[540px] rounded-full border border-gold/25 shadow-[0_0_30px_rgba(0,0,0,0.4)]"
        />

        {/* Ring 2 (Middle Intersecting Ring) */}
        <motion.div
          style={{ y: ring2Y, rotate: ring2Rotate }}
          className="absolute h-[340px] w-[340px] sm:h-[400px] sm:w-[400px] rounded-full border border-gold/35 bg-[#251F12]/30 backdrop-blur-sm shadow-[0_0_25px_rgba(124,113,68,0.2)]"
        />

        {/* Ring 3 (Inner Ring) */}
        <motion.div
          style={{ y: ring3Y, scale: ring3Scale }}
          className="absolute h-[220px] w-[220px] sm:h-[260px] sm:w-[260px] rounded-full border border-gold/45 bg-[#2E2716]/40 backdrop-blur-md shadow-inner"
        />
      </div>

      {/* Content Overlay: Title + 4 Generations */}
      <div className="relative z-20 flex flex-col items-center text-center">
        <span className="pm-eyebrow font-display tracking-[0.28em] text-gold uppercase opacity-90 block mb-2">
          HERITAGE & LINEAGE
        </span>
        <h2 className="pm-h2 font-display tracking-[0.16em] text-cream uppercase">
          Generations
        </h2>

        <OrnamentDivider className="mt-3 mb-8 w-48 text-gold/85" />

        <div className="flex flex-col gap-4">
          {PEOPLE.map((name, idx) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative flex items-center justify-center rounded-full border border-gold/25 bg-[#241E11]/80 px-6 py-2.5 backdrop-blur-md transition-all duration-300 hover:border-gold/60 hover:bg-[#342B18]/90 shadow-md"
            >
              <span className="font-display text-xs tracking-wider text-gold/80 mr-2.5">
                0{idx + 1}.
              </span>
              <span className="font-body text-sm sm:text-base text-cream group-hover:text-gold transition-colors font-medium">
                {name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
