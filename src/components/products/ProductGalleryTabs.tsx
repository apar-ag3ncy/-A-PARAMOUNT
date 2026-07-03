"use client";

import { useState } from "react";
import MaterialTabs from "@/components/products/MaterialTabs";
import ProductGallery from "@/components/products/ProductGallery";

interface Props {
  title: string;
  materials: string[];
  ratio?: string;
}

/** Left column of the product detail: material tabs above a crossfading gallery. */
export default function ProductGalleryTabs({ title, materials, ratio }: Props) {
  const [active, setActive] = useState(materials[0] ?? "Standard");

  return (
    <div className="lg:sticky lg:top-24 lg:self-start">
      {materials.length > 1 && (
        <div className="mb-5">
          <MaterialTabs materials={materials} active={active} onSelect={setActive} />
        </div>
      )}
      <ProductGallery title={title} material={active} ratio={ratio} />
    </div>
  );
}
