import { DateRule, type FieldDefinition, defineField } from "sanity";
import { getISODateString } from "../../utils/datetime";
import { ImageIcon } from "@sanity/icons";

export interface CoreFields {
  title: FieldDefinition;
  slug: FieldDefinition;
  publishedAt: FieldDefinition;
  featuredImage: FieldDefinition;
  excerpt: FieldDefinition;
  body: FieldDefinition;
  seo: FieldDefinition;
  modules: FieldDefinition;
}

type DynamicType<T> = {
  [K in keyof T]: T[K];
};

export const TITLE_FIELD = defineField({
  name: "title",
  title: "Title",
  type: "string",
});

export const SLUG_FIELD = defineField({
  name: "slug",
  title: "Slug",
  type: "slug",
  description:
    "The unique identifying part of a web address at the end of the URL. Only lowercase letters and hyphens are allowed.",
  options: {
    source: "title",
  },
});

export const EXCERPT_FIELD = defineField({
  name: "excerpt",
  title: "Excerpt",
  type: "text",
  description: "A short description of the content.",
});

export const BODY_FIELD = defineField({
  name: "body",
  title: "Body",
  type: "kit.editor",
});

export const PUBLISHED_AT_FIELD = defineField({
  name: "publishedAt",
  initialValue: getISODateString(),
  title: "Date",
  type: "date",
  validation: (Rule: DateRule) => Rule.required(),
});

export const IMAGE_FIELD = defineField({
  type: "image",
  icon: ImageIcon,
  name: "image",
  title: "Image",
  options: {
    hotspot: true,
  },
});

export const SEO_FIELD = defineField({
  name: "seo",
  title: "SEO & Schema",
  type: "kit.seo",
});

export const MODULES_FIELD = defineField({
  name: "modules",
  title: "Modules",
  type: "kit.modules",
});

export const LINK_FIELD = defineField({
  name: "link",
  title: "Link",
  type: "kit.link",
});

/**
 * Core fields are the default fields that are supported by a collection.
 */
export const CORE_FIELDS: DynamicType<CoreFields> = {
  title: TITLE_FIELD,
  slug: SLUG_FIELD,
  publishedAt: PUBLISHED_AT_FIELD,
  featuredImage: defineField({ ...IMAGE_FIELD, name: "featuredImage" }),
  excerpt: EXCERPT_FIELD,
  body: BODY_FIELD,
  modules: MODULES_FIELD,
  seo: defineField({ group: "seo", ...SEO_FIELD }),
};
