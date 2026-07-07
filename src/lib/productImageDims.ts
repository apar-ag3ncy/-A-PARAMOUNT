// AUTO-GENERATED from public/products/*.webp — do not edit by hand.
// Real intrinsic pixel dimensions of each client product photo, so a frame
// can adopt its photo’s exact aspect ratio (fills edge-to-edge, never crops).
// Regenerate: node scripts/gen-image-dims.mjs (see commit).

export const PRODUCT_IMAGE_DIMS: Record<string, { w: number; h: number }> = {
  "/products/108-diva-aarti.webp": { w: 670, h: 1200 },
  "/products/14-swapna-and-parna.webp": { w: 1200, h: 896 },
  "/products/angi-mugat.webp": { w: 1200, h: 1200 },
  "/products/ashtaprakari-puja-bajot.webp": { w: 1200, h: 896 },
  "/products/bhandar.webp": { w: 1200, h: 1200 },
  "/products/brass-bell.webp": { w: 1200, h: 900 },
  "/products/brass-gate.webp": { w: 675, h: 1200 },
  "/products/brass-grill-jali.webp": { w: 1200, h: 900 },
  "/products/brass-tijori.webp": { w: 675, h: 1200 },
  "/products/chattar.webp": { w: 1200, h: 896 },
  "/products/cloth-dhaja.webp": { w: 274, h: 1200 },
  "/products/dhwajadand.webp": { w: 896, h: 1200 },
  "/products/divistand.webp": { w: 1200, h: 896 },
  "/products/door-step.webp": { w: 1200, h: 896 },
  "/products/doors.webp": { w: 1042, h: 1200 },
  "/products/kalash.webp": { w: 1200, h: 1200 },
  "/products/kalpavruksh-naan.webp": { w: 670, h: 1200 },
  "/products/mandir.webp": { w: 1200, h: 900 },
  "/products/manekstambh-toran.webp": { w: 670, h: 1200 },
  "/products/patla.webp": { w: 1200, h: 896 },
  "/products/puja-table.webp": { w: 1200, h: 896 },
  "/products/rath.webp": { w: 675, h: 1200 },
  "/products/samovasaran-trigadu.webp": { w: 1167, h: 1200 },
  "/products/shatrunjay-pat.webp": { w: 1200, h: 896 },
  "/products/silver-aarti-mangal-divo.webp": { w: 670, h: 1200 },
  "/products/silver-kothi.webp": { w: 670, h: 1200 },
  "/products/toran.webp": { w: 1200, h: 232 },
  "/products/vyaakhyan-kamal.webp": { w: 670, h: 1200 },
  "/products/vyaakhyan-paat.webp": { w: 670, h: 1200 },
  "/products/wooden-carved-murti.webp": { w: 1200, h: 1200 },
};

/** Natural aspect ratio (w/h) for a local product photo path, or null. */
export function productAspect(src?: string | null): number | null {
  if (!src) return null;
  const d = PRODUCT_IMAGE_DIMS[src];
  return d ? d.w / d.h : null;
}
