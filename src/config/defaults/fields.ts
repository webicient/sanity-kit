import { type FieldDefinition, defineField } from "sanity";

export interface CoreFields {
  title: FieldDefinition;
  slug: FieldDefinition;
  featuredImage: FieldDefinition;
  excerpt: FieldDefinition;
  body: FieldDefinition;
  seo: FieldDefinition;
}

type DynamicType<T> = {
  [K in keyof T]: T[K];
};

/**
 * Core fields are the default fields that are supported by a collection.
 */
export const CORE_FIELDS: DynamicType<CoreFields> = {
  title: defineField({
    name: "title",
    title: "Title",
    type: "string",
    group: "content",
  }),
  slug: defineField({
    name: "slug",
    title: "Slug",
    type: "slug",
    description:
      "The unique identifying part of a web address at the end of the URL. Only lowercase letters and hyphens are allowed.",
    options: {
      source: "title",
    },
    group: "content",
  }),
  featuredImage: defineField({
    name: "featuredImage",
    title: "Featured image",
    type: "image",
    group: "content",
  }),
  excerpt: defineField({
    name: "excerpt",
    title: "Excerpt",
    type: "text",
    description: "A short description of the content.",
    group: "content",
  }),
  body: defineField({
    name: "body",
    title: "Body",
    type: "array",
    of: [{ type: "block" }],
    group: "content",
  }),
  seo: defineField({
    name: "seo",
    title: "SEO & Schema",
    type: "seo",
    group: "seo",
  }),
};
