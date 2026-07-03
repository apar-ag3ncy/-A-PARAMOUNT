// GROQ (plain strings — the `` tag is only editor sugar).
// Products flattened into the CatalogCategory shape the UI already uses.
const PRODUCT_FIELDS = `
  "slug": slug.current,
  title,
  titleDevanagari,
  "family": category->family,
  order,
  "variants": coalesce(variants[].material, []),
  "blurb": shortDescription,
  significance,
  heroImage,
  "ratio": coalesce(defaultRatio, "3/4")
`;

export const ALL_PRODUCTS_QUERY = `*[_type == "product"] | order(order asc){${PRODUCT_FIELDS}}`;

export const PRODUCTS_BY_FAMILY_QUERY = `*[_type == "product" && category->family == $family] | order(order asc){${PRODUCT_FIELDS}}`;

export const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0]{${PRODUCT_FIELDS}}`;

export const CATEGORIES_BY_FAMILY_QUERY = `*[_type == "category"] | order(order asc){
  "slug": slug.current, title, family, order, description, heroImage
}`;
