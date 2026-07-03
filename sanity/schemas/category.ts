import { defineType, defineField } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({
      name: "family",
      type: "string",
      options: {
        list: [
          { title: "Temple Architecture", value: "architecture" },
          { title: "Sacred Symbols", value: "symbols" },
          { title: "Ceremonial Pieces", value: "ceremonial" },
          { title: "Puja & Devotional", value: "devotional" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      type: "number",
      description: "Display order within family",
    }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({ name: "heroImage", type: "image", options: { hotspot: true } }),
    defineField({
      name: "seo",
      type: "object",
      fields: [
        { name: "title", type: "string" },
        { name: "description", type: "text", rows: 2 },
      ],
    }),
  ],
});
