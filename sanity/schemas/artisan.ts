import { defineType, defineField } from "sanity";

export default defineType({
  name: "artisan",
  title: "Artisan",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "bio", type: "text", rows: 4 }),
    defineField({ name: "photo", type: "image", options: { hotspot: true } }),
    defineField({ name: "order", type: "number" }),
  ],
});
