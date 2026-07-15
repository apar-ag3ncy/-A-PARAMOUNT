"use client";

import { useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger, Flip } from "@/lib/gsap";
import { batchReveal, showInstantly } from "@/lib/reveal";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import MasonryItem from "@/components/products/MasonryItem";
import type { CatalogCategory } from "@/lib/catalog";
import { productAspect } from "@/lib/productImageDims";
import { cn } from "@/lib/utils";

/**
 * Category browsing (PARAMOUNT_SCROLL_UI_PROMPT.md §3). One long scroll: a
 * material-filter rail (ScrollTrigger-pinned on desktop, since ScrollSmoother
 * breaks CSS sticky) filters the masonry IN PLACE via GSAP Flip — no navigation.
 */
export default function CategoryBrowser({
  familySlug,
  products,
}: {
  familySlug: string;
  products: CatalogCategory[];
}) {
  const [material, setMaterial] = useState("All");
  const gridRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const materials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.variants.forEach((v) => set.add(v)));
    return ["All", ...Array.from(set)];
  }, [products]);

  const isShown = (p: CatalogCategory) =>
    material === "All" || p.variants.includes(material);

  // Initial staggered reveal + desktop pin of the filter rail.
  useIsomorphicLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ctx = gsap.context(() => {
      const items = grid.querySelectorAll<HTMLElement>(".masonry-item");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => showInstantly(items));
      mm.add("(prefers-reduced-motion: no-preference)", () =>
        batchReveal(items, { start: "top 90%", stagger: 0.06 }),
      );

      mm.add("(min-width: 1024px)", () => {
        if (!railRef.current) return;
        ScrollTrigger.create({
          trigger: railRef.current,
          start: "top top+=64",
          endTrigger: grid,
          end: "bottom top+=140",
          pin: true,
          pinSpacing: false,
        });
      });

      ScrollTrigger.refresh();
    }, grid);
    return () => ctx.revert();
  }, []);

  // FLIP the grid whenever the material filter changes.
  useIsomorphicLayoutEffect(() => {
    if (!flipState.current) return;
    // The FLIP absolutely-repositions + scales every masonry card — the most
    // expensive path on a phone. Skip it entirely for reduced-motion users
    // (React just re-renders the filtered grid in place).
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flipState.current = null;
      return;
    }
    Flip.from(flipState.current, {
      duration: 0.6,
      ease: "power2.inOut",
      absolute: true,
      scale: true,
      onEnter: (els) =>
        gsap.fromTo(
          els,
          { opacity: 0, scale: 0.85 },
          { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
        ),
      onLeave: (els) =>
        gsap.to(els, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.in" }),
      onComplete: () => ScrollTrigger.refresh(),
    });
    flipState.current = null;
  }, [material]);

  function pick(m: string) {
    if (m === material || !gridRef.current) return;
    flipState.current = Flip.getState(
      gridRef.current.querySelectorAll(".masonry-item"),
      { props: "opacity" },
    );
    setMaterial(m);
  }

  return (
    <>
      <div
        ref={railRef}
        // Touch (below lg) has native scrolling (smoothTouch:0), so plain CSS
        // sticky keeps the filters reachable through a long list. Desktop uses
        // ScrollSmoother's transform (which breaks sticky), so there the
        // ScrollTrigger pin below takes over — hence lg:static.
        className="sticky top-[75px] z-30 -mx-6 mb-10 border-y border-olive/15 bg-cream/95 px-6 py-3 lg:static"
      >
        <div className="flex gap-2.5 overflow-x-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
          {materials.map((m) => {
            const active = m === material;
            return (
              <button
                key={m}
                type="button"
                onClick={() => pick(m)}
                aria-pressed={active}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 font-body pm-label whitespace-nowrap transition-colors",
                  active
                    ? "bg-olive text-cream"
                    : "text-maroon hover:text-maroon",
                )}
              >
                {/* gold coin marker — matches the deck's variant chips (p13) */}
                <svg viewBox="0 0 32 32" className="h-4 w-4 shrink-0" aria-hidden>
                  <circle cx={16} cy={16} r={15} fill="var(--color-gold)" />
                  <circle cx={16} cy={16} r={15} fill="none" stroke="#C9A85E" strokeWidth={1} />
                  <circle cx={16} cy={16} r={11.5} fill="none" stroke="#B8933F" strokeWidth={1.4} opacity={0.7} />
                </svg>
                {m}
              </button>
            );
          })}
        </div>
      </div>

      <div
        ref={gridRef}
        className="columns-1 [column-gap:1.5rem] sm:columns-2 lg:columns-3 xl:columns-4"
      >
        {products.map((p, i) => {
          // A real photo drives its own frame ratio; the temple arch only
          // reads on a tall (portrait) frame, so gate it on the true photo.
          const aspect = productAspect(p.image);
          const isPortrait =
            aspect != null ? aspect < 0.82 : ["3/4", "4/5", "2/3"].includes(p.ratio);
          return (
            <MasonryItem
              key={p.slug}
              caption={p.title}
              ratio={p.ratio}
              image={p.heroImage}
              src={p.image}
              href={`/products/${familySlug}/${p.slug}`}
              depth={i % 2 ? 1.04 : 0.96}
              hidden={!isShown(p)}
              arch={i % 3 === 0 && isPortrait}
            />
          );
        })}
      </div>
    </>
  );
}
