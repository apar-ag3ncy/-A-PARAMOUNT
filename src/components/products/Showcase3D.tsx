"use client";

import KalashOrbit from "@/components/products/KalashOrbit";

/**
 * Home-page product showcase — the baked 360° turntable of the real silver
 * kalash (KalashOrbit: 96 photographic frames, drag + inertia, no WebGL).
 *
 * This used to lazy-load a three.js/R3F viewer, so that runtime shipped to the
 * home page even though the default showcase never rendered a GLB. Nothing
 * routed to that viewer any more, so it — and three/@react-three — are gone.
 * Restoring a real `product.model3d` GLB would mean reinstating both.
 */
export default function Showcase3D({ label }: { label?: string }) {
  return <KalashOrbit label={label ?? "Silver Kalash"} />;
}
