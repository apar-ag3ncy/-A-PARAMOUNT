import type { Family, SanityImage } from "@/types/sanity";
import {
  CATEGORIES,
  categoriesByFamily as localByFamily,
  getCategory as localGet,
  type CatalogCategory,
} from "./catalog";
import { hasSanity, sanityClient } from "./sanity/client";
import {
  PRODUCTS_BY_FAMILY_QUERY,
  PRODUCT_BY_SLUG_QUERY,
} from "./sanity/queries";

const RATIOS = ["3/4", "4/5", "1/1", "4/3", "2/3"];

function mapDoc(d: Record<string, unknown>, i = 0): CatalogCategory {
  const variants = Array.isArray(d.variants)
    ? (d.variants as unknown[]).filter(Boolean).map(String)
    : [];
  return {
    slug: String(d.slug ?? ""),
    title: String(d.title ?? ""),
    family: (d.family as Family) ?? "architecture",
    order: Number(d.order ?? 900 + i),
    variants,
    blurb: (d.blurb as string) || undefined,
    ratio: (d.ratio as string) || RATIOS[i % RATIOS.length],
    heroImage: (d.heroImage as SanityImage) ?? null,
  };
}

/** Products in a family — Sanity if configured, else the local catalog. */
export async function getProductsByFamily(
  family: Family,
): Promise<CatalogCategory[]> {
  if (hasSanity && sanityClient) {
    try {
      const docs = await sanityClient.fetch<Record<string, unknown>[]>(
        PRODUCTS_BY_FAMILY_QUERY,
        { family },
      );
      if (docs?.length) return docs.map(mapDoc);
    } catch {
      // fall back to local catalog
    }
  }
  return localByFamily(family);
}

/** A single product by slug — Sanity if configured, else the local catalog. */
export async function getProductBySlug(
  slug: string,
): Promise<CatalogCategory | undefined> {
  if (hasSanity && sanityClient) {
    try {
      const doc = await sanityClient.fetch<Record<string, unknown> | null>(
        PRODUCT_BY_SLUG_QUERY,
        { slug },
      );
      if (doc) return mapDoc(doc);
    } catch {
      // fall back to local catalog
    }
  }
  return localGet(slug);
}

/** Static params for prerendering — the local catalog is the build-time source. */
export function productParams() {
  return CATEGORIES.map((c) => ({ category: c.family, slug: c.slug }));
}
