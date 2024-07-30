import { defineArrayMember, defineField, defineType } from "sanity";
import { REDIRECT_OPTIONS } from "../defaults/constants";
import { ImageIcon } from "@sanity/icons";
import { getContentTypes, getEntities, getModules } from "../../utils/config";
import { IMAGE_FIELD, LINK_FIELD } from "../defaults/fields";

export const seo = defineType({
  name: "kit.seo",
  type: "object",
  options: {
    collapsible: true,
    collapsed: false,
  },
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      description: "Around 55-60 characters long.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      description: "Around 150-160 characters long. Limit to 300 characters.",
    }),
    defineField({
      name: "openGraph",
      title: "OpenGraph",
      type: "object",
      description: "OpenGraph meta tags for social media sharing.",
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: "title",
          title: "Title",
          type: "string",
          description: "Around 55-60 characters long.",
        }),
        defineField({
          name: "description",
          title: "Description",
          type: "text",
          description:
            "Around 150-160 characters long. Limit to 300 characters.",
        }),
        defineField({
          name: "image",
          title: "Image",
          type: "image",
          description: "Minimum 1200 x 630 pixels, 1.91:1 ratio.",
        }),
      ],
    }),
    defineField({
      name: "advanced",
      title: "Advanced",
      type: "object",
      description: "Advanced SEO settings.",
      options: {
        collapsible: true,
        collapsed: true,
      },
      fields: [
        defineField({
          name: "canonical",
          title: "Canonical URL",
          type: "url",
          description:
            "The canonical URL informs search crawlers which page is the main page if you have double content.",
        }),
        defineField({
          name: "redirect",
          title: "Redirect",
          type: "object",
          options: {
            collapsible: false,
          },
          fields: [
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: false,
            }),
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              initialValue: "301",
              options: {
                list: REDIRECT_OPTIONS,
                layout: "radio",
              },
              hidden: ({ parent = {} }) => {
                const { enabled = false } = parent as Record<string, unknown>;
                return !enabled;
              },
            }),
            defineField({
              name: "url",
              title: "Destination URL",
              type: "url",
              hidden: ({ parent = {} }) => {
                const { enabled = false } = parent as Record<string, unknown>;
                return !enabled;
              },
            }),
          ],
        }),
        defineField({
          name: "robots",
          title: "Robots Meta",
          type: "object",
          options: {
            columns: 2,
          },
          fields: [
            defineField({
              name: "index",
              title: "Index",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to index and show these pages in the search results.",
            }),
            defineField({
              name: "follow",
              title: "Follow",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to follow the links on the page.",
            }),
            defineField({
              name: "archive",
              title: "Archive",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to show a cached version of the page.",
            }),
            defineField({
              name: "imageIndex",
              title: "Image Index",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to index images on the page.",
            }),
            defineField({
              name: "snippet",
              title: "Snippet",
              type: "boolean",
              initialValue: true,
              description:
                "Instructs search engines to show a snippet of the page.",
            }),
          ],
        }),
      ],
    }),
  ],
});

export const editor = defineType({
  title: "Editor",
  name: "kit.editor",
  type: "array",
  of: [
    defineArrayMember({
      title: "Block",
      type: "block",
      // Styles let you define what blocks can be marked up as. The default
      // set corresponds with HTML tags, but you can set any title or value
      // you want, and decide how you want to deal with it where you want to
      // use your content.
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 1", value: "h1" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Heading 5", value: "h5" },
        { title: "Heading 6", value: "h5" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }],
      // Marks let you mark up inline text in the Portable Text Editor
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          LINK_FIELD,
        ],
      },
    }),
    IMAGE_FIELD,
  ],
});

export function getObjectsWithConfigRequired() {
  const objects: ReturnType<typeof defineType>[] = [];

  objects.push(
    defineType({
      name: "kit.modules",
      title: "Modules",
      type: "array",
      of: getModules().map(({ name }) => ({ type: name })),
    }),
  );

  objects.push(
    defineType({
      name: "kit.link",
      title: "Link",
      type: "object",
      fields: [
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "isExternal",
          title: "External",
          type: "boolean",
          description: "Use an external link.",
          initialValue: () => false,
        }),
        defineField({
          name: "external",
          type: "url",
          title: "URL",
          hidden: ({ parent }) => !parent?.isExternal,
        }),
        defineField({
          name: "internal",
          type: "reference",
          to: [...getContentTypes(), ...getEntities()]
            .filter(({ rewrite }) => !!rewrite)
            .map(({ name }) => ({ type: name })),
          hidden: ({ parent }) => parent?.isExternal,
        }),
        defineField({
          name: "openInNewTab",
          title: "Open in new tab",
          type: "boolean",
          initialValue: false,
        }),
      ],
    }),
  );

  return objects;
}
