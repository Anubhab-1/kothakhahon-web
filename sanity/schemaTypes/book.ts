import { defineArrayMember, defineField, defineType } from "sanity";

export const book = defineType({
  name: "book",
  title: "Book",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "titleEn",
      title: "English Title",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "genre",
      title: "Genres",
      type: "array",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "genre" }],
        }),
      ],
    }),
    defineField({
      name: "synopsis",
      title: "Synopsis",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "pullQuote",
      title: "Pull Quote",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "buyLink",
      title: "Buy Link",
      type: "url",
    }),
    defineField({
      name: "publicationDate",
      title: "Publication Date",
      type: "date",
    }),
    defineField({
      name: "pageCount",
      title: "Page Count",
      type: "number",
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "isbn",
      title: "ISBN",
      type: "string",
    }),
    defineField({
      name: "language",
      title: "Language",
      type: "string",
      initialValue: "Bengali",
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "chapterPreview",
      title: "Chapter Preview",
      type: "text",
      rows: 12,
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "author.name",
      media: "coverImage",
    },
  },
});
