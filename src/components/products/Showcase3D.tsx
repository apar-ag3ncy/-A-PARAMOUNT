"use client";

import dynamic from "next/dynamic";

// Lazy-load the R3F viewer so three.js isn't in the critical home bundle —
// the chunk loads after mount, and the canvas itself is further gated in-view.
const ProductViewer3D = dynamic(
  () => import("@/components/products/ProductViewer3D"),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto aspect-square w-full max-w-lg rounded-card border border-olive/25 bg-gradient-to-b from-cream-deep to-[#E9DBC0]" />
    ),
  },
);

export default function Showcase3D({ label }: { label?: string }) {
  return <ProductViewer3D label={label} />;
}
