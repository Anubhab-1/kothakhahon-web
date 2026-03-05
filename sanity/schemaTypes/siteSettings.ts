import { defineArrayMember, defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "heroTagline",
      title: "Hero Tagline (Bengali)",
      type: "string",
    }),
    defineField({
      name: "heroTaglineEn",
      title: "Hero Tagline (English)",
      type: "string",
    }),
    defineField({
      name: "missionStatement",
      title: "Mission Statement",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "featuredBooks",
      title: "Featured Books",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "book" }],
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: "featuredAuthor",
      title: "Featured Author",
      type: "reference",
      to: [{ type: "author" }],
    }),
    defineField({
      name: "social",
      title: "Social Links",
      type: "object",
      fields: [
        defineField({ name: "facebook", title: "Facebook", type: "url" }),
        defineField({ name: "instagram", title: "Instagram", type: "url" }),
        defineField({ name: "youtube", title: "YouTube", type: "url" }),
        defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
