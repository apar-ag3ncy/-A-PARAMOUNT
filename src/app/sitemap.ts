import type { MetadataRoute } from "next";
// STUB — expand with product/category URLs from Sanity.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://www.aparamount.example/", lastModified: new Date() }];
}
