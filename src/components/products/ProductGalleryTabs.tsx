"use client";

import { useRef, useState } from "react";
import MaterialTabs from "@/components/products/MaterialTabs";
import ProductGallery from "@/components/products/ProductGallery";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

interface Props {
  title: string;
  materials: string[];
  ratio?: string;
}

/**
 * Left column of the product detail: material tabs above a crossfading gallery.
 * Pinned on desktop via ScrollTrigger while the taller right column scrolls —
 * CSS position:sticky can't be used because ScrollSmoother drives synthetic
 * scroll (same reason CategoryBrowser pins its filter rail).
 */
export default function ProductGalleryTabs({ title, materials, ratio }: Props) {
  const [active, setActive] = useState(materials[0] ?? "Standard");
  const cellRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const cell = cellRef.current;
    const pin = pinRef.current;
    const grid = cell?.parentElement;
    if (!cell || !pin || !grid) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: pin,
          start: "top top+=96",
          endTrigger: grid,
          end: "bottom bottom",
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      });
    }, cell);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={cellRef}>
      <div ref={pinRef}>
        {materials.length > 1 && (
          <div className="mb-5">
            <MaterialTabs materials={materials} active={active} onSelect={setActive} />
          </div>
        )}
        <ProductGallery title={title} material={active} ratio={ratio} />
      </div>
    </div>
  );
}
