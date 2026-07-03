import { defineType, defineField } from "sanity";

export default defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "titleDevanagari",
      type: "string",
      description: "Product name in original script",
    }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "category", type: "reference", to: [{ type: "category" }] }),
    defineField({ name: "shortDescription", type: "text", rows: 3 }),
    defineField({ name: "longDescription", type: "array", of: [{ type: "block" }] }),
    defineField({
      name: "significance",
      type: "text",
      rows: 4,
      description: "Religious / cultural significance",
    }),
    defineField({
      name: "variants",
      type: "array",
      of: [{ type: "materialVariant" }],
      validation: (r) => r.min(1),
    }),
    defineField({ name: "heroImage", type: "image", options: { hotspot: true } }),
    defineField({
      name: "defaultRatio",
      type: "string",
      options: { list: ["3/4", "4/5", "1/1", "4/3", "2/3"] },
      description: "Card aspect ratio for the masonry",
      initialValue: "3/4",
    }),
    defineField({
      name: "model3d",
      type: "file",
      options: { accept: ".glb,.gltf" },
      description: "Optional 3D model",
    }),
    defineField({ name: "featured", type: "boolean", initialValue: false }),
    defineField({ name: "order", type: "number" }),
  ],
  preview: {
    select: { title: "title", media: "heroImage", subtitle: "category.title" },
  },
});
