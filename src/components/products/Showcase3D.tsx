"use client";

import KalashOrbit from "@/components/products/KalashOrbit";

/**
 * Home-page product showcase — the baked 360° turntable of the real silver
 * kalash (KalashOrbit: 96 photographic frames, drag + inertia, no WebGL).
 *
 * This used to lazy-load ProductViewer3D, which meant the whole three.js/R3F
 * chunk shipped to the home page even though the default showcase never
 * rendered a GLB. KalashOrbit needs no 3D runtime at all; ProductViewer3D
 * remains the viewer for real `product.model3d` GLBs elsewhere.
 */
export default function Showcase3D({ label }: { label?: string }) {
  return <KalashOrbit label={label ?? "Silver Kalash"} />;
}
