import type { MetadataRoute } from "next";
import { CATEGORIES } from "@/lib/catalog";
import { FAMILIES } from "@/lib/constants";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.aparamount.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/craftsmanship", "/gallery", "/contact", "/products"].map(
    (p) => ({
      url: `${base}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    }),
  );
  const familyRoutes = FAMILIES.map((f) => ({
    url: `${base}/products/${f.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  const productRoutes = CATEGORIES.map((c) => ({
    url: `${base}/products/${c.family}/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));
  return [...staticRoutes, ...familyRoutes, ...productRoutes];
}
