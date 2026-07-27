import type { CatalogCategory } from "@/lib/catalog";

interface Props {
  items: CatalogCategory[];
  familySlug: string;
}

/**
 * RelatedProducts section — removed from internal pages per request.
 */
export default function RelatedProducts({ items, familySlug }: Props) {
  return null;
}
