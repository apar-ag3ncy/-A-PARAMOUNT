/**
 * Sanity project config, read from env. Until NEXT_PUBLIC_SANITY_PROJECT_ID is
 * set the site runs entirely on the local catalog (src/lib/catalog.ts) and every
 * data call falls back gracefully.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-10-01";

/** True once a Sanity project is configured. */
export const hasSanity = Boolean(projectId);
