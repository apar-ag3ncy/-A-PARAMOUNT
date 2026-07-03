import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonial",
  title: "Client / Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "institution",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "location", type: "string" }),
    defineField({ name: "quote", type: "text", rows: 3 }),
    defineField({ name: "order", type: "number" }),
  ],
  preview: { select: { title: "institution", subtitle: "location" } },
});
