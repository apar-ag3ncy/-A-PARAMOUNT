import { defineType, defineField } from "sanity";

export default defineType({
  name: "materialVariant",
  title: "Material Variant",
  type: "object",
  fields: [
    defineField({
      name: "material",
      type: "string",
      options: {
        list: [
          "Silver", "Gold", "Brass", "Copper", "German Silver",
          "GS + Brass", "Copper + Brass", "Wooden",
          "Two-tone Polish", "Inlay / Embossed", "Diamond",
          "Minakari", "Jadtar (Full)", "Jadtar (Half)", "Moti", "Wire",
          "Painting", "Acrylic", "Fibre",
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "carvingLevel",
      type: "string",
      options: { list: ["Normal", "Deep", "Extra Deep"] },
      description: "For wooden items only",
    }),
    defineField({
      name: "gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "notes",
      type: "text",
      rows: 2,
      description: "Anything specific about this variant",
    }),
  ],
  preview: {
    select: { title: "material", media: "gallery.0" },
  },
});
