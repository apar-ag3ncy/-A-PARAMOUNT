import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";
import { dataset, projectId } from "./config";

// Light path (no client) — safe to import into client components like AssetFrame.
const builder = projectId ? imageUrlBuilder({ projectId, dataset }) : null;

/** Image URL builder for a Sanity image source, or null when unconfigured. */
export function urlFor(source: SanityImageSource) {
  return builder ? builder.image(source) : null;
}
