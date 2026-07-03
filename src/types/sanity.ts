/**
 * Shared content types. Full CMS-generated types land in Prompt B;
 * these cover what the UI (AssetFrame, cards, masonry) needs today.
 */

export type Family = "architecture" | "symbols" | "ceremonial" | "devotional";

export interface SanityImage {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number };
  alt?: string;
  blurDataURL?: string;
}

export interface MaterialVariant {
  material: string;
  carvingLevel?: "Normal" | "Deep" | "Extra Deep";
  gallery?: SanityImage[];
  notes?: string;
}

export interface Category {
  _id: string;
  title: string;
  slug: { current: string };
  family: Family;
  order?: number;
  description?: string;
  heroImage?: SanityImage | null;
}

export interface Product {
  _id: string;
  title: string;
  titleDevanagari?: string;
  slug: { current: string };
  category?: Category;
  shortDescription?: string;
  significance?: string;
  variants?: MaterialVariant[];
  heroImage?: SanityImage | null;
  featured?: boolean;
  order?: number;
  /** rotating aspect ratio for the empty-frame masonry (scroll-ui §2). */
  defaultRatio?: string;
}
